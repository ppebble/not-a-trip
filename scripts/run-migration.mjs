/**
 * Migration runner with dry-run/history support.
 *
 * Usage:
 *   node scripts/run-migration.mjs <script-path> [--dry-run] [--collection <name>]
 */
import { execSync } from 'child_process'
import { basename } from 'path'
import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'

const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const value = trimmed.slice(idx + 1).trim()
  envVars[key] = value
}

const uri = envVars.MONGODB_URI || 'mongodb://localhost:27017/not-a-trip'
const dbMatch = uri.match(/\/([^/?]+)(\?|$)/)
const dbName = envVars.MONGODB_DB || (dbMatch ? dbMatch[1] : 'not-a-trip')

const args = process.argv.slice(2)
const script = args[0]

if (!script) {
  console.error(
    'Usage: node scripts/run-migration.mjs <script-path> [--dry-run] [--collection <name>]'
  )
  process.exit(1)
}

const dryRun = args.includes('--dry-run')
const collectionIndex = args.indexOf('--collection')
const collectionName =
  collectionIndex >= 0 ? args[collectionIndex + 1] || undefined : undefined
const migrationName = basename(script)
const startedAt = new Date()

const client = new MongoClient(uri)
await client.connect()
const db = client.db(dbName)
const migrations = db.collection('migrations')

const existing = await migrations.findOne({
  name: migrationName,
  success: true,
})

if (existing && !dryRun) {
  console.log(`Skipping already applied migration: ${migrationName}`)
  await client.close()
  process.exit(0)
}

const beforeCount = collectionName
  ? await db.collection(collectionName).countDocuments()
  : null

try {
  console.log(`DB: ${dbName}`)
  console.log(`URI: ${uri}`)
  console.log(`Migration: ${migrationName}`)
  console.log(`Dry-run: ${dryRun ? 'yes' : 'no'}`)
  if (collectionName) {
    console.log(`Target collection: ${collectionName}`)
    console.log(`Documents before: ${beforeCount}`)
  }
  console.log('')

  execSync(`npx tsx ${script}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envVars,
      MONGODB_DB: dbName,
      MIGRATION_DRY_RUN: dryRun ? '1' : '0',
      MIGRATION_COLLECTION: collectionName || '',
    },
  })

  const afterCount = collectionName
    ? await db.collection(collectionName).countDocuments()
    : null
  const affectedCount =
    beforeCount !== null && afterCount !== null ? afterCount - beforeCount : null

  await migrations.insertOne({
    name: migrationName,
    scriptPath: script,
    collectionName: collectionName || null,
    dryRun,
    startedAt,
    finishedAt: new Date(),
    success: true,
    beforeCount,
    afterCount,
    affectedCount,
  })
} catch (error) {
  await migrations.insertOne({
    name: migrationName,
    scriptPath: script,
    collectionName: collectionName || null,
    dryRun,
    startedAt,
    finishedAt: new Date(),
    success: false,
    errorMessage: error instanceof Error ? error.message : String(error),
    beforeCount,
  })
  await client.close()
  throw error
}

await client.close()
