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
    const [routes, spotIds, contentNames] = await Promise.all([
      db.collection('routes').find(query).toArray(),
      db
        .collection('spots')
        .find({}, { projection: { _id: 0, id: 1 } })
        .toArray()
        .then((spots) => new Set(spots.map((spot) => spot.id))),
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
      validateRoute(route, spotIds, contentNames, failures)
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

function validateRoute(route, spotIds, contentNames, failures) {
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
  if (!Number.isFinite(route.totalDistance) || route.totalDistance < 0) {
    failures.push(`${label}: totalDistance must be finite and non-negative`)
  }
  if (!Number.isFinite(route.estimatedDuration) || route.estimatedDuration <= 0) {
    failures.push(`${label}: estimatedDuration must be finite and positive`)
  }
  if (!route.createdAt || !route.updatedAt) {
    failures.push(`${label}: missing timestamps`)
  }

  for (const [index, spot] of (route.spots || []).entries()) {
    if (!spotIds.has(spot.spotId)) {
      failures.push(`${label}: spot ${spot.spotId} does not exist`)
    }
    if (!spot.coordinates || !Number.isFinite(spot.coordinates.lat) || !Number.isFinite(spot.coordinates.lng)) {
      failures.push(`${label}: spot ${spot.spotId || index} has invalid coordinates`)
    }
    if (route.isPublic === true && /picsum\.photos|placeholder|dummy/i.test(spot.thumbnailUrl || '')) {
      failures.push(`${label}: public route has placeholder thumbnail: ${spot.thumbnailUrl}`)
    }
    if (index === 0) {
      if (spot.distanceFromPrev !== null || spot.walkTimeFromPrev !== null) {
        failures.push(`${label}: first spot must have null distance/time from previous`)
      }
    } else {
      if (!Number.isFinite(spot.distanceFromPrev) || spot.distanceFromPrev < 0) {
        failures.push(`${label}: spot ${spot.spotId} has invalid distanceFromPrev`)
      }
      if (
        spot.walkTimeFromPrev !== null &&
        (!Number.isFinite(spot.walkTimeFromPrev) || spot.walkTimeFromPrev < 0)
      ) {
        failures.push(`${label}: spot ${spot.spotId} has invalid walkTimeFromPrev`)
      }
    }
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
    if (!Array.isArray(route.sourceAudit.sourceUrls) || route.sourceAudit.sourceUrls.length === 0) {
      failures.push(`${label}: seeded route missing source URLs`)
    }
    if (!route.sourceAudit.sourceSummary) {
      failures.push(`${label}: seeded route missing source summary`)
    }
    if (typeof route.sourceAudit.allStopsAlreadyInDb !== 'boolean') {
      failures.push(`${label}: seeded route must document whether all stops already existed`)
    }
    if (
      route.sourceAudit.allStopsAlreadyInDb === false &&
      (!Array.isArray(route.sourceAudit.newSpotIds) || route.sourceAudit.newSpotIds.length === 0)
    ) {
      failures.push(`${label}: seeded route with new stops must list sourceAudit.newSpotIds`)
    }
  }
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
