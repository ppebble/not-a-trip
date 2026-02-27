import type {
  SpotCategory,
  MediaInfo,
  RelatedContent,
  ExternalLink,
  Coordinates,
  NearbyFacility,
} from './spot'
import type { SpotStatus } from './report'

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
  /** 현재 스팟 상태 (09-spot-report-wiki) */
  spotStatus?: SpotStatus
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

// ============================================
// Content Master Types (콘텐츠 마스터 데이터)
// ============================================

export interface ContentMaster {
  id: string
  /** 정규화된 콘텐츠 이름 (소문자, 공백 제거) */
  normalizedName: string
  /** 원본 콘텐츠 이름 (표시용) */
  displayName: string
  /** 대표 이미지 URL */
  imageUrl?: string
  /** 콘텐츠 타입 */
  type?: import('./spot').ContentType
  /** 연도 */
  year?: number
  /** 등록된 스팟 수 */
  spotCount: number
  createdAt: Date
  updatedAt: Date
}
