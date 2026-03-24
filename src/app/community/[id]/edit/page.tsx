'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { usePostDetail, useUpdatePost } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { validatePostInput } from '@/lib/post-validation'
import PasswordModal from '@/components/community/PasswordModal'

/**
 * 게시글 수정 페이지
 *
 * Requirements:
 * - 5.7: 게시글 수정 시 내용 업데이트 및 수정된 정보 표시
 * - 16.8.7: 비회원 게시글 수정 시 비밀번호 검증
 */
export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  const { user, isAuthenticated } = useAuth()

  // 게시글 데이터 조회
  const { data: post, isLoading, error } = usePostDetail(postId)
  const updatePost = useUpdatePost()

  // 폼 상태
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // 비밀번호 모달 상태 (비회원 게시글용)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  // 에러 상태
  const [errors, setErrors] = useState<string[]>([])

  // 기존 게시글 내용으로 폼 초기화
  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
    }
  }, [post])

  // 회원 게시글 권한 확인
  const canEdit = () => {
    if (!post) return false
    if (post.isGuest) return true // 비회원 게시글은 비밀번호로 확인
    // 회원 게시글은 본인만 수정 가능
    if (!isAuthenticated || !user) return false
    const currentUserId = user.id || user.email
    return post.userId === currentUserId
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    const validationResult = validatePostInput({ title, content })

    if (!validationResult.valid) {
      setErrors(validationResult.errors)
      return
    }

    // 에러 초기화
    setErrors([])

    if (post?.isGuest) {
      // 비회원 게시글: 비밀번호 모달 표시
      setPasswordError(null)
      setPendingSubmit(true)
      setIsPasswordModalOpen(true)
    } else {
      // 회원 게시글: 바로 수정
      await submitUpdate()
    }
  }

  // 실제 수정 요청
  const submitUpdate = async (password?: string) => {
    try {
      await updatePost.mutateAsync({
        postId,
        title: title.trim(),
        content: content.trim(),
        password,
      })

      // 수정 완료 후 상세 페이지로 이동
      router.push(`/community/${postId}`)
    } catch (err) {
      const error = err as Error & { requirePassword?: boolean }
      if (error.requirePassword) {
        setPasswordError('비밀번호가 필요합니다')
      } else {
        setErrors([
          error.message || '게시글 수정에 실패했습니다. 다시 시도해주세요.',
        ])
      }
    }
  }

  // 비밀번호 확인 후 수정
  const handlePasswordConfirm = async (password: string) => {
    setPasswordError(null)
    await submitUpdate(password)
    if (!updatePost.isError) {
      setIsPasswordModalOpen(false)
      setPendingSubmit(false)
    }
  }

  const handlePasswordCancel = () => {
    setIsPasswordModalOpen(false)
    setPendingSubmit(false)
    setPasswordError(null)
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <main className="bg-navy-50 min-h-screen">
        <div className="border-navy-200 border-b bg-white px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-navy-800 text-xl font-bold">게시글 수정</h1>
            <p className="text-navy-500 text-sm">로딩 중...</p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="border-navy-300 border-t-navy-600 h-8 w-8 animate-spin rounded-full border-4" />
          </div>
        </div>
      </main>
    )
  }

  // 에러 상태
  if (error || !post) {
    return (
      <main className="bg-navy-50 min-h-screen">
        <div className="border-navy-200 border-b bg-white px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-navy-800 text-xl font-bold">게시글 수정</h1>
            <p className="text-navy-500 text-sm">오류 발생</p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="text-navy-600">게시글을 찾을 수 없습니다.</p>
            <Link
              href="/community"
              className="text-navy-500 mt-4 inline-block hover:underline"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // 권한 없음 (회원 게시글 + 타인)
  if (!canEdit()) {
    return (
      <main className="bg-navy-50 min-h-screen">
        <div className="border-navy-200 border-b bg-white px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-navy-800 text-xl font-bold">게시글 수정</h1>
            <p className="text-navy-500 text-sm">권한 없음</p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="text-navy-600">본인의 게시글만 수정할 수 있습니다.</p>
            <Link
              href={`/community/${postId}`}
              className="text-navy-500 mt-4 inline-block hover:underline"
            >
              게시글로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-navy-50 min-h-screen">
      {/* 페이지 타이틀 */}
      <div className="border-navy-200 border-b bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-navy-800 text-xl font-bold">게시글 수정</h1>
          <p className="text-navy-500 text-sm">
            {post.isGuest
              ? '비회원 게시글 수정 (비밀번호 필요)'
              : '내용을 수정하세요'}
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {/* 비회원 게시글 안내 */}
          {post.isGuest && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-amber-600"
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
                <p className="text-sm text-amber-800">
                  비회원 게시글입니다. 수정하려면 작성 시 입력한 비밀번호가
                  필요합니다.
                </p>
              </div>
            </div>
          )}

          {/* 에러 메시지 표시 */}
          {errors.length > 0 && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-medium text-red-800">
                    입력 내용을 확인해주세요
                  </h3>
                  <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                    {errors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 수정 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 입력 */}
            <div>
              <label
                htmlFor="title"
                className="text-navy-700 mb-2 block text-sm font-medium"
              >
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="border-navy-200 text-navy-800 placeholder-navy-400 focus:border-navy-500 focus:ring-navy-500/20 w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                maxLength={100}
              />
              <p className="text-navy-400 mt-1 text-right text-xs">
                {title.length}/100
              </p>
            </div>

            {/* 작성자 표시 (수정 불가) */}
            <div>
              <label className="text-navy-700 mb-2 block text-sm font-medium">
                작성자
              </label>
              <div className="flex items-center gap-2">
                <div className="border-navy-100 bg-navy-50 text-navy-600 flex-1 rounded-lg border px-4 py-3">
                  {post.author}
                </div>
                {post.isGuest && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    비회원
                  </span>
                )}
              </div>
              <p className="text-navy-400 mt-1 text-xs">
                작성자는 수정할 수 없습니다
              </p>
            </div>

            {/* 내용 입력 */}
            <div>
              <label
                htmlFor="content"
                className="text-navy-700 mb-2 block text-sm font-medium"
              >
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={10}
                className="border-navy-200 text-navy-800 placeholder-navy-400 focus:border-navy-500 focus:ring-navy-500/20 w-full resize-none rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2"
                maxLength={5000}
              />
              <p className="text-navy-400 mt-1 text-right text-xs">
                {content.length}/5000
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="border-navy-100 flex items-center justify-end gap-3 border-t pt-6">
              <Link
                href={`/community/${postId}`}
                className="border-navy-300 text-navy-600 hover:bg-navy-50 rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={updatePost.isPending || pendingSubmit}
                className="bg-navy-600 hover:bg-navy-700 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatePost.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    수정 중...
                  </span>
                ) : (
                  '수정하기'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 비밀번호 입력 모달 (비회원 게시글용) */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        title="게시글 수정"
        description="비회원 게시글을 수정하려면 작성 시 입력한 비밀번호를 입력하세요."
        isLoading={updatePost.isPending}
        error={passwordError}
        onConfirm={handlePasswordConfirm}
        onCancel={handlePasswordCancel}
      />
    </main>
  )
}
