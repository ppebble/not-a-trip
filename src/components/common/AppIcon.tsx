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

const ICON_PATHS: Record<AppIconType, string> = {
  gallery: '/icons/ui/gallery.webp',
  distance: '/icons/ui/distance.webp',
  official: '/icons/ui/official.webp',
  'hall-of-fame': '/icons/ui/hall-of-fame.webp',
  bookmark: '/icons/ui/bookmark.webp',
  duration: '/icons/ui/duration.webp',
  spot: '/icons/map-markers/spot.webp',
  'today-checkin': '/icons/ui/today-checkin.webp',
  completion: '/icons/ui/completion.webp',
  location: '/icons/map-markers/current-location.webp',
  user: '/icons/ui/user.webp',
  popular: '/icons/map-markers/popular.webp',
  checkin: '/icons/ui/checkin.webp',
  checkin2: '/icons/ui/checkin-secondary.webp',
  'content-wise': '/icons/ui/content-wise.webp',
  map: '/icons/map-markers/map.webp',
  recommend: '/icons/ui/recommend.webp',
  logo: '/icons/mascot/mascot-main-full.webp',
  route: '/icons/ui/route.webp',
  profile: '/icons/ui/profile.webp',
  settings: '/icons/ui/settings.webp',
  'light-mode': '/icons/ui/light-mode.webp',
  'dark-mode': '/icons/ui/dark-mode.webp',
  'course-main': '/icons/ui/course-main.webp',
  'course-popular': '/icons/ui/course-popular.webp',
  'profile-front': '/icons/mascot/mascot-profile-front-full.webp',
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
  const iconPath = ICON_PATHS[name]
  if (!iconPath) return null

  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 20

  return (
    <Image
      src={iconPath}
      alt={alt || name}
      width={pixelSize}
      height={pixelSize}
      className={`object-contain ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      unoptimized
    />
  )
}
