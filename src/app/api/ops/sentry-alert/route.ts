import { NextRequest, NextResponse } from 'next/server'
import { sendConfiguredAlert } from '@/lib/ops/alerting'
import { recordApiErrorMetric } from '@/lib/ops/metrics'

interface SentryWebhookPayload {
  title?: string
  url?: string
  culprit?: string
  fingerprint?: string[]
  affectedUsers?: number | string
  metadata?: {
    title?: string
    value?: string
    affectedUsers?: number | string
  }
  event?: {
    title?: string
    affectedUsers?: number | string
  }
}

function parseAffectedUsers(
  value: number | string | undefined
): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed
    }
  }

  return undefined
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
    const affectedUsers =
      parseAffectedUsers(payload.affectedUsers) ??
      parseAffectedUsers(payload.event?.affectedUsers) ??
      parseAffectedUsers(payload.metadata?.affectedUsers)

    const result = await sendConfiguredAlert({
      title,
      occurredAt: new Date().toISOString(),
      affectedUsers,
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
