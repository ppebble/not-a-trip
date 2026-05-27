import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { MediaCommunitySummary } from '@/types'
import { normalizeContentName } from '@/lib/content-utils'

interface SpotDocument {
  id: string
  relatedMedia: {
    title: string
    type: 'anime' | 'drama' | 'movie' | 'other'
    year?: number
  }[]
  relatedContent?: {
    name: string
    type: string
    imageUrl?: string
  }[]
}

interface PostDocument {
  spotId?: string
  mediaTitle?: string
}

interface ContentMasterDocument {
  normalizedName: string
  displayName: string
  imageUrl?: string
}

/**
 * GET /api/media/community-summary - 작품별 게시글 수 조회
 * 작품에 연결된 모든 스팟의 게시글 수를 합산하여 반환
 * Requirements: 5.1
 */
export async function GET(): Promise<NextResponse> {
  try {
    const spotsCollection = await getCollection<SpotDocument>(COLLECTIONS.SPOTS)
    const postsCollection = await getCollection<PostDocument>(COLLECTIONS.POSTS)
    const contentMastersCollection = await getCollection<ContentMasterDocument>(
      COLLECTIONS.CONTENT_MASTERS
    )

    // 모든 스팟 조회
    const spots = await spotsCollection.find({}).toArray()

    // 작품별로 연결된 스팟 ID 목록 수집
    const mediaToSpots = new Map<
      string,
      {
        title: string
        type: 'anime' | 'drama' | 'movie' | 'other'
        spotIds: string[]
        imageUrl?: string
      }
    >()

    spots.forEach((spot) => {
      // relatedContent에서 이미지 URL 가져오기
      const contentImageMap = new Map<string, string>()
      if (spot.relatedContent && Array.isArray(spot.relatedContent)) {
        spot.relatedContent.forEach((content) => {
          if (content.imageUrl) {
            contentImageMap.set(content.name, content.imageUrl)
          }
        })
      }

      if (spot.relatedMedia && Array.isArray(spot.relatedMedia)) {
        spot.relatedMedia.forEach((media) => {
          if (media.title) {
            const existing = mediaToSpots.get(media.title)
            const imageUrl = contentImageMap.get(media.title)
            if (existing) {
              existing.spotIds.push(spot.id)
              // 이미지가 없으면 업데이트
              if (!existing.imageUrl && imageUrl) {
                existing.imageUrl = imageUrl
              }
            } else {
              mediaToSpots.set(media.title, {
                title: media.title,
                type: media.type || 'other',
                spotIds: [spot.id],
                imageUrl,
              })
            }
          }
        })
      }
    })

    // ContentMasters에서 이미지 URL 가져오기
    const normalizedNames = Array.from(mediaToSpots.keys()).map(
      normalizeContentName
    )
    const contentMasters = await contentMastersCollection
      .find({
        normalizedName: { $in: normalizedNames },
        imageUrl: { $exists: true, $ne: '' },
      })
      .toArray()

    const contentMasterImageMap = new Map<string, string>()
    contentMasters.forEach((cm) => {
      if (cm.imageUrl) {
        contentMasterImageMap.set(cm.normalizedName, cm.imageUrl)
      }
    })

    // 각 작품별 게시글 수 집계 (연결된 스팟의 게시글 + 직접 연결된 게시글)
    const summaries: MediaCommunitySummary[] = await Promise.all(
      Array.from(mediaToSpots.values()).map(async (media) => {
        // 해당 작품과 연결된 스팟들의 게시글 수
        const spotPostCount = await postsCollection.countDocuments({
          spotId: { $in: media.spotIds },
        })

        // 직접 mediaTitle로 연결된 게시글 수 (스팟 없이 작품만 연결된 경우)
        const directPostCount = await postsCollection.countDocuments({
          mediaTitle: media.title,
          spotId: { $exists: false },
        })

        // 이미지 URL 결정 (relatedContent > ContentMasters)
        const normalizedName = normalizeContentName(media.title)
        const imageUrl =
          contentMasterImageMap.get(normalizedName) || media.imageUrl

        return {
          title: media.title,
          type: media.type,
          postCount: spotPostCount + directPostCount,
          imageUrl,
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
