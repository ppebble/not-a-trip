import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'

/**
 * GET /api/admin/supplements - 관리자 정보 보완 목록 조회
 * Requirements: 2.1, 2.4
 * - status 필터: pending/approved/rejected/all
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

    const collection = await getCollection(COLLECTIONS.SPOT_SUPPLEMENTS)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (status !== 'all') {
      if (status === 'pending') {
        // 하위 호환: status 필드가 없거나 approved: false인 기존 데이터도 pending으로 취급
        query.$or = [
          { status: 'pending' },
          { status: { $exists: false }, approved: { $ne: true } },
        ]
      } else {
        query.status = status
      }
    }

    const [supplements, total] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ])

    return NextResponse.json({
      supplements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching admin supplements:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
