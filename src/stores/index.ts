/**
 * Zustand 스토어 통합 export
 * 모든 전역 상태 스토어를 한 곳에서 관리합니다.
 */

// Map Store - 지도 상태 관리
export {
  useMapStore,
  useMapCenter,
  useMapZoom,
  useSelectedSpotId,
} from './mapStore'

// UI Store - UI 상태 관리
export {
  useUIStore,
  useIsPreviewOpen,
  usePreviewSpotId,
  useIsMobileMenuOpen,
  useIsMapLoading,
} from './uiStore'

// Like Store - 좋아요 상태 관리
export { useLikeStore, useLikedSceneIds, useIsLoadingLikes } from './likeStore'

// Auth Store - 인증 UI 상태 관리
export { useAuthStore, useIsLoggingOut, useAuthError } from './authStore'

// Filter Store - 카테고리 필터 상태 관리
export {
  useFilterStore,
  useSelectedCategories,
  useSearchQuery,
  ALL_CATEGORIES,
} from './filterStore'
