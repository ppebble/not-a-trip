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
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
}

export interface CreatePostInput {
  title: string
  content: string
  author: string
}

export interface CreateCommentInput {
  postId: string
  content: string
  author: string
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
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  comments: (postId: string) =>
    [...postKeys.detail(postId), 'comments'] as const,
}

/**
 * Hook to fetch all posts for community board
 */
export function usePosts() {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: async (): Promise<Post[]> => {
      const response = await fetch('/api/posts')

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
    onSuccess: () => {
      // Invalidate posts list to refetch with new post
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

/**
 * Hook to create a new comment
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
        }),
      })

      if (!response.ok) {
        throw new Error(
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
