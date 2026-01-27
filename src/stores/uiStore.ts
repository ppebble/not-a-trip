import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIStore {
  isPreviewOpen: boolean
  previewSpotId: string | null
  isMobileMenuOpen: boolean
  isMapLoading: boolean

  openPreview: (spotId: string) => void
  closePreview: () => void
  toggleMobileMenu: () => void
  closeMobileMenu: () => void
  setMapLoading: (loading: boolean) => void
  resetUIState: () => void
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      isPreviewOpen: false,
      previewSpotId: null,
      isMobileMenuOpen: false,
      isMapLoading: true,

      openPreview: (spotId) =>
        set(
          {
            isPreviewOpen: true,
            previewSpotId: spotId,
            isMobileMenuOpen: false,
          },
          false,
          'uiStore/openPreview'
        ),

      closePreview: () =>
        set(
          {
            isPreviewOpen: false,
            previewSpotId: null,
          },
          false,
          'uiStore/closePreview'
        ),

      toggleMobileMenu: () =>
        set(
          (state) => ({
            isMobileMenuOpen: !state.isMobileMenuOpen,
            isPreviewOpen: state.isMobileMenuOpen ? state.isPreviewOpen : false,
            previewSpotId: state.isMobileMenuOpen ? state.previewSpotId : null,
          }),
          false,
          'uiStore/toggleMobileMenu'
        ),

      closeMobileMenu: () =>
        set({ isMobileMenuOpen: false }, false, 'uiStore/closeMobileMenu'),

      setMapLoading: (loading) =>
        set({ isMapLoading: loading }, false, 'uiStore/setMapLoading'),

      resetUIState: () =>
        set(
          {
            isPreviewOpen: false,
            previewSpotId: null,
            isMobileMenuOpen: false,
            isMapLoading: true,
          },
          false,
          'uiStore/resetUIState'
        ),
    }),
    {
      name: 'ui-store',
    }
  )
)

// Selectors
export const useIsPreviewOpen = () => useUIStore((state) => state.isPreviewOpen)
export const usePreviewSpotId = () => useUIStore((state) => state.previewSpotId)
export const useIsMobileMenuOpen = () =>
  useUIStore((state) => state.isMobileMenuOpen)
export const useIsMapLoading = () => useUIStore((state) => state.isMapLoading)
