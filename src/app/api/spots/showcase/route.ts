import { NextResponse } from 'next/server'

import { getCollection } from '@/lib/db'
import type { DataReviewStatus } from '@/lib/real-image-data'
import { SpotCategory } from '@/types'

import { resolveThumbnailUrl } from './helpers'

export interface ShowcaseSpotItem {
  id: string
  name: string
  category: SpotCategory
  thumbnailUrl: string
}

interface SpotDocument {
  id: string
  name: string
  photos: string[]
  category?: SpotCategory
  reviewStatus?: DataReviewStatus
}

const SHOWCASE_CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

const FETCH_LIMIT = 8
const MAX_PER_CATEGORY = 4

export async function GET(): Promise<NextResponse> {
  try {
    const collection = await getCollection<SpotDocument>('spots')

    const categoryResults = await Promise.all(
      SHOWCASE_CATEGORIES.map(async (category) => {
        const spots = await collection
          .aggregate<SpotDocument>([
            {
              $match: {
                category,
                reviewStatus: 'approved',
                'photos.0': { $exists: true, $ne: '' },
              },
            },
            {
              $addFields: {
                _photoQuality: {
                  $cond: {
                    if: {
                      $and: [
                        {
                          $not: [
                            {
                              $regexMatch: {
                                input: { $arrayElemAt: ['$photos', 0] },
                                regex: 'picsum\\.photos/seed/',
                              },
                            },
                          ],
                        },
                        {
                          $not: [
                            {
                              $regexMatch: {
                                input: { $arrayElemAt: ['$photos', 0] },
                                regex: '^/icons/',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    then: 0,
                    else: 1,
                  },
                },
              },
            },
            { $sort: { _photoQuality: 1 } },
            { $limit: FETCH_LIMIT },
            { $project: { _photoQuality: 0 } },
          ])
          .toArray()

        return spots
      })
    )

    const showcaseItems: ShowcaseSpotItem[] = []

    for (const spots of categoryResults) {
      const categoryItems: ShowcaseSpotItem[] = []

      for (const spot of spots) {
        if (!spot.category) continue

        const thumbnailUrl = resolveThumbnailUrl(spot.id, spot.photos?.[0])
        if (!thumbnailUrl) continue

        categoryItems.push({
          id: spot.id,
          name: spot.name,
          category: spot.category,
          thumbnailUrl,
        })

        if (categoryItems.length >= MAX_PER_CATEGORY) break
      }

      showcaseItems.push(...categoryItems)
    }

    return NextResponse.json(showcaseItems)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[GET /api/spots/showcase] DB query failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch showcase spots' },
      { status: 500 }
    )
  }
}
