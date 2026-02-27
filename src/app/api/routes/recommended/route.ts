import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { Route } from '@/types/route'

/**
 * GET /api/routes/recommended - 추천 코스 조회
 * Requirements: 4.1, 4.2, 4.3
 * Query params:
 *   - contentName: 작품명 필터 (해당 작품 관련 코스)
 *   - limit: 항목 수 (기본: 10)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const contentName = searchParams.get('contentName')
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
    )

    const collection = await getCollection<Route>('routes')

    // 공통 필터: 공개 코스만
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery: Record<string, any> = { isPublic: true }

    // 작품명 필터
    if (contentName) {
      baseQuery.relatedContentNames = contentName
    }

    // 1. 공식 추천 코스 (isOfficial: true)
    const officialQuery = { ...baseQuery, isOfficial: true }
    const officialRoutes = await collection
      .find(officialQuery)
      .sort({ bookmarkCount: -1, completionCount: -1 })
      .limit(limit)
      .toArray()

    // 2. 인기 코스 (bookmarkCount + completionCount 기준, 공식 코스 제외)
    const popularRoutes = await collection
      .aggregate<Route>([
        { $match: { ...baseQuery, isOfficial: { $ne: true } } },
        {
          $addFields: {
            popularityScore: {
              $add: ['$bookmarkCount', '$completionCount'],
            },
          },
        },
        { $sort: { popularityScore: -1, createdAt: -1 } },
        { $limit: limit },
        { $project: { popularityScore: 0 } },
      ])
      .toArray()

    return NextResponse.json({
      official: officialRoutes,
      popular: popularRoutes,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching recommended routes:', error)
    return NextResponse.json(
      { error: '추천 코스 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
