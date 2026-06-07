'use client'

import Image from 'next/image'
import { ContentType, SpotCategory, ExternalLinkType } from '@/types'

// ============================================
// 아이콘 경로 매핑
// ============================================

const CONTENT_TYPE_ICON_PATH: Record<ContentType, string> = {
  anime: '/icons/content-types/anime.webp',
  movie: '/icons/content-types/movie.webp',
  drama: '/icons/content-types/drama.webp',
  sports_team: '/icons/content-types/sports_team.webp',
  artist: '/icons/content-types/artist.webp',
  game: '/icons/content-types/game.webp',
  other: '/icons/content-types/other.webp',
}

const CATEGORY_ICON_PATH: Record<SpotCategory, string> = {
  animation: '/icons/mascot/mascot-confirm.webp',
  sports: '/icons/categories/sports.webp',
  movie_drama: '/icons/categories/movie_drama.webp',
  music: '/icons/categories/music.webp',
  game: '/icons/categories/game.webp',
  other: '/icons/categories/other.webp',
}

const LINK_TYPE_ICON_PATH: Record<ExternalLinkType, string> = {
  official: '/icons/link-types/official.webp',
  ticket: '/icons/link-types/ticket.webp',
  schedule: '/icons/link-types/schedule.webp',
  sns: '/icons/link-types/sns.webp',
  other: '/icons/link-types/other.webp',
}

// ============================================
// Fallback 이모티콘 매핑
// ============================================

const CONTENT_TYPE_FALLBACK: Record<ContentType, string> = {
  anime: '🎬',
  movie: '🎥',
  drama: '📺',
  sports_team: '⚽',
  artist: '🎵',
  game: '🎮',
  other: '📍',
}

const CATEGORY_FALLBACK: Record<SpotCategory, string> = {
  animation: '🎬',
  sports: '⚽',
  movie_drama: '🎥',
  music: '🎵',
  game: '🎮',
  other: '📍',
}

const LINK_TYPE_FALLBACK: Record<ExternalLinkType, string> = {
  official: '🏠',
  ticket: '🎫',
  schedule: '📅',
  sns: '📱',
  other: '🔗',
}

// ============================================
// 사이즈 설정
// ============================================

type IconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

const SIZE_MAP: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 40,
  '3xl': 48,
}

// ============================================
// ContentTypeIcon 컴포넌트
// ============================================

interface ContentTypeIconProps {
  type: ContentType
  size?: IconSize
  className?: string
}

/**
 * ContentType에 해당하는 SVG 아이콘을 렌더링하는 컴포넌트
 * SVG 로드 실패 시 fallback으로 이모티콘을 표시합니다.
 */
export function ContentTypeIcon({
  type,
  size = 'md',
  className = '',
}: ContentTypeIconProps) {
  const iconPath = CONTENT_TYPE_ICON_PATH[type] || CONTENT_TYPE_ICON_PATH.other
  const fallback = CONTENT_TYPE_FALLBACK[type] || CONTENT_TYPE_FALLBACK.other
  const pixelSize = SIZE_MAP[size]

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <Image
        src={iconPath}
        alt={type}
        width={pixelSize}
        height={pixelSize}
        className="h-full w-full"
        onError={(e) => {
          // SVG 로드 실패 시 fallback 이모티콘으로 대체
          const target = e.currentTarget
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const fallbackSpan = document.createElement('span')
            fallbackSpan.textContent = fallback
            fallbackSpan.style.fontSize = `${pixelSize}px`
            fallbackSpan.style.lineHeight = '1'
            parent.appendChild(fallbackSpan)
          }
        }}
      />
    </span>
  )
}

// ============================================
// CategoryIcon 컴포넌트
// ============================================

interface CategoryIconProps {
  category: SpotCategory
  size?: IconSize
  className?: string
}

/**
 * SpotCategory에 해당하는 SVG 아이콘을 렌더링하는 컴포넌트
 * SVG 로드 실패 시 fallback으로 이모티콘을 표시합니다.
 */
export function CategoryIcon({
  category,
  size = 'md',
  className = '',
}: CategoryIconProps) {
  const iconPath = CATEGORY_ICON_PATH[category] || CATEGORY_ICON_PATH.other
  const fallback = CATEGORY_FALLBACK[category] || CATEGORY_FALLBACK.other
  const pixelSize = SIZE_MAP[size]

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <Image
        src={iconPath}
        alt={category}
        width={pixelSize}
        height={pixelSize}
        className="h-full w-full"
        onError={(e) => {
          // SVG 로드 실패 시 fallback 이모티콘으로 대체
          const target = e.currentTarget
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const fallbackSpan = document.createElement('span')
            fallbackSpan.textContent = fallback
            fallbackSpan.style.fontSize = `${pixelSize}px`
            fallbackSpan.style.lineHeight = '1'
            parent.appendChild(fallbackSpan)
          }
        }}
      />
    </span>
  )
}

// ============================================
// LinkTypeIcon 컴포넌트
// ============================================

interface LinkTypeIconProps {
  linkType: ExternalLinkType
  size?: IconSize
  className?: string
}

/**
 * ExternalLinkType에 해당하는 SVG 아이콘을 렌더링하는 컴포넌트
 * SVG 로드 실패 시 fallback으로 이모티콘을 표시합니다.
 */
export function LinkTypeIcon({
  linkType,
  size = 'md',
  className = '',
}: LinkTypeIconProps) {
  const iconPath = LINK_TYPE_ICON_PATH[linkType] || LINK_TYPE_ICON_PATH.other
  const fallback = LINK_TYPE_FALLBACK[linkType] || LINK_TYPE_FALLBACK.other
  const pixelSize = SIZE_MAP[size]

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <Image
        src={iconPath}
        alt={linkType}
        width={pixelSize}
        height={pixelSize}
        className="h-full w-full"
        onError={(e) => {
          // SVG 로드 실패 시 fallback 이모티콘으로 대체
          const target = e.currentTarget
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const fallbackSpan = document.createElement('span')
            fallbackSpan.textContent = fallback
            fallbackSpan.style.fontSize = `${pixelSize}px`
            fallbackSpan.style.lineHeight = '1'
            parent.appendChild(fallbackSpan)
          }
        }}
      />
    </span>
  )
}
