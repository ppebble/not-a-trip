import fc from 'fast-check'
import { Spot, MediaInfo, Coordinates } from '@/types'

/**
 * Property 9: 스팟 데이터 직렬화 라운드트립
 * Validates: Requirements 6.3
 */

const coordinatesArbitrary = fc.record({
  lat: fc.double({ min: -90, max: 90, noNaN: true }),
  lng: fc.double({ min: -180, max: 180, noNaN: true }),
})

const mediaInfoArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.constantFrom('anime', 'drama', 'movie', 'other') as fc.Arbitrary<
    MediaInfo['type']
  >,
  year: fc.option(fc.integer({ min: 1900, max: 2030 }), { nil: undefined }),
})

const validDateArbitrary = fc
  .date({
    min: new Date('2000-01-01'),
    max: new Date('2030-12-31'),
  })
  .filter((date) => !isNaN(date.getTime()))

const spotArbitrary = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0),
  name: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  description: fc
    .string({ minLength: 1, maxLength: 1000 })
    .filter((s) => s.trim().length > 0),
  photos: fc.array(fc.webUrl(), { minLength: 0, maxLength: 10 }),
  address: fc
    .string({ minLength: 1, maxLength: 300 })
    .filter((s) => s.trim().length > 0),
  coordinates: coordinatesArbitrary,
  relatedMedia: fc.array(mediaInfoArbitrary, { minLength: 0, maxLength: 5 }),
  createdAt: validDateArbitrary,
  updatedAt: validDateArbitrary,
})

/**
 * Helper function to check if two Spot objects are equivalent
 * Handles JSON serialization edge cases properly
 */
function spotsAreEquivalent(spot1: Spot, spot2: Spot): boolean {
  const relatedMedia1 = spot1.relatedMedia || []
  const relatedMedia2 = spot2.relatedMedia || []

  return (
    spot1.id === spot2.id &&
    spot1.name === spot2.name &&
    spot1.description === spot2.description &&
    JSON.stringify(spot1.photos.sort()) ===
      JSON.stringify(spot2.photos.sort()) &&
    spot1.address === spot2.address &&
    spot1.coordinates.lat === spot2.coordinates.lat &&
    spot1.coordinates.lng === spot2.coordinates.lng &&
    relatedMedia1.length === relatedMedia2.length &&
    relatedMedia1.every((media1, index) => {
      const media2 = relatedMedia2[index]
      return (
        media1.title === media2.title &&
        media1.type === media2.type &&
        media1.year === media2.year
      )
    }) &&
    spot1.createdAt.getTime() === spot2.createdAt.getTime() &&
    spot1.updatedAt.getTime() === spot2.updatedAt.getTime()
  )
}

describe('Spot Data Serialization Round-trip Property Tests', () => {
  test('Property 9: 스팟 데이터 직렬화 라운드트립', () => {
    fc.assert(
      fc.property(spotArbitrary, (originalSpot: Spot) => {
        const serialized = JSON.stringify(originalSpot)
        const deserialized: Spot = JSON.parse(serialized)

        deserialized.createdAt = new Date(deserialized.createdAt)
        deserialized.updatedAt = new Date(deserialized.updatedAt)

        return spotsAreEquivalent(originalSpot, deserialized)
      }),
      { numRuns: 100 }
    )
  })

  test('Property 9 Edge Case: Empty arrays and optional fields', () => {
    return fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          photos: fc.constant([] as string[]),
          address: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          coordinates: coordinatesArbitrary,
          relatedMedia: fc.constant([] as MediaInfo[]),
          createdAt: validDateArbitrary,
          updatedAt: validDateArbitrary,
        }),
        (originalSpot: Spot) => {
          if (
            isNaN(originalSpot.createdAt.getTime()) ||
            isNaN(originalSpot.updatedAt.getTime())
          ) {
            return true
          }

          const serialized = JSON.stringify(originalSpot)
          const deserialized: Spot = JSON.parse(serialized)

          deserialized.createdAt = new Date(deserialized.createdAt)
          deserialized.updatedAt = new Date(deserialized.updatedAt)

          if (
            isNaN(deserialized.createdAt.getTime()) ||
            isNaN(deserialized.updatedAt.getTime())
          ) {
            return false
          }

          return spotsAreEquivalent(originalSpot, deserialized)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 9 Edge Case: Media with optional year field', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          photos: fc.array(fc.webUrl(), { maxLength: 3 }),
          address: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          coordinates: coordinatesArbitrary,
          relatedMedia: fc.array(
            fc.record({
              title: fc
                .string({ minLength: 1 })
                .filter((s) => s.trim().length > 0),
              type: fc.constantFrom(
                'anime',
                'drama',
                'movie',
                'other'
              ) as fc.Arbitrary<MediaInfo['type']>,
              year: fc.option(fc.integer({ min: 1900, max: 2030 }), {
                nil: undefined,
              }),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          createdAt: validDateArbitrary,
          updatedAt: validDateArbitrary,
        }),
        (originalSpot: Spot) => {
          if (
            isNaN(originalSpot.createdAt.getTime()) ||
            isNaN(originalSpot.updatedAt.getTime())
          ) {
            return true
          }

          const serialized = JSON.stringify(originalSpot)
          const deserialized: Spot = JSON.parse(serialized)

          deserialized.createdAt = new Date(deserialized.createdAt)
          deserialized.updatedAt = new Date(deserialized.updatedAt)

          return spotsAreEquivalent(originalSpot, deserialized)
        }
      ),
      { numRuns: 100 }
    )
  })
})
