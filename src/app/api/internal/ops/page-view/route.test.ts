const mockRecordPageViewMetric = jest.fn()

jest.mock('@/lib/ops/metrics', () => ({
  recordPageViewMetric: (...args: unknown[]) =>
    mockRecordPageViewMetric(...args),
}))

import { NextRequest } from 'next/server'
import { POST } from './route'

function createRequest(path: unknown, origin = 'https://not-a-trip.com') {
  return new NextRequest('https://not-a-trip.com/api/internal/ops/page-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      origin,
    },
    body: JSON.stringify({ path }),
  })
}

describe('POST /api/internal/ops/page-view', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRecordPageViewMetric.mockResolvedValue(undefined)
  })

  test('records a normalized same-origin public page view', async () => {
    const response = await POST(createRequest('/map?category=anime'))

    expect(response.status).toBe(202)
    expect(mockRecordPageViewMetric).toHaveBeenCalledWith('/map')
  })

  test('rejects cross-origin ingestion', async () => {
    const response = await POST(createRequest('/map', 'https://example.com'))

    expect(response.status).toBe(403)
    expect(mockRecordPageViewMetric).not.toHaveBeenCalled()
  })

  test('rejects ingestion without a browser origin', async () => {
    const request = new NextRequest(
      'https://not-a-trip.com/api/internal/ops/page-view',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/map' }),
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(403)
    expect(mockRecordPageViewMetric).not.toHaveBeenCalled()
  })

  test('rejects excluded page paths', async () => {
    const response = await POST(createRequest('/admin'))

    expect(response.status).toBe(400)
    expect(mockRecordPageViewMetric).not.toHaveBeenCalled()
  })
})
