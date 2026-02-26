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

// Network Store - 네트워크 상태 관리
export {
  useNetworkStore,
  useIsOnline,
  useConnectionType,
  useSaveData,
} from './networkStore'

// Upload Queue Store - 업로드 큐 관리
export {
  useUploadQueueStore,
  useNextPendingItem,
  useTotalProgress,
  useActiveUploadCount,
  usePendingCount,
  useErrorCount,
  useIsQueueEmpty,
  useIsUploadPaused,
  getRetryDelay,
  RETRY_CONFIG,
} from './uploadQueueStore'
export type { UploadItem, UploadStatus } from './uploadQueueStore'

// Report Store - 제보 폼 상태 관리
export {
  useReportStore,
  useReportCurrentStep,
  useReportFormData,
  useNearbyCheckPassed,
} from './reportStore'
export type { ReportFormStep, ReportFormData } from './reportStore'

// Bottom Sheet Store - 바텀 시트 상태 관리
export {
  useBottomSheetStore,
  useIsBottomSheetOpen,
  useBottomSheetHeight,
  useBottomSheetSpotId,
} from './bottomSheetStore'
export type { BottomSheetHeight } from './bottomSheetStore'
