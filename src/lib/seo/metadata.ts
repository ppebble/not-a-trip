import type { Metadata } from 'next'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'

// ============================================
// SEO ?곗씠???명꽣?섏씠??(DB 議고쉶 理쒖냼?붿슜 寃쎈웾 ???
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
// ?좏떥由ы떚 ?⑥닔
// ============================================

/** Base URL 諛섑솚 (?섍꼍 蹂??湲곕컲, 誘몄꽕????localhost ?대갚) */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

/** 湲곕낯 硫뷀??곗씠???앹꽦 (議고쉶 ?ㅽ뙣 ???대갚?? */
export function getDefaultMetadata(): Metadata {
  const baseUrl = getBaseUrl()
  const ogImage = `${baseUrl}/api/og?type=default`
  return {
    title: 'Not a Trip - ?щ뱾留??꾨뒗 ?밸퀎???ы뻾吏',
    description:
      '?좊땲硫붿씠???깆??쒕?, ?곹솕 珥ъ쁺吏, 肄섏꽌???μ냼 ???щ뱾留??꾨뒗 ?밸퀎???ы뻾吏瑜?諛쒓껄?섏꽭??',
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'Not a Trip - ?щ뱾留??꾨뒗 ?밸퀎???ы뻾吏',
      description:
        '?좊땲硫붿씠???깆??쒕?, ?곹솕 珥ъ쁺吏, 肄섏꽌???μ냼 ???щ뱾留??꾨뒗 ?밸퀎???ы뻾吏瑜?諛쒓껄?섏꽭??',
      images: [ogImage],
      url: baseUrl,
      type: 'website',
      siteName: 'Not a Trip',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Not a Trip - ?щ뱾留??꾨뒗 ?밸퀎???ы뻾吏',
      description:
        '?좊땲硫붿씠???깆??쒕?, ?곹솕 珥ъ쁺吏, 肄섏꽌???μ냼 ???щ뱾留??꾨뒗 ?밸퀎???ы뻾吏瑜?諛쒓껄?섏꽭??',
      images: [ogImage],
    },
  }
}

// ============================================
// ?숈쟻 硫뷀??곗씠???앹꽦 ?⑥닔
// ============================================

/** ?ㅽ뙚 ?섏씠吏 硫뷀??곗씠???앹꽦 */
export function generateSpotMetadata(spot: SpotSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = `${spot.name} | Not a Trip`

  // description ?대갚: 鍮꾩뼱?덉쑝硫?移댄뀒怨좊━+二쇱냼 議고빀
  const description = spot.description
    ? spot.description
    : spot.category
      ? `${CATEGORY_CONFIG[spot.category].label} 쨌 ${spot.address}`
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

/** 肄붿뒪 ?섏씠吏 硫뷀??곗씠???앹꽦 */
export function generateRouteMetadata(route: RouteSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = `${route.name} | Not a Trip`

  // description ?대갚: 鍮꾩뼱?덉쑝硫??ㅽ뙚 ?대쫫 議고빀
  const description = route.description
    ? `${route.description} 쨌 ${route.spots.length}媛??ㅽ뙚`
    : `${route.spots.map((s) => s.spotName).join(', ')} ??${route.spots.length}媛??ㅽ뙚 肄붿뒪`

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

/** 寃뚯떆湲 ?섏씠吏 硫뷀??곗씠???앹꽦 */
export function generatePostMetadata(post: PostSeoData): Metadata {
  const baseUrl = getBaseUrl()
  const title = `${post.title} | Not a Trip 而ㅻ??덊떚`

  // content 150??truncation
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
