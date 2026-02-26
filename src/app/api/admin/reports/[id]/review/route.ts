import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { validateReviewAction } from '@/lib/report-validation'
import type { ReportStatus, ReviewHistory } from '@/types/report'
import type { RelatedContent, SpotCategory } from '@/types/spot'

/**
 * 다음 스팟 ID 생성 (SPOT-{숫자} 형식)
 */
async function generateSpotId(): Promise<string> {
  const collection = await getCollection(COLLECTIONS.SPOTS)

  const spots = await collection
    .find({ id: { $regex: /^SPOT-\d+$/ } })
    .project({ id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  if (spots.length === 0) {
    return 'SPOT-001'
  }

  const match = spots[0].id.match(/^SPOT-(\d+)$/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `SPOT-${nextNumber.toString().padStart(3, '0')}`
}

/**
 * PUT /api/admin/reports/[id]/review - 관리자 제보 검토
 * Requirements: 5.2, 5.3, 1.5, 2.1
 *
 * - approve: 스팟 생성 + firstReporterId/Name 기록 + approvedSpotId 설정
 * - reject: 사유 필수 검사 + 상태 변경
 * - request_revision: 수정 요청 사유 기록 + 상태 변경
 * - reviewHistory 배열에 이력 추가 + 최신 검토 정보 동시 업데이트
 */
export async function PUT(
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

    // 관리자 권한 검사
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { action, comment } = body as {
      action: string
      comment?: string
    }

    // 검토 액션 유효성 검사
    const validation = validateReviewAction(action, comment)
    if (!validation.valid) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: validation.errors },
        { status: 400 }
      )
    }

    const reportsCollection = await getCollection(COLLECTIONS.SPOT_REPORTS)
    const report = await reportsCollection.findOne({ id })

    if (!report) {
      return NextResponse.json(
        { error: '제보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // pending 상태의 제보만 검토 가능
    if (report.status !== 'pending') {
      return NextResponse.json(
        { error: '이미 처리된 제보입니다' },
        { status: 400 }
      )
    }

    const statusMap: Record<string, ReportStatus> = {
      approve: 'approved',
      reject: 'rejected',
      request_revision: 'revision_requested',
    }

    const newStatus = statusMap[action]
    const now = new Date()
    const adminId = session.user.id!

    const historyEntry: ReviewHistory = {
      status: newStatus,
      comment: comment || '',
      reviewedAt: now,
      reviewedBy: adminId,
    }

    // 승인 시 스팟 생성 (Requirements 1.5, 2.1)
    let approvedSpotId: string | undefined
    if (action === 'approve') {
      const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
      const spotId = await generateSpotId()

      const newSpot = {
        id: spotId,
        name: report.name as string,
        description: report.description as string,
        photos: (report.evidencePairs as { realPhotoUrl: string }[]).map(
          (pair) => pair.realPhotoUrl
        ),
        address: report.address as string,
        coordinates: report.coordinates as { lat: number; lng: number },
        category: report.category as SpotCategory,
        relatedMedia: [],
        relatedContent: (report.relatedContent || []) as RelatedContent[],
        externalLinks: [],
        authorId: report.reporterId as string,
        authorName: report.reporterName as string,
        isGuestSpot: false,
        firstReporterId: report.reporterId as string,
        firstReporterName: report.reporterName as string,
        createdAt: now,
        updatedAt: now,
      }

      await spotsCollection.insertOne(newSpot)
      approvedSpotId = spotId
    }

    // 제보 상태 업데이트 + reviewHistory 추가
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: Record<string, any> = {
      status: newStatus,
      reviewedBy: adminId,
      reviewedAt: now,
      reviewComment: comment || '',
      updatedAt: now,
    }

    if (approvedSpotId) {
      updateFields.approvedSpotId = approvedSpotId
    }

    await reportsCollection.updateOne(
      { id },
      {
        $set: updateFields,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $push: { reviewHistory: historyEntry } as any,
      }
    )

    const actionLabels: Record<string, string> = {
      approve: '승인',
      reject: '반려',
      request_revision: '수정요청',
    }

    return NextResponse.json({
      id,
      status: newStatus,
      approvedSpotId,
      message: `제보가 ${actionLabels[action]}되었습니다`,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reviewing report:', error)
    return NextResponse.json(
      { error: '제보 검토에 실패했습니다' },
      { status: 500 }
    )
  }
}
