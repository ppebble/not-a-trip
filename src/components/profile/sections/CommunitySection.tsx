'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { SubTabNavigation } from '@/components/profile/SubTabNavigation'
import { useUserPosts, useUserComments } from '@/hooks/useUserQueries'
import { buildCommunityDetailHref } from '@/lib/community-routes'
import type { UserPost, UserComment } from '@/types/profile'

interface CommunitySectionProps {
  userId: string
  isOwner: boolean
}

type CommunityTab = 'posts' | 'comments'

const COMMUNITY_TABS = [
  { key: 'posts', label: '내 게시글' },
  { key: 'comments', label: '내 댓글' },
] as const

/**
 * 날짜 포맷 함수
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 커뮤니티 섹션 컴포넌트 — 내 게시글, 내 댓글
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 11.2, 11.3
 */
export function CommunitySection({ userId, isOwner }: CommunitySectionProps) {
  const [activeTab, setActiveTab] = useState<CommunityTab>('posts')

  const isCommentsEnabled = activeTab === 'comments'

  // 내 게시글: 기본 탭이므로 항상 enabled
  const { data: posts = [], isLoading: postsLoading } = useUserPosts(
    userId,
    true
  )
  // 내 댓글: lazy loading
  const { data: comments = [], isLoading: commentsLoading } = useUserComments(
    userId,
    isCommentsEnabled
  )

  return (
    <div>
      {/* 하위 탭 네비게이션 */}
      <div className="mb-5">
        <SubTabNavigation
          tabs={COMMUNITY_TABS as unknown as { key: string; label: string }[]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as CommunityTab)}
        />
      </div>

      {/* 내 게시글 탭 */}
      {activeTab === 'posts' && (
        <PostsTab posts={posts} isLoading={postsLoading} isOwner={isOwner} />
      )}

      {/* 내 댓글 탭 */}
      {activeTab === 'comments' && (
        <CommentsTab comments={comments} isLoading={commentsLoading} />
      )}
    </div>
  )
}

// ── 내 게시글 탭 ──────────────────────────────────────────

interface PostsTabProps {
  posts: UserPost[]
  isLoading: boolean
  isOwner: boolean
}

function PostsTab({ posts, isLoading, isOwner }: PostsTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        message="아직 작성한 게시글이 없습니다"
        actionLabel={isOwner ? '커뮤니티 가기' : undefined}
        actionHref={isOwner ? '/community' : undefined}
      />
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post, index) => (
        <CommunityActivityCard
          key={post.id || `post-${index}`}
          href={buildCommunityDetailHref(post.id)}
        >
          <h3 className="truncate font-semibold text-neutral-800">
            {post.title || post.contentPreview}
          </h3>
          <div className="mt-1.5 flex items-center gap-3 text-sm text-neutral-500">
            <span>{formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </CommunityActivityCard>
      ))}
    </div>
  )
}

// ── 내 댓글 탭 ──────────────────────────────────────────

interface CommentsTabProps {
  comments: UserComment[]
  isLoading: boolean
}

function CommentsTab({ comments, isLoading }: CommentsTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (comments.length === 0) {
    return <EmptyState message="아직 작성한 댓글이 없습니다" />
  }

  return (
    <div className="space-y-3">
      {comments.map((comment, index) => (
        <CommunityActivityCard
          key={comment.id || `comment-${index}`}
          href={buildCommunityDetailHref(comment.postId)}
        >
          <p className="line-clamp-2 text-neutral-800">
            {comment.contentPreview}
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-sm text-neutral-500">
            <span>{formatDate(comment.createdAt)}</span>
            <span>·</span>
            <span className="truncate">
              원문: <span className="text-primary">{comment.postTitle}</span>
            </span>
          </div>
        </CommunityActivityCard>
      ))}
    </div>
  )
}

// ── 공통 컴포넌트 ──────────────────────────────────────────

interface CommunityActivityCardProps {
  href: string | null
  children: ReactNode
}

function CommunityActivityCard({ href, children }: CommunityActivityCardProps) {
  const className =
    'block rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm transition-colors hover:bg-neutral-50'

  if (!href) {
    return (
      <article data-disabled="true" className={className}>
        {children}
      </article>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

interface EmptyStateProps {
  message: string
  actionLabel?: string
  actionHref?: string
}

function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <svg
          className="h-8 w-8 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <p className="text-neutral-500">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  )
}
