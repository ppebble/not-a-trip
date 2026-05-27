import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { resolveQualityReport } from '@/lib/spot-quality/report-processor'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = (await request.json()) as {
      action?: 'approved' | 'rejected' | 'deferred'
      reason?: string
      closeSpot?: boolean
    }

    if (
      !body.action ||
      !['approved', 'rejected', 'deferred'].includes(body.action)
    ) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
    }

    if (!body.reason?.trim()) {
      return NextResponse.json(
        { error: 'Reason is required.' },
        { status: 400 }
      )
    }

    const report = await resolveQualityReport(id, {
      action: body.action,
      reason: body.reason,
      closeSpot: body.closeSpot,
      resolvedBy: session.user.id!,
    })

    return NextResponse.json({ message: 'Quality report reviewed.', report })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // eslint-disable-next-line no-console
    console.error('Error reviewing quality report:', error)
    return NextResponse.json(
      { error: 'Failed to review quality report.' },
      { status: 500 }
    )
  }
}
