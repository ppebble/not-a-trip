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
    AUDIT_LOGS: 'audit_logs',
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
  mockSession = null
  mockToArray.mockResolvedValue([])
  mockLimit.mockReturnValue({ toArray: mockToArray })
  mockSkip.mockReturnValue({ limit: mockLimit })
  mockSort.mockReturnValue({ skip: mockSkip })
  mockFind.mockReturnValue({ sort: mockSort })
  mockCountDocuments.mockResolvedValue(0)
})

describe('GET /api/admin/audit-logs', () => {
  test('returns 401 when unauthenticated', async () => {
    const request = new NextRequest('http://localhost/api/admin/audit-logs')
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('로그인이 필요합니다')
  })

  test('returns 403 when not admin', async () => {
    mockSession = { user: { id: 'user-1', role: 'user' } }

    const request = new NextRequest('http://localhost/api/admin/audit-logs')
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toBe('관리자 권한이 필요합니다')
  })

  test('returns paginated audit logs for admin requests', async () => {
    mockSession = { user: { id: 'admin-1', role: 'admin' } }
    mockCountDocuments.mockResolvedValue(2)
    mockToArray.mockResolvedValue([
      { adminId: 'admin-1', actionType: 'review_spot_report' },
      { adminId: 'admin-1', actionType: 'review_status_report' },
    ])

    const request = new NextRequest(
      'http://localhost/api/admin/audit-logs?actionType=review_spot_report&page=2&pageSize=10'
    )
    const response = await GET(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.total).toBe(2)
    expect(body.page).toBe(2)
    expect(body.pageSize).toBe(10)
    expect(mockCountDocuments).toHaveBeenCalledWith({
      actionType: 'review_spot_report',
    })
    expect(mockSkip).toHaveBeenCalledWith(10)
  })
})
