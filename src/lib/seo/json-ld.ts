import type { SpotSeoData, RouteSeoData } from './metadata'
import {
  DEFAULT_SITE_DESCRIPTION,
  SITE_NAME,
  getBaseUrl,
  getCanonicalUrl,
} from './metadata'
import { CATEGORY_CONFIG } from '@/types/spot'

// ============================================
// JSON-LD 생성 함수
// ============================================

/** 스팟 TouristAttraction JSON-LD 생성 */
export function generateSpotJsonLd(spot: SpotSeoData): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    '@id': getCanonicalUrl(`/spots/${spot.id}`),
    url: getCanonicalUrl(`/spots/${spot.id}`),
    name: spot.name,
    address: spot.address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: spot.coordinates.lat,
      longitude: spot.coordinates.lng,
    },
  }

  // 빈 필드 생략 로직
  if (spot.description) {
    jsonLd.description = spot.description
  }

  if (spot.photos.length > 0) {
    jsonLd.image = spot.photos[0]
  }

  if (spot.category) {
    jsonLd.additionalType = CATEGORY_CONFIG[spot.category].label
  }

  return jsonLd
}

/** 코스 TouristTrip JSON-LD 생성 */
export function generateRouteJsonLd(
  route: RouteSeoData
): Record<string, unknown> {
  // description 폴백: 비어있으면 스팟 이름 조합
  const description = route.description
    ? route.description
    : route.spots.map((s) => s.spotName).join(', ')

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': getCanonicalUrl(`/routes/${route.id}`),
    url: getCanonicalUrl(`/routes/${route.id}`),
    name: route.name,
    description,
    itinerary: route.spots.map((spot) => ({
      '@type': 'TouristAttraction',
      name: spot.spotName,
    })),
  }
}

/** WebSite JSON-LD 생성 (루트 레이아웃용) */
export function generateWebSiteJsonLd(): Record<string, unknown> {
  const baseUrl = getBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/map?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Organization JSON-LD 생성 (루트 레이아웃용) */
export function generateOrganizationJsonLd(): Record<string, unknown> {
  const baseUrl = getBaseUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: SITE_NAME,
    url: baseUrl,
    logo: `${baseUrl}/icons/icon-512x512.png`,
    description: DEFAULT_SITE_DESCRIPTION,
  }
}

/** BreadcrumbList JSON-LD 생성 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
