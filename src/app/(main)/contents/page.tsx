import { Metadata } from 'next'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { ContentType } from '@/types'
import { ContentListClient } from '@/components/content/ContentListClient'

/**
 * 작품 목록 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: '작품 탐색 | Not a Trip',
  description:
    '서비스에 등록된 모든 작품을 탐색하고, 관심 있는 작품의 성지순례 스팟을 찾아보세요.',
}

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
 * 서버 사이드에서 작품 목록 데이터를 조회
 */
async function fetchContents(): Promise<ContentListItem[]> {
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

    return contents
  } catch (error) {
    console.error('Error fetching contents:', error)
    return []
  }
}

/**
 * 작품 목록 서버 컴포넌트 페이지
 * 서버 사이드에서 DB를 직접 조회하여 초기 데이터를 fetch하고
 * ContentListClient에 전달
 * Requirements: 2.1
 */
export default async function ContentsPage() {
  const initialContents = await fetchContents()

  return <ContentListClient initialContents={initialContents} />
}
