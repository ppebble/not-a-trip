import fs from 'node:fs'
import { MongoClient } from 'mongodb'

loadEnv()

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB || extractDbNameFromUri(mongoUri)
const seededOnly = process.argv.includes('--seeded-only')

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

async function main() {
  const client = new MongoClient(mongoUri)
  await client.connect()

  try {
    const db = client.db(dbName)
    const query = seededOnly
      ? { 'sourceAudit.generatedBy': 'scripts/seed-researched-routes.mjs' }
      : {}
    const [routes, spotsById, contentNames] = await Promise.all([
      db.collection('routes').find(query).toArray(),
      db
        .collection('spots')
        .find(
          {},
          {
            projection: {
              _id: 0,
              id: 1,
              name: 1,
              coordinates: 1,
              photos: 1,
              status: 1,
              spotStatus: 1,
              lifecycleStatus: 1,
            },
          }
        )
        .toArray()
        .then((spots) => new Map(spots.map((spot) => [spot.id, spot]))),
      db
        .collection('content_masters')
        .find({}, { projection: { _id: 0, displayName: 1, normalizedName: 1 } })
        .toArray()
        .then(
          (contents) =>
            new Set(
              contents.flatMap((content) =>
                [content.displayName, content.normalizedName].filter(Boolean)
              )
            )
        ),
    ])

    const failures = []
    const routeIdCounts = new Map()
    for (const route of routes) {
      routeIdCounts.set(route.id, (routeIdCounts.get(route.id) || 0) + 1)
      validateRoute(route, spotsById, contentNames, failures)
    }

    for (const [routeId, count] of routeIdCounts.entries()) {
      if (count > 1) failures.push(`${routeId}: duplicated route id (${count})`)
    }

    const summary = {
      dbName,
      scope: seededOnly ? 'seeded-only' : 'all-routes',
      checkedRoutes: routes.length,
      failures,
    }

    console.log(JSON.stringify(summary, null, 2))
    if (failures.length > 0) process.exitCode = 1
  } finally {
    await client.close()
  }
}

