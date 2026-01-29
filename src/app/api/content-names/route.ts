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
  category?: SpotCategory
  relatedContent?: {
    name: string
    type: string
    year?: number
  }[]
}

/**
 * GET /api/content-names - 자동완성용 콘텐츠명 목록 조회
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * - 5.1: 자동완성용 콘텐츠명 목록 조회 엔드포인트 제공
 * - 5.2: 중복 제거된 Content_Name 목록 반환
 * - 5.3: 각 Content_Name에 해당 카테고리 정보 포함
 * - 5.4: 검색어 파라미터로 서버 사이드 필터링 지원
 *
 * Query params:
 *   - search: 검색어 (부분 일치, 대소문자 무시)
 *
 * Response:
 *   - items: AutocompleteItem[] (최대 10개)
 *   - total: 전체 매칭 개수
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''

    const collection = await getCollection<SpotDocument>('spots')

    // MongoDB aggregation pipeline으로 중복 제거 및 카운트
    const pipeline: object[] = [
      // relatedContent 배열이 있는 문서만 필터링
      { $match: { relatedContent: { $exists: true, $ne: [] } } },
      // relatedContent 배열 풀기
      { $unwind: '$relatedContent' },
    ]

    // 검색어가 있으면 필터링 추가 (Requirements 5.4)
    if (search) {
      // 정규식 특수문자 이스케이프
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      pipeline.push({
        $match: {
          'relatedContent.name': {
            $regex: escapedSearch,
            $options: 'i', // 대소문자 무시
          },
        },
      })
    }

    // 그룹화하여 중복 제거 및 카운트 (Requirements 5.2, 5.3)
    pipeline.push(
      {
        $group: {
          _id: {
            name: '$relatedContent.name',
            category: '$category',
          },
          count: { $sum: 1 },
        },
      },
      // 같은 이름의 콘텐츠를 다시 그룹화 (카테고리별 카운트 합산)
      {
        $group: {
          _id: '$_id.name',
          category: { $first: '$_id.category' },
          count: { $sum: '$count' },
        },
      },
      // 카운트 내림차순 정렬
      { $sort: { count: -1 } },
      // 최대 10개 제한 (Requirements 2.2)
      { $limit: 10 }
    )

    const results = await collection.aggregate(pipeline).toArray()

    // 응답 형식으로 변환
    const items: AutocompleteItem[] = results.map((doc) => ({
      name: doc._id as string,
      category: (doc.category as SpotCategory) || 'other',
      count: doc.count as number,
    }))

    return NextResponse.json({
      items,
      total: items.length,
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
