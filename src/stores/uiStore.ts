import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PreviewPosition {
  x: number
  y: number
}

interface UIStore {
  isPreviewOpen: boolean
  previewSpotId: string | null
  previewPosition: PreviewPosition | null
  isPreviewHovered: boolean
  isMobileMenuOpen: boolean
  isMapLoading: boolean

  openPreview: (spotId: string, position?: PreviewPosition) => void
  closePreview: () => void
  setPreviewHovered: (hovered: boolean) => void
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
      previewPosition: null,
      isPreviewHovered: false,
      isMobileMenuOpen: false,
      isMapLoading: true,

      openPreview: (spotId, position) =>
        set(
          {
            isPreviewOpen: true,
            previewSpotId: spotId,
            previewPosition: position || null,
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
            previewPosition: null,
            isPreviewHovered: false,
          },
          false,
          'uiStore/closePreview'
        ),

      setPreviewHovered: (hovered) =>
        set({ isPreviewHovered: hovered }, false, 'uiStore/setPreviewHovered'),

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
            previewPosition: null,
            isPreviewHovered: false,
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
export const usePreviewPosition = () =>
  useUIStore((state) => state.previewPosition)
export const useIsPreviewHovered = () =>
  useUIStore((state) => state.isPreviewHovered)
export const useIsMobileMenuOpen = () =>
  useUIStore((state) => state.isMobileMenuOpen)
export const useIsMapLoading = () => useUIStore((state) => state.isMapLoading)
