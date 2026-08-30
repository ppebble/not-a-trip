import {
  buildOsmMapUrl,
  calculateDistanceMeters,
  hasNearbyFacility,
  mapOsmFacilityType,
  normalizeOsmElement,
  parseOsmMapNodes,
  selectFacilityCandidates,
} from './nearby-facility-import.mjs'

const spot = {
  id: 'REAL-ANI-054',
  coordinates: { lat: 36.25, lng: 139.5 },
}

function element(id: number, tags: Record<string, string>, offset = 0.001) {
  return {
    type: 'node',
    id,
    lat: spot.coordinates.lat + offset,
    lon: spot.coordinates.lng,
    tags,
  }
}

describe('nearby facility import', () => {
  it('uses the same two-kilometer distance boundary as the spot API', () => {
    expect(
      calculateDistanceMeters({ lat: 35, lng: 139 }, { lat: 35.01, lng: 139 })
    ).toBeCloseTo(1111.95, 0)
    expect(
      hasNearbyFacility(spot, [
        { coordinates: [spot.coordinates.lat + 0.001, spot.coordinates.lng] },
      ])
    ).toBe(true)
    expect(
      hasNearbyFacility(spot, [
        { coordinates: { lat: spot.coordinates.lat + 0.03, lng: 139.5 } },
      ])
    ).toBe(false)
  })

  it.each([
    [{ amenity: 'cafe' }, 'cafe'],
    [{ amenity: 'restaurant' }, 'restaurant'],
    [{ amenity: 'toilets' }, 'public_restroom'],
    [{ shop: 'convenience' }, 'convenience_store'],
    [{ railway: 'halt' }, 'station'],
    [{ tourism: 'information' }, 'other'],
    [{ amenity: 'parking' }, null],
  ])('maps supported OSM tags only', (tags, expected) => {
    expect(mapOsmFacilityType(tags)).toBe(expected)
  })

  it('normalizes source identity, address fallback, and verification state', () => {
    expect(
      normalizeOsmElement(element(123, { amenity: 'toilets' }), spot)
    ).toMatchObject({
      name: '公衆トイレ',
      type: 'public_restroom',
      address: 'OpenStreetMap address unavailable',
      spotId: spot.id,
      status: 'needs_verification',
      source: {
        provider: 'openstreetmap',
        elementId: 'node/123',
        url: 'https://www.openstreetmap.org/node/123',
      },
    })
  })

  it('selects nearby category diversity first and de-duplicates OSM IDs', () => {
    const candidates = selectFacilityCandidates(
      [
        element(1, { amenity: 'cafe', name: 'A' }, 0.001),
        element(1, { amenity: 'cafe', name: 'A' }, 0.001),
        element(2, { amenity: 'cafe', name: 'B' }, 0.002),
        element(3, { shop: 'convenience', name: 'C' }, 0.003),
      ],
      spot,
      { maxResults: 3 }
    )

    expect(candidates.map(({ name }) => name)).toEqual(['A', 'C', 'B'])
  })

  it('parses tagged nodes from the OSM map API fallback', () => {
    const xml = `<osm><node id="123" lat="36.251" lon="139.5"><tag k="amenity" v="cafe"/><tag k="name" v="Tom &amp; Jerry"/></node><node id="456" lat="36.252" lon="139.5"/></osm>`
    expect(parseOsmMapNodes(xml)).toEqual([
      {
        type: 'node',
        id: 123,
        lat: 36.251,
        lon: 139.5,
        tags: { amenity: 'cafe', name: 'Tom & Jerry' },
      },
    ])
  })

  it('builds an OSM map bounding box around the target', () => {
    const url = new URL(buildOsmMapUrl(spot.coordinates, 500))
    const bbox = url.searchParams.get('bbox')?.split(',').map(Number) ?? []
    expect(bbox).toHaveLength(4)
    expect(bbox[0]).toBeLessThan(spot.coordinates.lng)
    expect(bbox[1]).toBeLessThan(spot.coordinates.lat)
    expect(bbox[2]).toBeGreaterThan(spot.coordinates.lng)
    expect(bbox[3]).toBeGreaterThan(spot.coordinates.lat)
  })
})
