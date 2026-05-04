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
    color: 'rgb(var(--link-official))',
  },
  ticket: {
    label: '티켓 예매',
    icon: '/icons/link-types/ticket.webp',
    color: 'rgb(var(--link-ticket))',
  },
  schedule: {
    label: '일정 확인',
    icon: '/icons/link-types/schedule.webp',
    color: 'rgb(var(--link-schedule))',
  },
  sns: {
    label: 'SNS',
    icon: '/icons/link-types/sns.webp',
    color: 'rgb(var(--link-sns))',
  },
  other: {
    label: '기타',
    icon: '/icons/link-types/other.webp',
    color: 'rgb(var(--link-other))',
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
  bgColor: string
  fgColor: string
  label: string
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  anime: {
    icon: '/icons/content-types/anime.webp',
    bgColor: 'rgb(var(--content-anime-bg))',
    fgColor: 'rgb(var(--content-anime-fg))',
    label: '애니메이션',
  },
  movie: {
    icon: '/icons/content-types/movie.webp',
    bgColor: 'rgb(var(--content-movie-bg))',
    fgColor: 'rgb(var(--content-movie-fg))',
    label: '영화',
  },
  drama: {
    icon: '/icons/content-types/drama.webp',
    bgColor: 'rgb(var(--content-drama-bg))',
    fgColor: 'rgb(var(--content-drama-fg))',
    label: '드라마',
  },
  sports_team: {
    icon: '/icons/content-types/sports_team.webp',
    bgColor: 'rgb(var(--content-sports-team-bg))',
    fgColor: 'rgb(var(--content-sports-team-fg))',
    label: '스포츠 팀',
  },
  artist: {
    icon: '/icons/content-types/artist.webp',
    bgColor: 'rgb(var(--content-artist-bg))',
    fgColor: 'rgb(var(--content-artist-fg))',
    label: '아티스트',
  },
  game: {
    icon: '/icons/content-types/game.webp',
    bgColor: 'rgb(var(--content-game-bg))',
    fgColor: 'rgb(var(--content-game-fg))',
    label: '게임',
  },
  other: {
    icon: '/icons/content-types/other.webp',
    bgColor: 'rgb(var(--content-other-bg))',
    fgColor: 'rgb(var(--content-other-fg))',
    label: '기타',
  },
}

export interface CategoryConfig {
  icon: string
  bgColor: string
  fgColor: string
  label: string
}

export const CATEGORY_CONFIG: Record<SpotCategory, CategoryConfig> = {
  animation: {
    icon: '/icons/categories/animation.webp',
    bgColor: 'rgb(var(--category-anime-bg))',
    fgColor: 'rgb(var(--category-anime-fg))',
    label: '애니메이션',
  },
  sports: {
    icon: '/icons/categories/sports.webp',
    bgColor: 'rgb(var(--category-sports-bg))',
    fgColor: 'rgb(var(--category-sports-fg))',
    label: '스포츠',
  },
  movie_drama: {
    icon: '/icons/categories/movie_drama.webp',
    bgColor: 'rgb(var(--category-movie-drama-bg))',
    fgColor: 'rgb(var(--category-movie-drama-fg))',
    label: '영화/드라마',
  },
  music: {
    icon: '/icons/categories/music.webp',
    bgColor: 'rgb(var(--category-music-bg))',
    fgColor: 'rgb(var(--category-music-fg))',
    label: '음악/콘서트',
  },
  game: {
    icon: '/icons/categories/game.webp',
    bgColor: 'rgb(var(--category-game-bg))',
    fgColor: 'rgb(var(--category-game-fg))',
    label: '게임',
  },
  other: {
    icon: '/icons/categories/other.webp',
    bgColor: 'rgb(var(--category-other-bg))',
    fgColor: 'rgb(var(--category-other-fg))',
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

// ============================================
// SpotContentRelation Types (스팟-작품 관계)
// ============================================

/** 관계 유형 */
export type RelationType =
  | 'scene_depicted' // 장면 등장
  | 'inspired_by' // 모티프
  | 'filming_location' // 촬영지
  | 'collaboration_event' // 콜라보 이벤트
  | 'merchandise_spot' // 굿즈/전시
  | 'fan_inferred' // 팬 추정 성지
  | 'promotional_reference' // 홍보 등장

/** 신뢰도 */
export type ConfidenceLevel = 'high' | 'medium' | 'low'

/** 공식성 */
export type Officialness =
  | 'official'
  | 'community_verified'
  | 'user_submitted'
  | 'unverified'

/** 관계 상태 */
export type RelationStatus = 'active' | 'expired' | 'scheduled' | 'archived'

/** 관계 유형 한글 라벨 */
export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  scene_depicted: '장면 등장',
  inspired_by: '모티프',
  filming_location: '촬영지',
  collaboration_event: '콜라보 이벤트',
  merchandise_spot: '굿즈/전시',
  fan_inferred: '팬 추정 성지',
  promotional_reference: '홍보 등장',
}

/** SpotContentRelation 엔티티 */
export interface SpotContentRelation {
  /** 고유 ID */
  id: string
  /** 연결된 스팟 ID */
  spotId: string
  /** 콘텐츠 식별자 ({spotId}_{normalizedContentName}) */
  contentId: string
  /** 작품명 */
  contentName: string
  /** 작품 타입 */
  contentType: ContentType
  /** 작품 대표 이미지 URL */
  contentImageUrl?: string
  /** 관계 유형 */
  relationType: RelationType
  /** 신뢰도 */
  confidenceLevel: ConfidenceLevel
  /** 공식성 */
  officialness: Officialness
  /** 표시 우선순위 (낮을수록 먼저) */
  displayPriority: number
  /** 관계 상태 */
  status: RelationStatus
  /** 요약 설명 */
  summary?: string
  /** 시작일 (기간성 관계) */
  startDate?: Date
  /** 종료일 (기간성 관계) */
  endDate?: Date
  /** 증거 수 */
  sourceCount?: number
  /** 검증 점수 */
  verificationScore?: number
  /** 생성자 ID */
  createdBy?: string
  /** 수정자 ID */
  updatedBy?: string
  /** 생성일 */
  createdAt: Date
  /** 수정일 */
  updatedAt: Date
}
