'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { CATEGORY_CONFIG, SpotCategory } from '@/types'

/**
 * 스팟 등록 폼 스켈레톤
 */
function RegisterFormSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-6">
        {/* 로그인 상태 안내 */}
        <div className="h-16 w-full rounded-lg bg-gray-200"></div>
        {/* 기본 정보 섹션 */}
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-12 w-full rounded-lg bg-gray-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-12 w-full rounded-lg bg-gray-200"></div>
        </div>
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-32 w-full rounded-lg bg-gray-200"></div>
        </div>
        {/* 위치 정보 섹션 */}
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-12 w-full rounded-lg bg-gray-200"></div>
        </div>
        <div className="h-64 w-full rounded-lg bg-gray-200"></div>
        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-4">
          <div className="h-10 w-20 rounded-lg bg-gray-200"></div>
          <div className="h-10 w-20 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * 스팟 등록 폼 컴포넌트
 */
function SpotRegisterForm() {
  const { user } = useAuth()

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      {/* 로그인 상태 안내 */}
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
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
            <p className="font-medium text-green-800">회원으로 등록</p>
            <p className="text-sm text-green-600">
              {user?.email}로 로그인되어 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 등록 폼 */}
      <form className="space-y-6">
        {/* 기본 정보 섹션 */}
        <div className="border-b border-navy-100 pb-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-800">
            기본 정보
          </h2>

          {/* 스팟 이름 */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-navy-700"
            >
              스팟 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              placeholder="스팟 이름을 입력하세요"
              className="w-full rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              maxLength={100}
            />
          </div>

          {/* 카테고리 */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-navy-700"
            >
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              className="w-full rounded-lg border border-navy-200 px-4 py-3 text-navy-800 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
            >
              <option value="">카테고리를 선택하세요</option>
              {(Object.keys(CATEGORY_CONFIG) as SpotCategory[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_CONFIG[key].icon} {CATEGORY_CONFIG[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* 설명 */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-navy-700"
            >
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              placeholder="스팟에 대한 설명을 입력하세요"
              rows={4}
              className="w-full resize-none rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              maxLength={2000}
            />
          </div>
        </div>

        {/* 위치 정보 섹션 */}
        <div className="border-b border-navy-100 pb-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-800">
            위치 정보
          </h2>

          {/* 주소 검색 */}
          <div className="mb-4">
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-navy-700"
            >
              주소 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="address"
                placeholder="주소를 검색하세요"
                className="flex-1 rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
                readOnly
              />
              <button
                type="button"
                className="rounded-lg bg-navy-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-700"
              >
                검색
              </button>
            </div>
            <p className="mt-1 text-xs text-navy-400">
              주소 검색 또는 지도에서 직접 위치를 선택하세요
            </p>
          </div>

          {/* 지도 위치 선택 (플레이스홀더) */}
          <div className="rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <svg
                className="mb-2 h-12 w-12 text-navy-300"
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
              <p className="text-sm text-navy-500">
                지도에서 위치를 선택하세요
              </p>
              <p className="text-xs text-navy-400">
                (LocationPicker 컴포넌트가 여기에 표시됩니다)
              </p>
            </div>
          </div>
        </div>

        {/* 사진 섹션 */}
        <div className="border-b border-navy-100 pb-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-800">
            사진{' '}
            <span className="text-xs font-normal text-navy-400">
              (선택, 최대 5장)
            </span>
          </h2>
          <div className="rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <svg
                className="mb-2 h-12 w-12 text-navy-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-navy-500">
                사진을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-navy-400">JPG, PNG 형식 (최대 5MB)</p>
            </div>
          </div>
        </div>

        {/* 관련 콘텐츠 섹션 */}
        <div className="border-b border-navy-100 pb-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-800">
            관련 콘텐츠{' '}
            <span className="text-xs font-normal text-navy-400">(선택)</span>
          </h2>
          <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
            <p className="text-sm text-navy-500">
              이 스팟과 관련된 작품, 팀, 아티스트 등을 추가할 수 있습니다.
            </p>
            <button
              type="button"
              className="mt-3 flex items-center gap-2 rounded-lg border border-navy-300 bg-white px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
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
              콘텐츠 추가
            </button>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            className="rounded-lg border border-navy-300 px-6 py-2.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded-lg bg-navy-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * 스팟 등록 페이지
 *
 * Requirements:
 * - 4.1: 스팟 등록 버튼 클릭 시 등록 페이지로 이동
 * - 4.8: 회원만 스팟 등록 가능 (비로그인 시 로그인 페이지로 리다이렉트)
 */
export default function SpotRegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin?callbackUrl=/spots/register')
    }
  }, [isAuthenticated, isLoading, router])

  // 로딩 중이거나 비로그인 상태면 스켈레톤 표시
  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-navy-50">
        <div className="border-b border-navy-200 bg-white px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-xl font-bold text-navy-800">스팟 등록</h1>
            <p className="text-sm text-navy-500">특별한 여행지를 공유하세요</p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <RegisterFormSkeleton />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-navy-50">
      {/* 페이지 타이틀 */}
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-bold text-navy-800">스팟 등록</h1>
          <p className="text-sm text-navy-500">특별한 여행지를 공유하세요</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <SpotRegisterForm />
      </div>
    </main>
  )
}
