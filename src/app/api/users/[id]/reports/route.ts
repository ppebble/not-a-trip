import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * GET /api/users/[id]/reports - 유저의 신규 스팟 제보 목록
 * Requirements: 9.4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const reportsCollection = await getCollection(COLLECTIONS.SPOT_REPORTS)

    const reports = await reportsCollection
      .find({ reporterId: userId })
      .sort({ createdAt: -1 })
      .toArray()

    const result = reports.map((report) => ({
      id: report._id.toString(),
      spotName: report.spotName || report.name || '이름 없음',
      status: report.status || 'pending',
      createdAt:
        report.createdAt instanceof Date
          ? report.createdAt.toISOString()
          : report.createdAt,
    }))

    return NextResponse.json({ reports: result })
  } catch (error) {
    runtimeLogger.error('Error fetching user reports:', error)
    return NextResponse.json(
      { error: '제보 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
