import { NextRequest } from 'next/server'

const mockUsersFindOne = jest.fn()
const mockUsersUpdateOne = jest.fn()
const mockValidateNewPasswordSecurity = jest.fn()
let mockSession: { user: { id: string } } | null = null

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}))

jest.mock('@/lib/db', () => ({
  getDb: jest.fn(() =>
    Promise.resolve({
      collection: () => ({
        findOne: mockUsersFindOne,
        updateOne: mockUsersUpdateOne,
      }),
    })
  ),
}))

jest.mock('@/lib/security', () => ({
  validateNewPasswordSecurity: (...args: unknown[]) =>
    mockValidateNewPasswordSecurity(...args),
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn((plain: string) =>
    Promise.resolve(plain === 'current-password')
  ),
  hash: jest.fn(() => Promise.resolve('$2a$12$newhash')),
}))

import { POST } from './route'

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/account/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/account/change-password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSession = { user: { id: '507f1f77bcf86cd799439011' } }
    mockUsersFindOne.mockResolvedValue({ password: '$2a$12$currenthash' })
    mockUsersUpdateOne.mockResolvedValue({ modifiedCount: 1 })
    mockValidateNewPasswordSecurity.mockResolvedValue({ ok: true })
  })

  test('requires authentication', async () => {
    mockSession = null

    const response = await POST(
      createRequest({
        currentPassword: 'current-password',
        newPassword: 'new-safe-password',
      })
    )

    expect(response.status).toBe(401)
    expect(mockUsersUpdateOne).not.toHaveBeenCalled()
  })

  test('rejects the wrong current password before updating', async () => {
    const response = await POST(
      createRequest({
        currentPassword: 'wrong-password',
        newPassword: 'new-safe-password',
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('현재 비밀번호가 일치하지 않습니다.')
    expect(mockValidateNewPasswordSecurity).not.toHaveBeenCalled()
    expect(mockUsersUpdateOne).not.toHaveBeenCalled()
  })

  test('rejects compromised replacement passwords before hashing', async () => {
    mockValidateNewPasswordSecurity.mockResolvedValue({
      ok: false,
      error: 'compromised',
      status: 400,
    })

    const response = await POST(
      createRequest({
        currentPassword: 'current-password',
        newPassword: 'password123',
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('compromised')
    expect(mockUsersUpdateOne).not.toHaveBeenCalled()
  })

  test('updates the stored hash for a valid password change', async () => {
    const response = await POST(
      createRequest({
        currentPassword: 'current-password',
        newPassword: 'new-safe-password',
      })
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.message).toBe('비밀번호가 변경되었습니다.')
    expect(mockValidateNewPasswordSecurity).toHaveBeenCalledWith(
      'new-safe-password'
    )
    expect(mockUsersUpdateOne).toHaveBeenCalledWith(
      { _id: expect.anything() },
      {
        $set: {
          password: '$2a$12$newhash',
          updatedAt: expect.any(Date),
        },
      }
    )
  })
})
