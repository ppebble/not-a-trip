import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'

/**
 * GET /api/users/[id]/status-reports - 유저의 상태신고 목록
 * Requirements: 9.6
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const statusReportsCollection = await getCollection(COLLECTIONS.SPOT_STATUS_REPORTS)

    const statusReports = await statusReportsCollection
      .find({ reporterId: userId })
      .sort({ createdAt: -1 })
      .toArray()

    const result = statusReports.map((report) => ({
      id: report._id.toString(),
      spotName: report.spotName || '이름 없음',
      reportedStatus: report.reportedStatus || report.status || '알 수 없음',
      resolved: report.resolved || false,
      createdAt:
        report.createdAt instanceof Date
          ? report.createdAt.toISOString()
          : report.createdAt,
    }))

    return NextResponse.json({ statusReports: result })
  } catch (error) {
    console.error('Error fetching user status reports:', error)
    return NextResponse.json(
      { error: '상태신고 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
