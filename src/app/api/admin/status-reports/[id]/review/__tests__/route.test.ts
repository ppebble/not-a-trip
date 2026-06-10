import { NextRequest } from 'next/server'

let mockSession: {
  user: { email?: string; id: string; name?: string; role: string }
} | null = null

const mockDeleteOne = jest.fn()
const mockLogAdminAction = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}))

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOT_STATUS_REPORTS: 'spot_status_reports',
  },
  getCollection: jest.fn(() =>
    Promise.resolve({
      deleteOne: mockDeleteOne,
    })
  ),
}))

jest.mock('@/lib/audit-log', () => ({
  extractClientIp: jest.fn(() => '127.0.0.1'),
  logAdminAction: jest.fn((input) => {
    mockLogAdminAction(input)
    return Promise.resolve()
  }),
}))

import { DELETE } from '../route'

beforeEach(() => {
  jest.clearAllMocks()
  mockSession = {
    user: {
      email: 'admin@example.com',
      id: 'admin-1',
      name: 'Admin',
      role: 'admin',
    },
  }
  mockDeleteOne.mockResolvedValue({ deletedCount: 1 })
})

describe('DELETE /api/admin/status-reports/[id]/review', () => {
  test('deletes a status report review queue item and writes audit log', async () => {
    const request = new NextRequest(
      'http://localhost/api/admin/status-reports/STAT-1/review',
      { method: 'DELETE', headers: { 'x-real-ip': '127.0.0.1' } }
    )

    const response = await DELETE(request, {
      params: Promise.resolve({ id: 'STAT-1' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.id).toBe('STAT-1')
    expect(mockDeleteOne).toHaveBeenCalledWith({ id: 'STAT-1' })
    expect(mockLogAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'delete_status_report',
        resourceId: 'STAT-1',
        resourceType: 'status_report',
      })
    )
  })
})
