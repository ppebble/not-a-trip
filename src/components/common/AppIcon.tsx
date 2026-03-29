'use client'

import Image from 'next/image'

export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

const SIZE_MAP: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 40,
  '3xl': 48,
}

export type AppIconType =
  | 'gallery'
  | 'distance'
  | 'official'
  | 'hall-of-fame'
  | 'bookmark'
  | 'duration'
  | 'spot'
  | 'today-checkin'
  | 'completion'
  | 'location'
  | 'user'
  | 'popular'
  | 'checkin'
  | 'checkin2'
  | 'content-wise'
  | 'map'
  | 'recommend'
  | 'logo'
  | 'route'
  | 'profile'
  | 'settings'
  | 'light-mode'
  | 'dark-mode'
  | 'course-main'
  | 'course-popular'
  | 'profile-front'

const ICON_MAP: Record<AppIconType, string> = {
  gallery: '갤러리.webp',
  distance: '거리.webp',
  official: '공식.webp',
  'hall-of-fame': '명예의_전당.webp',
  bookmark: '북마크.webp',
  duration: '소요시간.webp',
  spot: '스팟.webp',
  'today-checkin': '오늘의_인증.webp',
  completion: '완주.webp',
  location: '위치.webp',
  user: '유저.webp',
  popular: '인기.webp',
  checkin: '인증.webp',
  checkin2: '인증2.webp',
  'content-wise': '작품별.webp',
  map: '지도.webp',
  recommend: '추천.webp',
  logo: '캐릭터_메인_최종.webp',
  route: '코스.webp',
  profile: '프로필.webp',
  settings: '설정톱니바퀴.webp',
  'light-mode': '기본모드.webp',
  'dark-mode': '다크모드.webp',
  'course-main': '순례코스.webp',
  'course-popular': '순례코스인기.webp',
  'profile-front': '캐릭터정면1.webp',
}

interface AppIconProps {
  name: AppIconType
  size?: IconSize | number
  className?: string
  alt?: string
}

export function AppIcon({
  name,
  size = 'md',
  className = '',
  alt = '',
}: AppIconProps) {
  const fileName = ICON_MAP[name]
  if (!fileName) return null

  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 20

  return (
    <Image
      src={`/icons/raw/0329/${fileName}`}
      alt={alt || name}
      width={pixelSize}
      height={pixelSize}
      className={`object-contain ${className}`}
      style={{ width: 'auto', height: 'auto' }}
    />
  )
}
