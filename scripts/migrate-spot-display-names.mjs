/**
 * Spot display name / related content cleanup migration
 *
 * Usage:
 * - Dry run: node scripts/migrate-spot-display-names.mjs
 * - Apply:   node scripts/migrate-spot-display-names.mjs --apply
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'

function loadEnvLocal() {
  try {
    const envContent = readFileSync('.env.local', 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim()
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // ignore missing .env.local
  }
}

function normalizeContentName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣ａ-ｚＡ-Ｚぁ-ゔァ-ヴー一-龠-]/g, '')
}

function getContentAliases(contentName) {
  const trimmed = contentName.trim()
  const beforeParen = trimmed.replace(/\s*\([^)]*\)\s*$/, '').trim()
  const aliases = [trimmed]
  if (beforeParen && beforeParen !== trimmed) aliases.push(beforeParen)
  return [...new Set(aliases.map((value) => value.toLowerCase()))]
}

function dedupeRelatedContent(contents) {
  if (!Array.isArray(contents) || contents.length === 0) {
    return { deduped: [], duplicateNames: [] }
  }

  const seen = new Set()
  const deduped = []
  const duplicateNames = []

  for (const content of contents) {
    const key = normalizeContentName(content.name)
    if (seen.has(key)) {
      duplicateNames.push(content.name)
      continue
    }
    seen.add(key)
    deduped.push(content)
  }

  return { deduped, duplicateNames }
}

function dedupeRelations(relations) {
  const sorted = [...relations].sort(
    (a, b) => a.displayPriority - b.displayPriority
  )
  const seen = new Set()
  const keep = []
  const remove = []
  const duplicateNames = []

  for (const relation of sorted) {
    const key = normalizeContentName(relation.contentName)
    if (seen.has(key)) {
      remove.push(relation)
      duplicateNames.push(relation.contentName)
      continue
    }
    seen.add(key)
    keep.push(relation)
  }

  return { keep, remove, duplicateNames }
}

function getRenamedSpotName(spotName, dedupedRelatedContent) {
  if (dedupedRelatedContent.length < 2) return spotName

  const explicitNameOverrides = {
    '\uC5D0\uB178\uC2DC\uB9C8 (\uCCAD\uCD98 \uB3FC\uC9C0 \uC2DC\uB9AC\uC988)':
      '\uC5D0\uB178\uC2DC\uB9C8',
    '\uC288\uD37C \uB2CC\uD150\uB3C4 \uC6D4\uB4DC (\uC720\uB2C8\uBC84\uC124 \uC2A4\uD29C\uB514\uC624 \uC7AC\uD32C)':
      '\uC720\uB2C8\uBC84\uC124 \uC2A4\uD29C\uB514\uC624 \uC7AC\uD32C - \uC288\uD37C \uB2CC\uD150\uB3C4 \uC6D4\uB4DC',
  }
  if (explicitNameOverrides[spotName]) {
    return explicitNameOverrides[spotName]
  }

  const match = spotName.match(/^(.*)\s+\(([^()]+)\)\s*$/)
  if (!match) return spotName

  const baseName = match[1].trim()
  const suffix = match[2].trim().toLowerCase()
  if (!baseName || !suffix) return spotName

  const aliases = dedupedRelatedContent.flatMap((content) =>
    getContentAliases(content.name)
  )

  return aliases.includes(suffix) ? baseName : spotName
}

async function main() {
  loadEnvLocal()

  const isApply = process.argv.includes('--apply')
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/not-a-trip'
  const dbName =
    process.env.MONGODB_DB || uri.match(/\/([^/?]+)(\?|$)/)?.[1] || 'not-a-trip'

  console.log(
    `Starting spot display-name migration (${isApply ? 'apply' : 'dry-run'})`
  )
  console.log(`DB: ${dbName}`)
  console.log(`URI: ${uri}\n`)

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
  await client.connect()

  try {
    const db = client.db(dbName)
    const spotsCollection = db.collection('spots')
    const relationsCollection = db.collection('spot_content_relations')

    const spots = await spotsCollection.find({}).toArray()
    const stats = {
      scanned: spots.length,
      candidates: 0,
      namesChanged: 0,
      relatedDeduped: 0,
      relationsDeleted: 0,
      relationPrioritiesUpdated: 0,
    }
    const candidates = []

    for (const spot of spots) {
      const originalRelated = Array.isArray(spot.relatedContent)
        ? spot.relatedContent
        : []
      const { deduped: dedupedRelated, duplicateNames: duplicateRelatedNames } =
        dedupeRelatedContent(originalRelated)

      const activeRelations = await relationsCollection
        .find({ spotId: spot.id, status: 'active' })
        .toArray()
      const {
        keep: dedupedRelations,
        remove: duplicateRelations,
        duplicateNames: duplicateRelationNames,
      } = dedupeRelations(activeRelations)

      const renamed = getRenamedSpotName(spot.name, dedupedRelated)
      const needsNameUpdate = renamed !== spot.name
      const needsRelatedDedup = dedupedRelated.length !== originalRelated.length
      const needsRelationDedup = duplicateRelations.length > 0
      const needsRelationPriorityFix = dedupedRelations.some(
        (relation, index) => relation.displayPriority !== index
      )

      if (
        !needsNameUpdate &&
        !needsRelatedDedup &&
        !needsRelationDedup &&
        !needsRelationPriorityFix
      ) {
        continue
      }

      stats.candidates++
      candidates.push({
        id: spot.id,
        beforeName: spot.name,
        afterName: renamed,
        originalRelatedCount: originalRelated.length,
        dedupedRelatedCount: dedupedRelated.length,
        originalRelationCount: activeRelations.length,
        dedupedRelationCount: dedupedRelations.length,
        relatedNames: dedupedRelated.map((content) => content.name),
        duplicateRelatedNames,
        duplicateRelationNames,
      })

      if (!isApply) continue

      if (needsNameUpdate || needsRelatedDedup) {
        const setFields = {}
        if (needsNameUpdate) setFields.name = renamed
        if (needsRelatedDedup) setFields.relatedContent = dedupedRelated
        await spotsCollection.updateOne({ id: spot.id }, { $set: setFields })
        if (needsNameUpdate) stats.namesChanged++
        if (needsRelatedDedup) {
          stats.relatedDeduped += originalRelated.length - dedupedRelated.length
        }
      }

      if (needsRelationDedup) {
        await relationsCollection.deleteMany({
          id: { $in: duplicateRelations.map((relation) => relation.id) },
        })
        stats.relationsDeleted += duplicateRelations.length
      }

      if (needsRelationDedup || needsRelationPriorityFix) {
        for (const [index, relation] of dedupedRelations.entries()) {
          if (relation.displayPriority === index) continue
          await relationsCollection.updateOne(
            { id: relation.id },
            { $set: { displayPriority: index } }
          )
          stats.relationPrioritiesUpdated++
        }
      }
    }

    const preview = candidates.slice(0, 20)
    console.log(`Scanned spots: ${stats.scanned}`)
    console.log(`Migration candidates: ${stats.candidates}\n`)

    for (const candidate of preview) {
      console.log(`[${candidate.id}] ${candidate.beforeName}`)
      if (candidate.beforeName !== candidate.afterName) {
        console.log(`  -> ${candidate.afterName}`)
      }
      if (candidate.originalRelatedCount !== candidate.dedupedRelatedCount) {
        console.log(
          `  relatedContent: ${candidate.originalRelatedCount} -> ${candidate.dedupedRelatedCount}`
        )
      }
      if (candidate.originalRelationCount !== candidate.dedupedRelationCount) {
        console.log(
          `  relations: ${candidate.originalRelationCount} -> ${candidate.dedupedRelationCount}`
        )
      }
      if (candidate.duplicateRelatedNames.length > 0) {
        console.log(
          `  duplicate relatedContent: ${candidate.duplicateRelatedNames.join(', ')}`
        )
      }
      if (candidate.duplicateRelationNames.length > 0) {
        console.log(
          `  duplicate relations: ${candidate.duplicateRelationNames.join(', ')}`
        )
      }
      console.log(`  contents: ${candidate.relatedNames.join(' | ')}`)
    }

    if (candidates.length > preview.length) {
      console.log(
        `\n... ${candidates.length - preview.length} more candidate(s) omitted`
      )
    }

    if (!isApply) {
      console.log(
        '\nDry run complete. Re-run with --apply to update the database.'
      )
      return
    }

    console.log('\nApplied changes:')
    console.log(`- spot names changed: ${stats.namesChanged}`)
    console.log(`- duplicate relatedContent removed: ${stats.relatedDeduped}`)
    console.log(`- duplicate relations deleted: ${stats.relationsDeleted}`)
    console.log(
      `- relation displayPriority updates: ${stats.relationPrioritiesUpdated}`
    )
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
