import * as fc from 'fast-check'
import { NextRequest } from 'next/server'

const mockFindOne = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    USERS: 'users',
  },
  getCollection: jest.fn(() =>
    Promise.resolve({
      findOne: mockFindOne,
    })
  ),
}))

import { GET } from '@/app/api/users/[id]/route'

const validObjectId = '507f1f77bcf86cd799439011'

describe('Feature: 37-profile-user-info, Property 1: API 응답 필드 완전성', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('응답은 항상 id, name, image, createdAt 필드를 포함한다', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          image: fc.option(fc.webUrl(), { nil: null }),
          createdAt: fc.date().filter((date) => !Number.isNaN(date.getTime())),
        }),
        async ({ name, image, createdAt }) => {
          mockFindOne.mockResolvedValueOnce({
            _id: { toString: () => validObjectId },
            name,
            image,
            createdAt,
          })

          const response = await GET(
            new NextRequest('http://localhost/api/users/me'),
            {
              params: Promise.resolve({ id: validObjectId }),
            }
          )
          const body = await response.json()

          expect(response.status).toBe(200)
          expect(body).toEqual({
            id: validObjectId,
            name,
            image,
            createdAt: createdAt.toISOString(),
          })
        }
      ),
      { numRuns: 50 }
    )
  })
})

describe('Feature: 37-profile-user-info, Property 2: 민감 필드 비노출', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('password, email이 원본 문서에 있어도 응답에는 포함되지 않는다', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          image: fc.option(fc.webUrl(), { nil: null }),
          createdAt: fc.date().filter((date) => !Number.isNaN(date.getTime())),
          password: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
        }),
        async ({ name, image, createdAt, password, email }) => {
          mockFindOne.mockResolvedValueOnce({
            _id: { toString: () => validObjectId },
            name,
            image,
            createdAt,
            password,
            email,
          })

          const response = await GET(
            new NextRequest('http://localhost/api/users/me'),
            {
              params: Promise.resolve({ id: validObjectId }),
            }
          )
          const body = await response.json()

          expect(response.status).toBe(200)
          expect(body.password).toBeUndefined()
          expect(body.email).toBeUndefined()
          expect(Object.keys(body).sort()).toEqual(
            ['createdAt', 'id', 'image', 'name'].sort()
          )
        }
      ),
      { numRuns: 50 }
    )
  })
})
