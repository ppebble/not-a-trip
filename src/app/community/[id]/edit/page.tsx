'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { usePostDetail, useUpdatePost } from '@/hooks/usePosts'
import { validatePostInput } from '@/lib/post-validation'

/**
 * 게시글 수정 페이지
 *
 * Requirements:
 * - 5.7: 게시글 수정 시 내용 업데이트 및 수정된 정보 표시
 */
export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  // 게시글 데이터 조회
  const { data: post, isLoading, error } = usePostDetail(postId)
  const updatePost = useUpdatePost()

  // 폼 상태
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // 에러 상태
  const [errors, setErrors] = useState<string[]>([])

  // 기존 게시글 내용으로 폼 초기화
  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
    }
  }, [post])

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

    try {
      await updatePost.mutateAsync({
        postId,
        title: title.trim(),
        content: content.trim(),
      })

      // 수정 완료 후 상세 페이지로 이동
      router.push(`/community/${postId}`)
    } catch {
      setErrors(['게시글 수정에 실패했습니다. 다시 시도해주세요.'])
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <main className="min-h-screen bg-navy-50">
        <header className="border-b border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-4 shadow-lg">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-xl"
              >
                🗾
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">게시글 수정</h1>
                <p className="text-xs text-navy-300">로딩 중...</p>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-300 border-t-navy-600" />
          </div>
        </div>
      </main>
    )
  }

  // 에러 상태
  if (error || !post) {
    return (
      <main className="min-h-screen bg-navy-50">
        <header className="border-b border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-4 shadow-lg">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-xl"
              >
                🗾
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">게시글 수정</h1>
                <p className="text-xs text-navy-300">오류 발생</p>
              </div>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="text-navy-600">게시글을 찾을 수 없습니다.</p>
            <Link
              href="/community"
              className="mt-4 inline-block text-navy-500 hover:underline"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-navy-50">
      {/* 헤더 */}
      <header className="border-b border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-xl"
              >
                🗾
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">게시글 수정</h1>
                <p className="text-xs text-navy-300">내용을 수정하세요</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-sm text-navy-300 hover:text-white">
                지도
              </Link>
              <Link
                href="/community"
                className="text-sm text-navy-300 hover:text-white"
              >
                커뮤니티
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
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
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
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
                className="mb-2 block text-sm font-medium text-navy-700"
              >
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
                maxLength={100}
              />
              <p className="mt-1 text-right text-xs text-navy-400">
                {title.length}/100
              </p>
            </div>

            {/* 작성자 표시 (수정 불가) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-navy-700">
                작성자
              </label>
              <div className="w-full rounded-lg border border-navy-100 bg-navy-50 px-4 py-3 text-navy-600">
                {post.author}
              </div>
              <p className="mt-1 text-xs text-navy-400">
                작성자는 수정할 수 없습니다
              </p>
            </div>

            {/* 내용 입력 */}
            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-medium text-navy-700"
              >
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={10}
                className="w-full resize-none rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
                maxLength={5000}
              />
              <p className="mt-1 text-right text-xs text-navy-400">
                {content.length}/5000
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="flex items-center justify-end gap-3 border-t border-navy-100 pt-6">
              <Link
                href={`/community/${postId}`}
                className="rounded-lg border border-navy-300 px-6 py-2.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={updatePost.isPending}
                className="rounded-lg bg-navy-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    </main>
  )
}
