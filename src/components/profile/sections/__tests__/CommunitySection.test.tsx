/**
 * @jest-environment jsdom
 */
/// <reference types="@testing-library/jest-dom" />

import { fireEvent, render, screen } from '@testing-library/react'
import { CommunitySection } from '../CommunitySection'
import type { UserComment, UserPost } from '@/types/profile'

const mockUseUserPosts = jest.fn()
const mockUseUserComments = jest.fn()

jest.mock('@/hooks/useUserQueries', () => ({
  useUserPosts: (...args: unknown[]) => mockUseUserPosts(...args),
  useUserComments: (...args: unknown[]) => mockUseUserComments(...args),
}))

const basePost: UserPost = {
  id: 'post-123',
  title: 'My Post',
  contentPreview: 'Post preview',
  viewCount: 12,
  commentCount: 3,
  createdAt: '2026-06-01T00:00:00.000Z',
}

const baseComment: UserComment = {
  id: 'comment-123',
  postId: 'parent-post-456',
  postTitle: 'Parent Post',
  contentPreview: 'My Comment',
  createdAt: '2026-06-01T00:00:00.000Z',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseUserPosts.mockReturnValue({ data: [basePost], isLoading: false })
  mockUseUserComments.mockReturnValue({
    data: [baseComment],
    isLoading: false,
  })
})

describe('CommunitySection profile community links', () => {
  it('links profile posts to the canonical community detail route', () => {
    render(<CommunitySection userId="user-1" isOwner />)

    const link = screen.getByText('My Post').closest('a')

    expect(link).toHaveAttribute('href', '/community/post-123')
    expect(link).not.toHaveAttribute('href', '/community/posts/post-123')
  })

  it('links profile comments to the parent post canonical community detail route', () => {
    render(<CommunitySection userId="user-1" isOwner />)

    fireEvent.click(screen.getAllByRole('tab')[1])
    const link = screen.getByText('My Comment').closest('a')

    expect(link).toHaveAttribute('href', '/community/parent-post-456')
    expect(link).not.toHaveAttribute('href', '/community/posts/parent-post-456')
  })

  it('renders a non-link fallback for posts without an id', () => {
    mockUseUserPosts.mockReturnValue({
      data: [{ ...basePost, id: '' }],
      isLoading: false,
    })

    render(<CommunitySection userId="user-1" isOwner />)

    expect(screen.getByText('My Post').closest('a')).toBeNull()
    expect(screen.getByText('My Post').closest('article')).toHaveAttribute(
      'data-disabled',
      'true'
    )
  })

  it('renders a non-link fallback for comments without a parent post id', () => {
    mockUseUserComments.mockReturnValue({
      data: [{ ...baseComment, postId: '' }],
      isLoading: false,
    })

    render(<CommunitySection userId="user-1" isOwner />)

    fireEvent.click(screen.getAllByRole('tab')[1])
    expect(screen.getByText('My Comment').closest('a')).toBeNull()
    expect(screen.getByText('My Comment').closest('article')).toHaveAttribute(
      'data-disabled',
      'true'
    )
  })
})
