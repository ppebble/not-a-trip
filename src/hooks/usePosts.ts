import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types for post data
export interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  viewCount: number
  commentCount: number
  spotId?: string
  mediaTitle?: string
  userId?: string
  isGuest?: boolean
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
  userId?: string
  isGuest?: boolean
}

export interface CreatePostInput {
  title: string
  content: string
  author: string
  spotId?: string
  mediaTitle?: string
}

export interface CreateCommentInput {
  postId: string
  content: string
  author: string
  password?: string
}

export interface UpdatePostInput {
  postId: string
  title?: string
  content?: string
}

// API response types
interface PostsResponse {
  posts: Post[]
  total: number
}

interface CommentsResponse {
  comments: Comment[]
  total: number
}

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...postKeys.lists(), { filters }] as const,
  bySpot: (spotId: string) => [...postKeys.lists(), 'spot', spotId] as const,
  byMedia: (mediaTitle: string) =>
    [...postKeys.lists(), 'media', mediaTitle] as const,
  byType: (type: string) => [...postKeys.lists(), 'type', type] as const,
  bySearch: (search: string, type?: string) =>
    [...postKeys.lists(), 'search', search, type || 'all'] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  comments: (postId: string) =>
    [...postKeys.detail(postId), 'comments'] as const,
}

/**
 * Hook to fetch all posts for community board
 * Supports optional filtering by spotId, mediaTitle, type, or search
 */
export function usePosts(filters?: {
  spotId?: string
  mediaTitle?: string
  type?: 'general'
  search?: string
}) {
  const { spotId, mediaTitle, type, search } = filters || {}

  const getQueryKey = () => {
    if (search) return postKeys.bySearch(search, type)
    if (spotId) return postKeys.bySpot(spotId)
    if (mediaTitle) return postKeys.byMedia(mediaTitle)
    if (type) return postKeys.byType(type)
    return postKeys.lists()
  }

  return useQuery({
    queryKey: getQueryKey(),
    queryFn: async (): Promise<Post[]> => {
      const params = new URLSearchParams()
      if (spotId) params.set('spotId', spotId)
      if (mediaTitle) params.set('mediaTitle', mediaTitle)
      if (type) params.set('type', type)
      if (search) params.set('search', search)

      const url = `/api/posts${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts: ${response.status} ${response.statusText}`
        )
      }

      const data: PostsResponse = await response.json()

      // Convert date strings to Date objects
      return data.posts.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      }))
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for posts (more dynamic content)
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  })
}

/**
 * Hook to fetch posts for a specific spot
 * Requirements: 3.1, 5.1
 */
export function usePostsBySpot(spotId: string | null) {
  return useQuery({
    queryKey: postKeys.bySpot(spotId || ''),
    queryFn: async (): Promise<Post[]> => {
      if (!spotId) {
        throw new Error('Spot ID is required')
      }

      const response = await fetch(`/api/posts?spotId=${spotId}`)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts: ${response.status} ${response.statusText}`
        )
      }

      const data: PostsResponse = await response.json()

      // Convert date strings to Date objects
      return data.posts.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      }))
    },
    enabled: !!spotId,
    staleTime: 2 * 60 * 1000, // 2 minutes for posts
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  })
}

/**
 * Hook to fetch posts for a specific media title
 * Requirements: 5.1
 */
export function usePostsByMedia(mediaTitle: string | null) {
  return useQuery({
    queryKey: postKeys.byMedia(mediaTitle || ''),
    queryFn: async (): Promise<Post[]> => {
      if (!mediaTitle) {
        throw new Error('Media title is required')
      }

      const response = await fetch(
        `/api/posts?mediaTitle=${encodeURIComponent(mediaTitle)}`
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts: ${response.status} ${response.statusText}`
        )
      }

      const data: PostsResponse = await response.json()

      // Convert date strings to Date objects
      return data.posts.map((post) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      }))
    },
    enabled: !!mediaTitle,
    staleTime: 2 * 60 * 1000, // 2 minutes for posts
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  })
}

/**
 * Hook to fetch a specific post detail
 */
