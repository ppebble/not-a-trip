import { createHash } from 'crypto'

import { COLLECTIONS, getCollection } from '@/lib/db'

export interface UploadFingerprintDocument {
  fingerprint: string
  userId: string
  originalUrl: string
  pinUrl?: string | null
  cardUrl?: string | null
  createdAt: Date
}

export class UploadAbuseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadAbuseError'
  }
}

export interface DuplicateUploadResult {
  original: string
  pin: string | null
  card: string | null
}

export function createUploadFingerprint(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

export async function findRecentDuplicateUpload(
  userId: string,
  fingerprint: string
): Promise<DuplicateUploadResult | null> {
  const collection = await getCollection<UploadFingerprintDocument>(
    COLLECTIONS.UPLOAD_FINGERPRINTS
  )
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const existing = await collection.findOne({
    userId,
    fingerprint,
    createdAt: { $gte: threshold },
  })

  if (!existing) {
    return null
  }

  return {
    original: existing.originalUrl,
    pin: existing.pinUrl ?? null,
    card: existing.cardUrl ?? null,
  }
}

export async function assertHourlyUploadLimit(userId: string): Promise<void> {
  const collection = await getCollection<UploadFingerprintDocument>(
    COLLECTIONS.UPLOAD_FINGERPRINTS
  )
  const threshold = new Date(Date.now() - 60 * 60 * 1000)
  const count = await collection.countDocuments({
    userId,
    createdAt: { $gte: threshold },
  })

  if (count >= 20) {
    throw new UploadAbuseError(
      '이미지 업로드는 1시간에 최대 20건까지 허용됩니다.'
    )
  }
}

export async function recordUploadFingerprint(params: {
  userId: string
  fingerprint: string
  originalUrl: string
  pinUrl?: string | null
  cardUrl?: string | null
}): Promise<void> {
  const collection = await getCollection<UploadFingerprintDocument>(
    COLLECTIONS.UPLOAD_FINGERPRINTS
  )

  await collection.insertOne({
    fingerprint: params.fingerprint,
    userId: params.userId,
    originalUrl: params.originalUrl,
    pinUrl: params.pinUrl,
    cardUrl: params.cardUrl,
    createdAt: new Date(),
  })
}
