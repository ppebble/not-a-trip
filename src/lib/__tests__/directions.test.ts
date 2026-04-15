/**
 * isKoreanCoordinates Property-Based Tests
 *
 * Feature: navigation-google-maps-default
 * Property 1: Boundary classification biconditional
 *
 * Validates: Requirements 1.2, 1.3, 4.4
 */
import * as fc from 'fast-check'
import { isKoreanCoordinates } from '@/lib/directions'

const KOREA_LAT_MIN = 33.0
const KOREA_LAT_MAX = 38.7
const KOREA_LNG_MIN = 124.5
const KOREA_LNG_MAX = 132.0

describe('Feature: navigation-google-maps-default', () => {
  describe('Property 1: Boundary classification biconditional', () => {
    /**
     * **Validates: Requirements 1.2, 1.3, 4.4**
     *
     * For any coordinate pair (lat, lng), isKoreanCoordinates(lat, lng)
     * returns true iff 33.0 <= lat <= 38.7 AND 124.5 <= lng <= 132.0
     */
    it('should return true iff coordinates are within Korea boundary', () => {
      fc.assert(
        fc.property(
          fc.double({
            min: -90,
            max: 90,
            noNaN: true,
            noDefaultInfinity: true,
          }),
          fc.double({
            min: -180,
            max: 180,
            noNaN: true,
            noDefaultInfinity: true,
          }),
          (lat, lng) => {
            const result = isKoreanCoordinates(lat, lng)
            const expected =
              lat >= KOREA_LAT_MIN &&
              lat <= KOREA_LAT_MAX &&
              lng >= KOREA_LNG_MIN &&
              lng <= KOREA_LNG_MAX

            return result === expected
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
