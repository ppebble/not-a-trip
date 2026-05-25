import * as fc from 'fast-check'

const mockAuth = jest.fn()
const mockRedirect = jest.fn((_: string) => {
  throw new Error('NEXT_REDIRECT')
})

jest.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

jest.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}))

import AccountSettingsPage from '@/app/settings/account/page'

describe('Feature: 45-profile-complete, Property 11: /settings/account 리다이렉트', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('로그인 상태면 management 섹션으로 리다이렉트한다', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 24 }),
        async (userId) => {
          mockAuth.mockResolvedValueOnce({ user: { id: userId } })

          await expect(AccountSettingsPage()).rejects.toThrow('NEXT_REDIRECT')
          expect(mockRedirect).toHaveBeenCalledWith(
            `/profile/${userId}?section=management`
          )
        }
      ),
      { numRuns: 20 }
    )
  })

  it('비로그인 상태면 signin callbackUrl로 리다이렉트한다', async () => {
    mockAuth.mockResolvedValueOnce(null)

    await expect(AccountSettingsPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(mockRedirect).toHaveBeenCalledWith(
      '/auth/signin?callbackUrl=/settings/account'
    )
  })
})
