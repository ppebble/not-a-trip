/**
 * 체크인 콘텐츠 진행률 계산 유틸리티
 * Spec: 38-checkin-content-progress
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 2.1, 2.2, 2.3
 */

import { getCollection, COLLECTIONS } from '@/lib/db'
import { ContentProgress } from '@/types'

/**
 * spot_content_relations에서 contentName별 총 스팟 수 집계
 *
 * - status: 'active'인 문서만 포함 (Requirements 1.1, 2.1)
 * - 동일 contentName에 동일 spotId가 여러 relation으로 연결된 경우 1회로 계산 (Requirements 2.2)
 *
 * @returns Map<contentName, totalSpots>
 */
export async function fetchTotalSpotsMap(): Promise<Map<string, number>> {
  const collection = await getCollection(COLLECTIONS.SPOT_CONTENT_RELATIONS)

  const pipeline = [
    // 1. active 상태만 필터
    { $match: { status: 'active' } },
    // 2. contentName별로 distinct spotId 집계
    {
      $group: {
        _id: { contentName: '$contentName', spotId: '$spotId' },
      },
    },
    // 3. contentName별 고유 스팟 수 카운트
    {
      $group: {
        _id: '$_id.contentName',
        totalSpots: { $sum: 1 },
      },
    },
  ]

  const results = await collection.aggregate(pipeline).toArray()

  const map = new Map<string, number>()
  for (const doc of results) {
    if (doc._id != null) {
      map.set(doc._id as string, doc.totalSpots as number)
    }
  }

  return map
}

/**
 * checkins에서 userId별 contentName별 인증 스팟 수 집계
 *
 * - migrationStatus: { $ne: 'unresolved' }인 문서만 포함 (Requirements 1.2, 1.6)
 * - contentName이 없는 체크인 자동 제외 (Requirements 1.2)
 * - 동일 스팟에 여러 번 체크인이 있어도 1회로 계산 (Requirements 1.6)
 *
 * @param userId 유저 ID
 * @returns Map<contentName, checkedSpots>
 */
export async function fetchCheckedSpotsMap(
  userId: string
): Promise<Map<string, number>> {
  const collection = await getCollection(COLLECTIONS.CHECKINS)

  const pipeline = [
    // 1. 해당 유저 + unresolved 제외 + contentName 존재 필터
    {
      $match: {
        userId,
        migrationStatus: { $ne: 'unresolved' },
        contentName: { $exists: true, $ne: null },
      },
    },
    // 2. contentName별로 distinct spotId 집계
    {
      $group: {
        _id: { contentName: '$contentName', spotId: '$spotId' },
      },
    },
    // 3. contentName별 고유 인증 스팟 수 카운트
    {
      $group: {
        _id: '$_id.contentName',
        checkedSpots: { $sum: 1 },
      },
    },
  ]

  const results = await collection.aggregate(pipeline).toArray()

  const map = new Map<string, number>()
  for (const doc of results) {
    if (doc._id != null) {
      map.set(doc._id as string, doc.checkedSpots as number)
    }
  }

  return map
}

/**
 * totalSpotsMap과 checkedSpotsMap을 병합하여 ContentProgress[] 계산
 *
 * - checkedSpots === 0인 항목 제외 (Requirements 1.4)
 * - progress = Math.round((checkedSpots / totalSpots) * 100) (Requirements 1.3)
 *
 * @param totalSpotsMap contentName → totalSpots
 * @param checkedSpotsMap contentName → checkedSpots
 * @returns ContentProgress[]
 */
export function mergeProgressMaps(
  totalSpotsMap: Map<string, number>,
  checkedSpotsMap: Map<string, number>
): ContentProgress[] {
  const result: ContentProgress[] = []

  for (const [contentName, totalSpots] of totalSpotsMap) {
    const checkedSpots = checkedSpotsMap.get(contentName) ?? 0

    // checkedSpots === 0인 작품 제외 (Requirements 1.4)
    if (checkedSpots === 0) continue

    const progress = Math.round((checkedSpots / totalSpots) * 100)

    result.push({ contentName, totalSpots, checkedSpots, progress })
  }

  return result
}
