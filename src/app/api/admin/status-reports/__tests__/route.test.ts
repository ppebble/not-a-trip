import { NextRequest } from 'next/server'

let mockSession: { user: { id: string; role: string } } | null = null

const mockFind = jest.fn()
const mockSort = jest.fn()
const mockSkip = jest.fn()
const mockLimit = jest.fn()
const mockToArray = jest.fn()
const mockCountDocuments = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}))

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOT_STATUS_REPORTS: 'spot_status_reports',
  },
  getCollection: jest.fn(() =>
    Promise.resolve({
      countDocuments: mockCountDocuments,
      find: mockFind,
    })
  ),
}))

import { GET } from '../route'

beforeEach(() => {
  jest.clearAllMocks()
  mockSession = { user: { id: 'admin-1', role: 'admin' } }
  mockToArray.mockResolvedValue([])
  mockLimit.mockReturnValue({ toArray: mockToArray })
  mockSkip.mockReturnValue({ limit: mockLimit })
  mockSort.mockReturnValue({ skip: mockSkip })
  mockFind.mockReturnValue({ sort: mockSort })
  mockCountDocuments.mockResolvedValue(0)
})

describe('GET /api/admin/status-reports', () => {
  test('normalizes legacy review records without reviewStatus as pending', async () => {
    mockCountDocuments.mockResolvedValue(1)
    mockToArray.mockResolvedValue([
      {
        id: 'STAT-1',
        spotId: 'SPOT-1',
        status: 'under_construction',
        createdAt: new Date('2026-06-10T00:00:00.000Z'),
      },
    ])

    const request = new NextRequest('http://localhost/api/admin/status-reports')
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.reports[0].reviewStatus).toBe('pending')
    expect(mockFind).toHaveBeenCalledWith({
      $or: [{ reviewStatus: 'pending' }, { reviewStatus: { $exists: false } }],
    })
  })
})
