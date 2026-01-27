import fc from 'fast-check'
import { NearbyFacility, FacilityType } from '@/types'
import { groupFacilitiesByType, VALID_FACILITY_TYPES } from '../facility-utils'

/**
 * Property 4: 편의시설 타입별 분류
 * Validates: Requirements 3.4, 4.2
 */

const facilityTypeArbitrary: fc.Arbitrary<FacilityType> = fc.constantFrom(
  'restaurant',
  'convenience_store',
  'cafe',
  'station',
  'other'
)

const coordinatesTupleArbitrary: fc.Arbitrary<[number, number]> = fc.tuple(
  fc.double({ min: -90, max: 90, noNaN: true }),
  fc.double({ min: -180, max: 180, noNaN: true })
)

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

const facilitiesArrayArbitrary = fc.array(nearbyFacilityArbitrary, {
  minLength: 0,
  maxLength: 50,
})

describe('Facility Grouping Property Tests', () => {
  test('Property 4: 편의시설 타입별 분류 - 모든 시설이 올바른 타입으로 그룹화됨', () => {
    fc.assert(
      fc.property(facilitiesArrayArbitrary, (facilities: NearbyFacility[]) => {
        const grouped = groupFacilitiesByType(facilities)

        // 모든 그룹의 시설들이 해당 타입과 일치하는지 확인
        for (const type of VALID_FACILITY_TYPES) {
          const facilitiesInGroup = grouped[type]
          const allMatchType = facilitiesInGroup.every(
            (facility) => facility.type === type
          )
          if (!allMatchType) {
            return false
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 4: 편의시설 타입별 분류 - 모든 시설이 정확히 하나의 그룹에 포함됨', () => {
    fc.assert(
      fc.property(facilitiesArrayArbitrary, (facilities: NearbyFacility[]) => {
        const grouped = groupFacilitiesByType(facilities)

        // 그룹화된 총 시설 수가 원본과 일치하는지 확인
        const totalGrouped = VALID_FACILITY_TYPES.reduce(
          (sum, type) => sum + grouped[type].length,
          0
        )

        return totalGrouped === facilities.length
      }),
      { numRuns: 100 }
    )
  })

  test('Property 4: 편의시설 타입별 분류 - 원본 시설이 모두 그룹에 존재함', () => {
    fc.assert(
      fc.property(facilitiesArrayArbitrary, (facilities: NearbyFacility[]) => {
        const grouped = groupFacilitiesByType(facilities)

        // 모든 원본 시설이 해당 타입 그룹에 존재하는지 확인
        for (const facility of facilities) {
          const group = grouped[facility.type]
          const existsInGroup = group.some((f) => f.id === facility.id)
          if (!existsInGroup) {
            return false
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 4: 편의시설 타입별 분류 - 빈 배열 처리', () => {
    fc.assert(
      fc.property(
        fc.constant([] as NearbyFacility[]),
        (facilities: NearbyFacility[]) => {
          const grouped = groupFacilitiesByType(facilities)

          // 모든 그룹이 빈 배열이어야 함
          return VALID_FACILITY_TYPES.every(
            (type) => grouped[type].length === 0
          )
        }
      ),
      { numRuns: 10 }
    )
  })

  test('Property 4: 편의시설 타입별 분류 - 단일 타입만 있는 경우', () => {
    fc.assert(
      fc.property(
        facilityTypeArbitrary,
        fc.array(nearbyFacilityArbitrary, { minLength: 1, maxLength: 20 }),
        (singleType: FacilityType, facilities: NearbyFacility[]) => {
          // 모든 시설을 동일한 타입으로 설정
          const sameTypeFacilities = facilities.map((f) => ({
            ...f,
            type: singleType,
          }))

          const grouped = groupFacilitiesByType(sameTypeFacilities)

          // 해당 타입 그룹에만 시설이 있어야 함
          const targetGroupHasAll =
            grouped[singleType].length === sameTypeFacilities.length
          const otherGroupsEmpty = VALID_FACILITY_TYPES.filter(
            (t) => t !== singleType
          ).every((t) => grouped[t].length === 0)

          return targetGroupHasAll && otherGroupsEmpty
        }
      ),
      { numRuns: 100 }
    )
  })
})
