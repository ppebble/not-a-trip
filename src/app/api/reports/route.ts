import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { validateSpotReportInput } from '@/lib/report-validation'
import type { CreateSpotReportInput, ReportStatus } from '@/types/report'

/**
 * SpotReport MongoDB Document
 */
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

/**
 * 다음 제보 ID 생성 (REPORT-{숫자} 형식)
 */
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

/**
 * GET /api/reports - 내 제보 목록 조회
 * Requirements: 1.6
 * - 세션 유저의 reporterId로 필터링하여 목록 반환
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
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
    // eslint-disable-next-line no-console
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: '제보 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reports - 신규 성지 제보 생성
 * Requirements: 1.2, 1.4
 * - 유효성 검사 → 인증 확인 → status 'pending'으로 저장
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const body: CreateSpotReportInput = await request.json()

    // 유효성 검사 (Requirements 1.2)
    const validation = validateSpotReportInput(body)
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
      status: 'pending', // Requirements 1.4: 항상 pending으로 시작
      name: body.name.trim(),
      description: body.description.trim(),
      address: body.address.trim(),
      coordinates: {
        lat: body.coordinates.lat,
        lng: body.coordinates.lng,
      },
      category: body.category,
      relatedContent: body.relatedContent,
      evidencePairs: body.evidencePairs,
      episodeInfo: body.episodeInfo.trim(),
      additionalPhotos: body.additionalPhotos,
      reviewHistory: [],
      createdAt: now,
      updatedAt: now,
    }

    await collection.insertOne(newReport)

    return NextResponse.json(
      {
        id: newReport.id,
        message: '제보가 접수되었습니다',
      },
      { status: 201 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: '제보 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
