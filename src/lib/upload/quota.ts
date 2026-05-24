import { COLLECTIONS, getCollection } from '@/lib/db'

const FIFTY_MB = 50 * 1024 * 1024

export interface UploadDailyUsageDocument {
  userId: string
  dateKey: string
  bytesUsed: number
  uploadCount: number
  createdAt: Date
  updatedAt: Date
}

export class UploadQuotaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadQuotaError'
  }
}

export function getKstDateKey(date: Date = new Date()): string {
  const kstOffsetMs = 9 * 60 * 60 * 1000
  const kstDate = new Date(date.getTime() + kstOffsetMs)
  const year = kstDate.getUTCFullYear()
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(kstDate.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function assertUploadQuota(
  userId: string,
  fileSize: number
): Promise<void> {
  const collection = await getCollection<UploadDailyUsageDocument>(
    COLLECTIONS.UPLOAD_DAILY_USAGE
  )
  const dateKey = getKstDateKey()
  const usage = await collection.findOne({ userId, dateKey })

  const currentBytes = usage?.bytesUsed ?? 0
  if (currentBytes + fileSize > FIFTY_MB) {
    throw new UploadQuotaError(
      '일일 업로드 한도를 초과했습니다. 하루 최대 50MB까지 업로드할 수 있습니다.'
    )
  }
}

export async function recordUploadQuotaUsage(
  userId: string,
  fileSize: number
): Promise<void> {
  const collection = await getCollection<UploadDailyUsageDocument>(
    COLLECTIONS.UPLOAD_DAILY_USAGE
  )
  const dateKey = getKstDateKey()
  const now = new Date()

  await collection.updateOne(
    { userId, dateKey },
    {
      $inc: {
        bytesUsed: fileSize,
        uploadCount: 1,
      },
      $set: {
        updatedAt: now,
      },
      $setOnInsert: {
        userId,
        dateKey,
        createdAt: now,
      },
    },
    { upsert: true }
  )
}
