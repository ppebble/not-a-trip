/** @jest-environment jsdom */

import { render, waitFor } from '@testing-library/react'
import PageViewTracker from './PageViewTracker'

let currentPathname = '/contents'

jest.mock('next/navigation', () => ({
  usePathname: () => currentPathname,
}))

describe('PageViewTracker', () => {
  const mockFetch = jest.fn().mockResolvedValue({ ok: true })

  beforeEach(() => {
    currentPathname = '/contents'
    mockFetch.mockClear()
    global.fetch = mockFetch
  })

  test('tracks initial load and subsequent public route changes once', async () => {
    const { rerender } = render(<PageViewTracker />)

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/internal/ops/page-view',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ path: '/contents' }),
        keepalive: true,
      })
    )

    rerender(<PageViewTracker />)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    currentPathname = '/map'
    rerender(<PageViewTracker />)
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))
  })

  test('does not track excluded administration routes', async () => {
    currentPathname = '/admin'
    render(<PageViewTracker />)

    await waitFor(() => expect(mockFetch).not.toHaveBeenCalled())
  })
})
