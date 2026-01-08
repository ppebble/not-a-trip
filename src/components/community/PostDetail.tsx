'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePostDetail, useDeletePost, Post } from '@/hooks/usePosts'

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
      <div className="relative z-10 mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
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
          <h3 className="text-lg font-semibold text-navy-800">게시글 삭제</h3>
        </div>

        <p className="mb-6 text-navy-600">
          정말로 이 게시글을 삭제하시겠습니까?
          <br />
          <span className="text-sm text-navy-500">
            삭제된 게시글과 댓글은 복구할 수 없습니다.
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-navy-300 px-4 py-2 text-sm text-navy-600 transition-colors hover:bg-navy-50 disabled:opacity-50"
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
 */
function PostContent({ post }: PostContentProps) {
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const deletePost = useDeletePost()

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => {
        // Requirements 5.9: 삭제 후 목록 페이지로 리다이렉트
        router.push('/community')
      },
      onError: (error) => {
        alert(`삭제 실패: ${error.message}`)
        setIsDeleteModalOpen(false)
      },
    })
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
  }

  return (
    <>
      <article className="rounded-lg bg-white p-6 shadow-sm">
        {/* 게시글 헤더 */}
        <header className="mb-6 border-b border-navy-100 pb-4">
          <h1 className="mb-4 text-2xl font-bold text-navy-800">
            {post.title}
          </h1>
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
        <footer className="mt-8 flex items-center justify-between border-t border-navy-100 pt-4">
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

          {/* 수정/삭제 버튼 그룹 */}
          <div className="flex items-center gap-2">
            {/* 수정 버튼 - Requirements 5.7 */}
            <Link
              href={`/community/${post.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-navy-300 px-4 py-2 text-sm text-navy-600 transition-colors hover:bg-navy-50"
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
            </Link>

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
        </footer>
      </article>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        isDeleting={deletePost.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
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
