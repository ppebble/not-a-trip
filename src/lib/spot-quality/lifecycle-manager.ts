import { runtimeLogger } from '@/lib/runtime-logger'
// ============================================
// 스팟 라이프사이클 상태 전이 관리 모듈
// Spec: 40-spot-quality-workflow
// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
// ============================================

import { getCollection, COLLECTIONS } from '@/lib/db'
import { ALLOWED_TRANSITIONS } from '@/types/spot-quality'
import type {
  SpotLifecycleStatus,
  TransitionResult,
  LifecycleTransition,
} from '@/types/spot-quality'

/**
 * 상태 전이 유효성 검증
 * Requirements 2.7
 */
export function isValidTransition(
  from: SpotLifecycleStatus,
  to: SpotLifecycleStatus
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * 현재 상태에서 허용된 전이 목록 반환
 * Requirements 2.7
 */
export function getAllowedTransitions(
  currentStatus: SpotLifecycleStatus
): SpotLifecycleStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] ?? []
}

/**
 * 상태 전이 실행
 * - spots.lifecycleStatus 업데이트
 * - spot_lifecycle_history에 이력 기록
 * Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */
export async function transitionStatus(
  spotId: string,
  targetStatus: SpotLifecycleStatus,
  reason: string,
  changedBy: string
): Promise<TransitionResult> {
  try {
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)

    // 1. spots 컬렉션에서 스팟 조회
    const spot = await spotsCollection.findOne({ id: spotId })

    // 2. 스팟이 없으면 에러 반환
    if (!spot) {
      return { success: false, error: '스팟을 찾을 수 없습니다.' }
    }

    // 3. 현재 lifecycleStatus 가져오기 (없으면 'approved' 기본값)
    const currentStatus: SpotLifecycleStatus =
      (spot.lifecycleStatus as SpotLifecycleStatus) ?? 'approved'

    // 4. 상태 전이 유효성 검증
    if (!isValidTransition(currentStatus, targetStatus)) {
      return {
        success: false,
        error: '유효하지 않은 상태 전이입니다.',
        allowedTransitions: getAllowedTransitions(currentStatus),
      }
    }

    const now = new Date()

    // 5. spots 컬렉션 업데이트
    await spotsCollection.updateOne(
      { id: spotId },
      { $set: { lifecycleStatus: targetStatus, updatedAt: now } }
    )

    // 6. spot_lifecycle_history에 이력 기록
    const historyCollection = await getCollection(
      COLLECTIONS.SPOT_LIFECYCLE_HISTORY
    )

    const historyEntry: Omit<LifecycleTransition, never> & {
      spotId: string
      changedAt: Date
    } = {
      spotId,
      from: currentStatus,
      to: targetStatus,
      reason,
      changedBy,
      changedAt: now,
    }

    await historyCollection.insertOne(historyEntry)

    // 7. 성공 결과 반환
    return { success: true, newStatus: targetStatus }
  } catch (error) {
    runtimeLogger.error('[lifecycle-manager] transitionStatus error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '상태 전이 중 오류가 발생했습니다.',
    }
  }
}
