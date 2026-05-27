jest.mock('@/lib/db', () => ({
  getCollection: jest.fn(),
  COLLECTIONS: {
    CHECKINS: 'checkins',
    USER_STATS: 'user_stats',
    USER_BADGES: 'user_badges',
  },
}))

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

import { GET } from '../route'
import { getCollection } from '@/lib/db'

const mockGetCollection = getCollection as jest.MockedFunction<
  typeof getCollection
>

describe('GET /api/checkins/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns 400 for an invalid check-in id format', async () => {
    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'bad-id' }),
    })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain('유효하지 않은 인증 ID')
    expect(mockGetCollection).not.toHaveBeenCalled()
  })

  test('returns 404 when the check-in does not exist', async () => {
    mockGetCollection.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue(null),
    } as never)

    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'CHECKIN-404' }),
    })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toContain('찾을 수 없습니다')
  })

  test('returns the full check-in payload for a valid id', async () => {
    mockGetCollection.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue({
        id: 'CHECKIN-001',
        spotId: 'spot-1',
        userId: 'user-1',
        userName: '테스터',
        userImage: 'https://example.com/user.jpg',
        photoUrl: 'https://example.com/checkin.jpg',
        sceneImageUrl: 'https://example.com/scene.jpg',
        visitedAt: new Date('2026-05-01T00:00:00.000Z'),
        comment: '좋아요',
        likeCount: 7,
        relationId: 'rel-1',
        contentId: 'content-1',
        contentName: '슬램덩크',
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-02T00:00:00.000Z'),
      }),
    } as never)

    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'CHECKIN-001' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.id).toBe('CHECKIN-001')
    expect(body.contentName).toBe('슬램덩크')
    expect(body.relationId).toBe('rel-1')
    expect(body.photoUrl).toBe('https://example.com/checkin.jpg')
  })
})
