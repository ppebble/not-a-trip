'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePostsByMedia, Post } from '@/hooks/usePosts'

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
        <div className="min-w-0 flex-1">
          <h3 className="mb-2 truncate text-base font-semibold text-navy-800 hover:text-navy-600">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-navy-500">
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
        <div className="flex flex-shrink-0 items-center gap-4 text-sm text-navy-400">
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

function PostListEmpty({ mediaTitle }: { mediaTitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 text-4xl">📝</div>
      <p className="mb-2 text-navy-700">
        &apos;{mediaTitle}&apos; 관련 게시글이 없습니다
      </p>
      <p className="text-sm text-navy-500">첫 번째 게시글을 작성해보세요!</p>
    </div>
  )
}

interface PageProps {
  params: Promise<{ title: string }>
}

/**
 * 작품별 커뮤니티 페이지
 * Requirements 5.1: 특정 작품 관련 게시글 목록 표시
 */
export default function MediaCommunityPage({ params }: PageProps) {
  const { title } = use(params)
  const mediaTitle = decodeURIComponent(title)
  const router = useRouter()
  const { data: posts, isLoading, error, refetch } = usePostsByMedia(mediaTitle)

  const handlePostClick = (postId: string) => {
    router.push(`/community/${postId}`)
  }

  return (
    <main className="min-h-screen bg-navy-50">
      {/* 페이지 타이틀 */}
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Link
              href="/community"
              className="text-navy-500 hover:text-navy-700"
            >
              ← 커뮤니티
            </Link>
          </div>
          <h1 className="mt-2 text-xl font-bold text-navy-800">{mediaTitle}</h1>
          <p className="text-sm text-navy-500">작품 관련 게시글</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 작품 정보 배너 */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-navy-700 to-navy-600 p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>
            <div>
              <h2 className="text-lg font-bold">{mediaTitle}</h2>
              <p className="text-sm text-navy-200">
                이 작품에 대한 이야기를 나눠보세요
              </p>
            </div>
          </div>
        </div>

        {/* 글쓰기 버튼 */}
        <div className="mb-4 flex justify-end">
          <Link
            href={`/community/write?mediaTitle=${encodeURIComponent(mediaTitle)}`}
            className="flex items-center gap-2 rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            글쓰기
          </Link>
        </div>

        {/* 게시글 목록 */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          {isLoading ? (
            <PostListSkeleton />
          ) : error ? (
            <PostListError error={error} onRetry={() => refetch()} />
          ) : !posts || posts.length === 0 ? (
            <PostListEmpty mediaTitle={mediaTitle} />
          ) : (
            <>
              <div className="divide-y divide-navy-100">
                {posts.map((post) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    onClick={() => handlePostClick(post.id)}
                  />
                ))}
              </div>
              <div className="border-t border-navy-100 bg-navy-50 px-4 py-3">
                <p className="text-center text-sm text-navy-500">
                  총 {posts.length}개의 게시글
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
