import { APPROVED_ANIMATION_SPOTS } from '../seed-real-spots'
import {
  JAPAN_PILGRIMAGE_ROUTE_EXPANSION,
  JAPAN_PILGRIMAGE_ROUTE_SPOTS,
} from './japan-pilgrimage-route-expansion.mjs'

const expectedOrders = new Map([
  ['ROUTE-110', ['REAL-ANI-077', 'REAL-ANI-006', 'REAL-ANI-076']],
  ['ROUTE-111', ['REAL-ANI-081', 'REAL-ANI-080']],
  ['ROUTE-112', ['REAL-ANI-084', 'REAL-ANI-083']],
  ['ROUTE-113', ['REAL-ANI-085', 'REAL-ANI-086', 'REAL-ANI-022']],
  ['ROUTE-114', ['REAL-ANI-071', 'REAL-ANI-091']],
])

describe('Japan pilgrimage route expansion', () => {
  it('locks the researched traveler order for every route', () => {
    expect(JAPAN_PILGRIMAGE_ROUTE_EXPANSION).toHaveLength(expectedOrders.size)

    for (const route of JAPAN_PILGRIMAGE_ROUTE_EXPANSION) {
      expect(route.spotIds).toEqual(expectedOrders.get(route.id))
    }
  })

  it('requires traveler evidence and a route-planning cross-check', () => {
    const travelerKinds = new Set([
      'fan_trip_report',
      'guided_itinerary',
      'video_trip_report',
    ])
    const planningKinds = new Set([
      'official_route',
      'pilgrimage_guide',
      'guided_itinerary',
    ])

    for (const route of JAPAN_PILGRIMAGE_ROUTE_EXPANSION) {
      expect(route.pilgrimSources.length).toBeGreaterThanOrEqual(2)
      expect(
        route.pilgrimSources.some((source: { kind: string }) =>
          travelerKinds.has(source.kind)
        )
      ).toBe(true)
      expect(
        route.pilgrimSources.some((source: { kind: string }) =>
          planningKinds.has(source.kind)
        )
      ).toBe(true)
      expect(route.sourceUrls).toEqual(
        route.pilgrimSources.map((source: { url: string }) => source.url)
      )
      expect(
        route.sourceUrls.every((url: string) => url.startsWith('https://'))
      ).toBe(true)
      expect(route.observedTravelPattern.length).toBeGreaterThan(30)
      expect(route.estimatedDurationMinutes).toBeGreaterThanOrEqual(120)
    }
  })

  it('references only seeded spots with usable route thumbnails', () => {
    const spotById = new Map(
      APPROVED_ANIMATION_SPOTS.map((spot) => [spot.id, spot])
    )

    for (const route of JAPAN_PILGRIMAGE_ROUTE_EXPANSION) {
      expect(new Set(route.spotIds).size).toBe(route.spotIds.length)
      for (const spotId of route.spotIds) {
        const spot = spotById.get(spotId)
        expect(spot).toBeDefined()
        expect(spot?.photos[0]).toBeTruthy()
        expect(spot?.coordinates.lat).toBeGreaterThanOrEqual(24)
        expect(spot?.coordinates.lng).toBeGreaterThanOrEqual(122)
      }
    }
  })

  it('keeps the runtime route spot snapshot synchronized with seed data', () => {
    const approvedSpotById = new Map(
      APPROVED_ANIMATION_SPOTS.map((spot) => [spot.id, spot])
    )

    for (const snapshot of JAPAN_PILGRIMAGE_ROUTE_SPOTS) {
      const source = approvedSpotById.get(snapshot.id)
      expect(source).toBeDefined()
      expect(snapshot).toEqual({
        id: source?.id,
        name: source?.name,
        coordinates: source?.coordinates,
        photos: source?.photos,
      })
    }
  })

  it('marks only the regional Minobu to Motosu course as transit-dependent', () => {
    expect(
      JAPAN_PILGRIMAGE_ROUTE_EXPANSION.filter(
        ({ routeType }) => routeType === 'mixed_transit'
      ).map(({ id }) => id)
    ).toEqual(['ROUTE-113'])
    expect(
      JAPAN_PILGRIMAGE_ROUTE_EXPANSION.filter(
        ({ routeType }) => routeType === 'walking'
      ).map(({ id }) => id)
    ).toEqual(['ROUTE-110', 'ROUTE-111', 'ROUTE-112', 'ROUTE-114'])
  })
})
