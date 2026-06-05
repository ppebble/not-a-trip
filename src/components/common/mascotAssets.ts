export type MascotVariant = 'main' | 'greeting' | 'confirm' | 'cheer'

// Full-size mascot assets are intentionally separate from mascot-01..12.
// The numbered mascot files are 64px-tall thumbnails and must not be used
// for large overlays or offline-state illustrations.
export const MASCOT_ASSETS: Record<MascotVariant, string> = {
  main: '/icons/mascot/mascot-main-full.webp',
  greeting: '/icons/mascot/mascot-greeting-full.webp',
  confirm: '/icons/mascot/mascot-confirm-full.webp',
  cheer: '/icons/mascot/mascot-cheer-full.webp',
}

export const MAP_MARKER_ASSETS = {
  spot: '/icons/map-markers/spot.webp',
  current: '/icons/map-markers/current-location.webp',
  map: '/icons/map-markers/map.webp',
  popular: '/icons/map-markers/popular.webp',
} as const
