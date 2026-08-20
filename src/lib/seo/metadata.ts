import type { Metadata } from 'next'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'

export const SITE_NAME = 'Not a Trip'
export const PRODUCTION_BASE_URL = 'https://www.not-a-trip.xyz'
export const DEFAULT_SITE_TITLE =
  'Not a Trip - 애니메이션·영화 성지순례 여행 기록'
export const DEFAULT_SITE_DESCRIPTION =
  '애니메이션과 영화의 배경지를 찾아, 덕질 경험을 기록하고 공유하는 성지순례 여행 플랫폼입니다.'
export const DEFAULT_SEO_KEYWORDS = [
  '성지순례',
  '애니메이션 성지',
  '영화 촬영지',
  '덕질 여행',
  '팬 여행',
  'Not a Trip',
]

// ============================================
// SEO 데이터 인터페이스 (DB 조회 최소화용 경량 타입)
// ============================================

export interface SpotSeoData {
  id: string
  name: string
  description: string
  address: string
  category?: SpotCategory
  photos: string[]
  coordinates: { lat: number; lng: number }
}

export interface RouteSeoData {
  id: string
  name: string
  description: string
  spots: Array<{ spotName: string }>
}

export interface PostSeoData {
  id: string
  title: string
  content: string
}

// ============================================
// 유틸리티 함수
// ============================================

function removeTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function normalizeUrl(value: string | undefined): string | null {
  const trimmed = value?.trim()

  if (!trimmed) {
    return null
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`
    const url = new URL(withProtocol)
    return removeTrailingSlash(url.toString())
  } catch {
    return null
  }
}

function isLocalUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)
  } catch {
    return false
  }
}

/**
 * Canonical base URL.
 *
 * Production must never emit localhost into canonical, robots, sitemap, OG, or
 * JSON-LD URLs. If deployment env is missing or accidentally points at
 * localhost, fall back to the canonical custom domain instead of poisoning
 * crawler signals or leaking the Vercel default hostname.
 */
export function getBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configuredUrl = normalizeUrl(env.NEXT_PUBLIC_BASE_URL)
  const isProduction = env.NODE_ENV === 'production'

  if (configuredUrl && (!isProduction || !isLocalUrl(configuredUrl))) {
    return configuredUrl
  }

  if (isProduction) {
    return PRODUCTION_BASE_URL
  }

  return configuredUrl ?? 'http://localhost:3000'
}

export function getCanonicalUrl(
  path = '',
  env: NodeJS.ProcessEnv = process.env
): string {
  const baseUrl = getBaseUrl(env)
  const normalizedPath = path.trim()

  if (!normalizedPath || normalizedPath === '/') {
    return baseUrl
  }

  return `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`
}

export function getDefaultOgImage(
  env: NodeJS.ProcessEnv = process.env
): string {
  return `${getBaseUrl(env)}/api/og?type=default`
}

/** 기본 메타데이터 생성 (조회 실패 시 폴백용) */
export function getDefaultMetadata(): Metadata {
  const baseUrl = getBaseUrl()
  const ogImage = getDefaultOgImage()

  return {
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    keywords: DEFAULT_SEO_KEYWORDS,
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: DEFAULT_SITE_TITLE,
      description: DEFAULT_SITE_DESCRIPTION,
      images: [ogImage],
      url: baseUrl,
      type: 'website',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_SITE_TITLE,
      description: DEFAULT_SITE_DESCRIPTION,
      images: [ogImage],
    },
  }
}

// ============================================
// 동적 메타데이터 생성 함수
// ============================================

/** 스팟 페이지 메타데이터 생성 */
export function generateSpotMetadata(spot: SpotSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = spot.name
  const socialTitle = `${spot.name} | ${SITE_NAME}`

  // description 폴백: 비어 있으면 카테고리+주소 조합
  const description = spot.description
    ? spot.description
    : spot.category
      ? `${CATEGORY_CONFIG[spot.category].label} · ${spot.address}`
      : spot.address

  const url = `${baseUrl}/spots/${spot.id}`
  const ogImage = `${baseUrl}/api/og?type=spot&id=${spot.id}`
  const twitterImages = spot.photos.length > 0 ? [spot.photos[0]] : [ogImage]

  return {
    title,
    description,
    keywords: [
      spot.name,
      spot.address,
      spot.category ? CATEGORY_CONFIG[spot.category].label : '',
      ...DEFAULT_SEO_KEYWORDS,
    ].filter(Boolean),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      images: [ogImage],
      url,
      type: 'website',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: twitterImages,
    },
  }
}

/** 코스 페이지 메타데이터 생성 */
export function generateRouteMetadata(route: RouteSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = route.name
  const socialTitle = `${route.name} | ${SITE_NAME}`

  // description 폴백: 비어 있으면 스팟 이름 조합
  const description = route.description
    ? `${route.description} · ${route.spots.length}개 스팟`
    : `${route.spots.map((s) => s.spotName).join(', ')} 등 ${route.spots.length}개 스팟 코스`

  const url = `${baseUrl}/routes/${route.id}`
  const ogImage = `${baseUrl}/api/og?type=route&id=${route.id}`

  return {
    title,
    description,
    keywords: [
      route.name,
      ...route.spots.map((spot) => spot.spotName),
      ...DEFAULT_SEO_KEYWORDS,
    ].filter(Boolean),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      images: [ogImage],
      url,
      type: 'website',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [ogImage],
    },
  }
}

/** 게시글 페이지 메타데이터 생성 */
export function generatePostMetadata(post: PostSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = `${post.title} | 커뮤니티`
  const socialTitle = `${post.title} | ${SITE_NAME} 커뮤니티`

  // content 150자 truncation
  const description =
    post.content.length > 150
      ? `${post.content.slice(0, 150)}...`
      : post.content

  const url = `${baseUrl}/community/${post.id}`

  return {
    title,
    description,
    keywords: [post.title, '커뮤니티', '팬 후기', ...DEFAULT_SEO_KEYWORDS],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      type: 'article',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
  }
}
