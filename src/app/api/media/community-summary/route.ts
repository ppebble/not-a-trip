import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { MediaCommunitySummary } from '@/types'

interface SpotDocument {
  id: string
  relatedMedia: {
    title: string
    type: 'anime' | 'drama' | 'movie' | 'other'
    year?: number
  }[]
}

interface PostDocument {
  mediaTitle?: string
}

/**
 * GET /api/media/community-summary - 작품별 게시글 수 조회
 * Requirements: 5.1
 */
export async function GET(): Promise<NextResponse> {
  try {
    const spotsCollection = await getCollection<SpotDocument>(COLLECTIONS.SPOTS)
    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)

    // 모든 스팟에서 작품 정보 수집
    const spots = await spotsCollection.find({}).toArray()

    // 작품별로 중복 제거하여 수집 (title을 키로 사용)
    const mediaMap = new Map<
      string,
      { title: string; type: 'anime' | 'drama' | 'movie' | 'other' }
    >()

    spots.forEach((spot) => {
      if (spot.relatedMedia && Array.isArray(spot.relatedMedia)) {
        spot.relatedMedia.forEach((media) => {
          if (media.title && !mediaMap.has(media.title)) {
            mediaMap.set(media.title, {
              title: media.title,
              type: media.type || 'other',
            })
          }
        })
      }
    })

    // 각 작품별 게시글 수 집계
    const summaries: MediaCommunitySummary[] = await Promise.all(
      Array.from(mediaMap.values()).map(async (media) => {
        const postCount = await postsCollection.countDocuments({
          mediaTitle: media.title,
        })

        return {
          title: media.title,
          type: media.type,
          postCount,
        }
      })
    )

    // 게시글 수 기준 내림차순 정렬
    summaries.sort((a, b) => b.postCount - a.postCount)

    return NextResponse.json({ summaries, total: summaries.length })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching media community summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media community summary' },
      { status: 500 }
    )
  }
}
