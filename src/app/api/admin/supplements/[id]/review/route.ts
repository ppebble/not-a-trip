import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { SupplementReviewRequest } from '@/types/report'

/**
 * PUT /api/admin/supplements/[id]/review - 정보 보완 검토 (승인/반려)
 * Requirements: 2.2, 2.3, 2.4, 2.5
 *
 * - approve: type별 Append 병합 후 status → 'approved'
 * - reject: rejectionReason 필수, status → 'rejected'
 * - 병합 먼저 수행, 성공 시에만 status 변경
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

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body: SupplementReviewRequest = await request.json()
    const { action, rejectionReason } = body

    // 액션 유효성 검사
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다' },
        { status: 400 }
      )
    }

    // 반려 시 사유 필수
    if (action === 'reject' && !rejectionReason?.trim()) {
      return NextResponse.json(
        { error: '반려 사유를 입력해주세요' },
        { status: 400 }
      )
    }

    const supplementsCol = await getCollection(COLLECTIONS.SPOT_SUPPLEMENTS)
    const supplement = await supplementsCol.findOne({ id })

    if (!supplement) {
      return NextResponse.json(
        { error: '정보 보완을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 이미 처리된 supplement
    if (supplement.status !== 'pending') {
      return NextResponse.json(
        { error: '이미 처리된 정보 보완입니다' },
        { status: 400 }
      )
    }

    // 승인: type별 Append 병합
    if (action === 'approve') {
      const spotsCol = await getCollection(COLLECTIONS.SPOTS)
      const spot = await spotsCol.findOne({ id: supplement.spotId })

      if (!spot) {
        return NextResponse.json(
          { error: '대상 스팟을 찾을 수 없습니다' },
          { status: 404 }
        )
      }

      // 병합 먼저 수행, 성공 시에만 status 변경
      await mergeSupplement(supplement, spot)

      await supplementsCol.updateOne({ id }, { $set: { status: 'approved' } })

      return NextResponse.json({
        id,
        status: 'approved',
        message: '정보 보완이 승인되었습니다',
      })
    }

    // 반려
    await supplementsCol.updateOne(
      { id },
      {
        $set: {
          status: 'rejected',
          rejectionReason: rejectionReason!.trim(),
        },
      }
    )

    return NextResponse.json({
      id,
      status: 'rejected',
      message: '정보 보완이 반려되었습니다',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reviewing supplement:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * type별 Append 병합 로직
 * - photo: Spot.photos 배열에 $push
 * - scene_info: scenes 컬렉션에 새 문서 insertOne
 * - description: 기존 description 뒤에 append
 * - other: 자동 병합 없음
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mergeSupplement(supplement: any, spot: any): Promise<void> {
  const spotsCol = await getCollection(COLLECTIONS.SPOTS)

  switch (supplement.type) {
    case 'photo': {
      if (supplement.photos?.length > 0) {
        await spotsCol.updateOne(
          { id: supplement.spotId },
          { $push: { photos: { $each: supplement.photos } } as never }
        )
      }
      break
    }

    case 'scene_info': {
      if (supplement.sceneInfo) {
        const scenesCol = await getCollection(COLLECTIONS.SCENES)
        await scenesCol.insertOne({
          spotId: supplement.spotId,
          animeTitle: supplement.sceneInfo.animeTitle,
          episodeInfo: supplement.sceneInfo.episodeInfo || '',
          imageUrl: supplement.sceneInfo.captureImageUrl || '',
          createdAt: new Date(),
        })
      }
      break
    }

    case 'description': {
      const existingDesc = (spot.description as string) || ''
      const newDesc = existingDesc
        ? `${existingDesc}\n\n${supplement.content}`
        : supplement.content
      await spotsCol.updateOne(
        { id: supplement.spotId },
        { $set: { description: newDesc } }
      )
      break
    }

    case 'other':
      // 자동 병합 없음
      break
  }
}
