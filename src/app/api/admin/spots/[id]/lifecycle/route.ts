// ============================================
// 스팟 라이프사이클 관리자 API 엔드포인트
// Spec: 40-spot-quality-workflow
// Requirements: 2.3, 2.4, 2.5, 2.6, 2.7
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import { extractClientIp, logAdminAction } from '@/lib/audit-log'
import {
  transitionStatus,
  getAllowedTransitions,
} from '@/lib/spot-quality/lifecycle-manager'
import { getCollection, COLLECTIONS } from '@/lib/db'
import type { SpotLifecycleStatus } from '@/types/spot-quality'

const VALID_STATUSES: SpotLifecycleStatus[] = [
  'draft',
  'pending',
  'approved',
  'archived',
  'closed',
]

/**
 * GET /api/admin/spots/[id]/lifecycle
 * 현재 상태 + 허용된 전이 목록 + 이력 조회
 * Requirements: 2.3, 2.5, 2.6
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. 관리자 권한 확인
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

    // ObjectId 유효성 검증
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 스팟 ID입니다' },
        { status: 400 }
      )
    }

    // 2. spots 컬렉션에서 스팟 조회
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await spotsCollection.findOne({ _id: new ObjectId(id) })

    if (!spot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 3. 현재 lifecycleStatus (없으면 'approved' 기본값)
    const currentStatus: SpotLifecycleStatus =
      (spot.lifecycleStatus as SpotLifecycleStatus) ?? 'approved'

    // 4. 허용된 전이 목록
    const allowedTransitions = getAllowedTransitions(currentStatus)

    // 5. 이력 조회 (최신 20건)
    const historyCollection = await getCollection(
      COLLECTIONS.SPOT_LIFECYCLE_HISTORY
    )
    const history = await historyCollection
      .find({ spotId: new ObjectId(id) })
      .sort({ changedAt: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({
      currentStatus,
      allowedTransitions,
      history,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[lifecycle GET] error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/spots/[id]/lifecycle
 * 상태 전이 요청 처리
 * Requirements: 2.3, 2.4, 2.7
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. 관리자 권한 확인
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

    // ObjectId 유효성 검증
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 스팟 ID입니다' },
        { status: 400 }
      )
    }

    // 2. 요청 바디 파싱
    let body: { targetStatus?: unknown; reason?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: '요청 바디가 올바르지 않습니다' },
        { status: 400 }
      )
    }

    const { targetStatus, reason } = body

    // 3. targetStatus 유효성 검증
    if (
      typeof targetStatus !== 'string' ||
      !VALID_STATUSES.includes(targetStatus as SpotLifecycleStatus)
    ) {
      return NextResponse.json(
        {
          error: '유효하지 않은 targetStatus입니다',
          validStatuses: VALID_STATUSES,
        },
        { status: 400 }
      )
    }

    const reasonStr = typeof reason === 'string' ? reason : ''

    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const existingSpot = await spotsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!existingSpot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const previousStatus: SpotLifecycleStatus =
      (existingSpot.lifecycleStatus as SpotLifecycleStatus) ?? 'approved'

    // 4. 상태 전이 실행
    const changedBy =
      (session.user as { id?: string; email?: string }).id ??
      session.user.email ??
      'unknown'

    const result = await transitionStatus(
      id,
      targetStatus as SpotLifecycleStatus,
      reasonStr,
      changedBy
    )

    // 5. 실패 시 400 반환
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          allowedTransitions: result.allowedTransitions,
        },
        { status: 400 }
      )
    }

    void logAdminAction({
      adminId: changedBy,
      adminName: session.user.name ?? session.user.email ?? undefined,
      actionType: 'transition_spot_lifecycle',
      resourceType: 'spot',
      resourceId: id,
      changes: [
        {
          field: 'lifecycleStatus',
          before: previousStatus,
          after: result.newStatus ?? targetStatus,
        },
        {
          field: 'reason',
          before: null,
          after: reasonStr,
        },
      ],
      ipAddress: extractClientIp(request.headers),
    }).catch((auditError) => {
      // eslint-disable-next-line no-console
      console.error('Failed to write audit log:', auditError)
    })

    // 6. 성공 시 200 반환
    return NextResponse.json({
      success: true,
      newStatus: result.newStatus,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[lifecycle PUT] error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