export function usePostDetail(postId: string | null) {
  return useQuery({
    queryKey: postKeys.detail(postId || ''),
    queryFn: async (): Promise<Post> => {
      if (!postId) {
        throw new Error('Post ID is required')
      }

      const response = await fetch(`/api/posts/${postId}`)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch post: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      // API returns Post object directly (not wrapped in { post: ... })
      return {
        ...data,
        createdAt: new Date(data.createdAt),
      }
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes for individual posts
  })
}

/**
 * Hook to fetch comments for a specific post
 */
export function useComments(postId: string | null) {
  return useQuery({
    queryKey: postKeys.comments(postId || ''),
    queryFn: async (): Promise<Comment[]> => {
      if (!postId) {
        throw new Error('Post ID is required')
      }

      const response = await fetch(`/api/posts/${postId}/comments`)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch comments: ${response.status} ${response.statusText}`
        )
      }

      const data: CommentsResponse = await response.json()

      // Convert date strings to Date objects and sort by creation time
      return data.comments
        .map((comment) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    },
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1 minute for comments (very dynamic)
    gcTime: 3 * 60 * 1000, // 3 minutes cache time
  })
}

/**
 * Hook to create a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePostInput): Promise<Post> => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(
          `Failed to create post: ${response.status} ${response.statusText}`
        )
      }

      // API returns Post object directly (not wrapped in { post: ... })
      const result = await response.json()
      return {
        ...result,
        createdAt: new Date(result.createdAt),
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate posts list to refetch with new post
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      // If post is linked to a spot, invalidate spot posts
      if (variables.spotId) {
        queryClient.invalidateQueries({
          queryKey: postKeys.bySpot(variables.spotId),
        })
      }
    },
  })
}

/**
 * Hook to create a new comment
 * Requirements: 5.4, 16.8.6
 *
 * 비회원 댓글 작성 시 password 필드 필요
 */
export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCommentInput): Promise<Comment> => {
      const response = await fetch(`/api/posts/${data.postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: data.content,
          author: data.author,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.details?.[0] ||
            errorData.error ||
            `Failed to create comment: ${response.status} ${response.statusText}`
        )
      }

      // API returns Comment object directly (not wrapped in { comment: ... })
      const result = await response.json()
      return {
        ...result,
        createdAt: new Date(result.createdAt),
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({
        queryKey: postKeys.comments(variables.postId),
      })
      // Also invalidate post detail to update comment count
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      })
    },
  })
}

/**
 * Hook to delete a comment
 * Requirements: 5.4, 16.8.8
 *
 * 비회원 댓글 삭제 시 password 필드 필요
 */
export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      postId: string
      commentId: string
      password?: string
    }): Promise<void> => {
      const response = await fetch(
        `/api/posts/${data.postId}/comments/${data.commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: data.password }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(
          errorData.error ||
            `Failed to delete comment: ${response.status} ${response.statusText}`
        ) as Error & { requirePassword?: boolean }
        error.requirePassword = errorData.requirePassword
        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate comments for this post
      queryClient.invalidateQueries({
        queryKey: postKeys.comments(variables.postId),
      })
      // Also invalidate post detail to update comment count
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      })
    },
  })
}

/**
 * Hook to update an existing post
 * Requirements: 5.7, 16.8.7
 *
 * 비회원 게시글 수정 시 password 필드 필요
 */
export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      data: UpdatePostInput & { password?: string }
    ): Promise<Post> => {
      const response = await fetch(`/api/posts/${data.postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(
          errorData.error ||
            `Failed to update post: ${response.status} ${response.statusText}`
        ) as Error & { requirePassword?: boolean }
        error.requirePassword = errorData.requirePassword
        throw error
      }

      const result = await response.json()
      return {
        ...result,
        createdAt: new Date(result.createdAt),
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate post detail to refetch updated data
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      })
      // Invalidate posts list to update title if changed
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

/**
 * Hook to delete a post
 * Requirements: 5.8, 5.9, 16.8.7
 *
 * 비회원 게시글 삭제 시 password 필드 필요
 */
export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      postId: string
      password?: string
    }): Promise<void> => {
      const response = await fetch(`/api/posts/${data.postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: data.password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(
          errorData.error ||
            `Failed to delete post: ${response.status} ${response.statusText}`
        ) as Error & { requirePassword?: boolean }
        error.requirePassword = errorData.requirePassword
        throw error
      }
    },
    onSuccess: (_, data) => {
      // Remove post from cache
      queryClient.removeQueries({
        queryKey: postKeys.detail(data.postId),
      })
      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}
