const mockAuthAttemptsCollection = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
}

const mockAuthContextsCollection = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
  insertOne: jest.fn(),
  distinct: jest.fn(),
}

const mockUsersCollection = {
  findOne: jest.fn(),
  updateOne: jest.fn(),
}

const mockGetCollection = jest.fn()
const mockWriteSecurityLog = jest.fn()

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    AUTH_LOGIN_ATTEMPTS: 'auth_login_attempts',
    AUTH_LOGIN_CONTEXTS: 'auth_login_contexts',
    USERS: 'users',
  },
  getCollection: (...args: unknown[]) => mockGetCollection(...args),
}))

jest.mock('./security-log', () => ({
  writeSecurityLog: (...args: unknown[]) => mockWriteSecurityLog(...args),
}))

import {
  getLoginLockoutStatus,
  logSuccessfulLogin,
  recordFailedLoginAttempt,
} from './auth-security'

describe('auth-security', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCollection.mockImplementation(async (name: string) => {
      if (name === 'auth_login_attempts') {
        return mockAuthAttemptsCollection
      }

      if (name === 'auth_login_contexts') {
        return mockAuthContextsCollection
      }

      if (name === 'users') {
        return mockUsersCollection
      }

      throw new Error(`Unexpected collection ${name}`)
    })
  })

  test('returns lockout metadata when account is currently locked', async () => {
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000)
    mockAuthAttemptsCollection.findOne.mockResolvedValue({
      email: 'locked@example.com',
      attempts: 5,
      lastAttemptAt: new Date(),
      lockedUntil,
    })

    const result = await getLoginLockoutStatus('locked@example.com')

    expect(result.locked).toBe(true)
    expect(result.lockedUntil).toEqual(lockedUntil)
    expect(result.remainingSeconds).toBeGreaterThan(0)
  })

  test('records failed login attempts and lockout threshold', async () => {
    mockAuthAttemptsCollection.findOne.mockResolvedValue({
      email: 'user@example.com',
      attempts: 4,
      lastAttemptAt: new Date(),
    })
    mockAuthAttemptsCollection.updateOne.mockResolvedValue({
      acknowledged: true,
    })

    await recordFailedLoginAttempt({
      email: 'user@example.com',
      ip: '203.0.113.10',
    })

    expect(mockAuthAttemptsCollection.updateOne).toHaveBeenCalled()
    expect(mockWriteSecurityLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'login_lockout',
        severity: 'warning',
      })
    )
  })

  test('logs new ip or device and multi-ip warning for active contexts', async () => {
    mockAuthContextsCollection.findOne.mockResolvedValue(null)
    mockAuthContextsCollection.insertOne.mockResolvedValue({
      acknowledged: true,
    })
    mockAuthContextsCollection.distinct.mockResolvedValue([
      '203.0.113.10',
      '203.0.113.11',
      '203.0.113.12',
    ])
    mockUsersCollection.findOne.mockResolvedValue({
      lastActiveAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
    })
    mockUsersCollection.updateOne.mockResolvedValue({ acknowledged: true })

    await logSuccessfulLogin({
      email: 'user@example.com',
      userId: '507f1f77bcf86cd799439011',
      ip: '203.0.113.12',
      userAgent: 'Mozilla/5.0 Test Browser',
    })

    expect(mockAuthContextsCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
        ip: '203.0.113.12',
        userAgent: 'Mozilla/5.0 Test Browser',
      })
    )
    expect(mockWriteSecurityLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'reauth_after_inactivity',
      })
    )
    expect(mockWriteSecurityLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'login_new_ip_or_device',
      })
    )
    expect(mockWriteSecurityLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'login_multi_ip_warning',
        severity: 'warning',
      })
    )
  })
})
