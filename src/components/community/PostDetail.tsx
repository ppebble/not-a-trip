'use client'

import Link from 'next/link'
import { usePostDetail, Post } from '@/hooks/usePosts'

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function PostDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-8 w-3/4 rounded bg-navy-200"></div>
      <div className="mb-6 flex gap-4">
        <div className="h-4 w-20 rounded bg-navy-100"></div>
        <div className="h-4 w-32 rounded bg-navy-100"></div>
        <div className="h-4 w-16 rounded bg-navy-100"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-navy-100"></div>
        <div className="h-4 w-full rounded bg-navy-100"></div>
        <div className="h-4 w-2/3 rounded bg-navy-100"></div>
      </div>
    </div>
  )
}

/**
 * 에러 표시 컴포넌트
 */
function PostDetailError({
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

interface PostContentProps {
  post: Post
}

/**
 * 게시글 내용 컴포넌트
 * Requirements 5.3: 게시글 전체 내용 표시
 */
function PostContent({ post }: PostContentProps) {
  return (
    <article className="rounded-lg bg-white p-6 shadow-sm">
      {/* 게시글 헤더 */}
      <header className="mb-6 border-b border-navy-100 pb-4">
        <h1 className="mb-4 text-2xl font-bold text-navy-800">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-navy-500">
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

          {/* 작성일 */}
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

          {/* 조회수 */}
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>조회 {post.viewCount}</span>
          </span>

          {/* 댓글수 */}
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>댓글 {post.commentCount}</span>
          </span>
        </div>
      </header>

      {/* 게시글 본문 */}
      <div className="prose prose-navy max-w-none">
        <p className="whitespace-pre-wrap text-navy-700">{post.content}</p>
      </div>

      {/* 하단 네비게이션 */}
      <footer className="mt-8 border-t border-navy-100 pt-4">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm text-navy-600 transition-colors hover:text-navy-800"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          목록으로 돌아가기
        </Link>
      </footer>
    </article>
  )
}

interface PostDetailProps {
  postId: string
  className?: string
}

/**
 * PostDetail 컴포넌트
 *
 * 게시글 상세 내용을 표시합니다.
 *
 * Requirements:
 * - 5.3: 게시글 전체 내용 표시 및 댓글 허용
 */
export default function PostDetail({
  postId,
  className = '',
}: PostDetailProps) {
  const { data: post, isLoading, error, refetch } = usePostDetail(postId)

  if (isLoading) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
        <PostDetailSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-lg bg-white shadow-sm ${className}`}>
        <PostDetailError error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  if (!post) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
        <p className="text-center text-navy-500">게시글을 찾을 수 없습니다</p>
      </div>
    )
  }

  return <PostContent post={post} />
}
