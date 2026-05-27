import { COLLECTIONS, getCollection } from '@/lib/db'
import type { DashboardSummaryResponse } from '@/types/report'
import { getTrackedApiErrorRate24h } from './metrics'
import { getSlaStatistics } from '@/lib/spot-quality/report-processor'

interface ActivityDocument {
  userId?: string
  createdAt: Date
}

function startOfDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function formatDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

async function getPendingReviewCounts() {
  const [reportsCol, supplementsCol, statusReportsCol, qualityReportsCol] =
    await Promise.all([
      getCollection(COLLECTIONS.SPOT_REPORTS),
      getCollection(COLLECTIONS.SPOT_SUPPLEMENTS),
      getCollection(COLLECTIONS.SPOT_STATUS_REPORTS),
      getCollection(COLLECTIONS.SPOT_QUALITY_REPORTS),
    ])

  const [
    pendingReports,
    pendingSupplements,
    pendingStatusReports,
    pendingQualityReports,
  ] = await Promise.all([
    reportsCol.countDocuments({ status: 'pending' }),
    supplementsCol.countDocuments({
      $or: [
        { status: 'pending' },
        { status: { $exists: false }, approved: { $ne: true } },
      ],
    }),
    statusReportsCol.countDocuments({
      $or: [{ reviewStatus: 'pending' }, { reviewStatus: { $exists: false } }],
    }),
    qualityReportsCol.countDocuments({
      status: { $in: ['pending', 'in_review', 'sla_exceeded'] },
    }),
  ])

  return {
    pendingReports,
    pendingSupplements,
    pendingStatusReports,
    pendingQualityReports,
  }
}

async function getDistinctUserIdsSince(
  collectionName: string,
  since: Date
): Promise<string[]> {
  const collection = await getCollection<ActivityDocument>(collectionName)
  const values = await collection.distinct('userId', {
    createdAt: { $gte: since },
    userId: { $exists: true },
  })
  return values.filter((value): value is string => typeof value === 'string')
}

async function getDauToday(): Promise<number> {
  const today = startOfDay()
  const [checkinUsers, postUsers, commentUsers, reportUsers] =
    await Promise.all([
      getDistinctUserIdsSince(COLLECTIONS.CHECKINS, today),
      getDistinctUserIdsSince(COLLECTIONS.POSTS, today),
      getDistinctUserIdsSince(COLLECTIONS.COMMENTS, today),
      getDistinctUserIdsSince(COLLECTIONS.SPOT_REPORTS, today),
    ])

  return new Set([
    ...checkinUsers,
    ...postUsers,
    ...commentUsers,
    ...reportUsers,
  ]).size
}

async function getCheckInTrend(days = 7) {
  const collection = await getCollection<ActivityDocument>(COLLECTIONS.CHECKINS)
  const points: Array<{ date: string; count: number }> = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayStart = startOfDay(addDays(new Date(), -offset))
    const nextDay = addDays(dayStart, 1)
    const count = await collection.countDocuments({
      createdAt: { $gte: dayStart, $lt: nextDay },
    })
    points.push({ date: formatDayKey(dayStart), count })
  }

  return points
}

async function getDauTrend(days = 7) {
  const checkins = await getCollection<ActivityDocument>(COLLECTIONS.CHECKINS)
  const posts = await getCollection<ActivityDocument>(COLLECTIONS.POSTS)
  const comments = await getCollection<ActivityDocument>(COLLECTIONS.COMMENTS)
  const reports = await getCollection<ActivityDocument>(
    COLLECTIONS.SPOT_REPORTS
  )
  const points: Array<{ date: string; count: number }> = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayStart = startOfDay(addDays(new Date(), -offset))
    const nextDay = addDays(dayStart, 1)
    const [checkinUsers, postUsers, commentUsers, reportUsers] =
      await Promise.all([
        checkins.distinct('userId', {
          createdAt: { $gte: dayStart, $lt: nextDay },
          userId: { $exists: true },
        }),
        posts.distinct('userId', {
          createdAt: { $gte: dayStart, $lt: nextDay },
          userId: { $exists: true },
        }),
        comments.distinct('userId', {
          createdAt: { $gte: dayStart, $lt: nextDay },
          userId: { $exists: true },
        }),
        reports.distinct('userId', {
          createdAt: { $gte: dayStart, $lt: nextDay },
          userId: { $exists: true },
        }),
      ])

    points.push({
      date: formatDayKey(dayStart),
      count: new Set([
        ...checkinUsers.filter(
          (value): value is string => typeof value === 'string'
        ),
        ...postUsers.filter(
          (value): value is string => typeof value === 'string'
        ),
        ...commentUsers.filter(
          (value): value is string => typeof value === 'string'
        ),
        ...reportUsers.filter(
          (value): value is string => typeof value === 'string'
        ),
      ]).size,
    })
  }

  return points
}

export async function buildDashboardSummary(): Promise<DashboardSummaryResponse> {
  const today = startOfDay()
  const usersCollection = await getCollection(COLLECTIONS.USERS)
  const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
  const checkinsCollection = await getCollection<ActivityDocument>(
    COLLECTIONS.CHECKINS
  )

  const [
    pendingCounts,
    dauToday,
    totalCheckInsToday,
    errorRate24h,
    newUsersToday,
    newSpotsToday,
    qualitySla,
    dauTrend,
    checkInTrend,
  ] = await Promise.all([
    getPendingReviewCounts(),
    getDauToday(),
    checkinsCollection.countDocuments({ createdAt: { $gte: today } }),
    getTrackedApiErrorRate24h(),
    usersCollection.countDocuments({ createdAt: { $gte: today } }),
    spotsCollection.countDocuments({ createdAt: { $gte: today } }),
    getSlaStatistics(),
    getDauTrend(),
    getCheckInTrend(),
  ])

  return {
    ...pendingCounts,
    dauToday,
    totalCheckInsToday,
    errorRate24h,
    newUsersToday,
    newSpotsToday,
    qualitySla,
    dauTrend,
    checkInTrend,
    generatedAt: new Date().toISOString(),
  }
}
