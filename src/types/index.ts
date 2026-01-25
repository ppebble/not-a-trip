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
  label: string // "공식 홈페이지", "티켓 예매" 등
  url: string // https://...
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
  | 'animation' // 애니메이션/만화
  | 'sports' // 스포츠 (축구, 야구 등)
  | 'movie_drama' // 영화/드라마
  | 'music' // 음악/콘서트
  | 'game' // 게임/e스포츠
  | 'other' // 기타

export type ContentType =
  | 'anime' // 애니메이션
  | 'movie' // 영화
  | 'drama' // 드라마
  | 'sports_team' // 스포츠 팀
  | 'artist' // 아티스트/가수
  | 'game' // 게임
  | 'other' // 기타

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

// 카테고리별 표시할 섹션
export const CATEGORY_SECTIONS: Record<SpotCategory, SectionType[]> = {
  animation: ['scenes'], // 작품 속 장면
  movie_drama: ['scenes'], // 작품 속 장면
  sports: ['events'], // 이벤트 정보 (경기 일정)
  music: ['events'], // 이벤트 정보 (공연 정보)
  game: ['scenes', 'events'], // 둘 다
  other: ['info'], // 일반 정보
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

// 확장된 관련 콘텐츠 인터페이스 (다양한 콘텐츠 타입 지원)
export interface RelatedContent {
  name: string // 콘텐츠 이름 (작품명, 팀명, 아티스트명 등)
  type: ContentType // 콘텐츠 타입
  year?: number // 연도 (선택)
  additionalInfo?: string // 추가 정보 (에피소드, 시즌 등)
}

export interface Spot {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: Coordinates
  category?: SpotCategory // 스팟 카테고리 (마이그레이션 전 optional)
  relatedMedia?: MediaInfo[] // 기존 호환성 유지 (deprecated)
  relatedContent?: RelatedContent[] // 새로운 관련 콘텐츠 (마이그레이션 후 사용)
  externalLinks?: ExternalLink[] // 외부 링크 (스포츠/음악 카테고리용)
  createdAt: Date
  updatedAt: Date
  // 작성자 정보 (마이그레이션 전 optional)
  authorId?: string // 회원 작성자 ID
  authorName?: string // 작성자 이름
  isGuestSpot?: boolean // 비회원 등록 여부
  password?: string // 비회원 수정/삭제용 (해시)
}

export interface SpotPin {
  id: string
  name: string
  coordinates: [number, number]
  thumbnailUrl: string
  category?: SpotCategory // 마이그레이션 전 optional
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
  category?: SpotCategory // 마이그레이션 전 optional
  relatedMedia?: MediaInfo[] // 기존 호환성 유지 (deprecated)
  relatedContent?: RelatedContent[] // 새로운 관련 콘텐츠
  externalLinks?: ExternalLink[] // 외부 링크 (스포츠/음악 카테고리용)
  nearbyFacilities: NearbyFacility[]
  // 작성자 정보 (마이그레이션 전 optional)
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
  distance: number // meters
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
  spotId?: string // 연결된 스팟 ID (optional)
  mediaTitle?: string // 연결된 작품 제목 (optional)
  // 비회원/회원 구분 필드
  password?: string // 비회원용 비밀번호 (해시 저장)
  userId?: string // 회원용 사용자 ID (optional)
  isGuest: boolean // 회원/비회원 구분 (true: 비회원, false: 회원)
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
  // 비회원/회원 구분 필드
  password?: string // 비회원용 비밀번호 (해시 저장)
  userId?: string // 회원용 사용자 ID (optional)
  isGuest: boolean // 회원/비회원 구분 (true: 비회원, false: 회원)
}

export interface CreatePostInput {
  title: string
  content: string
  author?: string // 비회원: 닉네임 입력, 회원: 자동 설정
  password?: string // 비회원용 비밀번호 (필수)
  spotId?: string // 연결된 스팟 ID (optional)
  mediaTitle?: string // 연결된 작품 제목 (optional)
}

export interface UpdatePostInput {
  title?: string
  content?: string
  spotId?: string | null // null로 연결 해제 가능
  mediaTitle?: string | null // null로 연결 해제 가능
  password?: string // 비회원 수정 시 비밀번호 확인용
}

export interface CreateCommentInput {
  postId: string
  content: string
  author?: string // 비회원: 닉네임 입력, 회원: 자동 설정
  password?: string // 비회원용 비밀번호 (필수)
}

// ============================================
// Scene Types (작품 속 장면)
// ============================================

export interface Scene {
  id: string
  spotId: string
  imageUrl: string
  animeTitle: string
  episodeInfo?: string // 예: "1화", "OVA" 등
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
  category?: SpotCategory // 마이그레이션 전 optional
  relatedMedia?: MediaInfo[] // 기존 호환성 유지 (deprecated)
  relatedContent?: RelatedContent[] // 새로운 관련 콘텐츠
  externalLinks?: ExternalLink[] // 외부 링크 (스포츠/음악 카테고리용)
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
}

// 스팟 등록 Input
export interface CreateSpotInput {
  name: string
  description: string
  address: string
  coordinates: Coordinates
  category: SpotCategory
  photos?: string[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[] // 외부 링크 (스포츠/음악 카테고리용)
  // 작성자 정보
  authorName?: string // 비회원용 닉네임
  password?: string // 비회원용 비밀번호
}

// 스팟 수정 Input
export interface UpdateSpotInput {
  name?: string
  description?: string
  address?: string
  coordinates?: Coordinates
  category?: SpotCategory
  photos?: string[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[] // 외부 링크 (스포츠/음악 카테고리용)
  password?: string // 비회원 수정 시 비밀번호 확인용
}

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: string
  email: string
  name?: string
  nickname?: string
  image?: string
  provider: 'credentials' | 'google' | 'kakao' | 'naver'
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
