import { runtimeLogger } from '@/lib/runtime-logger'
import { COLLECTIONS, getCollection } from '@/lib/db'

const RETRY_LIMIT = 3
const ESCALATION_THRESHOLD = 10
const ESCALATION_WINDOW_MS = 60 * 60 * 1000

export interface AlertEventRecord {
  fingerprint: string
  title: string
  createdAt: Date
  channel: 'slack' | 'discord'
  delivered: boolean
}

export interface AlertNotificationInput {
  title: string
  occurredAt: string
  affectedUsers?: number
  sentryUrl?: string
  fingerprint: string
}

export function createAlertMessage(input: AlertNotificationInput): string {
  const parts = [
    `Error: ${input.title}`,
    `Occurred at: ${input.occurredAt}`,
    `Affected users: ${input.affectedUsers ?? 0}`,
  ]

  if (input.sentryUrl) {
    parts.push(`Sentry: ${input.sentryUrl}`)
  }

  return parts.join('\n')
}

async function deliverWebhook(url: string, payload: unknown): Promise<void> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`)
      }

      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt === RETRY_LIMIT) {
        runtimeLogger.error('Alert webhook delivery failed:', {
          url,
          attempt,
          error: lastError.message,
        })
      }
    }
  }

  throw lastError ?? new Error('Unknown webhook delivery failure')
}

async function recordAlertEvent(params: {
  fingerprint: string
  title: string
  channel: 'slack' | 'discord'
  delivered: boolean
}): Promise<void> {
  const collection = await getCollection<AlertEventRecord>(
    COLLECTIONS.ALERT_EVENTS
  )
  await collection.insertOne({
    fingerprint: params.fingerprint,
    title: params.title,
    channel: params.channel,
    delivered: params.delivered,
    createdAt: new Date(),
  })
}

export async function shouldEscalateRepeatedError(
  fingerprint: string
): Promise<boolean> {
  const collection = await getCollection<AlertEventRecord>(
    COLLECTIONS.ALERT_EVENTS
  )
  const threshold = new Date(Date.now() - ESCALATION_WINDOW_MS)
  const count = await collection.countDocuments({
    fingerprint,
    createdAt: { $gte: threshold },
    delivered: true,
  })

  return count >= ESCALATION_THRESHOLD
}

export async function sendConfiguredAlert(
  input: AlertNotificationInput
): Promise<{ deliveredTo: Array<'slack' | 'discord'>; escalated: boolean }> {
  const slackUrl = process.env.SLACK_WEBHOOK_URL?.trim()
  const discordUrl = process.env.DISCORD_WEBHOOK_URL?.trim()
  const message = createAlertMessage(input)
  const deliveredTo: Array<'slack' | 'discord'> = []

  if (slackUrl) {
    await deliverWebhook(slackUrl, { text: message })
    await recordAlertEvent({
      fingerprint: input.fingerprint,
      title: input.title,
      channel: 'slack',
      delivered: true,
    })
    deliveredTo.push('slack')
  }

  if (discordUrl) {
    await deliverWebhook(discordUrl, { content: message })
    await recordAlertEvent({
      fingerprint: input.fingerprint,
      title: input.title,
      channel: 'discord',
      delivered: true,
    })
    deliveredTo.push('discord')
  }

  const escalated = await shouldEscalateRepeatedError(input.fingerprint)
  if (escalated) {
    const escalationMessage = `${message}\nEscalation: repeated 10+ times in the last hour.`

    if (slackUrl) {
      await deliverWebhook(slackUrl, { text: escalationMessage })
    }

    if (discordUrl) {
      await deliverWebhook(discordUrl, { content: escalationMessage })
    }
  }

  return { deliveredTo, escalated }
}
