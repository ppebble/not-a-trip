// ============================================
// Community Types
// ============================================

export interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
  viewCount: number
  commentCount: number
  spotId?: string
  mediaTitle?: string
  password?: string
  userId?: string
  isGuest: boolean
}

export interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
  password?: string
  userId?: string
  isGuest: boolean
}

export interface CreatePostInput {
  title: string
  content: string
  author?: string
  password?: string
  spotId?: string
  mediaTitle?: string
}

export interface UpdatePostInput {
  title?: string
  content?: string
  spotId?: string | null
  mediaTitle?: string | null
  password?: string
}

export interface CreateCommentInput {
  postId: string
  content: string
  author?: string
  password?: string
}

// ============================================
// Community Summary Types
// ============================================

export interface SpotCommunitySummary {
  id: string
  name: string
  thumbnailUrl: string
  postCount: number
}

export interface MediaCommunitySummary {
  title: string
  type: 'anime' | 'drama' | 'movie' | 'other'
  postCount: number
  /** 작품 대표 이미지 URL */
  imageUrl?: string
}
