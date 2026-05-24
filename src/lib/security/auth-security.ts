import { COLLECTIONS, getCollection } from '@/lib/db'
import { writeSecurityLog } from './security-log'

export interface AuthLoginAttemptDocument {
  email: string
  attempts: number
  lastAttemptAt: Date
  lockedUntil?: Date
}

export class AuthLockoutError extends Error {
  constructor(public readonly lockedUntil: Date) {
    super(
      `로그인 시도가 너무 많습니다. ${lockedUntil.toISOString()} 이후 다시 시도해주세요.`
    )
    this.name = 'AuthLockoutError'
  }
}

export async function assertLoginNotLocked(email: string): Promise<void> {
  const collection = await getCollection<AuthLoginAttemptDocument>(
    COLLECTIONS.AUTH_LOGIN_ATTEMPTS
  )
  const record = await collection.findOne({ email })

  if (record?.lockedUntil && record.lockedUntil > new Date()) {
    throw new AuthLockoutError(record.lockedUntil)
  }
}

export async function recordFailedLoginAttempt(params: {
  email: string
  ip?: string
}): Promise<void> {
  const collection = await getCollection<AuthLoginAttemptDocument>(
    COLLECTIONS.AUTH_LOGIN_ATTEMPTS
  )
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  const existing = await collection.findOne({ email: params.email })

  let attempts = 1
  if (existing && existing.lastAttemptAt > fiveMinutesAgo) {
    attempts = existing.attempts + 1
  }

  const lockedUntil =
    attempts >= 5 ? new Date(now.getTime() + 15 * 60 * 1000) : undefined

  await collection.updateOne(
    { email: params.email },
    {
      $set: {
        email: params.email,
        attempts,
        lastAttemptAt: now,
        ...(lockedUntil ? { lockedUntil } : {}),
      },
      ...(lockedUntil ? {} : { $unset: { lockedUntil: '' } }),
    },
    { upsert: true }
  )

  await writeSecurityLog({
    type: lockedUntil ? 'login_lockout' : 'login_failed',
    severity: lockedUntil ? 'warning' : 'info',
    ip: params.ip,
    details: {
      email: params.email,
      attempts,
      lockedUntil: lockedUntil?.toISOString(),
    },
  })
}

export async function clearFailedLoginAttempts(email: string): Promise<void> {
  const collection = await getCollection<AuthLoginAttemptDocument>(
    COLLECTIONS.AUTH_LOGIN_ATTEMPTS
  )

  await collection.deleteOne({ email })
}

export async function logSuccessfulLogin(params: {
  email: string
  userId?: string
  ip?: string
}): Promise<void> {
  await writeSecurityLog({
    type: 'login_success',
    severity: 'info',
    userId: params.userId,
    ip: params.ip,
    details: {
      email: params.email,
    },
  })
}
