jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    UPLOAD_DAILY_USAGE: 'upload_daily_usage',
  },
  getCollection: jest.fn(),
}))

import { getCollection } from '@/lib/db'
import {
  assertUploadQuota,
  getKstDateKey,
  recordUploadQuotaUsage,
  UploadQuotaError,
} from './quota'

const mockGetCollection = getCollection as jest.MockedFunction<
  typeof getCollection
>

describe('upload quota', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates KST date keys using UTC+9', () => {
    expect(getKstDateKey(new Date('2026-05-24T14:59:59.000Z'))).toBe(
      '2026-05-24'
    )
    expect(getKstDateKey(new Date('2026-05-24T15:00:00.000Z'))).toBe(
      '2026-05-25'
    )
  })

  test('rejects when daily quota would exceed 50MB', async () => {
    mockGetCollection.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue({
        bytesUsed: 49 * 1024 * 1024,
      }),
    } as never)

    await expect(
      assertUploadQuota('user-1', 2 * 1024 * 1024)
    ).rejects.toBeInstanceOf(UploadQuotaError)
  })

  test('records usage with upsert update', async () => {
    const updateOne = jest.fn().mockResolvedValue({})
    mockGetCollection.mockResolvedValue({
      updateOne,
    } as never)

    await recordUploadQuotaUsage('user-1', 1024)

    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1' }),
      expect.objectContaining({
        $inc: { bytesUsed: 1024, uploadCount: 1 },
      }),
      { upsert: true }
    )
  })
})
