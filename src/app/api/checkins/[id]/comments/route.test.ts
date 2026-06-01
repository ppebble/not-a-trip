jest.mock('@/lib/db', () => ({
  getCollection: jest.fn(),
  COLLECTIONS: {
    CHECKINS: 'checkins',
    CHECKIN_COMMENTS: 'checkin_comments',
  },
}))

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/ops/metrics', () => ({
  recordApiErrorMetric: jest.fn(),
}))

jest.mock('@/lib/security/security-log', () => ({
  writeSecurityLog: jest.fn(),
}))

import { ObjectId } from 'mongodb'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'

const mockGetCollection = getCollection as jest.MockedFunction<
  typeof getCollection
>
const mockAuth = auth as jest.MockedFunction<typeof auth>

function request(body?: unknown): NextRequest {
  return new NextRequest('http://localhost/api/checkins/CHECKIN-001/comments', {
    method: body ? 'POST' : 'GET',
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  })
}

describe('/api/checkins/[id]/comments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue(null as never)
  })

  test('lists check-in comments in chronological order contract shape', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1' },
    } as never)
    const checkinsCollection = {
      findOne: jest.fn().mockResolvedValue({ id: 'CHECKIN-001' }),
    }
    const toArray = jest.fn().mockResolvedValue([
      {
        _id: new ObjectId('000000000000000000000001'),
        checkInId: 'CHECKIN-001',
        content: '첫 댓글',
        authorName: '테스터',
        userId: 'user-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ])
    const commentsCollection = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({ toArray }),
      }),
    }
    mockGetCollection
      .mockResolvedValueOnce(checkinsCollection as never)
      .mockResolvedValueOnce(commentsCollection as never)

    const response = await GET(request(), {
      params: Promise.resolve({ id: 'CHECKIN-001' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.total).toBe(1)
    expect(body.comments[0]).toMatchObject({
      id: '000000000000000000000001',
      checkInId: 'CHECKIN-001',
      content: '첫 댓글',
      authorName: '테스터',
      userId: 'user-1',
      canDelete: true,
    })
    expect(commentsCollection.find).toHaveBeenCalledWith({
      checkInId: 'CHECKIN-001',
    })
  })

  test('requires login before creating check-in comments', async () => {
    const checkinsCollection = {
      findOne: jest.fn().mockResolvedValue({ id: 'CHECKIN-001' }),
    }
    mockGetCollection.mockResolvedValueOnce(checkinsCollection as never)

    const response = await POST(request({ content: '댓글' }), {
      params: Promise.resolve({ id: 'CHECKIN-001' }),
    })

    expect(response.status).toBe(401)
  })

  test('sanitizes and creates authenticated comments without touching caption', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-1',
        name: '테스터',
        email: 'tester@example.com',
        image: 'https://example.com/user.jpg',
      },
    } as never)
    const checkinsCollection = {
      findOne: jest.fn().mockResolvedValue({ id: 'CHECKIN-001' }),
    }
    const insertedId = new ObjectId('000000000000000000000002')
    const commentsCollection = {
      insertOne: jest.fn().mockResolvedValue({ insertedId }),
    }
    mockGetCollection
      .mockResolvedValueOnce(checkinsCollection as never)
      .mockResolvedValueOnce(commentsCollection as never)

    const response = await POST(
      request({ content: '<script>bad()</script><b>좋아요</b>' }),
      { params: Promise.resolve({ id: 'CHECKIN-001' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toMatchObject({
      id: insertedId.toHexString(),
      checkInId: 'CHECKIN-001',
      content: '좋아요',
      authorName: '테스터',
      userId: 'user-1',
      canDelete: true,
    })
    expect(commentsCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        checkInId: 'CHECKIN-001',
        content: '좋아요',
      })
    )
  })
})
