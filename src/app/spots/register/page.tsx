'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  CATEGORY_CONFIG,
  SpotCategory,
  Coordinates,
  RelatedContent,
} from '@/types'

// 폼 상태 인터페이스
interface SpotFormData {
  name: string
  description: string
  address: string
  coordinates: Coordinates | null
  category: SpotCategory | ''
  photos: string[]
  relatedContent: RelatedContent[]
}

// 초기 폼 상태
const initialFormData: SpotFormData = {
  name: '',
  description: '',
  address: '',
  coordinates: null,
  category: '',
  photos: [],
  relatedContent: [],
}

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
 *
 * Requirements:
 * - 4.2: 필수 필드 (이름, 설명, 주소, 카테고리)
 * - 4.3: 선택 필드 (사진, 관련 콘텐츠)
 * - 4.6: 필수 필드 누락 시 유효성 검사 에러
 */
function SpotRegisterForm() {
  const router = useRouter()
  const { user } = useAuth()

  // 폼 상태
  const [formData, setFormData] = useState<SpotFormData>(initialFormData)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 필드 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 유효성 검사
  const validateForm = (): string[] => {
    const validationErrors: string[] = []

    if (!formData.name.trim()) {
      validationErrors.push('스팟 이름은 필수입니다')
    } else if (formData.name.trim().length < 2) {
      validationErrors.push('스팟 이름은 2자 이상이어야 합니다')
    }

    if (!formData.category) {
      validationErrors.push('카테고리를 선택해주세요')
    }

    if (!formData.description.trim()) {
      validationErrors.push('설명은 필수입니다')
    } else if (formData.description.trim().length < 10) {
      validationErrors.push('설명은 10자 이상이어야 합니다')
    }

    if (!formData.address.trim()) {
      validationErrors.push('주소는 필수입니다')
    }

    if (!formData.coordinates) {
      validationErrors.push('지도에서 위치를 선택해주세요')
    }

    return validationErrors
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    setIsSubmitting(true)

    try {
      // TODO: API 호출 (Task 5.6에서 구현)
      // const response = await fetch('/api/spots', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...formData,
      //     authorId: user?.id,
      //     authorName: user?.name || user?.email?.split('@')[0],
      //   }),
      // })

      // 임시: 성공 시 메인 페이지로 이동
      alert('스팟 등록 API는 Task 5.6에서 구현됩니다.')
      router.push('/')
    } catch {
      setErrors(['스팟 등록에 실패했습니다. 다시 시도해주세요.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    if (
      formData.name ||
      formData.description ||
      formData.address ||
      formData.category
    ) {
      if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        router.push('/')
      }
    } else {
      router.push('/')
    }
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
              {user?.name || user?.email}님으로 등록됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 등록 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="스팟 이름을 입력하세요"
              className="w-full rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              maxLength={100}
            />
            <p className="mt-1 text-right text-xs text-navy-400">
              {formData.name.length}/100
            </p>
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
              name="category"
              value={formData.category}
              onChange={handleChange}
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
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="스팟에 대한 설명을 입력하세요"
              rows={4}
              className="w-full resize-none rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              maxLength={2000}
            />
            <p className="mt-1 text-right text-xs text-navy-400">
              {formData.description.length}/2000
            </p>
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
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="주소를 입력하세요 (검색 기능은 Task 5.3에서 구현)"
                className="flex-1 rounded-lg border border-navy-200 px-4 py-3 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              />
              <button
                type="button"
                className="rounded-lg bg-navy-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-700"
                onClick={() =>
                  alert('주소 검색 기능은 Task 5.3에서 구현됩니다.')
                }
              >
                검색
              </button>
            </div>
            <p className="mt-1 text-xs text-navy-400">
              주소 검색 또는 지도에서 직접 위치를 선택하세요
            </p>
          </div>

          {/* 좌표 표시 */}
          {formData.coordinates && (
            <div className="mb-4 rounded-lg border border-navy-200 bg-navy-50 p-3">
              <p className="text-sm text-navy-600">
                📍 선택된 좌표: {formData.coordinates.lat.toFixed(6)},{' '}
                {formData.coordinates.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* 지도 위치 선택 (플레이스홀더) */}
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 p-8 transition-colors hover:border-navy-300 hover:bg-navy-100"
            onClick={() => {
              // 임시: 테스트용 좌표 설정
              setFormData((prev) => ({
                ...prev,
                coordinates: { lat: 35.6762, lng: 139.6503 },
                address: prev.address || '도쿄, 일본',
              }))
            }}
          >
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
                클릭하여 테스트 좌표 설정 (LocationPicker는 Task 5.4에서 구현)
              </p>
              <p className="text-xs text-navy-400">
                실제 지도 컴포넌트가 여기에 표시됩니다
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
            onClick={handleCancel}
            className="rounded-lg border border-navy-300 px-6 py-2.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-navy-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
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
                등록 중...
              </span>
            ) : (
              '등록하기'
            )}
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
