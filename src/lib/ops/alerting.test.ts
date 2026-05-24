import {
  createAlertMessage,
  sendConfiguredAlert,
  shouldEscalateRepeatedError,
} from './alerting'
import { getCollection } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    ALERT_EVENTS: 'alert_events',
  },
  getCollection: jest.fn(),
}))

const mockGetCollection = getCollection as jest.MockedFunction<
  typeof getCollection
>

describe('ops alerting', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.test'
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/webhook'
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as never
  })

  afterEach(() => {
    delete process.env.SLACK_WEBHOOK_URL
    delete process.env.DISCORD_WEBHOOK_URL
  })

  test('creates a readable alert message', () => {
    expect(
      createAlertMessage({
        title: 'Database unavailable',
        occurredAt: '2026-05-25T00:00:00.000Z',
        affectedUsers: 12,
        sentryUrl: 'https://sentry.example.com/issue/1',
        fingerprint: 'db-unavailable',
      })
    ).toContain('Database unavailable')
  })

  test('sends webhook alerts to configured channels', async () => {
    const insertOne = jest.fn()
    const countDocuments = jest.fn().mockResolvedValue(0)
    mockGetCollection.mockResolvedValue({
      insertOne,
      countDocuments,
    } as never)

    const result = await sendConfiguredAlert({
      title: 'Repeated 500 errors',
      occurredAt: '2026-05-25T00:00:00.000Z',
      affectedUsers: 3,
      fingerprint: '500-errors',
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(result.deliveredTo).toEqual(['slack', 'discord'])
  })

  test('flags escalation after repeated alerts', async () => {
    mockGetCollection.mockResolvedValue({
      countDocuments: jest.fn().mockResolvedValue(10),
    } as never)

    await expect(shouldEscalateRepeatedError('same-error')).resolves.toBe(true)
  })
})
