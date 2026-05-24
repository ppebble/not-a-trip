import { NextRequest, NextResponse } from 'next/server'
import { sendConfiguredAlert } from '@/lib/ops/alerting'
import { recordApiErrorMetric } from '@/lib/ops/metrics'

interface SentryWebhookPayload {
  title?: string
  url?: string
  culprit?: string
  fingerprint?: string[]
  metadata?: {
    title?: string
    value?: string
  }
  event?: {
    title?: string
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const expectedSecret = process.env.SENTRY_WEBHOOK_SECRET?.trim()
    if (expectedSecret) {
      const providedSecret = request.headers.get('x-sentry-webhook-secret')
      if (providedSecret !== expectedSecret) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const payload = (await request.json()) as SentryWebhookPayload
    const title =
      payload.title ||
      payload.event?.title ||
      payload.metadata?.title ||
      payload.culprit ||
      'Sentry alert'
    const fingerprint =
      payload.fingerprint?.join(':') ||
      payload.metadata?.value ||
      title.toLowerCase().replace(/\s+/g, '-')

    const result = await sendConfiguredAlert({
      title,
      occurredAt: new Date().toISOString(),
      sentryUrl: payload.url,
      fingerprint,
    })

    return NextResponse.json({
      ok: true,
      deliveredTo: result.deliveredTo,
      escalated: result.escalated,
    })
  } catch (error) {
    await recordApiErrorMetric({
      path: '/api/ops/sentry-alert',
      statusCode: 500,
    })
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process Sentry alert',
      },
      { status: 500 }
    )
  }
}
