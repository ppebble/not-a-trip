'use client'

import { useState, FormEvent } from 'react'
import { useComments, useCreateComment, Comment } from '@/hooks/usePosts'

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
}

/**
 * 개별 댓글 아이템 컴포넌트
 * Requirements 5.4: 댓글 시간순 표시
 */
function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="border-b border-navy-100 py-4 last:border-b-0">
      <div className="mb-2 flex items-center gap-3">
        {/* 작성자 아바타 */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-200 text-sm font-medium text-navy-600">
          {comment.author.charAt(0).toUpperCase()}
        </div>
        {/* 작성자 정보 */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-navy-700">
            {comment.author}
          </span>
          <span className="text-xs text-navy-400">
            {formatDate(comment.createdAt)}
          </span>
        </div>
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
 * Requirements 5.3, 5.4: 댓글 작성 기능
 */
function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
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

    try {
      await createComment.mutateAsync({
        postId,
        content: content.trim(),
        author: author.trim() || '익명',
      })

      // 성공 시 폼 초기화
      setContent('')
      setAuthor('')
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 작성에 실패했습니다')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 작성자 입력 */}
      <div>
        <label
          htmlFor="comment-author"
          className="mb-1 block text-sm font-medium text-navy-700"
        >
          닉네임 (선택)
        </label>
        <input
          id="comment-author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="익명"
          className="w-full rounded-lg border border-navy-200 px-4 py-2 text-sm text-navy-700 placeholder-navy-400 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
          maxLength={20}
        />
      </div>

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
 */
export default function CommentSection({
  postId,
  className = '',
}: CommentSectionProps) {
  const { data: comments, isLoading, error, refetch } = useComments(postId)

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
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
