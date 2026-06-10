import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { SpotStatusUpdateRequest, SpotStatus } from '@/types/report'

const VALID_SPOT_STATUSES: SpotStatus[] = [
  'normal',
  'partially_changed',
  'under_construction',
  'demolished',
  'inaccessible',
]

/**
 * PUT /api/admin/status-reports/spots/[spotId]/status - 스팟 상태 수동 변경
 * Requirements: 4.2, 4.4, 4.5, 4.6
 * - spotStatus를 지정된 상태로 $set
 * - 해당 spotId의 pending 신고를 모두 resolved로 일괄 updateMany
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
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

    const { spotId } = await params
    const body: SpotStatusUpdateRequest = await request.json()
    const { status } = body

    if (!status || !VALID_SPOT_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태 값입니다' },
        { status: 400 }
      )
    }

    const spotsCol = await getCollection(COLLECTIONS.SPOTS)
    const spot = await spotsCol.findOne({ id: spotId })

    if (!spot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 스팟 상태 변경
    await spotsCol.updateOne({ id: spotId }, { $set: { spotStatus: status } })

    // 해당 spotId의 pending 신고를 모두 resolved로 일괄 처리
    const statusReportsCol = await getCollection(
      COLLECTIONS.SPOT_STATUS_REPORTS
    )
    await statusReportsCol.updateMany(
      {
        spotId,
        $or: [
          { reviewStatus: 'pending' },
          { reviewStatus: { $exists: false } },
        ],
      },
      { $set: { reviewStatus: 'resolved' } }
    )

    return NextResponse.json({
      spotId,
      spotStatus: status,
      message: '스팟 상태가 변경되었습니다',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating spot status:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
