/**
 * 성지순례 인증(Check-in) 시스템 타입 정의
 * Spec: 07-pilgrimage-checkin
 */

// ============================================
// CheckIn (인증) 타입
// ============================================

/** 인증 데이터 */
export interface CheckIn {
  id: string
  spotId: string
  userId: string
  userName: string
  userImage?: string
  /** 유저가 올린 인증샷 URL */
  photoUrl: string
  /** 비교할 씬 이미지 URL (스팟의 대표 씬) */
  sceneImageUrl?: string
  /** 방문 날짜 */
  visitedAt: Date
  /** 간단한 코멘트 */
  comment?: string
  /** 좋아요 수 */
  likeCount: number
  createdAt: Date
  updatedAt?: Date
}

/** 인증 생성 입력 */
export interface CheckInInput {
  spotId: string
  photoUrl: string
  sceneImageUrl?: string
  visitedAt: Date
  comment?: string
}

/** 인증 목록 조회 필터 */
export interface CheckInFilter {
  spotId?: string
  userId?: string
  sortBy?: 'latest' | 'popular'
  page?: number
  limit?: number
}

// ============================================
// Badge (뱃지) 타입
// ============================================

/** 뱃지 타입 */
export type BadgeType = 'achievement' | 'content' | 'special'

/** 뱃지 획득 조건 타입 */
export type BadgeConditionType =
  | 'checkin_count'
  | 'content_progress'
  | 'first_action'

/** 뱃지 획득 조건 */
export interface BadgeCondition {
  type: BadgeConditionType
  /** 필요한 인증 수 (checkin_count 타입) */
  requiredCount?: number
  /** 필요한 진행률 0-100 (content_progress 타입) */
  requiredProgress?: number
  /** 관련 콘텐츠명 (content_progress 타입) */
  contentName?: string
}

/** 뱃지 정의 */
export interface Badge {
  id: string
  /** 뱃지 코드 (예: first_step, slam_dunk_explorer) */
  code: string
  /** 뱃지 이름 */
  name: string
  /** 뱃지 설명 */
  description: string
  /** 뱃지 아이콘 URL */
  iconUrl: string
  /** 뱃지 타입 */
  type: BadgeType
  /** 관련 콘텐츠 (작품별 뱃지인 경우) */
  contentName?: string
  /** 획득 조건 */
  condition: BadgeCondition
  createdAt: Date
}

/** 유저가 획득한 뱃지 */
export interface UserBadge {
  id: string
  userId: string
  badgeId: string
  /** 뱃지 정보 (조인용) */
  badge?: Badge
  earnedAt: Date
}

// ============================================
// UserStats (유저 통계) 타입
// ============================================

/** 콘텐츠별 진행률 */
export interface ContentProgress {
  contentName: string
  /** 해당 콘텐츠의 총 스팟 수 */
  totalSpots: number
  /** 인증한 스팟 수 */
  checkedSpots: number
  /** 진행률 (0-100) */
  progress: number
}

/** 유저 통계 */
export interface UserStats {
  userId: string
  /** 총 인증 수 */
  totalCheckIns: number
  /** 방문한 스팟 수 (중복 제외) */
  uniqueSpots: number
  /** 획득한 뱃지 수 */
  badgeCount: number
  /** 콘텐츠별 진행률 */
  contentProgress: ContentProgress[]
  updatedAt: Date
}

// ============================================
// 기본 뱃지 상수
// ============================================

/** 기본 뱃지 코드 */
export const DEFAULT_BADGES = {
  FIRST_STEP: 'first_step',
  EXPLORER_10: 'explorer_10',
  EXPLORER_50: 'explorer_50',
} as const

/** 기본 뱃지 정의 목록 */
export const DEFAULT_BADGE_DEFINITIONS: Omit<Badge, 'id' | 'createdAt'>[] = [
  {
    code: DEFAULT_BADGES.FIRST_STEP,
    name: '첫 발자국',
    description: '첫 인증샷을 업로드했습니다',
    iconUrl: '/icons/badges/first-step.webp',
    type: 'achievement',
    condition: {
      type: 'first_action',
    },
  },
  {
    code: DEFAULT_BADGES.EXPLORER_10,
    name: '탐험가',
    description: '10개의 스팟을 인증했습니다',
    iconUrl: '/icons/badges/explorer-10.webp',
    type: 'achievement',
    condition: {
      type: 'checkin_count',
      requiredCount: 10,
    },
  },
  {
    code: DEFAULT_BADGES.EXPLORER_50,
    name: '베테랑 탐험가',
    description: '50개의 스팟을 인증했습니다',
    iconUrl: '/icons/badges/explorer-50.webp',
    type: 'achievement',
    condition: {
      type: 'checkin_count',
      requiredCount: 50,
    },
  },
]

/**
 * 작품별 뱃지 생성 헬퍼
 * @param contentName 작품명
 * @param progress 필요 진행률 (50 = 탐험가, 100 = 정복자)
 */
export function createContentBadge(
  contentName: string,
  progress: 50 | 100
): Omit<Badge, 'id' | 'createdAt'> {
  const isComplete = progress === 100
  const code = `${contentName.toLowerCase().replace(/\s+/g, '_')}_${isComplete ? 'complete' : 'half'}`

  return {
    code,
    name: `${contentName} ${isComplete ? '정복자' : '탐험가'}`,
    description: `${contentName}의 성지를 ${isComplete ? '모두' : '50%'} 인증했습니다`,
    iconUrl: `/icons/badges/content-${isComplete ? 'complete' : 'half'}.webp`,
    type: 'content',
    contentName,
    condition: {
      type: 'content_progress',
      requiredProgress: progress,
      contentName,
    },
  }
}
