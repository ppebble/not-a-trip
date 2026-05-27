import { COLLECTIONS, getCollection } from '@/lib/db'
import { checkDuplicates } from './duplicate-detector'
import { SLA_DEADLINES } from '@/types/spot-quality'
import type {
  CreateQualityReportInput,
  QualityReportType,
  ReportProcessingStatus,
  SlaStatistics,
  SpotQualityReport,
} from '@/types/spot-quality'

interface SpotQualitySpotRecord {
  id: string
  lifecycleStatus?: string
  closureSuspected?: boolean
  closureConfirmedAt?: Date
  duplicateSuspected?: boolean
  pendingSupplementCount?: number
  urgentReviewRequired?: boolean
  updatedAt?: Date
}

export interface QualityReportSummary {
  countsByType: Partial<Record<QualityReportType, number>>
  recentReports: SpotQualityReport[]
  urgentReviewRequired: boolean
  closureSuspected: boolean
}

export interface QualityReportResolutionInput {
  action: 'approved' | 'rejected' | 'deferred'
  reason: string
  resolvedBy: string
  closeSpot?: boolean
}

function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

async function generateQualityReportId(): Promise<string> {
  const collection = await getCollection<{ id: string }>(
    COLLECTIONS.SPOT_QUALITY_REPORTS
  )
  const reports = await collection
    .find({ id: { $regex: /^QUALITY-\d+$/ } })
    .project({ id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  if (reports.length === 0) return 'QUALITY-001'

  const match = reports[0].id.match(/^QUALITY-(\d+)$/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `QUALITY-${nextNumber.toString().padStart(3, '0')}`
}

function getDeadline(reportType: QualityReportType): Date {
  return hoursFromNow(SLA_DEADLINES[reportType])
}

export function getSlaStatus(
  report: Pick<
    SpotQualityReport,
    'status' | 'deadline' | 'createdAt' | 'reportType' | 'resolution'
  >
): ReportProcessingStatus {
  if (report.status === 'resolved' || report.status === 'rejected') {
    return report.status
  }

  if (report.deadline.getTime() < Date.now()) {
    return 'sla_exceeded'
  }

  return report.status
}

export function isNearSlaThreshold(
  report: Pick<SpotQualityReport, 'createdAt' | 'deadline'>
): boolean {
  const total = report.deadline.getTime() - report.createdAt.getTime()
  if (total <= 0) return false

  const elapsed = Date.now() - report.createdAt.getTime()
  return elapsed / total >= 0.8 && report.deadline.getTime() > Date.now()
}

export async function syncSpotQualityFlags(spotId: string): Promise<void> {
  const reportsCollection = await getCollection<SpotQualityReport>(
    COLLECTIONS.SPOT_QUALITY_REPORTS
  )
  const supplementRequestsCollection = await getCollection(
    COLLECTIONS.SUPPLEMENT_REQUESTS
  )
  const spotsCollection = await getCollection<SpotQualitySpotRecord>(
    COLLECTIONS.SPOTS
  )

  const activeReports = await reportsCollection
    .find({
      spotId,
      status: { $in: ['pending', 'in_review', 'sla_exceeded', 'resolved'] },
    })
    .toArray()

  const closedPermanentlyCount = activeReports.filter(
    (report) =>
      report.reportType === 'closed_permanently' &&
      report.resolution?.action !== 'rejected'
  ).length

  const duplicateReportCount = activeReports.filter(
    (report) =>
      report.reportType === 'duplicate' &&
      report.resolution?.action !== 'rejected'
  ).length

  const urgentReviewRequired = Object.values(
    activeReports.reduce<Partial<Record<QualityReportType, number>>>(
      (acc, report) => {
        acc[report.reportType] = (acc[report.reportType] ?? 0) + 1
        return acc
      },
      {}
    )
  ).some((count) => (count ?? 0) >= 3)

  const pendingSupplementCount =
    await supplementRequestsCollection.countDocuments({
      spotId,
      status: 'pending',
    })

  const spot = await spotsCollection.findOne({ id: spotId })
  const nextLifecycleStatus =
    spot?.lifecycleStatus === 'closed'
      ? 'closed'
      : closedPermanentlyCount >= 2
        ? 'approved'
        : (spot?.lifecycleStatus ?? 'approved')

  await spotsCollection.updateOne(
    { id: spotId },
    {
      $set: {
        lifecycleStatus: nextLifecycleStatus,
        closureSuspected: closedPermanentlyCount >= 2,
        duplicateSuspected:
          Boolean(spot?.duplicateSuspected) || duplicateReportCount > 0,
        pendingSupplementCount,
        urgentReviewRequired,
        updatedAt: new Date(),
      },
    }
  )
}

export async function createQualityReport(
  input: CreateQualityReportInput
): Promise<SpotQualityReport> {
  const collection = await getCollection<SpotQualityReport>(
    COLLECTIONS.SPOT_QUALITY_REPORTS
  )
  const now = new Date()
  const duplicateWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const existing = await collection.findOne({
    spotId: input.spotId,
    reportType: input.reportType,
    reporterId: input.reporterId,
    createdAt: { $gte: duplicateWindow },
  })

  if (existing) {
    throw new Error(
      'You already submitted the same report type within 24 hours.'
    )
  }

  const reportId = await generateQualityReportId()
  const newReport: SpotQualityReport = {
    id: reportId,
    spotId: input.spotId,
    reportType: input.reportType,
    description: input.description.trim(),
    evidencePhotos: input.evidencePhotos ?? [],
    reporterId: input.reporterId,
    reporterName: input.reporterName,
    status: 'pending',
    deadline: getDeadline(input.reportType),
    isUrgent: false,
    createdAt: now,
    updatedAt: now,
  }

  await collection.insertOne(newReport)

  const sameTypeCount = await collection.countDocuments({
    spotId: input.spotId,
    reportType: input.reportType,
    status: { $in: ['pending', 'in_review', 'sla_exceeded'] },
  })

  if (sameTypeCount >= 3) {
    await collection.updateMany(
      {
        spotId: input.spotId,
        reportType: input.reportType,
        status: { $in: ['pending', 'in_review', 'sla_exceeded'] },
      },
      { $set: { isUrgent: true, updatedAt: new Date() } }
    )
  }

  await syncSpotQualityFlags(input.spotId)

  const created = await collection.findOne({ id: reportId })
  if (!created) {
    throw new Error('Failed to load created quality report.')
  }

  return created
}

export async function getQualityReportSummary(
  spotId: string
): Promise<QualityReportSummary> {
  const collection = await getCollection<SpotQualityReport>(
    COLLECTIONS.SPOT_QUALITY_REPORTS
  )
  const reports = await collection
    .find({ spotId })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray()

  const countsByType = reports.reduce<
    Partial<Record<QualityReportType, number>>
  >((acc, report) => {
    acc[report.reportType] = (acc[report.reportType] ?? 0) + 1
    return acc
  }, {})

  return {
    countsByType,
    recentReports: reports,
    urgentReviewRequired: Object.values(countsByType).some(
      (count) => (count ?? 0) >= 3
    ),
    closureSuspected: (countsByType.closed_permanently ?? 0) >= 2,
  }
}

export async function listQualityReports(filters?: {
  status?: ReportProcessingStatus | 'open'
  urgentOnly?: boolean
  spotId?: string
}) {
  const collection = await getCollection<SpotQualityReport>(
    COLLECTIONS.SPOT_QUALITY_REPORTS
  )

  const query: Record<string, unknown> = {}
  if (filters?.spotId) query.spotId = filters.spotId
  if (filters?.urgentOnly) query.isUrgent = true
  if (filters?.status === 'open') {
    query.status = { $in: ['pending', 'in_review', 'sla_exceeded'] }
  } else if (filters?.status) {
    query.status = filters.status
  }

  const reports = await collection.find(query).sort({ createdAt: -1 }).toArray()
  return reports.map((report) => ({
    ...report,
    status: getSlaStatus(report),
    nearingDeadline: isNearSlaThreshold(report),
  }))
}

export async function resolveQualityReport(
  reportId: string,
  input: QualityReportResolutionInput
) {
  const collection = await getCollection<SpotQualityReport>(
    COLLECTIONS.SPOT_QUALITY_REPORTS
  )
  const report = await collection.findOne({ id: reportId })

  if (!report) {
    throw new Error('Quality report not found.')
  }

  const now = new Date()
  const nextStatus =
    input.action === 'rejected'
      ? 'rejected'
      : input.action === 'deferred'
        ? 'in_review'
        : 'resolved'

  await collection.updateOne(
    { id: reportId },
    {
      $set: {
        status: nextStatus,
        resolution: {
          action: input.action,
          reason: input.reason.trim(),
          resolvedBy: input.resolvedBy,
          resolvedAt: now,
        },
        updatedAt: now,
      },
    }
  )

  const spotsCollection = await getCollection<SpotQualitySpotRecord>(
    COLLECTIONS.SPOTS
  )

  if (report.reportType === 'closed_permanently') {
    if (input.action === 'approved' && input.closeSpot) {
      await spotsCollection.updateOne(
        { id: report.spotId },
        {
          $set: {
            lifecycleStatus: 'closed',
            closureSuspected: false,
            closureConfirmedAt: now,
            updatedAt: now,
          },
        }
      )
    } else if (input.action === 'rejected') {
      await spotsCollection.updateOne(
        { id: report.spotId },
        {
          $set: {
            lifecycleStatus: 'approved',
            closureSuspected: false,
            updatedAt: now,
          },
        }
      )
    }
  }

  if (report.reportType === 'duplicate' && input.action === 'approved') {
    await spotsCollection.updateOne(
      { id: report.spotId },
      {
        $set: {
          duplicateSuspected: true,
          updatedAt: now,
        },
      }
    )
  }

  await syncSpotQualityFlags(report.spotId)
  return collection.findOne({ id: reportId })
}

export async function getSlaStatistics(): Promise<SlaStatistics> {
  const collection = await getCollection<SpotQualityReport>(
    COLLECTIONS.SPOT_QUALITY_REPORTS
  )
  const reports = await collection.find({}).toArray()

  const resolvedReports = reports.filter((report) => report.resolution)
  const exceededCount = reports.filter(
    (report) => !report.resolution && report.deadline.getTime() < Date.now()
  ).length

  const compliantResolved = resolvedReports.filter(
    (report) =>
      report.resolution &&
      report.resolution.resolvedAt.getTime() <= report.deadline.getTime()
  )

  const averageProcessingTime =
    resolvedReports.length === 0
      ? 0
      : Math.round(
          resolvedReports.reduce((sum, report) => {
            if (!report.resolution) return sum
            return (
              sum +
              (report.resolution.resolvedAt.getTime() -
                report.createdAt.getTime()) /
                (60 * 1000)
            )
          }, 0) / resolvedReports.length
        )

  return {
    complianceRate:
      resolvedReports.length === 0
        ? 100
        : Math.round((compliantResolved.length / resolvedReports.length) * 100),
    averageProcessingTime,
    exceededCount,
  }
}

export async function detectDuplicateSuspicionForSpotReport(input: {
  name: string
  coordinates: { lat: number; lng: number }
}): Promise<boolean> {
  const duplicateCheck = await checkDuplicates(input.coordinates, input.name)
  return (
    duplicateCheck.highDuplicates.length > 0 ||
    duplicateCheck.proximityWarnings.length > 0
  )
}
