'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePostsBySpot, Post } from '@/hooks/usePosts'
import { formatRelativeDate } from '@/lib/date-utils'

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
      className="cursor-pointer border-b border-neutral-100 p-4 transition-colors last:border-b-0 hover:bg-neutral-50"
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
          <h4 className="mb-1 truncate text-sm font-medium text-neutral-900">
            {post.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatRelativeDate(post.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
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
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
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
            {post.commentCount}
          </span>
        </div>
      </div>
    </article>
  )
}

/**
 * 로딩 스켈레톤
 */
function CommunitySkeleton() {
  return (
    <div className="divide-y divide-neutral-100">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse p-4">
          <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200"></div>
          <div className="flex gap-2">
            <div className="h-3 w-16 rounded bg-neutral-100"></div>
            <div className="h-3 w-20 rounded bg-neutral-100"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 빈 목록 표시
 */
function CommunityEmpty({
  spotId,
  spotName,
}: {
  spotId: string
  spotName: string
}) {
  return (
    <div className="py-8 text-center">
      <div className="mb-3 text-3xl">💬</div>
      <p className="mb-2 text-neutral-600">
        아직 이 스팟에 대한 게시글이 없습니다
      </p>
      <p className="mb-4 text-sm text-neutral-500">
        첫 번째 후기를 남겨보세요!
      </p>
      <Link
        href={`/community/write?spotId=${spotId}&spotName=${encodeURIComponent(spotName)}`}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
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
        게시글 작성
      </Link>
    </div>
  )
}

interface SpotCommunitySectionProps {
  spotId: string
  spotName: string
  maxPosts?: number
}

/**
 * 스팟 상세 페이지의 커뮤니티 섹션
 *
 * Requirements:
 * - 3.1: 스팟 상세 페이지에서 종합적인 정보 표시
 * - 5.1: 게시글 목록에 제목, 작성자, 날짜, 조회수 표시
 */
export default function SpotCommunitySection({
  spotId,
  spotName,
  maxPosts = 5,
}: SpotCommunitySectionProps) {
  const router = useRouter()
  const { data: posts, isLoading, error } = usePostsBySpot(spotId)

  const handlePostClick = (postId: string) => {
    router.push(`/community/${postId}`)
  }

  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-md dark:bg-neutral-800">
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">커뮤니티</h2>
          {/* 게시글이 있을 때만 헤더에 글쓰기 버튼 표시 */}
          {posts && posts.length > 0 && (
            <Link
              href={`/community/write?spotId=${spotId}&spotName=${encodeURIComponent(spotName)}`}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
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
          )}
        </div>

        {/* 콘텐츠 */}
        {isLoading ? (
          <CommunitySkeleton />
        ) : error ? (
          <div className="py-8 text-center text-neutral-500">
            게시글을 불러오는데 실패했습니다
          </div>
        ) : !posts || posts.length === 0 ? (
          <CommunityEmpty spotId={spotId} spotName={spotName} />
        ) : (
          <>
            <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {posts.slice(0, maxPosts).map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post.id)}
                />
              ))}
            </div>

            {/* 더보기 링크 */}
            {posts.length > maxPosts && (
              <div className="mt-4 text-center">
                <Link
                  href={`/community?spotId=${spotId}`}
                  className="text-sm text-primary hover:text-primary-600 hover:underline"
                >
                  게시글 {posts.length}개 전체보기 →
                </Link>
              </div>
            )}

            {posts.length <= maxPosts && posts.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-500">
                  총 {posts.length}개의 게시글
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