function validateRoute(route, spotsById, contentNames, failures) {
  const label = route.id || '(missing id)'

  if (!/^ROUTE-\d+$/.test(route.id || '')) {
    failures.push(`${label}: id must match ROUTE-### shape`)
  }
  if (!route.name || typeof route.name !== 'string') {
    failures.push(`${label}: missing name`)
  }
  if (!route.description || typeof route.description !== 'string') {
    failures.push(`${label}: missing description`)
  }
  if (!['easy', 'moderate', 'hard'].includes(route.difficulty)) {
    failures.push(`${label}: invalid difficulty`)
  }
  if (!Array.isArray(route.spots) || route.spots.length < 2) {
    failures.push(`${label}: route must have at least 2 spots`)
  }
  const routeSpotIds = (route.spots || []).map((spot) => spot.spotId)
  if (new Set(routeSpotIds).size !== routeSpotIds.length) {
    failures.push(`${label}: route contains duplicated spot ids`)
  }
  if (!Number.isFinite(route.totalDistance) || route.totalDistance < 0) {
    failures.push(`${label}: totalDistance must be finite and non-negative`)
  }
  if (
    !Number.isFinite(route.estimatedDuration) ||
    route.estimatedDuration <= 0
  ) {
    failures.push(`${label}: estimatedDuration must be finite and positive`)
  }
  if (!route.createdAt || !route.updatedAt) {
    failures.push(`${label}: missing timestamps`)
  }

  for (const [index, spot] of (route.spots || []).entries()) {
    const masterSpot = spotsById.get(spot.spotId)
    if (!masterSpot) {
      failures.push(`${label}: spot ${spot.spotId} does not exist`)
    } else {
      if (route.isPublic === true && spot.spotName !== masterSpot.name) {
        failures.push(`${label}: spot ${spot.spotId} name is stale`)
      }
      if (route.isPublic === true && isExplicitlyUnavailable(masterSpot)) {
        failures.push(
          `${label}: public route contains unavailable spot ${spot.spotId}`
        )
      }
      if (
        spot.coordinates &&
        masterSpot.coordinates &&
        calculateDistanceMeters(spot.coordinates, masterSpot.coordinates) > 25
      ) {
        failures.push(
          `${label}: spot ${spot.spotId} coordinates drifted from master data`
        )
      }
      if (
        route.isPublic === true &&
        (masterSpot.photos?.[0] || '') !== (spot.thumbnailUrl || '')
      ) {
        failures.push(`${label}: spot ${spot.spotId} thumbnail is stale`)
      }
    }
    if (
      !spot.coordinates ||
      !Number.isFinite(spot.coordinates.lat) ||
      !Number.isFinite(spot.coordinates.lng)
    ) {
      failures.push(
        `${label}: spot ${spot.spotId || index} has invalid coordinates`
      )
    }
    if (
      route.isPublic === true &&
      /picsum\.photos|placeholder|dummy/i.test(spot.thumbnailUrl || '')
    ) {
      failures.push(
        `${label}: public route has placeholder thumbnail: ${spot.thumbnailUrl}`
      )
    }
    if (index === 0) {
      if (spot.distanceFromPrev !== null || spot.walkTimeFromPrev !== null) {
        failures.push(
          `${label}: first spot must have null distance/time from previous`
        )
      }
    } else {
      if (
        !Number.isFinite(spot.distanceFromPrev) ||
        spot.distanceFromPrev < 0
      ) {
        failures.push(
          `${label}: spot ${spot.spotId} has invalid distanceFromPrev`
        )
      }
      if (
        spot.walkTimeFromPrev !== null &&
        (!Number.isFinite(spot.walkTimeFromPrev) || spot.walkTimeFromPrev < 0)
      ) {
        failures.push(
          `${label}: spot ${spot.spotId} has invalid walkTimeFromPrev`
        )
      }
    }
  }

  const summedLegDistance = (route.spots || []).reduce(
    (sum, spot) =>
      sum +
      (Number.isFinite(spot.distanceFromPrev) ? spot.distanceFromPrev : 0),
    0
  )
  if (
    Number.isFinite(route.totalDistance) &&
    Math.abs(route.totalDistance - summedLegDistance) > 1
  ) {
    failures.push(
      `${label}: totalDistance does not equal the sum of route legs`
    )
  }

  for (const contentName of route.relatedContentNames || []) {
    if (!contentNames.has(contentName)) {
      failures.push(`${label}: related content does not exist: ${contentName}`)
    }
  }

  if (route.sourceAudit?.generatedBy === 'scripts/seed-researched-routes.mjs') {
    if (route.isPublic !== true) {
      failures.push(`${label}: seeded route must be public`)
    }
    if (
      !Array.isArray(route.sourceAudit.sourceUrls) ||
      route.sourceAudit.sourceUrls.length === 0
    ) {
      failures.push(`${label}: seeded route missing source URLs`)
    }
    if (!route.sourceAudit.sourceSummary) {
      failures.push(`${label}: seeded route missing source summary`)
    }
    if (typeof route.sourceAudit.allStopsAlreadyInDb !== 'boolean') {
      failures.push(
        `${label}: seeded route must document whether all stops already existed`
      )
    }
    if (
      route.sourceAudit.allStopsAlreadyInDb === false &&
      (!Array.isArray(route.sourceAudit.newSpotIds) ||
        route.sourceAudit.newSpotIds.length === 0)
    ) {
      failures.push(
        `${label}: seeded route with new stops must list sourceAudit.newSpotIds`
      )
    }
  }
}

function isExplicitlyUnavailable(spot) {
  const unavailable = new Set([
    'lost',
    'removed',
    'deleted',
    'closed',
    'closure',
    'demolished',
    'unavailable',
    'inactive',
    'archived',
  ])
  return [spot.status, spot.spotStatus, spot.lifecycleStatus].some(
    (value) =>
      typeof value === 'string' && unavailable.has(value.trim().toLowerCase())
  )
}

function calculateDistanceMeters(a, b) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const earthRadiusMeters = 6371000
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(dLng / 2) ** 2
  return (
    2 * earthRadiusMeters * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  )
}

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match || process.env[match[1]]) continue
      let value = match[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[match[1]] = value
    }
  }
}

function extractDbNameFromUri(uri) {
  const match = uri.match(/\/([^/?]+)(\?|$)/)
  return match ? match[1] : 'not-a-trip'
}
