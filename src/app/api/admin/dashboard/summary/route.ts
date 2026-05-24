import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { buildDashboardSummary } from '@/lib/ops/dashboard'
import { recordApiErrorMetric } from '@/lib/ops/metrics'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json(await buildDashboardSummary())
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching dashboard summary:', error)
    await recordApiErrorMetric({
      path: '/api/admin/dashboard/summary',
      statusCode: 500,
    })
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
