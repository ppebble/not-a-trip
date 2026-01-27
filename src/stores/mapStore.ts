import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface MapStore {
  center: [number, number]
  zoom: number
  selectedSpotId: string | null

  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setSelectedSpot: (spotId: string | null) => void
  resetMapState: () => void
}

const DEFAULT_CENTER: [number, number] = [37.5665, 126.978]
const DEFAULT_ZOOM = 10

export const useMapStore = create<MapStore>()(
  devtools(
    (set) => ({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      selectedSpotId: null,

      setCenter: (center) => set({ center }, false, 'mapStore/setCenter'),

      setZoom: (zoom) => set({ zoom }, false, 'mapStore/setZoom'),

      setSelectedSpot: (spotId) =>
        set({ selectedSpotId: spotId }, false, 'mapStore/setSelectedSpot'),

      resetMapState: () =>
        set(
          {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            selectedSpotId: null,
          },
          false,
          'mapStore/resetMapState'
        ),
    }),
    {
      name: 'map-store',
    }
  )
)

// Selectors
export const useMapCenter = () => useMapStore((state) => state.center)
export const useMapZoom = () => useMapStore((state) => state.zoom)
export const useSelectedSpotId = () =>
  useMapStore((state) => state.selectedSpotId)
