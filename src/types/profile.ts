/**
 * 프로필 페이지 관련 타입 정의
 * Spec: 45-profile-complete
 */

import type { UserStats } from './checkin'

// ============================================
// 섹션 타입
// ============================================

/** 프로필 페이지 섹션 */
export type ProfileSection =
  | 'activity'
  | 'contribution'
  | 'community'
  | 'collection'
  | 'management'

// ============================================
// 확장 통계 타입
// ============================================

/** 확장된 유저 통계 (기존 UserStats + 추가 필드) */
export interface ExtendedUserStats extends UserStats {
  /** 완주한 코스 수 */
  completedRoutes: number
  /** 등록한 스팟 수 */
  registeredSpots: number
  /** 제보 수 (spot_reports) */
  reportCount: number
  /** 게시글 수 */
  postCount: number
}

// ============================================
// 유저 활동 데이터 타입
// ============================================

/** 유저가 만든 코스 */
export interface UserRoute {
  id: string
  name: string
  spotCount: number
  bookmarkCount: number
  createdAt: string
}

/** 유저가 저장한 코스 */
export interface UserBookmark {
  id: string
  name: string
  authorName: string
  spotCount: number
  bookmarkedAt: string
}

/** 유저의 코스 완주 기록 */
export interface UserCompletion {
  id: string
  routeId: string
  routeName: string
  spotCount: number
  completedAt: string
}

/** 유저의 신규 스팟 제보 */
export interface UserReport {
  id: string
  spotName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

/** 유저의 정보보완 신청 */
export interface UserSupplement {
  id: string
  spotName: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

/** 유저의 상태신고 */
export interface UserStatusReport {
  id: string
  spotName: string
  reportedStatus: string
  resolved: boolean
  createdAt: string
}

/** 유저의 게시글 */
export interface UserPost {
  id: string
  title: string
  contentPreview: string
  viewCount: number
  commentCount: number
  createdAt: string
}

/** 유저의 댓글 */
export interface UserComment {
  id: string
  postId: string
  postTitle: string
  contentPreview: string
  createdAt: string
}
