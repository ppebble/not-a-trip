/**
 * 계정 연동 API Property-Based Tests & Unit Tests
 * Feature: 15-oauth-integration
 *
 * Property 8: 미인증 API 거부 (Requirements 6.3, 8.2)
 * Property 5: 연결 해제 동작 (Requirements 5.5, 6.2)
 * Property 6: 마지막 로그인 수단 보호 (Requirements 5.6, 6.5)
 * Property 7: 비밀번호 설정 라운드 트립 (Requirements 5.8)
 * Property 12: 연결된 계정 목록 완전성 (Requirements 5.1, 6.1)
 * Unit: 존재하지 않는 프로바이더 해제 시 404 (Requirements 6.4)
 */

import fc from 'fast-check'
import { NextRequest } from 'next/server'

// --- Mock state ---
let mockSession: { user: { id: string } } | null = null

// accounts 컬렉션 mock
const mockAccountsFindOne = jest.fn()
const mockAccountsToArray = jest.fn()
const mockAccountsProject = jest.fn()
const mockAccountsFind = jest.fn()
const mockAccountsCountDocuments = jest.fn()
const mockAccountsDeleteOne = jest.fn()

// users 컬렉션 mock
const mockUsersFindOne = jest.fn()
const mockUsersUpdateOne = jest.fn()

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}))

jest.mock('@/lib/db', () => ({
  getDb: jest.fn(() =>
    Promise.resolve({
      collection: (name: string) => {
        if (name === 'accounts') {
          return {
            findOne: mockAccountsFindOne,
            find: mockAccountsFind,
            countDocuments: mockAccountsCountDocuments,
            deleteOne: mockAccountsDeleteOne,
          }
        }
        if (name === 'users') {
          return {
            findOne: mockUsersFindOne,
            updateOne: mockUsersUpdateOne,
          }
        }
        return {}
      },
    })
  ),
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('$2a$12$mockhash')),
  compare: jest.fn((plain: string, hashed: string) =>
    Promise.resolve(hashed === '$2a$12$mockhash')
  ),
}))

// --- Imports (after mocks) ---
import { GET, DELETE } from '../linked-accounts/route'
import { POST } from '../set-password/route'

// --- Arbitraries ---
const providerArb = fc.constantFrom('google', 'kakao', 'naver', 'twitter')
const providerAccountIdArb = fc.string({ minLength: 5, maxLength: 30 })
const validPasswordArb = fc.string({ minLength: 6, maxLength: 72 })

// --- Helpers ---
function createDeleteRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/account/linked-accounts', {
    method: 'DELETE',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/account/set-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function setupChainedFind(accounts: Array<Record<string, unknown>>) {
  mockAccountsToArray.mockResolvedValue(accounts)
  mockAccountsProject.mockReturnValue({ toArray: mockAccountsToArray })
  mockAccountsFind.mockReturnValue({ project: mockAccountsProject })
}

// --- Setup ---
beforeEach(() => {
  jest.clearAllMocks()
  mockSession = null
})

// ============================================================
// Property 8: 미인증 API 거부
// Feature: 15-oauth-integration, Property 8: Unauthenticated API rejection
// Validates: Requirements 6.3, 8.2
// ============================================================
describe('Property 8: 미인증 API 거부', () => {
  test('GET /api/account/linked-accounts — 미인증 시 401 반환', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        mockSession = null
        const res = await GET()
        const data = await res.json()
        expect(res.status).toBe(401)
        expect(data.error).toBe('인증이 필요합니다.')
      }),
      { numRuns: 100 }
    )
  })

  test('DELETE /api/account/linked-accounts — 미인증 시 401 반환', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerArb,
        providerAccountIdArb,
        async (provider, providerAccountId) => {
          mockSession = null
          const req = createDeleteRequest({ provider, providerAccountId })
          const res = await DELETE(req)
          const data = await res.json()
          expect(res.status).toBe(401)
          expect(data.error).toBe('인증이 필요합니다.')
        }
      ),
      { numRuns: 100 }
    )
  })

  test('POST /api/account/set-password — 미인증 시 401 반환', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArb, async (password) => {
        mockSession = null
        const req = createPostRequest({ password })
        const res = await POST(req)
        const data = await res.json()
        expect(res.status).toBe(401)
        expect(data.error).toBe('인증이 필요합니다.')
      }),
      { numRuns: 100 }
    )
  })
})

