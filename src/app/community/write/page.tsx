'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCreatePost } from '@/hooks/usePosts'
import { useAuth } from '@/hooks/useAuth'
import { validatePostInput } from '@/lib/post-validation'

/**
 * 게시글 작성 폼 컴포넌트
 */
function WriteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const createPost = useCreatePost()
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  // URL 파라미터에서 스팟/작품 정보 가져오기
  const spotIdParam = searchParams.get('spotId')
  const spotNameParam = searchParams.get('spotName')
  const mediaTitleParam = searchParams.get('mediaTitle')
  const typeParam = searchParams.get('type') // 'general' for 자유게시판

  // 자유게시판 모드 여부
  const isGeneralMode = typeParam === 'general'

  // 폼 상태
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [password, setPassword] = useState('') // 비회원용 비밀번호
  const [spotId, setSpotId] = useState<string | null>(null)
  const [spotName, setSpotName] = useState<string | null>(null)
  const [mediaTitle, setMediaTitle] = useState<string | null>(null)

  // 에러 상태
  const [errors, setErrors] = useState<string[]>([])

  // URL 파라미터로 스팟/작품 정보 설정 (자유게시판 모드가 아닐 때만)
  useEffect(() => {
    if (!isGeneralMode) {
      if (spotIdParam) {
        setSpotId(spotIdParam)
      }
      if (spotNameParam) {
        setSpotName(decodeURIComponent(spotNameParam))
      }
      if (mediaTitleParam) {
        setMediaTitle(decodeURIComponent(mediaTitleParam))
      }
    }
  }, [spotIdParam, spotNameParam, mediaTitleParam, isGeneralMode])

  // 로그인 사용자의 경우 작성자 자동 설정
  useEffect(() => {
    if (isAuthenticated && user) {
      const displayName = user.name || user.email?.split('@')[0] || '회원'
      setAuthor(displayName)
    }
  }, [isAuthenticated, user])

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

    // 비회원인 경우 비밀번호 필수
    if (!isAuthenticated) {
      if (!password || password.trim().length === 0) {
        allErrors.push('비밀번호는 필수입니다')
      } else if (password.length < 4) {
        allErrors.push('비밀번호는 4자 이상이어야 합니다')
      }
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
        // 비회원인 경우에만 비밀번호 전송
        ...(!isAuthenticated && { password }),
        ...(spotId && { spotId }),
        ...(mediaTitle && { mediaTitle }),
      })

      // 작성 완료 후 이동
      // 스팟에서 작성한 경우 스팟 상세 페이지로
      // 작품에서 작성한 경우 작품 커뮤니티 페이지로
      // 자유게시판에서 작성한 경우 자유게시판 탭으로
      // 그 외에는 커뮤니티 목록으로
      if (spotId) {
        router.push(`/spots/${spotId}`)
      } else if (mediaTitle) {
        router.push(`/contents/${encodeURIComponent(mediaTitle)}`)
      } else if (isGeneralMode) {
        router.push('/community?tab=general')
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

  // 인증 로딩 중일 때 스켈레톤 표시
  if (isAuthLoading) {
    return <WriteFormSkeleton />
  }

  return (
    <div className="rounded-lg bg-surface p-6 shadow-sm">
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
        {/* 로그인 상태 안내 */}
        {isAuthenticated ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-green-800">회원으로 작성</p>
                <p className="text-sm text-green-600">
                  {user?.email}로 로그인되어 있습니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
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
              <div>
                <p className="font-medium text-amber-800">비회원으로 작성</p>
                <p className="text-sm text-amber-600">
                  수정/삭제 시 비밀번호가 필요합니다.{' '}
                  <Link
                    href="/auth/signin"
                    className="underline hover:text-amber-700"
                  >
                    로그인
                  </Link>
                  하면 더 편리하게 이용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* 자유게시판 모드 안내 */}
        {isGeneralMode && (
          <div className="rounded-lg border border-primary-200 bg-accent-surface p-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-primary"
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
              <div>
                <p className="font-medium text-primary-800">자유게시판</p>
                <p className="text-sm text-primary">
                  스팟이나 작품과 관계없이 자유롭게 이야기를 나눠보세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 연결된 스팟 정보 표시 (자유게시판 모드가 아닐 때만) */}
        {!isGeneralMode && spotId && spotName && (
          <div className="rounded-lg border border-neutral-200 bg-primary-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-primary"
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
                  <p className="text-xs text-secondary">연결된 스팟</p>
                  <p className="font-medium text-primary">{spotName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveSpot}
                className="rounded p-1 text-neutral-400 transition-colors hover:bg-surface hover:text-primary"
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

        {/* 연결된 작품 정보 표시 (자유게시판 모드가 아닐 때만) */}
        {!isGeneralMode && mediaTitle && (
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
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-primary placeholder-neutral-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            maxLength={100}
          />
          <p className="mt-1 text-right text-xs text-neutral-400">
            {title.length}/100
          </p>
        </div>

        {/* 작성자 입력 - 회원/비회원 구분 */}
        <div>
          <label
            htmlFor="author"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            작성자 <span className="text-red-500">*</span>
          </label>
          {isAuthenticated ? (
            // 로그인 사용자: 읽기 전용
            <div className="relative">
              <input
                type="text"
                id="author"
                value={author}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-primary-50 px-4 py-3 text-secondary focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  회원
                </span>
              </div>
            </div>
          ) : (
            // 비회원: 입력 가능
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-primary placeholder-neutral-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={30}
            />
          )}
          {!isAuthenticated && (
            <p className="mt-1 text-right text-xs text-neutral-400">
              {author.length}/30
            </p>
          )}
        </div>

        {/* 비회원 비밀번호 입력 */}
        {!isAuthenticated && (
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="수정/삭제 시 필요한 비밀번호 (4자 이상)"
              className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-primary placeholder-neutral-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-neutral-400">
              게시글 수정/삭제 시 이 비밀번호가 필요합니다.
            </p>
          </div>
        )}

        {/* 내용 입력 */}
        <div>
          <label
            htmlFor="content"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={10}
            className="w-full resize-none rounded-lg border border-neutral-200 px-4 py-3 text-primary placeholder-neutral-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            maxLength={5000}
          />
          <p className="mt-1 text-right text-xs text-neutral-400">
            {content.length}/5000
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-6">
          <Link
            href="/community"
            className="rounded-lg border border-neutral-300 px-6 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-primary-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={createPost.isPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="rounded-lg bg-surface p-6 shadow-sm">
      <div className="animate-pulse space-y-6">
        <div className="h-16 w-full rounded-lg bg-neutral-200"></div>
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-neutral-200"></div>
          <div className="h-12 w-full rounded-lg bg-neutral-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-neutral-200"></div>
          <div className="h-12 w-full rounded-lg bg-neutral-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-neutral-200"></div>
          <div className="h-12 w-full rounded-lg bg-neutral-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-16 rounded bg-neutral-200"></div>
          <div className="h-48 w-full rounded-lg bg-neutral-200"></div>
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
 * - 16.8.3: 회원/비회원 구분 작성자 처리
 *   - 로그인 사용자: 작성자 필드 자동 설정 (닉네임 표시, 수정 불가)
 *   - 비회원: 닉네임 + 비밀번호 입력 필드 표시
 */
export default function WritePage() {
  return (
    <main className="min-h-screen bg-primary-50">
      {/* 페이지 타이틀 */}
      <div className="border-b border-neutral-200 bg-surface px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-bold text-primary">게시글 작성</h1>
          <p className="text-sm text-secondary">
            특별한 여행 경험을 공유하세요
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Suspense fallback={<WriteFormSkeleton />}>
          <WriteForm />
        </Suspense>
      </div>
    </main>
  )
}
