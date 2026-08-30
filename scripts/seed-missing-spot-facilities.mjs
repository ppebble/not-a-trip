import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { MongoClient } from 'mongodb'
import {
  buildOsmMapUrl,
  hasNearbyFacility,
  parseOsmMapNodes,
  selectFacilityCandidates,
} from './lib/nearby-facility-import.mjs'
import {
  describeMongoTarget,
  loadRepositoryEnv,
} from './lib/load-repository-env.mjs'

const TARGET_ID_PATTERN = '^REAL-ANI-(05[0-9]|06[0-9]|07[0-9]|08[0-9]|09[0-3])$'
const RADIUS_METERS = 2_000
const APPLY = process.argv.includes('--apply')
const execFileAsync = promisify(execFile)

async function fetchOsmElements(spot, radiusMeters) {
  const { stdout } = await execFileAsync(
    'curl',
    [
      '--silent',
      '--show-error',
      '--fail-with-body',
      '--max-time',
      '60',
      '--header',
      'User-Agent: not-a-trip-facility-maintenance/1.0',
      buildOsmMapUrl(spot.coordinates, radiusMeters),
    ],
    { maxBuffer: 50 * 1024 * 1024 }
  )
  return parseOsmMapNodes(stdout)
}

function facilityDocument(candidate, now) {
  const document = { ...candidate }
  delete document.distance
  return { ...document, createdAt: now, updatedAt: now }
}

async function main() {
  loadRepositoryEnv()
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required')
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()

  try {
    const db = client.db(process.env.MONGODB_DB || undefined)
    const spotsCollection = db.collection('spots')
    const facilitiesCollection = db.collection('facilities')
    const spots = await spotsCollection
      .find(
        { id: { $regex: TARGET_ID_PATTERN } },
        { projection: { _id: 0, id: 1, name: 1, coordinates: 1 } }
      )
      .sort({ id: 1 })
      .toArray()
    const facilities = await facilitiesCollection
      .find({ status: { $ne: 'hidden' } }, { projection: { coordinates: 1 } })
      .toArray()
    const missingSpots = spots.filter(
      (spot) => !hasNearbyFacility(spot, facilities, RADIUS_METERS)
    )

    console.log(
      JSON.stringify(
        {
          mode: APPLY ? 'apply' : 'dry-run',
          target: describeMongoTarget(process.env.MONGODB_URI),
          targetSpotCount: spots.length,
          missingSpotCount: missingSpots.length,
        },
        null,
        2
      )
    )

    const plans = []
    for (const spot of missingSpots) {
      let elements = await fetchOsmElements(spot, 500)
      let candidates = selectFacilityCandidates(elements, spot, {
        radiusMeters: RADIUS_METERS,
        maxResults: 5,
      })
      if (candidates.length === 0) {
        elements = await fetchOsmElements(spot, RADIUS_METERS)
        candidates = selectFacilityCandidates(elements, spot, {
          radiusMeters: RADIUS_METERS,
          maxResults: 5,
        })
      }
      if (candidates.length === 0) {
        throw new Error(`${spot.id} has no usable OpenStreetMap facilities`)
      }
      plans.push({ spot, candidates })
      console.log(
        `${spot.id}: ${candidates.map(({ name, type, distance }) => `${name} [${type}, ${distance}m]`).join(', ')}`
      )
      await new Promise((resolve) => setTimeout(resolve, 250))
    }

    if (!APPLY) {
      console.log(
        `Dry run complete: ${plans.reduce((sum, plan) => sum + plan.candidates.length, 0)} facilities planned. Re-run with --apply to persist.`
      )
      return
    }

    let upsertedCount = 0
    const now = new Date()
    for (const { candidates } of plans) {
      for (const candidate of candidates) {
        const result = await facilitiesCollection.updateOne(
          {
            'source.provider': candidate.source.provider,
            'source.elementId': candidate.source.elementId,
          },
          { $setOnInsert: facilityDocument(candidate, now) },
          { upsert: true }
        )
        upsertedCount += result.upsertedCount
      }
    }

    console.log(`Apply complete: ${upsertedCount} facilities inserted.`)
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
