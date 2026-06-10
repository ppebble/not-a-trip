import { NextRequest } from 'next/server'

let mockSession: { user: { id: string; role: string } } | null = null

const mockSpotFindOne = jest.fn()
const mockSpotUpdateOne = jest.fn()
const mockStatusReportsUpdateMany = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}))

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOTS: 'spots',
    SPOT_STATUS_REPORTS: 'spot_status_reports',
  },
  getCollection: jest.fn((name: string) => {
    if (name === 'spots') {
      return Promise.resolve({
        findOne: mockSpotFindOne,
        updateOne: mockSpotUpdateOne,
      })
    }

    return Promise.resolve({
      updateMany: mockStatusReportsUpdateMany,
    })
  }),
}))

import { PUT } from '../route'

beforeEach(() => {
  jest.clearAllMocks()
  mockSession = { user: { id: 'admin-1', role: 'admin' } }
  mockSpotFindOne.mockResolvedValue({ id: 'SPOT-1' })
  mockSpotUpdateOne.mockResolvedValue({ modifiedCount: 1 })
  mockStatusReportsUpdateMany.mockResolvedValue({ modifiedCount: 2 })
})

describe('PUT /api/admin/status-reports/spots/[spotId]/status', () => {
  test('resolves both explicit pending and legacy missing-reviewStatus reports', async () => {
    const request = new NextRequest(
      'http://localhost/api/admin/status-reports/spots/SPOT-1/status',
      {
        method: 'PUT',
        body: JSON.stringify({ status: 'under_construction' }),
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const response = await PUT(request, {
      params: Promise.resolve({ spotId: 'SPOT-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.spotStatus).toBe('under_construction')
    expect(mockStatusReportsUpdateMany).toHaveBeenCalledWith(
      {
        spotId: 'SPOT-1',
        $or: [
          { reviewStatus: 'pending' },
          { reviewStatus: { $exists: false } },
        ],
      },
      { $set: { reviewStatus: 'resolved' } }
    )
  })
})
