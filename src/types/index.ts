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

export interface Spot {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: Coordinates
  relatedMedia: MediaInfo[]
  createdAt: Date
  updatedAt: Date
}

export interface SpotPin {
  id: string
  name: string
  coordinates: [number, number]
  thumbnailUrl: string
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
  relatedMedia: MediaInfo[]
  nearbyFacilities: NearbyFacility[]
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
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
}

export interface CreatePostInput {
  title: string
  content: string
  spotId?: string // 연결된 스팟 ID (optional)
  mediaTitle?: string // 연결된 작품 제목 (optional)
}

export interface UpdatePostInput {
  title?: string
  content?: string
  spotId?: string | null // null로 연결 해제 가능
  mediaTitle?: string | null // null로 연결 해제 가능
}

export interface CreateCommentInput {
  postId: string
  content: string
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
  relatedMedia: MediaInfo[]
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
