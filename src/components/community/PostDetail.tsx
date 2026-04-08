'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePostDetail, useDeletePost, Post } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import PasswordModal from './PasswordModal'
import { formatFullDate } from '@/lib/date-utils'

/**
 * 로딩 스켈레톤 컴포넌트
 */
function PostDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-8 w-3/4 rounded bg-border"></div>
      <div className="mb-6 flex gap-4">
        <div className="h-4 w-20 rounded bg-surface"></div>
        <div className="h-4 w-32 rounded bg-surface"></div>
        <div className="h-4 w-16 rounded bg-surface"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-surface"></div>
        <div className="h-4 w-full rounded bg-surface"></div>
        <div className="h-4 w-2/3 rounded bg-surface"></div>
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
      <p className="text-text-secondary mb-2">
        게시글을 불러오는데 실패했습니다
      </p>
      <p className="mb-4 text-sm text-secondary">{error.message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-700"
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
 * 삭제 확인 모달 컴포넌트
 * Requirements 5.8, 5.9: 게시글 삭제 확인 및 리다이렉트
 */
interface DeleteConfirmModalProps {
  isOpen: boolean
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmModal({
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* 모달 콘텐츠 */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-lg bg-surface p-6 shadow-xl dark:bg-neutral-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-800">
            게시글 삭제
          </h3>
        </div>

        <p className="mb-6 text-primary">
          정말로 이 게시글을 삭제하시겠습니까?
          <br />
          <span className="text-sm text-secondary">
            삭제된 게시글과 댓글은 복구할 수 없습니다.
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * 게시글 내용 컴포넌트
 * Requirements 5.3: 게시글 전체 내용 표시
 * Requirements 5.8, 5.9: 게시글 삭제 기능
 * Requirements 16.8.7, 16.8.9: 비회원 게시글 비밀번호 검증
 */
function PostContent({ post }: PostContentProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const deletePost = useDeletePost()

  // 현재 사용자가 게시글 작성자인지 확인
  const isOwner = () => {
    if (post.isGuest) {
      // 비회원 게시글은 비밀번호로 확인
      return true // 비밀번호 모달로 확인
    }
    // 회원 게시글은 userId로 확인
    if (!isAuthenticated || !user) return false
    const currentUserId = user.id || user.email
    return post.userId === currentUserId
  }

  // 수정/삭제 버튼 표시 여부
  const canModify = () => {
    if (post.isGuest) return true // 비회원 게시글은 비밀번호로 확인
    return isOwner()
  }

  const handleDeleteClick = () => {
    if (post.isGuest) {
      // 비회원 게시글: 비밀번호 모달 표시
      setPasswordError(null)
      setIsPasswordModalOpen(true)
    } else if (isOwner()) {
      // 회원 게시글 + 본인: 삭제 확인 모달 표시
      setIsDeleteModalOpen(true)
    } else {
      // 회원 게시글 + 타인: 권한 없음
      alert('본인의 게시글만 삭제할 수 있습니다.')
    }
  }

  const handleEditClick = () => {
    if (post.isGuest) {
      // 비회원 게시글: 수정 페이지에서 비밀번호 확인
      router.push(`/community/${post.id}/edit`)
    } else if (isOwner()) {
      // 회원 게시글 + 본인: 수정 페이지로 이동
      router.push(`/community/${post.id}/edit`)
    } else {
      // 회원 게시글 + 타인: 권한 없음
      alert('본인의 게시글만 수정할 수 있습니다.')
    }
  }

  /**
   * 게시글 삭제 후 원래 게시판으로 리다이렉트
   * - spotId가 있으면 스팟 커뮤니티로
   * - mediaTitle이 있으면 작품 커뮤니티로
   * - 둘 다 없으면 자유게시판(general 탭)으로
   */
  const getRedirectUrl = () => {
    if (post.spotId) {
      return `/community/spot/${post.spotId}`
    }
    if (post.mediaTitle) {
      return `/community/media/${encodeURIComponent(post.mediaTitle)}`
    }
    // 자유게시판 게시글인 경우 general 탭으로 이동
    return '/community?tab=general'
  }

  // 비회원 게시글 삭제 (비밀번호 확인 후)
  const handlePasswordConfirm = (password: string) => {
    deletePost.mutate(
      { postId: post.id, password },
      {
        onSuccess: () => {
          setIsPasswordModalOpen(false)
          router.push(getRedirectUrl())
        },
        onError: (error) => {
          setPasswordError(error.message)
        },
      }
    )
  }

  // 회원 게시글 삭제 확인
  const handleDeleteConfirm = () => {
    deletePost.mutate(
      { postId: post.id },
      {
        onSuccess: () => {
          router.push(getRedirectUrl())
        },
        onError: (error) => {
          alert(`삭제 실패: ${error.message}`)
          setIsDeleteModalOpen(false)
        },
      }
    )
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
  }

  const handlePasswordCancel = () => {
    setIsPasswordModalOpen(false)
    setPasswordError(null)
  }

  return (
    <>
      <article className="rounded-lg bg-surface p-6 shadow-sm dark:bg-neutral-800">
        {/* 게시글 헤더 */}
        <header className="mb-6 border-b border-neutral-100 pb-4">
          <h1 className="mb-4 text-2xl font-bold text-primary-800">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
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
              <span>{formatFullDate(post.createdAt)}</span>
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
        <div className="prose prose-neutral max-w-none">
          <p className="text-text-secondary whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* 하단 네비게이션 */}
        <footer className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-4">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary-800"
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

          {/* 수정/삭제 버튼 그룹 */}
          {canModify() && (
            <div className="flex items-center gap-2">
              {/* 수정 버튼 - Requirements 5.7 */}
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary-50"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                수정
              </button>

              {/* 삭제 버튼 - Requirements 5.8 */}
              <button
                type="button"
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                삭제
              </button>
            </div>
          )}
        </footer>
      </article>

      {/* 삭제 확인 모달 (회원 게시글용) */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        isDeleting={deletePost.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* 비밀번호 입력 모달 (비회원 게시글용) */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        title="게시글 삭제"
        description="비회원 게시글을 삭제하려면 작성 시 입력한 비밀번호를 입력하세요."
        isLoading={deletePost.isPending}
        error={passwordError}
        onConfirm={handlePasswordConfirm}
        onCancel={handlePasswordCancel}
      />
    </>
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
      <div
        className={`rounded-lg bg-surface p-6 shadow-sm dark:bg-neutral-800 ${className}`}
      >
        <PostDetailSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`rounded-lg bg-surface shadow-sm dark:bg-neutral-800 ${className}`}
      >
        <PostDetailError error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  if (!post) {
    return (
      <div
        className={`rounded-lg bg-surface p-6 shadow-sm dark:bg-neutral-800 ${className}`}
      >
        <p className="text-center text-secondary">게시글을 찾을 수 없습니다</p>
      </div>
    )
  }

  return <PostContent post={post} />
}
