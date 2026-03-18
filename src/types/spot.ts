import { SpotStatus } from './report'

// ============================================
// External Link Types (외부 링크)
// ============================================

export type ExternalLinkType =
  | 'official'
  | 'ticket'
  | 'schedule'
  | 'sns'
  | 'other'

export interface ExternalLink {
  id: string
  type: ExternalLinkType
  label: string
  url: string
}

export interface LinkTypeConfig {
  label: string
  icon: string
  color: string
}

export const LINK_TYPE_CONFIG: Record<ExternalLinkType, LinkTypeConfig> = {
  official: {
    label: '공식 홈페이지',
    icon: '/icons/link-types/official.webp',
    color: '#3B82F6',
  },
  ticket: {
    label: '티켓 예매',
    icon: '/icons/link-types/ticket.webp',
    color: '#10B981',
  },
  schedule: {
    label: '일정 확인',
    icon: '/icons/link-types/schedule.webp',
    color: '#F59E0B',
  },
  sns: { label: 'SNS', icon: '/icons/link-types/sns.webp', color: '#8B5CF6' },
  other: {
    label: '기타',
    icon: '/icons/link-types/other.webp',
    color: '#6B7280',
  },
}

// ============================================
// Spot Category & Content Types
// ============================================

export type SpotCategory =
  | 'animation'
  | 'sports'
  | 'movie_drama'
  | 'music'
  | 'game'
  | 'other'

export type ContentType =
  | 'anime'
  | 'movie'
  | 'drama'
  | 'sports_team'
  | 'artist'
  | 'game'
  | 'other'

export interface ContentTypeConfig {
  icon: string
  color: string
  label: string
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  anime: {
    icon: '/icons/content-types/anime.webp',
    color: '#FF6B6B',
    label: '애니메이션',
  },
  movie: {
    icon: '/icons/content-types/movie.webp',
    color: '#45B7D1',
    label: '영화',
  },
  drama: {
    icon: '/icons/content-types/drama.webp',
    color: '#9B59B6',
    label: '드라마',
  },
  sports_team: {
    icon: '/icons/content-types/sports_team.webp',
    color: '#4ECDC4',
    label: '스포츠 팀',
  },
  artist: {
    icon: '/icons/content-types/artist.webp',
    color: '#96CEB4',
    label: '아티스트',
  },
  game: {
    icon: '/icons/content-types/game.webp',
    color: '#DDA0DD',
    label: '게임',
  },
  other: {
    icon: '/icons/content-types/other.webp',
    color: '#95A5A6',
    label: '기타',
  },
}

export interface CategoryConfig {
  icon: string
  color: string
  label: string
}

export const CATEGORY_CONFIG: Record<SpotCategory, CategoryConfig> = {
  animation: {
    icon: '/icons/categories/animation.webp',
    color: '#FF6B6B',
    label: '애니메이션',
  },
  sports: {
    icon: '/icons/categories/sports.webp',
    color: '#4ECDC4',
    label: '스포츠',
  },
  movie_drama: {
    icon: '/icons/categories/movie_drama.webp',
    color: '#45B7D1',
    label: '영화/드라마',
  },
  music: {
    icon: '/icons/categories/music.webp',
    color: '#96CEB4',
    label: '음악/콘서트',
  },
  game: {
    icon: '/icons/categories/game.webp',
    color: '#DDA0DD',
    label: '게임',
  },
  other: {
    icon: '/icons/categories/other.webp',
    color: '#95A5A6',
    label: '기타',
  },
}

// ============================================
// Category Section Mapping (카테고리별 섹션 매핑)
// ============================================

export type SectionType = 'scenes' | 'events' | 'info'

export const CATEGORY_SECTIONS: Record<SpotCategory, SectionType[]> = {
  animation: ['scenes'],
  movie_drama: ['scenes'],
  sports: ['events'],
  music: ['events'],
  game: ['scenes', 'events'],
  other: ['info'],
}

