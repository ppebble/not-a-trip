const mockGetLoginLockoutStatus = jest.fn()

jest.mock('@/lib/security', () => ({
  getLoginLockoutStatus: (...args: unknown[]) =>
    mockGetLoginLockoutStatus(...args),
  sanitizePlainText: (input: string | undefined | null) =>
    typeof input === 'string' ? input.trim() : '',
}))

import { NextRequest } from 'next/server'

import { POST } from '../route'

describe('POST /api/auth/login-status', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 400 when email is missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/login-status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('이메일이 필요합니다.')
  })

  test('returns unlocked status when account is not locked', async () => {
    mockGetLoginLockoutStatus.mockResolvedValue({ locked: false })

    const request = new NextRequest('http://localhost/api/auth/login-status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ locked: false })
  })

  test('returns lockout metadata when account is locked', async () => {
    mockGetLoginLockoutStatus.mockResolvedValue({
      locked: true,
      lockedUntil: new Date('2026-05-26T12:00:00.000Z'),
      remainingSeconds: 120,
    })

    const request = new NextRequest('http://localhost/api/auth/login-status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(423)
    expect(body.locked).toBe(true)
    expect(body.reason).toBe('too_many_failed_attempts')
    expect(body.lockedUntil).toBe('2026-05-26T12:00:00.000Z')
    expect(body.remainingSeconds).toBe(120)
  })
})
