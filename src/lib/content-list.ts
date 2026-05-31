import { COLLECTIONS, getCollection } from '@/lib/db'
import { normalizeContentName } from '@/lib/content-utils'
import type { ContentType } from '@/types'
import {
  DISCOVERABLE_CONTENT_TYPES,
  EXCLUDED_CONTENT_NAMES,
  type ContentListItem,
} from '@/lib/content-discovery'

export type { ContentListItem } from '@/lib/content-discovery'

interface AggregationResult {
  _id: {
    contentName: string
    contentType: ContentType
  }
  spotCount: number
}

interface ContentMasterDocument {
  normalizedName: string
  displayName: string
  imageUrl?: string
  type?: ContentType
  year?: number
  spotCount: number
}

interface RepresentativeImageResult {
  _id: string
  imageUrl: string
}

export async function fetchDiscoverableContents(): Promise<ContentListItem[]> {
  const relationsCollection = await getCollection(
    COLLECTIONS.SPOT_CONTENT_RELATIONS
  )
  const contentMastersCollection = await getCollection<ContentMasterDocument>(
    COLLECTIONS.CONTENT_MASTERS
  )

  const aggregationResult = await relationsCollection
    .aggregate<AggregationResult>([
      {
        $match: {
          status: 'active',
          contentType: { $in: [...DISCOVERABLE_CONTENT_TYPES] },
          contentName: {
            $exists: true,
            $ne: '',
            $nin: [...EXCLUDED_CONTENT_NAMES],
          },
        },
      },
      {
        $group: {
          _id: {
            contentName: '$contentName',
            contentType: '$contentType',
          },
          spotIds: { $addToSet: '$spotId' },
        },
      },
      {
        $project: {
          _id: 1,
          spotCount: { $size: '$spotIds' },
        },
      },
      { $sort: { spotCount: -1, '_id.contentName': 1 } },
    ])
    .toArray()

  const normalizedNames = aggregationResult.map((item) =>
    normalizeContentName(item._id.contentName)
  )

  const contentMasters = await contentMastersCollection
    .find({
      normalizedName: { $in: normalizedNames },
      imageUrl: {
        $exists: true,
        $ne: '',
        $not: /picsum\.photos\/seed\/|via\.placeholder\.com|^data:image\/svg\+xml/i,
      },
    })
    .project({ normalizedName: 1, imageUrl: 1 })
    .toArray()

  const masterImageMap = new Map<string, string>()
  for (const contentMaster of contentMasters) {
    if (contentMaster.imageUrl) {
      masterImageMap.set(contentMaster.normalizedName, contentMaster.imageUrl)
    }
  }

  const representativeImages = await relationsCollection
    .aggregate<RepresentativeImageResult>([
      {
        $match: {
          status: 'active',
          contentType: { $in: [...DISCOVERABLE_CONTENT_TYPES] },
          contentName: {
            $exists: true,
            $ne: '',
            $nin: [...EXCLUDED_CONTENT_NAMES],
          },
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.SPOTS,
          localField: 'spotId',
          foreignField: 'id',
          as: 'spot',
        },
      },
      { $unwind: '$spot' },
      {
        $project: {
          normalizedName: {
            $toLower: { $trim: { input: '$contentName' } },
          },
          imageUrl: { $arrayElemAt: ['$spot.photos', 0] },
          displayPriority: { $ifNull: ['$displayPriority', 999] },
          spotId: 1,
        },
      },
      {
        $match: {
          imageUrl: {
            $type: 'string',
            $ne: '',
            $not: /picsum\.photos\/seed\/|via\.placeholder\.com|^data:image\/svg\+xml/i,
          },
        },
      },
      { $sort: { displayPriority: 1, spotId: 1 } },
      {
        $group: {
          _id: '$normalizedName',
          imageUrl: { $first: '$imageUrl' },
        },
      },
    ])
    .toArray()

  const representativeImageMap = new Map(
    representativeImages.map((item) => [item._id, item.imageUrl])
  )

  return aggregationResult.map((item) => {
    const normalizedName = normalizeContentName(item._id.contentName)

    return {
      contentName: item._id.contentName,
      contentType: item._id.contentType,
      spotCount: item.spotCount,
      imageUrl:
        masterImageMap.get(normalizedName) ??
        representativeImageMap.get(normalizedName) ??
        null,
    }
  })
}
