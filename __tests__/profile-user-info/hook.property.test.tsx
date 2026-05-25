/** @jest-environment jsdom */

import * as fc from 'fast-check'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useUserInfo } from '@/hooks/useUserQueries'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('Feature: 37-profile-user-info, Property 3: 빈 userId 요청 차단', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('undefined 또는 빈 문자열이면 fetch를 호출하지 않는다', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<string | undefined>(undefined, ''),
        async (userId) => {
          const wrapper = createWrapper()
          renderHook(() => useUserInfo(userId), { wrapper })

          await Promise.resolve()

          expect(global.fetch).not.toHaveBeenCalled()
        }
      ),
      { numRuns: 10 }
    )
  })
})
