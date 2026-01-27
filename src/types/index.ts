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
  official: { label: '공식 홈페이지', icon: '🏠', color: '#3B82F6' },
  ticket: { label: '티켓 예매', icon: '🎫', color: '#10B981' },
  schedule: { label: '일정 확인', icon: '📅', color: '#F59E0B' },
  sns: { label: 'SNS', icon: '📱', color: '#8B5CF6' },
  other: { label: '기타', icon: '🔗', color: '#6B7280' },
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

export interface CategoryConfig {
  icon: string
  color: string
  label: string
}

export const CATEGORY_CONFIG: Record<SpotCategory, CategoryConfig> = {
  animation: { icon: '🎬', color: '#FF6B6B', label: '애니메이션' },
  sports: { icon: '⚽', color: '#4ECDC4', label: '스포츠' },
  movie_drama: { icon: '🎥', color: '#45B7D1', label: '영화/드라마' },
  music: { icon: '🎵', color: '#96CEB4', label: '음악/콘서트' },
  game: { icon: '🎮', color: '#DDA0DD', label: '게임' },
  other: { icon: '📍', color: '#95A5A6', label: '기타' },
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

// 섹션별 헤더 텍스트
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

// 섹션별 아이콘
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

/**
 * 확장된 관련 콘텐츠 인터페이스
 * 작품명, 팀명, 아티스트명 등 다양한 콘텐츠 타입 지원
 */
export interface RelatedContent {
  name: string
  type: ContentType
  year?: number
  additionalInfo?: string
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
}

export interface SpotPin {
  id: string
  name: string
  coordinates: [number, number]
  thumbnailUrl: string
  category?: SpotCategory
}

export interface SpotPreviewData {
  id: string
  name: string
  description: string
  photoUrl: string
  address: string
}

export interface SpotDetailData {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: [number, number]
  category?: SpotCategory
  /** @deprecated relatedContent 사용 권장 */
  relatedMedia?: MediaInfo[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[]
  nearbyFacilities: NearbyFacility[]
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
}

// ============================================
// Facility Types
// ============================================

export type FacilityType =
  | 'restaurant'
  | 'convenience_store'
  | 'cafe'
  | 'station'
  | 'other'

export interface NearbyFacility {
  id: string
  name: string
  type: FacilityType
  /** 거리 (미터 단위) */
  distance: number
  address: string
  coordinates: [number, number]
}

export interface Facility {
  id: string
  name: string
  type: FacilityType
  address: string
  coordinates: Coordinates
}

// ============================================
// Community Types
// ============================================

export interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
  viewCount: number
  commentCount: number
  spotId?: string
  mediaTitle?: string
  password?: string
  userId?: string
  isGuest: boolean
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
  password?: string
  userId?: string
  isGuest: boolean
}

export interface CreatePostInput {
  title: string
  content: string
  author?: string
  password?: string
  spotId?: string
  mediaTitle?: string
}

export interface UpdatePostInput {
  title?: string
  content?: string
  spotId?: string | null
  mediaTitle?: string | null
  password?: string
}

export interface CreateCommentInput {
  postId: string
  content: string
  author?: string
  password?: string
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
// Community Summary Types
// ============================================

export interface SpotCommunitySummary {
  id: string
  name: string
  thumbnailUrl: string
  postCount: number
}

export interface MediaCommunitySummary {
  title: string
  type: 'anime' | 'drama' | 'movie' | 'other'
  postCount: number
}

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  error: string
  details?: string[]
}

export interface SpotResponse {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: [number, number]
  category?: SpotCategory
  /** @deprecated relatedContent 사용 권장 */
  relatedMedia?: MediaInfo[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[]
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
}

export interface CreateSpotInput {
  name: string
  description: string
  address: string
  coordinates: Coordinates
  category: SpotCategory
  photos?: string[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[]
  authorName?: string
  password?: string
}

export interface UpdateSpotInput {
  name?: string
  description?: string
  address?: string
  coordinates?: Coordinates
  category?: SpotCategory
  photos?: string[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[]
  password?: string
}

// ============================================
// User & Auth Types
// ============================================

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  email: string
  name?: string
  nickname?: string
  image?: string
  provider: 'credentials' | 'google' | 'kakao' | 'naver'
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface UserCredentials {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  nickname?: string
}

// ============================================
// Store Types
// ============================================

export interface MapStore {
  center: [number, number]
  zoom: number
  selectedSpotId: string | null
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setSelectedSpot: (spotId: string | null) => void
}

export interface UIStore {
  isPreviewOpen: boolean
  isMobileMenuOpen: boolean
  openPreview: () => void
  closePreview: () => void
  toggleMobileMenu: () => void
}
