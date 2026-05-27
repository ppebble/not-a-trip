import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listQualityReports } from '@/lib/spot-quality/report-processor'
import type { ReportProcessingStatus } from '@/types/spot-quality'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Login is required.' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin role is required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = (searchParams.get('status') ?? 'open') as
      | ReportProcessingStatus
      | 'open'
    const urgentOnly = searchParams.get('urgentOnly') === 'true'
    const spotId = searchParams.get('spotId') ?? undefined

    const reports = await listQualityReports({
      status,
      urgentOnly,
      spotId,
    })

    return NextResponse.json({ reports, total: reports.length })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error listing quality reports:', error)
    return NextResponse.json(
      { error: 'Failed to list quality reports.' },
      { status: 500 }
    )
  }
}
