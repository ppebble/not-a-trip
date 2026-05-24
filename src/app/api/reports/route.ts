import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { validateSpotReportInput } from '@/lib/report-validation'
import type { CreateSpotReportInput, ReportStatus } from '@/types/report'
import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getClientIp,
  guardReportSpam,
  logIfSanitized,
  sanitizeOptionalPlainText,
  sanitizePlainText,
  sanitizeUrl,
  SpamGuardError,
} from '@/lib/security'
import { recordApiErrorMetric } from '@/lib/ops/metrics'

interface SpotReportDocument {
  id: string
  reporterId: string
  reporterName: string
  status: ReportStatus
  name: string
  description: string
  address: string
  coordinates: { lat: number; lng: number }
  category: string
  relatedContent: {
    name: string
    type: string
    year?: number
    additionalInfo?: string
  }[]
  evidencePairs: {
    captureImageUrl: string
    realPhotoUrl: string
    description?: string
  }[]
  episodeInfo: string
  additionalPhotos?: string[]
  reviewHistory?: []
  createdAt: Date
  updatedAt: Date
}

async function generateReportId(): Promise<string> {
  const collection = await getCollection<SpotReportDocument>(
    COLLECTIONS.SPOT_REPORTS
  )

  const reports = await collection
    .find({ id: { $regex: /^REPORT-\d+$/ } })
    .project({ id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  if (reports.length === 0) {
    return 'REPORT-001'
  }

  const match = reports[0].id.match(/^REPORT-(\d+)$/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `REPORT-${nextNumber.toString().padStart(3, '0')}`
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const collection = await getCollection<SpotReportDocument>(
      COLLECTIONS.SPOT_REPORTS
    )

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit
    const query = { reporterId: session.user.id! }

    const [reports, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ])

    return NextResponse.json({
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: '제보 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const ip = getClientIp(request)
    const rateLimit = evaluateSlidingWindowLimit({
      key: `report-write:${session.user.id}`,
      limit: 30,
      windowMs: 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '제보 등록 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: createRateLimitHeaders(rateLimit) }
      )
    }

    guardReportSpam(session.user.id)

    const body: CreateSpotReportInput = await request.json()
    const sanitizedBody: CreateSpotReportInput = {
      ...body,
      name: sanitizePlainText(body.name),
      description: sanitizePlainText(body.description),
      address: sanitizePlainText(body.address),
      episodeInfo: sanitizePlainText(body.episodeInfo),
      relatedContent: body.relatedContent.map((item) => ({
        ...item,
        name: sanitizePlainText(item.name),
        additionalInfo: sanitizeOptionalPlainText(item.additionalInfo),
      })),
      evidencePairs: body.evidencePairs.map((pair) => ({
        captureImageUrl: sanitizeUrl(pair.captureImageUrl),
        realPhotoUrl: sanitizeUrl(pair.realPhotoUrl),
        description: sanitizeOptionalPlainText(pair.description),
      })),
      additionalPhotos: body.additionalPhotos?.map(sanitizeUrl).filter(Boolean),
    }

    await Promise.all([
      logIfSanitized({
        label: 'report.name',
        before: body.name,
        after: sanitizedBody.name,
        userId: session.user.id,
        ip,
      }),
      logIfSanitized({
        label: 'report.description',
        before: body.description,
        after: sanitizedBody.description,
        userId: session.user.id,
        ip,
      }),
      logIfSanitized({
        label: 'report.address',
        before: body.address,
        after: sanitizedBody.address,
        userId: session.user.id,
        ip,
      }),
      logIfSanitized({
        label: 'report.episodeInfo',
        before: body.episodeInfo,
        after: sanitizedBody.episodeInfo,
        userId: session.user.id,
        ip,
      }),
    ])

    const validation = validateSpotReportInput(sanitizedBody)
    if (!validation.valid) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: validation.errors },
        { status: 400 }
      )
    }

    const collection = await getCollection<SpotReportDocument>(
      COLLECTIONS.SPOT_REPORTS
    )
    const now = new Date()
    const reportId = await generateReportId()

    const newReport: SpotReportDocument = {
      id: reportId,
      reporterId: session.user.id!,
      reporterName:
        session.user.name || session.user.email?.split('@')[0] || '익명',
      status: 'pending',
      name: sanitizedBody.name.trim(),
      description: sanitizedBody.description.trim(),
      address: sanitizedBody.address.trim(),
      coordinates: {
        lat: sanitizedBody.coordinates.lat,
        lng: sanitizedBody.coordinates.lng,
      },
      category: sanitizedBody.category,
      relatedContent: sanitizedBody.relatedContent,
      evidencePairs: sanitizedBody.evidencePairs,
      episodeInfo: sanitizedBody.episodeInfo.trim(),
      additionalPhotos: sanitizedBody.additionalPhotos,
      reviewHistory: [],
      createdAt: now,
      updatedAt: now,
    }

    await collection.insertOne(newReport)

    return NextResponse.json(
      {
        id: newReport.id,
        message: '제보가 접수되었습니다.',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof SpamGuardError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: { 'Retry-After': String(error.retryAfterSeconds) },
        }
      )
    }

    console.error('Error creating report:', error)
    await recordApiErrorMetric({ path: '/api/reports', statusCode: 500 })
    return NextResponse.json(
      { error: '제보 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
