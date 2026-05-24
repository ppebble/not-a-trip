import { NextRequest, NextResponse } from 'next/server'
import { recordApiRequestMetric } from '@/lib/ops/metrics'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (request.headers.get('x-ops-ingest') !== '1') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = (await request.json()) as { path?: string }
    if (!body.path) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    }

    await recordApiRequestMetric(body.path)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Metric ingestion failed' },
      { status: 500 }
    )
  }
}
