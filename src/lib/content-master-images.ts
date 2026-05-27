import { COLLECTIONS, getCollection } from '@/lib/db'
import { normalizeContentName } from '@/lib/content-utils'
import type { ContentType, RelatedContent, SpotContentRelation } from '@/types'

interface ContentMasterDocument {
  normalizedName: string
  displayName: string
  imageUrl?: string
  type?: ContentType
  year?: number
  spotCount: number
  createdAt: Date
  updatedAt: Date
}

export async function getContentMasterImageMap(
  contentNames: string[]
): Promise<Map<string, string>> {
  const normalizedNames = [
    ...new Set(contentNames.map(normalizeContentName).filter(Boolean)),
  ]

  if (normalizedNames.length === 0) return new Map()

  const collection = await getCollection<ContentMasterDocument>(
    COLLECTIONS.CONTENT_MASTERS
  )
  const masters = await collection
    .find({
      normalizedName: { $in: normalizedNames },
      imageUrl: { $exists: true, $ne: '' },
    })
    .project({ normalizedName: 1, imageUrl: 1 })
    .toArray()

  return new Map(
    masters
      .filter((master) => master.imageUrl)
      .map((master) => [master.normalizedName, master.imageUrl as string])
  )
}

export async function enrichRelatedContentWithMasterImages(
  contents?: RelatedContent[]
): Promise<RelatedContent[] | undefined> {
  if (!contents || contents.length === 0) return contents

  const imageMap = await getContentMasterImageMap(
    contents.map((content) => content.name)
  )

  return contents.map((content) => {
    const masterImageUrl = imageMap.get(normalizeContentName(content.name))
    return masterImageUrl ? { ...content, imageUrl: masterImageUrl } : content
  })
}

export async function enrichRelationsWithMasterImages(
  relations: SpotContentRelation[]
): Promise<SpotContentRelation[]> {
  if (relations.length === 0) return relations

  const imageMap = await getContentMasterImageMap(
    relations.map((relation) => relation.contentName)
  )

  return relations.map((relation) => {
    const masterImageUrl = imageMap.get(
      normalizeContentName(relation.contentName)
    )
    return masterImageUrl
      ? { ...relation, contentImageUrl: masterImageUrl }
      : relation
  })
}

export async function propagateContentMasterImage(
  normalizedName: string,
  imageUrl?: string
): Promise<void> {
  const now = new Date()
  const relationsCollection = await getCollection<SpotContentRelation>(
    COLLECTIONS.SPOT_CONTENT_RELATIONS
  )
  const spotsCollection = await getCollection(COLLECTIONS.SPOTS)

  const relationUpdate = imageUrl
    ? { $set: { contentImageUrl: imageUrl, updatedAt: now } }
    : { $unset: { contentImageUrl: '' }, $set: { updatedAt: now } }

  const relations = await relationsCollection
    .find({ contentName: { $exists: true } })
    .project({ _id: 1, contentName: 1 })
    .toArray()

  await Promise.all(
    relations
      .filter(
        (relation) =>
          normalizeContentName(relation.contentName) === normalizedName
      )
      .map((relation) =>
        relationsCollection.updateOne(
          { _id: relation._id },
          relationUpdate as never
        )
      )
  )

  const spots = await spotsCollection
    .find({ 'relatedContent.name': { $exists: true } })
    .project({ id: 1, relatedContent: 1 })
    .toArray()

  await Promise.all(
    spots.map(async (spot) => {
      const relatedContent = (
        spot.relatedContent as RelatedContent[] | undefined
      )?.map((content) => {
        if (normalizeContentName(content.name) !== normalizedName) {
          return content
        }

        if (imageUrl) return { ...content, imageUrl }

        const { imageUrl: _removed, ...rest } = content
        return rest
      })

      if (!relatedContent) return

      await spotsCollection.updateOne(
        { _id: spot._id },
        { $set: { relatedContent, updatedAt: now } }
      )
    })
  )
}
