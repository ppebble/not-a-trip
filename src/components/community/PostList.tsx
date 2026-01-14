'use client'

import { useRouter } from 'next/navigation'
import { usePosts, Post } from '@/hooks/usePosts'

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diff / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diff / (1000 * 60))
      return diffMinutes <= 0 ? '방금 전' : `${diffMinutes}분 전`
    }
    return `${diffHours}시간 전`
  }

  if (diffDays === 1) return '어제'
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 조회수를 포맷팅 (1000 이상일 경우 K 단위로 표시)
 */
function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

interface PostItemProps {
  post: Post
  onClick: () => void
}

/**
 * 개별 게시글 아이템 컴포넌트
 * Requirements 5.1: 제목, 작성자, 날짜, 조회수 표시
 */
function PostItem({ post, onClick }: PostItemProps) {
  return (
    <article
      onClick={onClick}
      className="cursor-pointer border-b border-navy-100 p-4 transition-colors hover:bg-navy-50"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* 게시글 정보 */}
        <div className="min-w-0 flex-1">
          {/* 제목 */}
          <h3 className="mb-2 truncate text-base font-semibold text-navy-800 hover:text-navy-600">
            {post.title}
          </h3>

          {/* 메타 정보: 작성자, 날짜 */}
          <div className="flex items-center gap-3 text-sm text-navy-500">
            {/* 작성자 */}
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{post.author}</span>
            </span>

            {/* 날짜 */}
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(post.createdAt)}</span>
            </span>
          </div>
        </div>

        {/* 통계 정보: 조회수, 댓글수 */}
        <div className="flex flex-shrink-0 items-center gap-4 text-sm text-navy-400">
          {/* 조회수 */}
          <span className="flex items-center gap-1" title="조회수">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{formatViewCount(post.viewCount)}</span>
          </span>

          {/* 댓글수 */}
          <span className="flex items-center gap-1" title="댓글수">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.commentCount}</span>
          </span>
        </div>
      </div>
    </article>
  )
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function PostListSkeleton() {
  return (
    <div className="divide-y divide-navy-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse p-4">
          <div className="mb-2 h-5 w-3/4 rounded bg-navy-200"></div>
          <div className="flex gap-4">
            <div className="h-4 w-20 rounded bg-navy-100"></div>
            <div className="h-4 w-24 rounded bg-navy-100"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 에러 표시 컴포넌트
 */
function PostListError({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 text-4xl">😢</div>
      <p className="mb-2 text-navy-700">게시글을 불러오는데 실패했습니다</p>
      <p className="mb-4 text-sm text-navy-500">{error.message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-navy-600 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-700"
      >
        다시 시도
      </button>
    </div>
  )
}

/**
 * 빈 목록 표시 컴포넌트
 */
function PostListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 text-4xl">📝</div>
      <p className="mb-2 text-navy-700">아직 게시글이 없습니다</p>
      <p className="text-sm text-navy-500">첫 번째 게시글을 작성해보세요!</p>
    </div>
  )
}

interface PostListProps {
  className?: string
  filterType?: 'all' | 'general' | 'spot' | 'media'
  spotId?: string
  mediaTitle?: string
}

/**
 * PostList 컴포넌트
 *
 * 커뮤니티 게시판의 게시글 목록을 표시합니다.
 *
 * Requirements:
 * - 5.1: 게시글 목록에 제목, 작성자, 날짜, 조회수 표시
 */
export default function PostList({
  className = '',
  filterType = 'all',
  spotId,
  mediaTitle,
}: PostListProps) {
  const router = useRouter()
  const {
    data: allPosts,
    isLoading,
    error,
    refetch,
  } = usePosts({ spotId, mediaTitle })

  // 필터 타입에 따라 게시글 필터링 (spotId/mediaTitle이 없을 때만 적용)
  const posts = allPosts?.filter((post) => {
    // spotId나 mediaTitle이 지정된 경우 필터링 없이 모두 표시
    if (spotId || mediaTitle) return true

    if (filterType === 'all') return true
    if (filterType === 'general') return !post.spotId && !post.mediaTitle
    if (filterType === 'spot') return !!post.spotId
    if (filterType === 'media') return !!post.mediaTitle
    return true
  })

  // 게시글 클릭 핸들러
  const handlePostClick = (postId: string) => {
    router.push(`/community/${postId}`)
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`rounded-lg bg-white shadow-sm ${className}`}>
        <PostListSkeleton />
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`rounded-lg bg-white shadow-sm ${className}`}>
        <PostListError error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  // 빈 목록
  if (!posts || posts.length === 0) {
    return (
      <div className={`rounded-lg bg-white shadow-sm ${className}`}>
        <PostListEmpty />
      </div>
    )
  }

  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow-sm ${className}`}
    >
      {/* 게시글 목록 */}
      <div className="divide-y divide-navy-100">
        {posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            onClick={() => handlePostClick(post.id)}
          />
        ))}
      </div>

      {/* 목록 하단 정보 */}
      <div className="border-t border-navy-100 bg-navy-50 px-4 py-3">
        <p className="text-center text-sm text-navy-500">
          총 {posts.length}개의 게시글
        </p>
      </div>
    </div>
  )
}
