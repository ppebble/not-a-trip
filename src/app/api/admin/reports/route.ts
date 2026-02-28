import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'

/**
 * GET /api/admin/reports - 관리자 제보 목록 조회
 * Requirements: 5.1
 * - 기본 필터: status 'pending', 최신순 정렬
 * - 관리자 권한 검사
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

    // 관리자 권한 검사
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const collection = await getCollection(COLLECTIONS.SPOT_REPORTS)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (status !== 'all') {
      if (status === 'pending') {
        // 하위 호환: status 필드가 없는 기존 데이터도 pending으로 취급
        query.$or = [{ status: 'pending' }, { status: { $exists: false } }]
      } else {
        query.status = status
      }
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
    console.error('Error fetching admin reports:', error)
    return NextResponse.json(
      { error: '제보 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
