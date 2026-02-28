import { NearbyFacility, FacilityType } from '@/types'

/**
 * 편의시설을 타입별로 분류하는 순수 함수
 * @param facilities 편의시설 목록
 * @returns 타입별로 그룹화된 편의시설 객체
 */
export function groupFacilitiesByType(
  facilities: NearbyFacility[]
): Record<FacilityType, NearbyFacility[]> {
  const grouped: Record<FacilityType, NearbyFacility[]> = {
    // Legacy_Category
    restaurant: [],
    convenience_store: [],
    cafe: [],
    station: [],
    other: [],
    // Otaku_Category
    coin_locker: [],
    solo_dining: [],
    charging_cafe: [],
    public_restroom: [],
    goods_shop: [],
  }

  facilities.forEach((facility) => {
    if (grouped[facility.type]) {
      grouped[facility.type].push(facility)
    } else {
      grouped.other.push(facility)
    }
  })

  return grouped
}

/**
 * 유효한 편의시설 타입 목록
 */
export const VALID_FACILITY_TYPES: FacilityType[] = [
  // Legacy_Category
  'restaurant',
  'convenience_store',
  'cafe',
  'station',
  'other',
  // Otaku_Category
  'coin_locker',
  'solo_dining',
  'charging_cafe',
  'public_restroom',
  'goods_shop',
]
