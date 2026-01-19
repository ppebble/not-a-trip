'use client'

import { useState, FormEvent } from 'react'
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  Comment,
} from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import PasswordModal from './PasswordModal'

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

interface CommentItemProps {
  comment: Comment
  postId: string
  currentUserId?: string
  onDeleteClick: (comment: Comment) => void
}

/**
 * 개별 댓글 아이템 컴포넌트
 * Requirements 5.4: 댓글 시간순 표시
 */
function CommentItem({
  comment,
  currentUserId,
  onDeleteClick,
}: CommentItemProps) {
  // 삭제 권한 확인: 회원은 본인 댓글만, 비회원은 비밀번호로 삭제
  const canDelete =
    comment.isGuest || (currentUserId && comment.userId === currentUserId)

  return (
    <div className="border-b border-navy-100 py-4 last:border-b-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 작성자 아바타 */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-200 text-sm font-medium text-navy-600">
            {comment.author.charAt(0).toUpperCase()}
          </div>
          {/* 작성자 정보 */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-navy-700">
                {comment.author}
              </span>
              {comment.isGuest && (
                <span className="rounded bg-navy-100 px-1.5 py-0.5 text-xs text-navy-500">
                  비회원
                </span>
              )}
            </div>
            <span className="text-xs text-navy-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
        </div>
        {/* 삭제 버튼 */}
        {canDelete && (
          <button
            onClick={() => onDeleteClick(comment)}
            className="text-xs text-navy-400 transition-colors hover:text-red-500"
            title="댓글 삭제"
          >
            삭제
          </button>
        )}
      </div>
      {/* 댓글 내용 */}
      <p className="ml-11 whitespace-pre-wrap text-sm text-navy-600">
        {comment.content}
      </p>
    </div>
  )
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function CommentListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse border-b border-navy-100 py-4">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-navy-200"></div>
            <div className="space-y-1">
              <div className="h-4 w-20 rounded bg-navy-200"></div>
              <div className="h-3 w-16 rounded bg-navy-100"></div>
            </div>
          </div>
          <div className="ml-11 h-4 w-3/4 rounded bg-navy-100"></div>
        </div>
      ))}
    </div>
  )
}

/**
 * 빈 댓글 목록 컴포넌트
 */
function CommentListEmpty() {
  return (
    <div className="py-8 text-center">
      <div className="mb-2 text-3xl">💬</div>
      <p className="text-sm text-navy-500">아직 댓글이 없습니다</p>
      <p className="text-xs text-navy-400">첫 번째 댓글을 남겨보세요!</p>
    </div>
  )
}

interface CommentFormProps {
  postId: string
  onSuccess?: () => void
}

/**
 * 댓글 작성 폼 컴포넌트
 * Requirements 5.3, 5.4, 16.8.5: 댓글 작성 기능 (회원/비회원 구분)
 */
function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createComment = useCreateComment()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // 유효성 검사
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요')
      return
    }

    // 비회원인 경우 비밀번호 필수
    if (!isAuthenticated && !password.trim()) {
      setError('비회원은 비밀번호가 필수입니다')
      return
    }

    if (!isAuthenticated && password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다')
      return
    }

    try {
      await createComment.mutateAsync({
        postId,
        content: content.trim(),
        author: isAuthenticated
          ? user?.name || user?.email?.split('@')[0] || '회원'
          : author.trim() || '익명',
        password: isAuthenticated ? undefined : password,
      })

      // 성공 시 폼 초기화
      setContent('')
      setAuthor('')
      setPassword('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성에 실패했습니다')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 로그인 상태 표시 */}
      {isAuthLoading ? (
        <div className="h-10 animate-pulse rounded-lg bg-navy-100"></div>
      ) : isAuthenticated ? (
        <div className="flex items-center gap-2 rounded-lg bg-navy-50 px-4 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-200 text-xs font-medium text-navy-600">
            {(user?.name || user?.email || '회')[0].toUpperCase()}
          </div>
          <span className="text-sm text-navy-700">
            {user?.name || user?.email?.split('@')[0] || '회원'}
          </span>
          <span className="text-xs text-navy-400">(으)로 작성</span>
        </div>
      ) : (
        /* 비회원: 닉네임 + 비밀번호 한 줄 입력 */
        <div className="flex gap-2">
          <input
            id="comment-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="닉네임"
            className="w-1/3 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 placeholder-navy-400 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            maxLength={20}
          />
          <input
            id="comment-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (4자 이상) *"
            className="w-2/3 rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700 placeholder-navy-400 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            maxLength={20}
          />
        </div>
      )}

      {/* 댓글 내용 입력 */}
      <div>
        <label
          htmlFor="comment-content"
          className="mb-1 block text-sm font-medium text-navy-700"
        >
          댓글 내용
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력해주세요"
          rows={3}
          className="w-full resize-none rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-700 placeholder-navy-400 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
          maxLength={500}
        />
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={createComment.isPending}
          className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createComment.isPending ? '작성 중...' : '댓글 작성'}
        </button>
      </div>
    </form>
  )
}

