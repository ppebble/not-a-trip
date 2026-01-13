'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCreatePost } from '@/hooks/usePosts'
import { validatePostInput } from '@/lib/post-validation'

/**
 * 게시글 작성 폼 컴포넌트
 */
function WriteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createPost = useCreatePost()

  // URL 파라미터에서 스팟/작품 정보 가져오기
  const spotIdParam = searchParams.get('spotId')
  const spotNameParam = searchParams.get('spotName')
  const mediaTitleParam = searchParams.get('mediaTitle')

  // 폼 상태
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [spotId, setSpotId] = useState<string | null>(null)
  const [spotName, setSpotName] = useState<string | null>(null)
  const [mediaTitle, setMediaTitle] = useState<string | null>(null)

  // 에러 상태
  const [errors, setErrors] = useState<string[]>([])

  // URL 파라미터로 스팟/작품 정보 설정
  useEffect(() => {
    if (spotIdParam) {
      setSpotId(spotIdParam)
    }
    if (spotNameParam) {
      setSpotName(decodeURIComponent(spotNameParam))
    }
    if (mediaTitleParam) {
      setMediaTitle(decodeURIComponent(mediaTitleParam))
    }
  }, [spotIdParam, spotNameParam, mediaTitleParam])

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    const validationResult = validatePostInput({ title, content })

    // 작성자 검사 추가
    const allErrors: string[] = []

    if (!validationResult.valid) {
      allErrors.push(...validationResult.errors)
    }

    if (!author || author.trim().length === 0) {
      allErrors.push('작성자는 필수입니다')
    }

    if (allErrors.length > 0) {
      setErrors(allErrors)
      return
    }

    // 에러 초기화
    setErrors([])

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        ...(spotId && { spotId }),
        ...(mediaTitle && { mediaTitle }),
      })

      // 작성 완료 후 이동
      // 스팟에서 작성한 경우 스팟 상세 페이지로
      // 작품에서 작성한 경우 작품 커뮤니티 페이지로
      // 그 외에는 커뮤니티 목록으로
      if (spotId) {
        router.push(`/spots/${spotId}`)
      } else if (mediaTitle) {
        router.push(`/community/media/${encodeURIComponent(mediaTitle)}`)
      } else {
        router.push('/community')
      }
    } catch {
      setErrors(['게시글 작성에 실패했습니다. 다시 시도해주세요.'])
    }
  }

  // 스팟 연결 해제 핸들러
  const handleRemoveSpot = () => {
    setSpotId(null)
    setSpotName(null)
  }

  // 작품 연결 해제 핸들러
  const handleRemoveMedia = () => {
    setMediaTitle(null)
  }

  return (
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

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 연결된 스팟 정보 표시 */}
        {spotId && spotName && (
          <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-navy-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs text-navy-500">연결된 스팟</p>
                  <p className="font-medium text-navy-800">{spotName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveSpot}
                className="rounded p-1 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-600"
                title="스팟 연결 해제"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 연결된 작품 정보 표시 */}
        {mediaTitle && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <div>
                  <p className="text-xs text-purple-500">연결된 작품</p>
                  <p className="font-medium text-purple-800">{mediaTitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="rounded p-1 text-purple-400 transition-colors hover:bg-purple-100 hover:text-purple-600"
                title="작품 연결 해제"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

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

        {/* 작성자 입력 */}
        <div>
          <label
            htmlFor="author"
            className="mb-2 block text-sm font-medium text-navy-700"
          >
            작성자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
            maxLength={30}
          />
          <p className="mt-1 text-right text-xs text-navy-400">
            {author.length}/30
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
            href="/community"
            className="rounded-lg border border-navy-300 px-6 py-2.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={createPost.isPending}
            className="rounded-lg bg-navy-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createPost.isPending ? (
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
                작성 중...
              </span>
            ) : (
              '작성하기'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * 로딩 스켈레톤
 */
function WriteFormSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-6">
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-12 w-full rounded-lg bg-gray-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-12 w-full rounded-lg bg-gray-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-gray-200"></div>
          <div className="h-48 w-full rounded-lg bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * 게시글 작성 페이지
 *
 * Requirements:
 * - 5.2: 게시글 작성 시 제목과 내용 필수
 * - 5.5: 필수 필드 누락 시 에러 메시지 표시 및 제출 방지
 * - 5.6: 글쓰기 버튼 클릭 시 제목, 내용 입력 폼이 있는 작성 페이지로 이동
 * - 3.1, 5.1: 스팟 상세에서 작성 시 스팟 자동 연결
 */
export default function WritePage() {
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
                <h1 className="text-xl font-bold text-white">게시글 작성</h1>
                <p className="text-xs text-navy-300">
                  성지순례 경험을 공유하세요
                </p>
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
        <Suspense fallback={<WriteFormSkeleton />}>
          <WriteForm />
        </Suspense>
      </div>
    </main>
  )
}
