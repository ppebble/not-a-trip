import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { SpotCategory } from '@/types'

/**
 * 자동완성 항목 인터페이스
 */
interface AutocompleteItem {
  name: string
  category: SpotCategory
  count: number
}

/**
 * MongoDB Spot 문서 인터페이스 (필요한 필드만)
 */
interface SpotDocument {
  name: string
  category?: SpotCategory
  relatedContent?: {
    name: string
    type: string
    year?: number
  }[]
}

/**
 * 검색 타입
 * - all: 스팟명 + 작품명 모두 검색 (기본값)
 * - content: 작품명(relatedContent.name)만 검색
 * - spot: 스팟명만 검색
 */
type SearchType = 'all' | 'content' | 'spot'

/**
 * GET /api/content-names - 자동완성용 콘텐츠명 및 스팟명 목록 조회
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * - 5.1: 자동완성용 콘텐츠명 목록 조회 엔드포인트 제공
 * - 5.2: 중복 제거된 Content_Name 목록 반환
 * - 5.3: 각 Content_Name에 해당 카테고리 정보 포함
 * - 5.4: 검색어 파라미터로 서버 사이드 필터링 지원
 *
 * Query params:
 *   - search: 검색어 (부분 일치, 대소문자 무시)
 *   - type: 검색 타입 (all | content | spot), 기본값 all
 *
 * Response:
 *   - items: AutocompleteItem[] (최대 10개)
 *   - total: 전체 매칭 개수
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const type = (searchParams.get('type') as SearchType) || 'all'

    const collection = await getCollection<SpotDocument>('spots')

    // 정규식 특수문자 이스케이프
    const escapedSearch = search
      ? search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      : ''

    const items: AutocompleteItem[] = []

    // 1. 스팟명 검색 (type이 'all' 또는 'spot'일 때)
    if (search && (type === 'all' || type === 'spot')) {
      const spotNamePipeline: object[] = [
        {
          $match: {
            name: { $regex: escapedSearch, $options: 'i' },
          },
        },
        {
          $group: {
            _id: '$name',
            category: { $first: '$category' },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: type === 'spot' ? 10 : 5 },
      ]

      const spotResults = await collection.aggregate(spotNamePipeline).toArray()

      spotResults.forEach((doc) => {
        items.push({
          name: doc._id as string,
          category: (doc.category as SpotCategory) || 'other',
          count: doc.count as number,
        })
      })
    }

    // 2. relatedContent.name 검색 (type이 'all' 또는 'content'일 때)
    if (type === 'all' || type === 'content') {
      const contentPipeline: object[] = [
        { $match: { relatedContent: { $exists: true, $ne: [] } } },
        { $unwind: '$relatedContent' },
      ]

      if (search) {
        contentPipeline.push({
          $match: {
            'relatedContent.name': { $regex: escapedSearch, $options: 'i' },
          },
        })
      }

      contentPipeline.push(
        {
          $group: {
            _id: {
              name: '$relatedContent.name',
              category: '$category',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.name',
            category: { $first: '$_id.category' },
            count: { $sum: '$count' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      )

      const contentResults = await collection
        .aggregate(contentPipeline)
        .toArray()

      contentResults.forEach((doc) => {
        const name = doc._id as string
        // 중복 제거 (스팟명과 동일한 이름이 있으면 스킵)
        if (!items.some((item) => item.name === name)) {
          items.push({
            name,
            category: (doc.category as SpotCategory) || 'other',
            count: doc.count as number,
          })
        }
      })
    }

    // 카운트 내림차순 정렬 후 최대 10개 제한
    items.sort((a, b) => b.count - a.count)
    const limitedItems = items.slice(0, 10)

    return NextResponse.json({
      items: limitedItems,
      total: limitedItems.length,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching content names:', error)
    return NextResponse.json(
      { error: '콘텐츠명 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
