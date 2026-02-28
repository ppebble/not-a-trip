import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'

/**
 * GET /api/admin/status-reports - 관리자 상태 신고 목록 조회
 * Requirements: 4.1, 4.4
 * - reviewStatus 필터: pending/resolved/all
 * - status 필터: normal/partially_changed/under_construction/demolished/inaccessible/all
 * - 페이지네이션: page, limit
 * - createdAt 내림차순 정렬
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const collection = await getCollection(COLLECTIONS.SPOT_STATUS_REPORTS)

    const { searchParams } = new URL(request.url)
    const reviewStatus = searchParams.get('reviewStatus') || 'pending'
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (reviewStatus !== 'all') {
      if (reviewStatus === 'pending') {
        // 하위 호환: reviewStatus 필드가 없는 기존 데이터도 pending으로 취급
        query.$or = [
          { reviewStatus: 'pending' },
          { reviewStatus: { $exists: false } },
        ]
      } else {
        query.reviewStatus = reviewStatus
      }
    }
    if (status !== 'all') {
      query.status = status
    }

    const [reports, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ])

    return NextResponse.json({
      reports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching admin status reports:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
