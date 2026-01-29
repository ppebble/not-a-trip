/**
 * @jest-environment jsdom
 */

import fc from 'fast-check'
import { render, cleanup, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Post } from '@/hooks/usePosts'
import PostList from '../PostList'

// Cleanup after each test to prevent DOM element accumulation
afterEach(() => {
  cleanup()
})

// Feature: anime-pilgrimage-map, Property 6: 게시글 목록 필수 정보 포함
// Validates: Requirements 5.1

/**
 * Generators for property-based testing
 */

// Generate valid Post objects with dates in the past (relative to now)
const postArbitrary = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0),
  title: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  content: fc
    .string({ minLength: 1, maxLength: 1000 })
    .filter((s) => s.trim().length > 0),
  author: fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0),
  // Generate dates that are always in the past (1 hour to 365 days ago)
  createdAt: fc
    .integer({ min: 1, max: 365 * 24 })
    .map((hoursAgo) => new Date(Date.now() - hoursAgo * 60 * 60 * 1000)),
  viewCount: fc.nat({ max: 100000 }),
  commentCount: fc.nat({ max: 1000 }),
})

// Generate array of posts
const postsArrayArbitrary = fc.array(postArbitrary, {
  minLength: 1,
  maxLength: 10,
})

/**
 * Helper function to check if rendered content contains required information
 * Requirements 5.1: 제목, 작성자, 날짜, 조회수 표시
 */
function containsRequiredInfo(container: HTMLElement, post: Post): boolean {
  const content = container.textContent || ''

  // Check if post title is present
  const hasTitle = content.includes(post.title)

  // Check if author is present
  const hasAuthor = content.includes(post.author)

  // Check if view count is present (formatted or raw)
  const viewCountStr = post.viewCount.toString()
  const formattedViewCount =
    post.viewCount >= 1000
      ? `${(post.viewCount / 1000).toFixed(1)}K`
      : viewCountStr
  const hasViewCount =
    content.includes(viewCountStr) || content.includes(formattedViewCount)

  // Check if date is present (in some format)
  // Date can be displayed as relative time or formatted date (Korean format)
  // formatRelativeDate returns: "방금 전", "N분 전", "N시간 전", "어제", "N일 전", or "YYYY년 M월 D일"
  const hasDate =
    content.includes('분 전') ||
    content.includes('시간 전') ||
    content.includes('일 전') ||
    content.includes('어제') ||
    content.includes('방금 전') ||
    content.includes('년')

  return hasTitle && hasAuthor && hasViewCount && hasDate
}

/**
 * Mock data for usePosts hook
 */
let mockPostsData: Post[] | null = null
let mockIsLoading = false
let mockError: Error | null = null

jest.mock('@/hooks/usePosts', () => ({
  usePosts: () => ({
    data: mockPostsData,
    isLoading: mockIsLoading,
    error: mockError,
    refetch: jest.fn(),
  }),
  Post: {},
}))

/**
 * Mock Next.js router
 */
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('PostList Required Information Property Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    mockPostsData = null
    mockIsLoading = false
    mockError = null
  })

  afterEach(() => {
    queryClient.clear()
  })

  test('Property 6: 게시글 목록 필수 정보 포함', () => {
    fc.assert(
      fc.property(postsArrayArbitrary, (posts: Post[]) => {
        // Cleanup before each iteration
        cleanup()

        // Set mock data for the hook
        mockPostsData = posts

        // Render the PostList component wrapped in act
        let container: HTMLElement
        act(() => {
          const result = render(
            <QueryClientProvider client={queryClient}>
              <PostList />
            </QueryClientProvider>
          )
          container = result.container
        })

        // Verify that all required information is present for each post
        // Requirements 5.1: 제목, 작성자, 날짜, 조회수 표시
        return posts.every((post) => containsRequiredInfo(container!, post))
      }),
      { numRuns: 100 }
    )
  })
})
