'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { useSpotRegistration } from '@/hooks/useSpotRegistration'
import { AddressSearch } from '@/components/spot/AddressSearch'
import { RelatedContentForm } from '@/components/spot/RelatedContentForm'
import { CATEGORY_CONFIG, SpotCategory } from '@/types'

// LocationPicker는 Leaflet을 사용하므로 SSR 비활성화
const LocationPicker = dynamic(
  () =>
    import('@/components/spot/LocationPicker').then(
      (mod) => mod.LocationPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-navy-100" />
    ),
  }
)

/**
 * 스팟 등록 폼 스켈레톤
 */
function RegisterFormSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-6">
        <div className="h-16 w-full rounded-lg bg-gray-200"></div>
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
        <div>
          <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
          <div className="h-12 w-full rounded-lg bg-gray-200"></div>
        </div>
        <div className="h-64 w-full rounded-lg bg-gray-200"></div>
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
 * - 4.7: 등록 성공 시 스팟 상세 페이지로 이동
 */
function SpotRegisterForm() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useSpotRegistration()

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
            <label className="mb-2 block text-sm font-medium text-navy-700">
              주소 <span className="text-red-500">*</span>
            </label>
            <AddressSearch
              initialValue={formData.address}
              onSelect={(address, coordinates) => {
                setFormData((prev) => ({
                  ...prev,
                  address,
                  coordinates,
                }))
              }}
            />
          </div>

          {/* 지도 위치 선택 */}
          <LocationPicker
            initialCoordinates={formData.coordinates || undefined}
            onLocationChange={(coordinates) => {
              setFormData((prev) => ({
                ...prev,
                coordinates,
              }))
            }}
            onAddressSuggestion={(address) => {
              if (!formData.address) {
                setFormData((prev) => ({
                  ...prev,
                  address,
                }))
              }
            }}
          />
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
                사진 업로드 기능은 추후 구현 예정입니다
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
          <RelatedContentForm
            value={formData.relatedContent}
            onChange={(contents) => {
              setFormData((prev) => ({
                ...prev,
                relatedContent: contents,
              }))
            }}
          />
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
 * 로그인 필요 모달 컴포넌트
 */
function LoginRequiredModal({
  isOpen,
  onConfirm,
}: {
  isOpen: boolean
  onConfirm: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-6 w-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <h3 className="mb-2 text-center text-lg font-semibold text-navy-800">
          로그인이 필요한 서비스입니다
        </h3>
        <p className="mb-6 text-center text-sm text-navy-500">
          스팟을 등록하려면 로그인이 필요합니다.
          <br />
          로그인 페이지로 이동합니다.
        </p>
        <button
          onClick={onConfirm}
          className="w-full rounded-lg bg-navy-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
        >
          로그인하러 가기
        </button>
      </div>
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
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading])

  const handleLoginConfirm = () => {
    router.push('/auth/signin?callbackUrl=/spots/register')
  }

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
        <LoginRequiredModal
          isOpen={showLoginModal}
          onConfirm={handleLoginConfirm}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-navy-50">
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-bold text-navy-800">스팟 등록</h1>
          <p className="text-sm text-navy-500">특별한 여행지를 공유하세요</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <SpotRegisterForm />
      </div>
    </main>
  )
}
