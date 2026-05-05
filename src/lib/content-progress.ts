/**
 * relation 기반 작품별 진행률 계산 유틸리티
 * Spec: multi-content-spot-structure
 * Requirements: 5.1, 5.2, 5.3, 5.5, 8.4
 */

import { getCollection, COLLECTIONS } from '@/lib/db'

export interface ContentProgressInput {
  userId: string
  contentName: string
}

export interface ContentProgressResult {
  contentName: string
  /** 해당 작품의 총 스팟 수 (active relations 기준) */
  totalSpots: number
  /** 사용자가 인증한 고유 스팟 수 */
  checkedSpots: number
  /** 진행률 0-100 */
  progress: number
}

/**
 * relation 기반 작품별 진행률 계산
 *
 * totalSpots = spot_content_relations에서
 *   contentName 일치 + status='active'인 고유 spotId 수
 *
 * checkedSpots = checkins에서
 *   userId 일치 + contentName 일치 + migrationStatus != 'unresolved'인 고유 spotId 수
 *
 * progress = Math.round((checkedSpots / totalSpots) * 100)
 *
 * 실패 시: 에러 로깅 후 { totalSpots: 0, checkedSpots: 0, progress: 0 } 반환 (graceful skip)
 *
 * @invariant totalSpots >= checkedSpots >= 0
 * @invariant 0 <= progress <= 100
 * @invariant unresolved 체크인은 checkedSpots에 포함되지 않음
 * @invariant 동일 spotId 중복 체크인은 1회로 카운트
 * @invariant 계산 실패 시 { totalSpots: 0, checkedSpots: 0, progress: 0 } 반환 + 에러 로깅
 */
export async function calculateContentProgress(
  input: ContentProgressInput
): Promise<ContentProgressResult> {
  const { userId, contentName } = input

  try {
    // 총 스팟 수: active relations에서 고유 spotId (Requirements 5.1)
    const relationsCollection = await getCollection(
      COLLECTIONS.SPOT_CONTENT_RELATIONS
    )
    const totalSpotIds = await relationsCollection.distinct('spotId', {
      contentName,
      status: 'active',
    })
    const totalSpots = totalSpotIds.length

    if (totalSpots === 0) {
      return { contentName, totalSpots: 0, checkedSpots: 0, progress: 0 }
    }

    // 인증한 스팟 수: 해당 contentName 체크인의 고유 spotId (Requirements 5.2)
    // unresolved 제외 (Requirements 5.3, 8.4)
    // 동일 spotId 중복 체크인 1회 카운트 — distinct 사용 (Requirements 5.5)
    const checkinsCollection = await getCollection(COLLECTIONS.CHECKINS)
    const checkedSpotIds = await checkinsCollection.distinct('spotId', {
      userId,
      contentName,
      migrationStatus: { $ne: 'unresolved' },
    })
    const checkedSpots = checkedSpotIds.length

    const progress = Math.round((checkedSpots / totalSpots) * 100)

    return { contentName, totalSpots, checkedSpots, progress }
  } catch (error) {
    // 계산 실패 시 graceful skip + 에러 로깅 (H4 수정사항)
    console.error('Content progress 계산 실패:', error)
    return { contentName, totalSpots: 0, checkedSpots: 0, progress: 0 }
  }
}
