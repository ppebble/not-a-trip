/**
 * 뱃지 획득 조건 체크 유틸리티
 * Spec: 07-pilgrimage-checkin
 * Requirements: 4.1, 4.2, 4.3
 */

import { getCollection, COLLECTIONS } from '@/lib/db'
import { Badge, UserBadge, DEFAULT_BADGES } from '@/types'
import { calculateContentProgress } from '@/lib/content-progress'

interface CheckInDocument {
  id: string
  spotId: string
  userId: string
  createdAt: Date
}

interface BadgeDocument {
  id: string
  code: string
  name: string
  description: string
  iconUrl: string
  type: 'achievement' | 'content' | 'special'
  contentName?: string
  condition: {
    type: 'checkin_count' | 'content_progress' | 'first_action'
    requiredCount?: number
    requiredProgress?: number
    contentName?: string
  }
  createdAt: Date
}

interface UserBadgeDocument {
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
}

/**
 * 유저가 이미 획득한 뱃지인지 확인
 */
async function hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
  const collection = await getCollection<UserBadgeDocument>(
    COLLECTIONS.USER_BADGES
  )
  const exists = await collection.findOne({ userId, badgeId })
  return !!exists
}

/**
 * 뱃지 부여
 */
async function awardBadge(
  userId: string,
  badge: BadgeDocument
): Promise<UserBadge | null> {
  // 이미 획득한 뱃지인지 확인
  if (await hasUserBadge(userId, badge.id)) {
    return null
  }

  const collection = await getCollection<UserBadgeDocument>(
    COLLECTIONS.USER_BADGES
  )

  const userBadge: UserBadgeDocument = {
    id: `UB-${userId}-${badge.code}`,
    userId,
    badgeId: badge.id,
    earnedAt: new Date(),
  }

  await collection.insertOne(userBadge)

  return {
    id: userBadge.id,
    userId: userBadge.userId,
    badgeId: userBadge.badgeId,
    badge: {
      id: badge.id,
      code: badge.code,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      type: badge.type,
      contentName: badge.contentName,
      condition: badge.condition,
      createdAt: badge.createdAt,
    } as Badge,
    earnedAt: userBadge.earnedAt,
  }
}

/**
 * 뱃지 획득 조건 체크 및 자동 부여
 * Requirements: 4.1, 4.2, 4.3
 *
 * @param userId 유저 ID
 * @returns 새로 획득한 뱃지 목록
 */
export async function checkAndAwardBadges(
  userId: string
): Promise<UserBadge[]> {
  const earnedBadges: UserBadge[] = []

  try {
    const checkinsCollection = await getCollection<CheckInDocument>(
      COLLECTIONS.CHECKINS
    )
    const badgesCollection = await getCollection<BadgeDocument>(
      COLLECTIONS.BADGES
    )

    // 유저의 인증 통계
    const totalCheckIns = await checkinsCollection.countDocuments({ userId })
    const uniqueSpots = await checkinsCollection
      .distinct('spotId', { userId })
      .then((spots) => spots.length)

    // 모든 뱃지 조회
    const allBadges = await badgesCollection.find({}).toArray()

    for (const badge of allBadges) {
      const { condition } = badge

      let shouldAward = false

      switch (condition.type) {
        case 'first_action':
          // 첫 인증샷 (Requirements 4.3)
          if (badge.code === DEFAULT_BADGES.FIRST_STEP && totalCheckIns >= 1) {
            shouldAward = true
          }
          break

        case 'checkin_count':
          // 인증 수 기반 (Requirements 4.1 일부)
          if (
            condition.requiredCount &&
            uniqueSpots >= condition.requiredCount
          ) {
            shouldAward = true
          }
          break

        case 'content_progress':
          // 콘텐츠별 진행률 — relation 기반 (Requirements 5.4)
          if (condition.contentName && condition.requiredProgress) {
            try {
              const progressResult = await calculateContentProgress({
                userId,
                contentName: condition.contentName,
              })
              if (progressResult.progress >= condition.requiredProgress) {
                shouldAward = true
              }
            } catch (progressError) {
              // relation 기반 계산 실패 시 content_progress 뱃지 평가 건너뛰기 (H4, Requirements 11.6)
              console.error(
                `Content progress 뱃지 평가 건너뛰기 (${badge.code}):`,
                progressError
              )
            }
          }
          break
      }

      if (shouldAward) {
        const awarded = await awardBadge(userId, badge)
        if (awarded) {
          earnedBadges.push(awarded)
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error)
  }

  return earnedBadges
}

/**
 * 특정 뱃지 획득 조건 체크
 */
export async function checkSpecificBadge(
  userId: string,
  badgeCode: string
): Promise<UserBadge | null> {
  const badgesCollection = await getCollection<BadgeDocument>(
    COLLECTIONS.BADGES
  )
  const badge = await badgesCollection.findOne({ code: badgeCode })

  if (!badge) return null

  // 이미 획득했는지 확인
  if (await hasUserBadge(userId, badge.id)) {
    return null
  }

  const checkinsCollection = await getCollection<CheckInDocument>(
    COLLECTIONS.CHECKINS
  )

  const { condition } = badge
  let shouldAward = false

  switch (condition.type) {
    case 'first_action':
      const totalCheckIns = await checkinsCollection.countDocuments({ userId })
      if (totalCheckIns >= 1) shouldAward = true
      break

    case 'checkin_count':
      const uniqueSpots = await checkinsCollection
        .distinct('spotId', { userId })
        .then((spots) => spots.length)
      if (condition.requiredCount && uniqueSpots >= condition.requiredCount) {
        shouldAward = true
      }
      break
  }

  if (shouldAward) {
    return await awardBadge(userId, badge)
  }

  return null
}