interface CommentSectionProps {
  postId: string
  className?: string
}

/**
 * CommentSection 컴포넌트
 *
 * 게시글의 댓글 목록과 댓글 작성 폼을 표시합니다.
 *
 * Requirements:
 * - 5.3: 게시글에 댓글 허용
 * - 5.4: 댓글 시간순 정렬 표시
 * - 16.8.5: 비회원 비밀번호 입력 필드
 * - 16.8.8: 댓글 삭제 권한 검증
 */
export default function CommentSection({
  postId,
  className = '',
}: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const { data: comments, isLoading, error, refetch } = useComments(postId)
  const deleteComment = useDeleteComment()

  // 삭제 모달 상태
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const currentUserId = isAuthenticated
    ? user?.id || user?.email || undefined
    : undefined

  // 댓글 삭제 클릭 핸들러
  const handleDeleteClick = (comment: Comment) => {
    setDeleteTarget(comment)
    setDeleteError(null)
  }

  // 댓글 삭제 확인 핸들러
  const handleDeleteConfirm = async (password?: string) => {
    if (!deleteTarget) return

    try {
      await deleteComment.mutateAsync({
        postId,
        commentId: deleteTarget.id,
        password: deleteTarget.isGuest ? password : undefined,
      })
      setDeleteTarget(null)
      setDeleteError(null)
    } catch (err) {
      const error = err as Error & { requirePassword?: boolean }
      if (error.requirePassword) {
        // 비밀번호 필요 - 모달 유지
        setDeleteError('비밀번호를 입력해주세요')
      } else {
        setDeleteError(error.message || '댓글 삭제에 실패했습니다')
      }
    }
  }

  // 회원 댓글 삭제 (비밀번호 불필요)
  const handleMemberDelete = () => {
    if (deleteTarget && !deleteTarget.isGuest) {
      handleDeleteConfirm()
    }
  }

  return (
    <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
      {/* 섹션 헤더 */}
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy-800">
        <svg
          className="h-5 w-5"
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
        댓글 {comments ? `(${comments.length})` : ''}
      </h2>

      {/* 댓글 작성 폼 */}
      <div className="mb-6 border-b border-navy-100 pb-6">
        <CommentForm postId={postId} onSuccess={() => refetch()} />
      </div>

      {/* 댓글 목록 */}
      <div>
        {isLoading ? (
          <CommentListSkeleton />
        ) : error ? (
          <div className="py-4 text-center">
            <p className="mb-2 text-sm text-navy-500">
              댓글을 불러오는데 실패했습니다
            </p>
            <button
              onClick={() => refetch()}
              className="text-sm text-navy-600 hover:text-navy-800"
            >
              다시 시도
            </button>
          </div>
        ) : !comments || comments.length === 0 ? (
          <CommentListEmpty />
        ) : (
          <div>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* 비회원 댓글 삭제 비밀번호 모달 */}
      {deleteTarget?.isGuest && (
        <PasswordModal
          isOpen={!!deleteTarget}
          title="댓글 삭제"
          description="댓글 작성 시 입력한 비밀번호를 입력해주세요."
          isLoading={deleteComment.isPending}
          error={deleteError}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteTarget(null)
            setDeleteError(null)
          }}
        />
      )}

      {/* 회원 댓글 삭제 확인 모달 */}
      {deleteTarget && !deleteTarget.isGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-navy-800">
              댓글 삭제
            </h3>
            <p className="mb-4 text-sm text-navy-600">
              이 댓글을 삭제하시겠습니까?
            </p>
            {deleteError && (
              <p className="mb-4 text-sm text-red-500">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteComment.isPending}
                className="rounded-lg border border-navy-300 px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleMemberDelete}
                disabled={deleteComment.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {deleteComment.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
