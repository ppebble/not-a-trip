import { NextRequest } from 'next/server'

const mockSendConfiguredAlert = jest.fn()
const mockRecordApiErrorMetric = jest.fn()

jest.mock('@/lib/ops/alerting', () => ({
  sendConfiguredAlert: (...args: unknown[]) => mockSendConfiguredAlert(...args),
}))

jest.mock('@/lib/ops/metrics', () => ({
  recordApiErrorMetric: (...args: unknown[]) =>
    mockRecordApiErrorMetric(...args),
}))

import { POST } from '../route'

describe('POST /api/ops/sentry-alert', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.SENTRY_WEBHOOK_SECRET
    mockSendConfiguredAlert.mockResolvedValue({
      deliveredTo: ['slack'],
      escalated: false,
    })
  })

  test('returns 403 when webhook secret does not match', async () => {
    process.env.SENTRY_WEBHOOK_SECRET = 'expected-secret'

    const request = new NextRequest('http://localhost/api/ops/sentry-alert', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-sentry-webhook-secret': 'wrong-secret',
      },
      body: JSON.stringify({ title: 'Database unavailable' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toBe('Forbidden')
    expect(mockSendConfiguredAlert).not.toHaveBeenCalled()
  })

  test('forwards parsed title, fingerprint, url and affected users', async () => {
    const request = new NextRequest('http://localhost/api/ops/sentry-alert', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        event: { title: 'Database unavailable', affectedUsers: '7' },
        url: 'https://sentry.example.com/issues/1',
        fingerprint: ['db', 'unavailable'],
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockSendConfiguredAlert).toHaveBeenCalledWith({
      title: 'Database unavailable',
      occurredAt: expect.any(String),
      affectedUsers: 7,
      sentryUrl: 'https://sentry.example.com/issues/1',
      fingerprint: 'db:unavailable',
    })
    expect(body).toEqual({
      ok: true,
      deliveredTo: ['slack'],
      escalated: false,
    })
  })

  test('records an api error metric when alert processing fails', async () => {
    mockSendConfiguredAlert.mockRejectedValue(new Error('webhook failed'))

    const request = new NextRequest('http://localhost/api/ops/sentry-alert', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ title: 'Webhook failure' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('webhook failed')
    expect(mockRecordApiErrorMetric).toHaveBeenCalledWith({
      path: '/api/ops/sentry-alert',
      statusCode: 500,
    })
  })
})