export const SECTION_HEADERS: Record<
  SectionType,
  Partial<Record<SpotCategory, string>>
> = {
  scenes: {
    animation: '작품 속 장면',
    movie_drama: '작품 속 장면',
    game: '게임 속 장면',
  },
  events: {
    sports: '경기 일정',
    music: '공연 정보',
    game: 'e스포츠 경기',
  },
  info: {
    other: '정보',
  },
}

export const SECTION_ICONS: Record<SectionType, string> = {
  scenes: '🎬',
  events: '📅',
  info: '📍',
}

// ============================================
// Spot Types
// ============================================

export interface Coordinates {
  lat: number
  lng: number
}

export interface MediaInfo {
  title: string
  type: 'anime' | 'drama' | 'movie' | 'other'
  year?: number
}

export interface RelatedContent {
  name: string
  type: ContentType
  year?: number
  additionalInfo?: string
  /** 대표 이미지 URL (관리자만 설정 가능) */
  imageUrl?: string
}

export interface Spot {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: Coordinates
  category?: SpotCategory
  /** @deprecated relatedContent 사용 권장 */
  relatedMedia?: MediaInfo[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[]
  createdAt: Date
  updatedAt: Date
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
  password?: string
  /** 최초 제보자 ID (09-spot-report-wiki) */
  firstReporterId?: string
  /** 최초 제보자 이름 (09-spot-report-wiki) */
  firstReporterName?: string
  /** 현재 스팟 상태 (09-spot-report-wiki) */
  spotStatus?: SpotStatus
  /** 상태 신고 누적 수 (09-spot-report-wiki) */
  statusReportCount?: number
}

export interface SpotPin {
  id: string
  name: string
  coordinates: [number, number]
  thumbnailUrl: string
  category?: SpotCategory
  /** 인증 수 (인기 스팟 표시용) */
  checkInCount?: number
}

export interface SpotPreviewData {
  id: string
  name: string
  description: string
  photoUrl: string
  address: string
}

// ============================================
// Facility Types
// ============================================

import { FacilityStatus, OtakuFacilityDetails } from './facility'

export type LegacyFacilityType =
  | 'restaurant'
  | 'convenience_store'
  | 'cafe'
  | 'station'
  | 'other'

export type OtakuFacilityType =
  | 'coin_locker'
  | 'solo_dining'
  | 'charging_cafe'
  | 'public_restroom'
  | 'goods_shop'

export type FacilityType = LegacyFacilityType | OtakuFacilityType

export interface NearbyFacility {
  id: string
  name: string
  type: FacilityType
  distance: number
  address: string
  coordinates: [number, number]
  // 신규 필드 (Req 6.7~6.10)
  status?: FacilityStatus
  verificationScore?: number
  upvotes?: number
  downvotes?: number
  googlePlaceId?: string
  otakuDetails?: OtakuFacilityDetails
  reportedBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface Facility {
  id: string
  name: string
  type: FacilityType
  address: string
  coordinates: Coordinates
  // 신규 필드 (Req 6.7~6.10)
  status?: FacilityStatus
  verificationScore?: number
  upvotes?: number
  downvotes?: number
  googlePlaceId?: string
  otakuDetails?: OtakuFacilityDetails
  reportedBy?: string
  createdAt?: string
  updatedAt?: string
}

// ============================================
// Scene Types (작품 속 장면)
// ============================================

export interface Scene {
  id: string
  spotId: string
  imageUrl: string
  animeTitle: string
  episodeInfo?: string
  description?: string
  likeCount: number
  createdAt: Date
}

export interface CreateSceneInput {
  spotId: string
  imageUrl: string
  animeTitle: string
  episodeInfo?: string
  description?: string
}

// ============================================
// User Like Types (사용자 좋아요)
// ============================================

export interface UserLike {
  id: string
  userId: string
  sceneId: string
  createdAt: Date
}

export interface UserLikeStatus {
  liked: boolean
  likeCount: number
}
