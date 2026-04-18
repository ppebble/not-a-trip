/**
 * Feature: ux-quality-improvements, Property 3: progress calculation accuracy
 * Validates: Requirements 3.7
 *
 * Property 3: 코스 진행률 계산 정확성
 *
 * 임의의 스팟 목록과 체크된 스팟 ID 집합에 대해 진행률이
 * (유효 스팟 중 체크된 수 / 전체 유효 스팟 수) × 100과 일치하는지 검증한다.
 * 유효 스팟 = isAvailable !== false
 */

import fc from 'fast-check'
import { calculateProgress } from '../GuidePanel'
import type { RouteSpot } from '@/types/route'

// ============================================
// Generators
// ============================================

/**
 * RouteSpot을 생성하는 arbitrary.
 * isAvailable은 true, false, undefined 중 하나를 가진다.
 */
const routeSpotArbitrary = (idx: number): fc.Arbitrary<RouteSpot> =>
  fc.record({
    spotId: fc.constant(`spot-${idx}`),
    spotName: fc.constant(`스팟${idx}`),
    coordinates: fc.record({
      lat: fc.double({ min: 33.0, max: 38.0, noNaN: true }),
      lng: fc.double({ min: 126.0, max: 132.0, noNaN: true }),
    }),
    thumbnailUrl: fc.constant(`https://example.com/thumb-${idx}.jpg`),
    distanceFromPrev:
      idx === 0 ? fc.constant(null) : fc.integer({ min: 1, max: 50000 }),
    walkTimeFromPrev:
      idx === 0 ? fc.constant(null) : fc.integer({ min: 1, max: 300 }),
    note: fc.constant(undefined),
    isAvailable: fc.oneof(
      fc.constant(true),
      fc.constant(false),
      fc.constant(undefined)
    ),
  })

/**
 * 1~10개의 RouteSpot 배열과 체크된 스팟 ID 부분집합을 생성하는 arbitrary.
 */
const spotsAndCheckedArbitrary: fc.Arbitrary<{
  spots: RouteSpot[]
  checkedSpotIds: string[]
}> = fc.integer({ min: 1, max: 10 }).chain((count) =>
  fc
    .tuple(...Array.from({ length: count }, (_, i) => routeSpotArbitrary(i)))
    .chain((spotsArr) => {
      const spots = spotsArr as RouteSpot[]
      const allIds = spots.map((s) => s.spotId)
      return fc.subarray(allIds).map((checkedSpotIds) => ({
        spots,
        checkedSpotIds,
      }))
    })
)

// ============================================
// Test Suite
// ============================================

describe('코스 진행률 계산 정확성 속성 테스트', () => {
  /**
   * Property 3: 임의의 스팟 목록과 체크된 스팟 ID에 대해
   * calculateProgress 결과가 (유효 스팟 중 체크된 수 / 전체 유효 스팟 수) × 100과 일치한다.
   *
   * Validates: Requirements 3.7
   */
  test('Property 3: 진행률이 (유효 스팟 중 체크된 수 / 전체 유효 스팟 수) × 100과 일치한다', () => {
    fc.assert(
      fc.property(spotsAndCheckedArbitrary, ({ spots, checkedSpotIds }) => {
        const result = calculateProgress(spots, checkedSpotIds)

        // 기대값 독립 계산
        const availableSpots = spots.filter((s) => s.isAvailable !== false)
        if (availableSpots.length === 0) {
          expect(result).toBe(0)
          return
        }

        const checkedCount = availableSpots.filter((s) =>
          checkedSpotIds.includes(s.spotId)
        ).length
        const expected = (checkedCount / availableSpots.length) * 100

        expect(result).toBe(expected)
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3 보조: 유효 스팟이 0개이면 진행률은 항상 0이다.
   *
   * Validates: Requirements 3.7
   */
  test('Property 3: 유효 스팟이 0개이면 진행률은 0이다', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }).chain((count) =>
          fc.tuple(
            ...Array.from({ length: count }, (_, i) =>
              fc.record({
                spotId: fc.constant(`spot-${i}`),
                spotName: fc.constant(`스팟${i}`),
                coordinates: fc.record({
                  lat: fc.constant(35.0),
                  lng: fc.constant(129.0),
                }),
                thumbnailUrl: fc.constant('https://example.com/thumb.jpg'),
                distanceFromPrev: fc.constant(null),
                walkTimeFromPrev: fc.constant(null),
                note: fc.constant(undefined),
                isAvailable: fc.constant(false),
              })
            )
          )
        ),
        (spotsArr) => {
          const spots = spotsArr as RouteSpot[]
          const allIds = spots.map((s) => s.spotId)
          expect(calculateProgress(spots, allIds)).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Property 3 보조: 진행률은 항상 0 이상 100 이하이다.
   *
   * Validates: Requirements 3.7
   */
  test('Property 3: 진행률은 항상 0 이상 100 이하이다', () => {
    fc.assert(
      fc.property(spotsAndCheckedArbitrary, ({ spots, checkedSpotIds }) => {
        const result = calculateProgress(spots, checkedSpotIds)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThanOrEqual(100)
      }),
      { numRuns: 100 }
    )
  })
})
