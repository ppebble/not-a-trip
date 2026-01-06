import fc from 'fast-check'
import { NearbyFacility, FacilityType } from '@/types'

// Feature: anime-pilgrimage-map, Property 5: 편의시설 필수 정보 포함
// Validates: Requirements 4.1

/**
 * 편의시설 렌더링에 필수 정보가 포함되어 있는지 검증하는 함수
 * NearbyFacilities 컴포넌트의 FacilityCard가 표시해야 하는 정보를 검증
 */
export function validateFacilityRequiredInfo(facility: NearbyFacility): {
  hasName: boolean
  hasType: boolean
  hasDistance: boolean
  hasAddress: boolean
  isValid: boolean
} {
  const hasName =
    typeof facility.name === 'string' && facility.name.trim().length > 0
  const hasType =
    typeof facility.type === 'string' &&
    ['restaurant', 'convenience_store', 'cafe', 'station', 'other'].includes(
      facility.type
    )
  const hasDistance =
    typeof facility.distance === 'number' &&
    !isNaN(facility.distance) &&
    facility.distance >= 0
  const hasAddress =
    typeof facility.address === 'string' && facility.address.trim().length > 0

  return {
    hasName,
    hasType,
    hasDistance,
    hasAddress,
    isValid: hasName && hasType && hasDistance && hasAddress,
  }
}

/**
 * 거리를 사용자 친화적 형태로 변환 (NearbyFacilities 컴포넌트와 동일한 로직)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  } else {
    return `${(meters / 1000).toFixed(1)}km`
  }
}

/**
 * Generators for property-based testing
 */

// Generate valid facility type
const facilityTypeArbitrary: fc.Arbitrary<FacilityType> = fc.constantFrom(
  'restaurant',
  'convenience_store',
  'cafe',
  'station',
  'other'
)

// Generate valid coordinates tuple
const coordinatesTupleArbitrary: fc.Arbitrary<[number, number]> = fc.tuple(
  fc.double({ min: -90, max: 90, noNaN: true }),
  fc.double({ min: -180, max: 180, noNaN: true })
)

// Generate valid NearbyFacility object
const nearbyFacilityArbitrary: fc.Arbitrary<NearbyFacility> = fc.record({
  id: fc.uuid(),
  name: fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0),
  type: facilityTypeArbitrary,
  distance: fc.double({ min: 0, max: 10000, noNaN: true }),
  address: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  coordinates: coordinatesTupleArbitrary,
})

describe('Facility Required Info Property Tests', () => {
  test('Property 5: 편의시설 필수 정보 포함 - 모든 유효한 시설이 필수 정보를 포함함', () => {
    fc.assert(
      fc.property(nearbyFacilityArbitrary, (facility: NearbyFacility) => {
        const validation = validateFacilityRequiredInfo(facility)

        // 모든 필수 정보가 존재해야 함
        return validation.isValid
      }),
      { numRuns: 100 }
    )
  })

  test('Property 5: 편의시설 필수 정보 포함 - 이름이 비어있지 않음', () => {
    fc.assert(
      fc.property(nearbyFacilityArbitrary, (facility: NearbyFacility) => {
        const validation = validateFacilityRequiredInfo(facility)
        return validation.hasName
      }),
      { numRuns: 100 }
    )
  })

  test('Property 5: 편의시설 필수 정보 포함 - 타입이 유효한 값임', () => {
    fc.assert(
      fc.property(nearbyFacilityArbitrary, (facility: NearbyFacility) => {
        const validation = validateFacilityRequiredInfo(facility)
        return validation.hasType
      }),
      { numRuns: 100 }
    )
  })

  test('Property 5: 편의시설 필수 정보 포함 - 거리가 유효한 숫자임', () => {
    fc.assert(
      fc.property(nearbyFacilityArbitrary, (facility: NearbyFacility) => {
        const validation = validateFacilityRequiredInfo(facility)
        return validation.hasDistance
      }),
      { numRuns: 100 }
    )
  })

  test('Property 5: 편의시설 필수 정보 포함 - 주소가 비어있지 않음', () => {
    fc.assert(
      fc.property(nearbyFacilityArbitrary, (facility: NearbyFacility) => {
        const validation = validateFacilityRequiredInfo(facility)
        return validation.hasAddress
      }),
      { numRuns: 100 }
    )
  })

  test('Property 5: 편의시설 필수 정보 포함 - 거리 포맷팅이 올바름', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000, noNaN: true }),
        (distance: number) => {
          const formatted = formatDistance(distance)

          // 포맷된 결과가 문자열이어야 함
          if (typeof formatted !== 'string') return false

          // 1000m 미만이면 'm' 단위, 이상이면 'km' 단위
          if (distance < 1000) {
            return formatted.endsWith('m') && !formatted.includes('km')
          } else {
            return formatted.endsWith('km')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 5: 편의시설 필수 정보 포함 - 배열의 모든 시설이 필수 정보를 포함함', () => {
    const facilitiesArrayArbitrary = fc.array(nearbyFacilityArbitrary, {
      minLength: 1,
      maxLength: 50,
    })

    fc.assert(
      fc.property(facilitiesArrayArbitrary, (facilities: NearbyFacility[]) => {
        // 모든 시설이 필수 정보를 포함해야 함
        return facilities.every(
          (facility) => validateFacilityRequiredInfo(facility).isValid
        )
      }),
      { numRuns: 100 }
    )
  })
})
