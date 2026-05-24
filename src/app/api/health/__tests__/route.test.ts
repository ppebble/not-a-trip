jest.mock('@/lib/health', () => ({
  createHealthStatus: jest.fn(),
}))

import { GET } from '../route'
import { createHealthStatus } from '@/lib/health'

const mockCreateHealthStatus = createHealthStatus as jest.MockedFunction<
  typeof createHealthStatus
>

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 200 and healthy payload when the database check succeeds', async () => {
    mockCreateHealthStatus.mockResolvedValue({
      statusCode: 200,
      body: {
        status: 'healthy',
        database: 'healthy',
        responseTimeMs: 12,
        serverTime: '2026-05-24T00:00:00.000Z',
        version: '0.1.0',
      },
    })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe('healthy')
    expect(body.database).toBe('healthy')
    expect(body.responseTimeMs).toBe(12)
    expect(body.version).toBe('0.1.0')
  })

  test('returns 503 and unhealthy payload when the database check fails', async () => {
    mockCreateHealthStatus.mockResolvedValue({
      statusCode: 503,
      body: {
        status: 'unhealthy',
        database: 'unhealthy',
        responseTimeMs: 27,
        serverTime: '2026-05-24T00:00:00.000Z',
        version: '0.1.0',
        error: 'Database connection failed',
      },
    })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.status).toBe('unhealthy')
    expect(body.database).toBe('unhealthy')
    expect(body.error).toBe('Database connection failed')
  })
})
