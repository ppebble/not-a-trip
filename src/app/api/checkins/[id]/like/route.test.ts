jest.mock('@/lib/db', () => ({
  getCollection: jest.fn(),
  COLLECTIONS: {
    CHECKINS: 'checkins',
    CHECKIN_LIKES: 'checkin_likes',
  },
}))

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'

const mockGetCollection = getCollection as jest.MockedFunction<
  typeof getCollection
>
const mockAuth = auth as jest.MockedFunction<typeof auth>

function request(headers?: HeadersInit): NextRequest {
  return new NextRequest('http://localhost/api/checkins/CHECKIN-001/like', {
    headers,
  })
}

describe('/api/checkins/[id]/like', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue(null as never)
  })

  test('rejects invalid check-in ids before touching persistence', async () => {
    const response = await GET(request(), {
      params: Promise.resolve({ id: 'bad-id' }),
    })

    expect(response.status).toBe(400)
    expect(mockGetCollection).not.toHaveBeenCalled()
  })

  test('returns guest like status and server-confirmed count', async () => {
    const checkinsCollection = {
      findOne: jest.fn().mockResolvedValue({ id: 'CHECKIN-001', likeCount: 3 }),
    }
    const likesCollection = {
      findOne: jest.fn().mockResolvedValue({ checkInId: 'CHECKIN-001' }),
    }
    mockGetCollection
      .mockResolvedValueOnce(checkinsCollection as never)
      .mockResolvedValueOnce(likesCollection as never)

    const response = await GET(request({ 'x-device-id': 'device-1' }), {
      params: Promise.resolve({ id: 'CHECKIN-001' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ liked: true, likeCount: 3 })
    expect(likesCollection.findOne).toHaveBeenCalledWith({
      checkInId: 'CHECKIN-001',
      identityKey: 'guest:device-1:unknown',
    })
  })

  test('adds one like for an authenticated user', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', name: 'Tester' },
    } as never)
    const checkinsCollection = {
      findOne: jest.fn().mockResolvedValue({ id: 'CHECKIN-001', likeCount: 3 }),
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValue({ id: 'CHECKIN-001', likeCount: 4 }),
    }
    const likesCollection = {
      findOne: jest.fn().mockResolvedValue(null),
      insertOne: jest.fn().mockResolvedValue({ insertedId: 'like-1' }),
    }
    mockGetCollection
      .mockResolvedValueOnce(checkinsCollection as never)
      .mockResolvedValueOnce(likesCollection as never)

    const response = await POST(request(), {
      params: Promise.resolve({ id: 'CHECKIN-001' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({ success: true, liked: true, likeCount: 4 })
    expect(likesCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        checkInId: 'CHECKIN-001',
        identityKey: 'user:user-1',
        identityType: 'user',
        userId: 'user-1',
      })
    )
  })

  test('removes an existing like without decrementing below zero', async () => {
    const checkinsCollection = {
      findOne: jest.fn().mockResolvedValue({ id: 'CHECKIN-001', likeCount: 0 }),
      findOneAndUpdate: jest.fn().mockResolvedValue(null),
    }
    const likesCollection = {
      findOne: jest.fn().mockResolvedValue({ checkInId: 'CHECKIN-001' }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    }
    mockGetCollection
      .mockResolvedValueOnce(checkinsCollection as never)
      .mockResolvedValueOnce(likesCollection as never)

    const response = await POST(request({ 'x-device-id': 'device-1' }), {
      params: Promise.resolve({ id: 'CHECKIN-001' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toMatchObject({ success: true, liked: false, likeCount: 0 })
    expect(checkinsCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { id: 'CHECKIN-001', likeCount: { $gt: 0 } },
      expect.any(Object),
      { returnDocument: 'after' }
    )
  })
})
