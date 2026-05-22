export type MascotVariant = 'main' | 'greeting' | 'confirm' | 'cheer'

export const MASCOT_ASSETS: Record<MascotVariant, string> = {
  main: '/icons/raw/0329/캐릭터_메인_최종.webp',
  greeting: '/icons/raw/0329/캐릭터-인사.webp',
  confirm: '/icons/raw/0329/캐릭터-확인.webp',
  cheer: '/icons/raw/0329/캐릭터-환호.webp',
}

export const MAP_MARKER_ASSETS = {
  spot: '/icons/raw/0329/스팟.webp',
  current: '/icons/raw/0329/위치.webp',
  map: '/icons/raw/0329/지도.webp',
  popular: '/icons/raw/0329/인기.webp',
} as const
