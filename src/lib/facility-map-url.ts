import type { NearbyFacility } from '@/types'

const ADDRESS_UNAVAILABLE_VALUES = new Set([
  '주소 정보 없음',
  'OpenStreetMap address unavailable',
])

export function hasUsableFacilityAddress(address?: string): boolean {
  return (
    typeof address === 'string' &&
    address.trim().length > 0 &&
    !ADDRESS_UNAVAILABLE_VALUES.has(address.trim())
  )
}

export function buildFacilityGoogleMapsSearchUrl(
  facility: Pick<NearbyFacility, 'name' | 'address' | 'coordinates'>
): string {
  const [lat, lng] = facility.coordinates
  const query = [
    facility.name,
    hasUsableFacilityAddress(facility.address) ? facility.address.trim() : null,
    Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : null,
  ]
    .filter(Boolean)
    .join(' ')

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
