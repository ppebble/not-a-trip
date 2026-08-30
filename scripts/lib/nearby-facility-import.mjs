const EARTH_RADIUS_METERS = 6_371_000

const DEFAULT_NAME_BY_TYPE = {
  cafe: 'カフェ',
  convenience_store: 'コンビニエンスストア',
  other: '観光案内所',
  public_restroom: '公衆トイレ',
  restaurant: '飲食店',
  station: '駅',
}

export function calculateDistanceMeters(origin, destination) {
  const toRadians = Math.PI / 180
  const deltaLat = (destination.lat - origin.lat) * toRadians
  const deltaLng = (destination.lng - origin.lng) * toRadians
  const originLat = origin.lat * toRadians
  const destinationLat = destination.lat * toRadians
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(deltaLng / 2) ** 2

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}

export function normalizeCoordinates(coordinates) {
  if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every(Number.isFinite)
  ) {
    return { lat: coordinates[0], lng: coordinates[1] }
  }

  if (
    coordinates &&
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng)
  ) {
    return coordinates
  }

  return null
}

export function mapOsmFacilityType(tags = {}) {
  if (tags.amenity === 'cafe') return 'cafe'
  if (['restaurant', 'fast_food', 'food_court'].includes(tags.amenity)) {
    return 'restaurant'
  }
  if (['convenience', 'supermarket'].includes(tags.shop)) {
    return 'convenience_store'
  }
  if (
    ['station', 'halt'].includes(tags.railway) ||
    tags.public_transport === 'station' ||
    tags.amenity === 'bus_station'
  ) {
    return 'station'
  }
  if (tags.amenity === 'toilets') return 'public_restroom'
  if (tags.tourism === 'information' || tags.amenity === 'pharmacy') {
    return 'other'
  }

  return null
}

function extractCoordinates(element) {
  const lat = element.lat ?? element.center?.lat
  const lng = element.lon ?? element.center?.lon
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}

function extractName(tags, facilityType) {
  return (
    tags['name:ko'] ||
    tags.name ||
    tags['name:ja'] ||
    tags['name:en'] ||
    DEFAULT_NAME_BY_TYPE[facilityType]
  )
}

function extractAddress(tags) {
  if (tags['addr:full']) return tags['addr:full']

  const locality = [
    tags['addr:province'],
    tags['addr:city'],
    tags['addr:suburb'],
    tags['addr:quarter'],
    tags['addr:street'],
    tags['addr:housenumber'],
  ].filter(Boolean)

  return locality.join(' ') || 'OpenStreetMap address unavailable'
}

export function normalizeOsmElement(element, spot) {
  const facilityType = mapOsmFacilityType(element.tags)
  const coordinates = extractCoordinates(element)
  if (!facilityType || !coordinates) return null

  const distance = Math.round(
    calculateDistanceMeters(spot.coordinates, coordinates)
  )

  return {
    name: extractName(element.tags ?? {}, facilityType),
    type: facilityType,
    address: extractAddress(element.tags ?? {}),
    coordinates,
    spotId: spot.id,
    status: 'needs_verification',
    verificationScore: 0,
    upvotes: 0,
    downvotes: 0,
    source: {
      provider: 'openstreetmap',
      elementId: `${element.type}/${element.id}`,
      url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    },
    distance,
  }
}

export function selectFacilityCandidates(elements, spot, options = {}) {
  const radiusMeters = options.radiusMeters ?? 2_000
  const maxResults = options.maxResults ?? 5
  const candidates = elements
    .map((element) => normalizeOsmElement(element, spot))
    .filter((facility) => facility && facility.distance <= radiusMeters)
    .sort((left, right) => left.distance - right.distance)

  const selected = []
  const usedSources = new Set()
  const usedTypes = new Set()
  const usedNames = new Set()

  for (const facility of candidates) {
    if (usedSources.has(facility.source.elementId)) continue
    if (usedTypes.has(facility.type)) continue
    selected.push(facility)
    usedSources.add(facility.source.elementId)
    usedTypes.add(facility.type)
    usedNames.add(`${facility.type}:${facility.name}`)
    if (selected.length === maxResults) return selected
  }

  for (const facility of candidates) {
    if (usedSources.has(facility.source.elementId)) continue
    if (usedNames.has(`${facility.type}:${facility.name}`)) continue
    selected.push(facility)
    usedSources.add(facility.source.elementId)
    usedNames.add(`${facility.type}:${facility.name}`)
    if (selected.length === maxResults) break
  }

  return selected
}

export function hasNearbyFacility(spot, facilities, radiusMeters = 2_000) {
  return facilities.some((facility) => {
    const coordinates = normalizeCoordinates(facility.coordinates)
    return (
      coordinates &&
      calculateDistanceMeters(spot.coordinates, coordinates) <= radiusMeters
    )
  })
}

function decodeXml(value) {
  return value
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

export function parseOsmMapNodes(xml) {
  const elements = []
  const nodePattern = /<node\b([^>]*)>([\s\S]*?)<\/node>/g
  const attributePattern = /\b(id|lat|lon)="([^"]+)"/g
  const tagPattern = /<tag\s+k="([^"]+)"\s+v="([^"]*)"\s*\/>/g

  for (const nodeMatch of xml.matchAll(nodePattern)) {
    const attributes = Object.fromEntries(
      [...nodeMatch[1].matchAll(attributePattern)].map((match) => [
        match[1],
        match[2],
      ])
    )
    const tags = Object.fromEntries(
      [...nodeMatch[2].matchAll(tagPattern)].map((match) => [
        decodeXml(match[1]),
        decodeXml(match[2]),
      ])
    )
    if (!attributes.id || !attributes.lat || !attributes.lon) continue

    elements.push({
      type: 'node',
      id: Number(attributes.id),
      lat: Number(attributes.lat),
      lon: Number(attributes.lon),
      tags,
    })
  }

  return elements
}

export function buildOsmMapUrl({ lat, lng }, radiusMeters) {
  const latitudeDelta = radiusMeters / 111_320
  const longitudeDelta =
    radiusMeters / (111_320 * Math.cos((lat * Math.PI) / 180))
  const bbox = [
    lng - longitudeDelta,
    lat - latitudeDelta,
    lng + longitudeDelta,
    lat + latitudeDelta,
  ].join(',')

  return `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`
}
