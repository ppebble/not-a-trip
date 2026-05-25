import { createHash } from 'crypto'
import { ObjectId } from 'mongodb'

import { COLLECTIONS, getCollection } from '@/lib/db'
import { writeSecurityLog } from './security-log'

export interface AuthLoginAttemptDocument {
  email: string
  attempts: number
  lastAttemptAt: Date
  lockedUntil?: Date
}

export interface AuthLoginContextDocument {
  userId: string
  email: string
  ip?: string
  userAgent?: string
  deviceFingerprint: string
  createdAt: Date
  lastSeenAt: Date
  expiresAt: Date
}

export class AuthLockoutError extends Error {
  constructor(public readonly lockedUntil: Date) {
    super(
      `로그인 시도가 너무 많습니다. ${lockedUntil.toISOString()} 이후 다시 시도해주세요.`
    )
    this.name = 'AuthLockoutError'
  }
}

function createDeviceFingerprint(userAgent?: string): string {
  const normalized = (userAgent || 'unknown-device').trim().toLowerCase()
  return createHash('sha256').update(normalized).digest('hex')
}

function createSessionExpiry(now: Date): Date {
  return new Date(now.getTime() + 24 * 60 * 60 * 1000)
}

export async function getLoginLockoutStatus(email: string): Promise<{
  locked: boolean
  lockedUntil?: Date
  remainingSeconds?: number
}> {
  const collection = await getCollection<AuthLoginAttemptDocument>(
    COLLECTIONS.AUTH_LOGIN_ATTEMPTS
  )
  const record = await collection.findOne({ email })

  if (!record?.lockedUntil || record.lockedUntil <= new Date()) {
    return { locked: false }
  }

  return {
    locked: true,
    lockedUntil: record.lockedUntil,
    remainingSeconds: Math.max(
      1,
      Math.ceil((record.lockedUntil.getTime() - Date.now()) / 1000)
    ),
  }
}

export async function assertLoginNotLocked(email: string): Promise<void> {
  const status = await getLoginLockoutStatus(email)
  if (status.lockedUntil) {
    throw new AuthLockoutError(status.lockedUntil)
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
  userAgent?: string
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

  if (!params.userId) {
    return
  }

  const now = new Date()
  const usersCollection = await getCollection<{
    _id?: unknown
    lastActiveAt?: Date
  }>(COLLECTIONS.USERS)
  const existingUser = await usersCollection.findOne({
    _id: new ObjectId(params.userId),
  })

  if (
    existingUser?.lastActiveAt &&
    now.getTime() - new Date(existingUser.lastActiveAt).getTime() >=
      30 * 24 * 60 * 60 * 1000
  ) {
    await writeSecurityLog({
      type: 'reauth_after_inactivity',
      severity: 'info',
      userId: params.userId,
      ip: params.ip,
      details: {
        email: params.email,
        lastActiveAt: existingUser.lastActiveAt.toISOString(),
      },
    })
  }

  await usersCollection.updateOne(
    { _id: new ObjectId(params.userId) },
    {
      $set: {
        lastLoginAt: now,
        lastActiveAt: now,
      },
    }
  )

  const collection = await getCollection<AuthLoginContextDocument>(
    COLLECTIONS.AUTH_LOGIN_CONTEXTS
  )
  const deviceFingerprint = createDeviceFingerprint(params.userAgent)
  const expiresAt = createSessionExpiry(now)
  const existingContext = await collection.findOne({
    userId: params.userId,
    ip: params.ip,
    deviceFingerprint,
    expiresAt: { $gt: now },
  })

  if (existingContext) {
    await collection.updateOne(
      { _id: existingContext._id },
      {
        $set: {
          lastSeenAt: now,
          expiresAt,
          userAgent: params.userAgent,
        },
      }
    )
  } else {
    await collection.insertOne({
      userId: params.userId,
      email: params.email,
      ip: params.ip,
      userAgent: params.userAgent,
      deviceFingerprint,
      createdAt: now,
      lastSeenAt: now,
      expiresAt,
    })

    await writeSecurityLog({
      type: 'login_new_ip_or_device',
      severity: 'warning',
      userId: params.userId,
      ip: params.ip,
      details: {
        email: params.email,
        userAgent: params.userAgent,
      },
    })
  }

  const distinctIps = (
    await collection.distinct('ip', {
      userId: params.userId,
      expiresAt: { $gt: now },
    })
  ).filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  )

  if (distinctIps.length >= 3) {
    await writeSecurityLog({
      type: 'login_multi_ip_warning',
      severity: 'warning',
      userId: params.userId,
      ip: params.ip,
      details: {
        email: params.email,
        distinctIps,
        count: distinctIps.length,
      },
    })
  }
}
