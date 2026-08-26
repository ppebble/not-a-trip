import { NextRequest, NextResponse } from 'next/server'
import { normalizeTrackablePagePath } from '@/lib/analytics/page-views'
import { recordPageViewMetric } from '@/lib/ops/metrics'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const origin = request.headers.get('origin')
    if (origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await request.json()) as { path?: unknown }
    const path = normalizeTrackablePagePath(body.path)
    if (!path) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    await recordPageViewMetric(path)
    return NextResponse.json({ ok: true }, { status: 202 })
  } catch {
    return NextResponse.json(
      { error: 'Page view ingestion failed' },
      { status: 500 }
    )
  }
}
