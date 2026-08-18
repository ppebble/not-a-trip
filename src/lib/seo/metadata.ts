import type { Metadata } from 'next'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'

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

/** Base URL 반환 (환경 변수 기반, 미설정 시 localhost 폴백) */
export function getBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim()

  if (!configuredUrl && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_BASE_URL is required in production')
  }

  return (configuredUrl || 'http://localhost:3000').replace(/\/$/, '')
}

/** 기본 메타데이터 생성 (조회 실패 시 폴백용) */
export function getDefaultMetadata(): Metadata {
  const baseUrl = getBaseUrl()
  const ogImage = `${baseUrl}/api/og?type=default`
  return {
    title: 'Not a Trip - 팬들만 아는 특별한 여행지',
    description:
      '애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'Not a Trip - 팬들만 아는 특별한 여행지',
      description:
        '애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
      images: [ogImage],
      url: baseUrl,
      type: 'website',
      siteName: 'Not a Trip',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Not a Trip - 팬들만 아는 특별한 여행지',
      description:
        '애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
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
  const title = `${spot.name} | Not a Trip`

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
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      images: [ogImage],
      url,
      type: 'website',
      siteName: 'Not a Trip',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: twitterImages,
    },
  }
}

/** 코스 페이지 메타데이터 생성 */
export function generateRouteMetadata(route: RouteSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = `${route.name} | Not a Trip`

  // description 폴백: 비어 있으면 스팟 이름 조합
  const description = route.description
    ? `${route.description} · ${route.spots.length}개 스팟`
    : `${route.spots.map((s) => s.spotName).join(', ')} 등 ${route.spots.length}개 스팟 코스`

  const url = `${baseUrl}/routes/${route.id}`
  const ogImage = `${baseUrl}/api/og?type=route&id=${route.id}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      images: [ogImage],
      url,
      type: 'website',
      siteName: 'Not a Trip',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

/** 게시글 페이지 메타데이터 생성 */
export function generatePostMetadata(post: PostSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = `${post.title} | Not a Trip 커뮤니티`

  // content 150자 truncation
  const description =
    post.content.length > 150
      ? `${post.content.slice(0, 150)}...`
      : post.content

  const url = `${baseUrl}/community/${post.id}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Not a Trip',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export function generateContentMetadata(
  contentName: string,
  pathname: string
): Metadata {
  const baseUrl = getBaseUrl()
  const title = `${contentName} 성지순례 스팟·코스 | Not a Trip`
  const description = `${contentName} 관련 성지순례 스팟, 여행 코스, 현장 인증 정보를 한곳에서 확인하세요.`
  const url = `${baseUrl}${pathname}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Not a Trip',
      images: [`${baseUrl}/api/og?type=default`],
    },
  }
}
