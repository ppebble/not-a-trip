import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { validateStatusReportInput } from '@/lib/report-validation'
import type { CreateStatusReportInput } from '@/types/report'

/**
 * 다음 상태 신고 ID 생성 (STATUS-REPORT-{숫자} 형식)
 */
async function generateStatusReportId(): Promise<string> {
  const collection = await getCollection(COLLECTIONS.SPOT_STATUS_REPORTS)

  const reports = await collection
    .find({ id: { $regex: /^STATUS-REPORT-\d+$/ } })
    .project({ id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  if (reports.length === 0) {
    return 'STATUS-REPORT-001'
  }

  const match = reports[0].id.match(/^STATUS-REPORT-(\d+)$/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `STATUS-REPORT-${nextNumber.toString().padStart(3, '0')}`
}

/**
 * GET /api/spots/[id]/status-reports - 스팟 상태 신고 이력 조회
 * Requirements: 4.1
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: spotId } = await params
    const collection = await getCollection(COLLECTIONS.SPOT_STATUS_REPORTS)

    const reports = await collection
      .find({ spotId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      reports,
      total: reports.length,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching status reports:', error)
    return NextResponse.json(
      { error: '상태 신고 이력 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/spots/[id]/status-reports - 스팟 상태 신고
 * Requirements: 4.1, 4.2, 4.3
 *
 * 자동 전환 로직:
 * 1. 사진 증거 첨부 시 → 즉시 스팟 상태 업데이트
 * 2. 동일 스팟 신고 3회 이상 누적 시 → 스팟 상태 업데이트
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { id: spotId } = await params
    const body: CreateStatusReportInput = await request.json()

    // 유효성 검사
    const validation = validateStatusReportInput(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: validation.errors },
        { status: 400 }
      )
    }

    // 스팟 존재 여부 확인
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await spotsCollection.findOne({ id: spotId })
    if (!spot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 상태 신고 저장
    const statusReportsCollection = await getCollection(
      COLLECTIONS.SPOT_STATUS_REPORTS
    )
    const now = new Date()
    const reportId = await generateStatusReportId()

    const newReport = {
      id: reportId,
      spotId,
      reporterId: session.user.id!,
      reporterName:
        session.user.name || session.user.email?.split('@')[0] || '익명',
      status: body.status,
      description: body.description.trim(),
      photoUrl: body.photoUrl || undefined,
      createdAt: now,
    }

    await statusReportsCollection.insertOne(newReport)

    // 자동 전환 조건 평가
    const hasPhoto = !!body.photoUrl
    let statusUpdated = false

    if (hasPhoto) {
      // 사진 증거 첨부 시 즉시 전환
      await spotsCollection.updateOne(
        { id: spotId },
        {
          $set: {
            spotStatus: body.status,
            updatedAt: now,
          },
          $inc: { statusReportCount: 1 },
        }
      )
      statusUpdated = true
    } else {
      // 사진 없는 경우: 누적 신고 수 확인
      const reportCount = await statusReportsCollection.countDocuments({
        spotId,
      })

      if (reportCount >= 3) {
        // 3회 이상 누적 시 전환
        await spotsCollection.updateOne(
          { id: spotId },
          {
            $set: {
              spotStatus: body.status,
              updatedAt: now,
            },
            $inc: { statusReportCount: 1 },
          }
        )
        statusUpdated = true
      } else {
        // 3회 미만: 카운트만 증가
        await spotsCollection.updateOne(
          { id: spotId },
          {
            $inc: { statusReportCount: 1 },
            $set: { updatedAt: now },
          }
        )
      }
    }

    return NextResponse.json(
      {
        id: newReport.id,
        message: '상태 신고가 접수되었습니다',
        statusUpdated,
      },
      { status: 201 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating status report:', error)
    return NextResponse.json(
      { error: '상태 신고에 실패했습니다' },
      { status: 500 }
    )
  }
}
