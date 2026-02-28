import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { DashboardSummaryResponse } from '@/types/report'

/**
 * GET /api/admin/dashboard/summary - 대시보드 요약 (대기 항목 count)
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export async function GET(): Promise<NextResponse> {
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

    const [reportsCol, supplementsCol, statusReportsCol] = await Promise.all([
      getCollection(COLLECTIONS.SPOT_REPORTS),
      getCollection(COLLECTIONS.SPOT_SUPPLEMENTS),
      getCollection(COLLECTIONS.SPOT_STATUS_REPORTS),
    ])

    const [pendingReports, pendingSupplements, pendingStatusReports] =
      await Promise.all([
        reportsCol.countDocuments({ status: 'pending' }),
        supplementsCol.countDocuments({
          $or: [
            { status: 'pending' },
            { status: { $exists: false }, approved: { $ne: true } },
          ],
        }),
        statusReportsCol.countDocuments({
          $or: [
            { reviewStatus: 'pending' },
            { reviewStatus: { $exists: false } },
          ],
        }),
      ])

    const response: DashboardSummaryResponse = {
      pendingReports,
      pendingSupplements,
      pendingStatusReports,
    }

    return NextResponse.json(response)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching dashboard summary:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