// ============================================================
// Property 12: 연결된 계정 목록 완전성
// Feature: 15-oauth-integration, Property 12: Linked accounts API returns complete list
// Validates: Requirements 5.1, 6.1
// ============================================================
describe('Property 12: 연결된 계정 목록 완전성', () => {
  test('GET — N개 연결된 계정이 있으면 정확히 N개 반환', async () => {
    const accountArb = fc.record({
      provider: providerArb,
      providerAccountId: providerAccountIdArb,
    })

    await fc.assert(
      fc.asyncProperty(
        fc.array(accountArb, { minLength: 0, maxLength: 8 }),
        fc.boolean(),
        async (accounts, hasPassword) => {
          mockSession = { user: { id: '507f1f77bcf86cd799439011' } }
          setupChainedFind(accounts)
          mockUsersFindOne.mockResolvedValue(
            hasPassword ? { password: '$2a$12$mockhash' } : { password: null }
          )

          const res = await GET()
          const data = await res.json()

          expect(res.status).toBe(200)
          expect(data.accounts).toHaveLength(accounts.length)
          expect(data.hasPassword).toBe(hasPassword)

          // 각 계정에 provider와 providerAccountId가 존재하는지 확인
          for (const account of data.accounts) {
            expect(account).toHaveProperty('provider')
            expect(account).toHaveProperty('providerAccountId')
            expect(typeof account.provider).toBe('string')
            expect(typeof account.providerAccountId).toBe('string')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================
// Property 5: 연결 해제 동작
// Feature: 15-oauth-integration, Property 5: Unlinking removes provider from account
// Validates: Requirements 5.5, 6.2
// ============================================================
describe('Property 5: 연결 해제 동작', () => {
  test('DELETE — 2개 이상 로그인 수단이 있을 때 연결 해제 성공', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerArb,
        providerAccountIdArb,
        fc.integer({ min: 2, max: 5 }),
        async (provider, providerAccountId, accountCount) => {
          mockSession = { user: { id: '507f1f77bcf86cd799439011' } }

          // 해당 프로바이더 연결 존재
          mockAccountsFindOne.mockResolvedValue({
            userId: '507f1f77bcf86cd799439011',
            provider,
            providerAccountId,
          })
          // 2개 이상 연결된 계정
          mockAccountsCountDocuments.mockResolvedValue(accountCount)
          mockUsersFindOne.mockResolvedValue({ password: null })
          mockAccountsDeleteOne.mockResolvedValue({ deletedCount: 1 })

          const req = createDeleteRequest({ provider, providerAccountId })
          const res = await DELETE(req)
          const data = await res.json()

          expect(res.status).toBe(200)
          expect(data.message).toBe('계정 연결이 해제되었습니다.')
          expect(mockAccountsDeleteOne).toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================
// Property 6: 마지막 로그인 수단 보호
// Feature: 15-oauth-integration, Property 6: Last login method protection
// Validates: Requirements 5.6, 6.5
// ============================================================
describe('Property 6: 마지막 로그인 수단 보호', () => {
  test('DELETE — 마지막 로그인 수단 해제 시 400 에러', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerArb,
        providerAccountIdArb,
        async (provider, providerAccountId) => {
          mockSession = { user: { id: '507f1f77bcf86cd799439011' } }

          // 해당 프로바이더 연결 존재
          mockAccountsFindOne.mockResolvedValue({
            userId: '507f1f77bcf86cd799439011',
            provider,
            providerAccountId,
          })
          // 정확히 1개 계정, 비밀번호 없음 → 마지막 로그인 수단
          mockAccountsCountDocuments.mockResolvedValue(1)
          mockUsersFindOne.mockResolvedValue({ password: null })

          const req = createDeleteRequest({ provider, providerAccountId })
          const res = await DELETE(req)
          const data = await res.json()

          expect(res.status).toBe(400)
          expect(data.error).toBe('최소 하나의 로그인 수단이 필요합니다.')
          expect(mockAccountsDeleteOne).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 100 }
    )
  })

  test('DELETE — 비밀번호가 있으면 마지막 OAuth 계정도 해제 가능', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerArb,
        providerAccountIdArb,
        async (provider, providerAccountId) => {
          mockSession = { user: { id: '507f1f77bcf86cd799439011' } }

          mockAccountsFindOne.mockResolvedValue({
            userId: '507f1f77bcf86cd799439011',
            provider,
            providerAccountId,
          })
          // 1개 OAuth 계정 + 비밀번호 있음 → totalLoginMethods = 2
          mockAccountsCountDocuments.mockResolvedValue(1)
          mockUsersFindOne.mockResolvedValue({ password: '$2a$12$mockhash' })
          mockAccountsDeleteOne.mockResolvedValue({ deletedCount: 1 })

          const req = createDeleteRequest({ provider, providerAccountId })
          const res = await DELETE(req)
          const data = await res.json()

          expect(res.status).toBe(200)
          expect(data.message).toBe('계정 연결이 해제되었습니다.')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================================
// Property 7: 비밀번호 설정 라운드 트립
// Feature: 15-oauth-integration, Property 7: Password setting round trip
// Validates: Requirements 5.8
// ============================================================
describe('Property 7: 비밀번호 설정 라운드 트립', () => {
  test('POST — 소셜 전용 계정에 비밀번호 설정 성공', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArb, async (password) => {
        mockSession = { user: { id: '507f1f77bcf86cd799439011' } }

        // 비밀번호 미설정 사용자
        mockUsersFindOne.mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          password: null,
        })
        mockUsersUpdateOne.mockResolvedValue({ modifiedCount: 1 })

        const req = createPostRequest({ password })
        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(200)
        expect(data.message).toBe('비밀번호가 설정되었습니다.')
        expect(mockUsersUpdateOne).toHaveBeenCalled()
      }),
      { numRuns: 100 }
    )
  })

  test('POST — 이미 비밀번호가 설정된 경우 409 반환', async () => {
    await fc.assert(
      fc.asyncProperty(validPasswordArb, async (password) => {
        mockSession = { user: { id: '507f1f77bcf86cd799439011' } }

        // 이미 비밀번호 설정된 사용자
        mockUsersFindOne.mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          password: '$2a$12$existinghash',
        })

        const req = createPostRequest({ password })
        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(409)
        expect(data.error).toBe('이미 비밀번호가 설정되어 있습니다.')
        expect(mockUsersUpdateOne).not.toHaveBeenCalled()
      }),
      { numRuns: 100 }
    )
  })

  test('POST — 6자 미만 비밀번호 시 400 반환', async () => {
    const shortPasswordArb = fc.string({ minLength: 1, maxLength: 5 })

    await fc.assert(
      fc.asyncProperty(shortPasswordArb, async (password) => {
        mockSession = { user: { id: '507f1f77bcf86cd799439011' } }

        const req = createPostRequest({ password })
        const res = await POST(req)
        const data = await res.json()

        expect(res.status).toBe(400)
        expect(data.error).toBe('비밀번호는 최소 6자 이상이어야 합니다.')
      }),
      { numRuns: 100 }
    )
  })
})

// ============================================================
// Unit Test: 존재하지 않는 프로바이더 해제 시 404 응답
// Validates: Requirements 6.4
// ============================================================
describe('Unit: 존재하지 않는 프로바이더 해제 시 404', () => {
  test('DELETE — 존재하지 않는 프로바이더 해제 요청 시 404 반환', async () => {
    mockSession = { user: { id: '507f1f77bcf86cd799439011' } }

    // 해당 프로바이더 연결이 존재하지 않음
    mockAccountsFindOne.mockResolvedValue(null)

    const req = createDeleteRequest({
      provider: 'twitter',
      providerAccountId: 'nonexistent-id-12345',
    })
    const res = await DELETE(req)
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data.error).toBe('연결된 계정을 찾을 수 없습니다.')
    expect(mockAccountsDeleteOne).not.toHaveBeenCalled()
  })
})
