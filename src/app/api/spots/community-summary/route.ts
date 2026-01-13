import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { SpotCommunitySummary } from '@/types'

interface SpotDocument {
  id: string
  name: string
  photos: string[]
}

interface PostDocument {
  spotId?: string
}

/**
 * GET /api/spots/community-summary - 스팟별 게시글 수 조회
 * Requirements: 5.1, 3.1
 */
export async function GET(): Promise<NextResponse> {
  try {
    const spotsCollection = await getCollection<SpotDocument>(COLLECTIONS.SPOTS)
    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)

    // 모든 스팟 조회
    const spots = await spotsCollection.find({}).toArray()

    // 각 스팟별 게시글 수 집계
    const summaries: SpotCommunitySummary[] = await Promise.all(
      spots.map(async (spot) => {
        const postCount = await postsCollection.countDocuments({
          spotId: spot.id,
        })

        return {
          id: spot.id,
          name: spot.name,
          thumbnailUrl: spot.photos[0] || '',
          postCount,
        }
      })
    )

    // 게시글 수 기준 내림차순 정렬
    summaries.sort((a, b) => b.postCount - a.postCount)

    return NextResponse.json({ summaries, total: summaries.length })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching spot community summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spot community summary' },
      { status: 500 }
    )
  }
}
