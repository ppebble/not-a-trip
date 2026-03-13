import type { SpotSeoData, RouteSeoData } from './metadata'
import { getBaseUrl } from './metadata'
import { CATEGORY_CONFIG } from '@/types/spot'

// ============================================
// JSON-LD 생성 함수
// ============================================

/** 스팟 TouristAttraction JSON-LD 생성 */
export function generateSpotJsonLd(spot: SpotSeoData): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
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
    name: 'Not a Trip',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/spots?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
