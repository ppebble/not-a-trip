/**
 * related display-name migration source version
 *
 * Runtime uses the `.mjs` file so this file is kept mainly as a typed reference.
 */

import { connectToDatabase, COLLECTIONS } from '../src/lib/db'
import { normalizeContentName } from '../src/lib/relation-utils'
import type { RelatedContent, SpotContentRelation } from '../src/types/spot'

interface SpotDocument {
  id: string
  name: string
  relatedContent?: RelatedContent[]
}

interface MigrationCandidate {
  id: string
  beforeName: string
  afterName: string
  originalRelatedCount: number
  dedupedRelatedCount: number
  originalRelationCount: number
  dedupedRelationCount: number
  relatedNames: string[]
  duplicateRelatedNames: string[]
  duplicateRelationNames: string[]
}

function getContentAliases(contentName: string): string[] {
  const trimmed = contentName.trim()
  const beforeParen = trimmed.replace(/\s*\([^)]*\)\s*$/, '').trim()
  const aliases = [trimmed]
  if (beforeParen && beforeParen !== trimmed) aliases.push(beforeParen)
  return [...new Set(aliases.map((value) => value.toLowerCase()))]
}

function dedupeRelatedContent(contents: RelatedContent[] | undefined): {
  deduped: RelatedContent[]
  duplicateNames: string[]
} {
  if (!contents || contents.length === 0) {
    return { deduped: [], duplicateNames: [] }
  }

  const seen = new Set<string>()
  const deduped: RelatedContent[] = []
  const duplicateNames: string[] = []

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

function dedupeRelations(relations: SpotContentRelation[]): {
  keep: SpotContentRelation[]
  remove: SpotContentRelation[]
  duplicateNames: string[]
} {
  const sorted = [...relations].sort(
    (a, b) => a.displayPriority - b.displayPriority
  )
  const seen = new Set<string>()
  const keep: SpotContentRelation[] = []
  const remove: SpotContentRelation[] = []
  const duplicateNames: string[] = []

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

function getRenamedSpotName(
  spotName: string,
  dedupedRelatedContent: RelatedContent[]
): string {
  if (dedupedRelatedContent.length < 2) return spotName

  const explicitNameOverrides: Record<string, string> = {
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

async function migrateSpotDisplayNames() {
  const isApply = process.argv.includes('--apply')
  console.log(
    `Starting spot display-name migration (${isApply ? 'apply' : 'dry-run'})...\n`
  )

  const { db } = await connectToDatabase()
  const spotsCollection = db.collection<SpotDocument>(COLLECTIONS.SPOTS)
  const relationsCollection = db.collection<SpotContentRelation>(
    COLLECTIONS.SPOT_CONTENT_RELATIONS
  )

  const spots = await spotsCollection.find({}).toArray()
  const candidates: MigrationCandidate[] = []

  for (const spot of spots) {
    const originalRelated = spot.relatedContent ?? []
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
  }

  console.log(`Scanned spots: ${spots.length}`)
  console.log(`Migration candidates: ${candidates.length}`)
}

migrateSpotDisplayNames().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
