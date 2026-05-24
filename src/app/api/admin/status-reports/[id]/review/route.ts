import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { extractClientIp, logAdminAction } from '@/lib/audit-log'
import type { StatusReportReviewRequest } from '@/types/report'

/**
 * PUT /api/admin/status-reports/[id]/review - 상태 신고 확인 처리
 * Requirements: 4.3, 4.4
 * - action: 'resolve' → reviewStatus를 'resolved'로 변경
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    const { id } = await params
    const body: StatusReportReviewRequest = await request.json()
    const { action } = body

    if (!action || action !== 'resolve') {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다' },
        { status: 400 }
      )
    }

    const collection = await getCollection(COLLECTIONS.SPOT_STATUS_REPORTS)
    const report = await collection.findOne({ id })

    if (!report) {
      return NextResponse.json(
        { error: '상태 신고를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    await collection.updateOne({ id }, { $set: { reviewStatus: 'resolved' } })

    void logAdminAction({
      adminId: session.user.id!,
      adminName: session.user.name ?? session.user.email ?? undefined,
      actionType: 'review_status_report',
      resourceType: 'status_report',
      resourceId: id,
      changes: [
        {
          field: 'reviewStatus',
          before: report.reviewStatus ?? 'pending',
          after: 'resolved',
        },
      ],
      ipAddress: extractClientIp(request.headers),
    }).catch((auditError) => {
      // eslint-disable-next-line no-console
      console.error('Failed to write audit log:', auditError)
    })

    return NextResponse.json({
      id,
      reviewStatus: 'resolved',
      message: '상태 신고가 확인 처리되었습니다',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error reviewing status report:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
