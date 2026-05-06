import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { ContentType } from '@/types'

/**
 * 작품 목록 아이템 인터페이스
 */
interface ContentListItem {
  contentName: string
  contentType: ContentType
  spotCount: number
  imageUrl: string | null
}

/**
 * MongoDB aggregation 결과 인터페이스
 */
interface AggregationResult {
  _id: {
    contentName: string
    contentType: ContentType
  }
  spotCount: number
  contentId: string
}

/**
 * ContentMaster 문서 인터페이스
 */
interface ContentMasterDocument {
  normalizedName: string
  displayName: string
  imageUrl?: string
  type?: ContentType
  year?: number
  spotCount: number
}

/**
 * GET /api/contents - 작품 목록 조회
 * Requirements: 2.1, 2.2, 2.3
 *
 * spot_content_relations 컬렉션에서 작품별 스팟 수를 집계하여 반환
 * 대표 이미지는 content_masters 컬렉션에서 조회
 *
 * Response: { contents: ContentListItem[], total: number }
 */
export async function GET(): Promise<NextResponse> {
  try {
    const relationsCollection = await getCollection(
      COLLECTIONS.SPOT_CONTENT_RELATIONS
    )
    const contentMastersCollection = await getCollection<ContentMasterDocument>(
      COLLECTIONS.CONTENT_MASTERS
    )

    // 1. spot_content_relations에서 작품별 spotCount 집계
    const aggregationResult = await relationsCollection
      .aggregate<AggregationResult>([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: {
              contentName: '$contentName',
              contentType: '$contentType',
            },
            spotCount: { $sum: 1 },
            contentId: { $first: '$contentId' },
          },
        },
        { $sort: { spotCount: -1 } },
      ])
      .toArray()

    // 2. content_masters에서 대표 이미지 조회
    const contentNames = aggregationResult.map((item) =>
      item._id.contentName.trim().toLowerCase()
    )

    const contentMasters = await contentMastersCollection
      .find({
        normalizedName: { $in: contentNames },
        imageUrl: { $exists: true, $ne: '' },
      })
      .toArray()

    // 정규화된 이름 -> 이미지 URL 맵 생성
    const imageMap = new Map<string, string>()
    for (const cm of contentMasters) {
      if (cm.imageUrl) {
        imageMap.set(cm.normalizedName, cm.imageUrl)
      }
    }

    // 3. 응답 데이터 구성
    const contents: ContentListItem[] = aggregationResult.map((item) => {
      const normalizedName = item._id.contentName.trim().toLowerCase()
      return {
        contentName: item._id.contentName,
        contentType: item._id.contentType,
        spotCount: item.spotCount,
        imageUrl: imageMap.get(normalizedName) || null,
      }
    })

    return NextResponse.json({ contents, total: contents.length })
  } catch (error) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: '작품 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
