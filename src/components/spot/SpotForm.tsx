'use client'

import { FormEvent, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AddressSearch } from '@/components/spot/AddressSearch'
import { RelatedContentForm } from '@/components/spot/RelatedContentForm'
import { ImageUpload, UploadedImage } from '@/components/spot/ImageUpload'
import {
  CATEGORY_CONFIG,
  SpotCategory,
  Coordinates,
  RelatedContent,
  ExternalLink,
} from '@/types'
import { ExternalLinkForm } from '@/components/spot/ExternalLinkForm'

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
 * 스팟 폼 데이터 인터페이스
 */
export interface SpotFormData {
  name: string
  description: string
  address: string
  coordinates: Coordinates | null
  category: SpotCategory | ''
  photos: string[]
  relatedContent: RelatedContent[]
  externalLinks: ExternalLink[]
}

/**
 * SpotForm 컴포넌트 Props
 */
interface SpotFormProps {
  /** 폼 모드: 등록 또는 수정 */
  mode: 'create' | 'edit'
  /** 폼 데이터 */
  formData: SpotFormData
  /** 폼 데이터 변경 핸들러 */
  setFormData: React.Dispatch<React.SetStateAction<SpotFormData>>
  /** 유효성 검사 에러 목록 */
  errors: string[]
  /** 제출 중 상태 */
  isSubmitting: boolean
  /** 삭제 중 상태 (수정 모드에서만 사용) */
  isDeleting?: boolean
  /** 폼 제출 핸들러 */
  onSubmit: (e: FormEvent) => void
  /** 취소 핸들러 */
  onCancel: () => void
  /** 삭제 핸들러 (수정 모드에서만 사용) */
  onDelete?: () => void
  /** 필드 변경 핸들러 */
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void
  /** 회원 정보 (등록 모드에서 표시) */
  userInfo?: {
    name: string
    email?: string
  }
  /** 이미지 업로드 상태 */
  uploadedImages?: UploadedImage[]
  /** 이미지 업로드 상태 변경 핸들러 */
  onImagesChange?: (images: UploadedImage[]) => void
}

/**
 * 에러 메시지 표시 컴포넌트
 */
function ErrorMessages({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null

  return (
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
          <h3 className="font-medium text-red-800">입력 내용을 확인해주세요</h3>
          <ul className="mt-1 list-inside list-disc text-sm text-red-700">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * 회원 정보 표시 컴포넌트 (등록 모드에서만 사용)
 */
function UserInfoBanner({
  userInfo,
}: {
  userInfo: { name: string; email?: string }
}) {
  return (
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
            {userInfo.name}님으로 등록됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 사진 업로드 섹션
 */
function PhotoUploadSection({
  images,
  onChange,
  disabled,
}: {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  disabled?: boolean
}) {
  return (
    <div className="border-b border-navy-100 pb-6">
      <h2 className="mb-4 text-lg font-semibold text-navy-800">
        사진{' '}
        <span className="text-xs font-normal text-navy-400">
          (선택, 최대 5장)
        </span>
      </h2>
      <ImageUpload
        images={images}
        onChange={onChange}
        maxImages={5}
        disabled={disabled}
      />
    </div>
  )
}

/**
 * 제출 버튼 로딩 스피너
 */
function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
  )
}

/**
 * SpotForm 공통 컴포넌트
 *
 * 스팟 등록/수정 페이지에서 공유하는 폼 로직을 통합합니다.
 *
 * Requirements:
 * - 4.2: 필수 필드 (이름, 설명, 주소, 카테고리)
 * - 4.3: 선택 필드 (사진, 관련 콘텐츠)
 * - 6.1: 기존 데이터 로드 및 수정 폼
 */
export function SpotForm({
  mode,
  formData,
  setFormData,
  errors,
  isSubmitting,
  isDeleting = false,
  onSubmit,
  onCancel,
  onDelete,
  handleChange,
  userInfo,
  uploadedImages = [],
  onImagesChange,
}: SpotFormProps) {
  const isEditMode = mode === 'edit'
  const submitLabel = isEditMode ? '수정하기' : '등록하기'
  const submittingLabel = isEditMode ? '수정 중...' : '등록 중...'

  // 이미지 변경 핸들러 (photos 배열도 함께 업데이트)
  const handleImagesChange = useCallback(
    (images: UploadedImage[]) => {
      onImagesChange?.(images)
      // 완료된 이미지의 URL만 photos에 저장
      const completedUrls = images
        .filter((img) => img.status === 'completed')
        .map((img) => img.url)
      setFormData((prev) => ({
        ...prev,
        photos: completedUrls,
      }))
    },
    [onImagesChange, setFormData]
  )

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      {/* 에러 메시지 */}
      <ErrorMessages errors={errors} />

      {/* 회원 정보 (등록 모드에서만) */}
      {!isEditMode && userInfo && <UserInfoBanner userInfo={userInfo} />}

      {/* 폼 */}
      <form onSubmit={onSubmit} className="space-y-6">
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
        <PhotoUploadSection
          images={uploadedImages}
          onChange={handleImagesChange}
          disabled={isSubmitting || isDeleting}
        />

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

        {/* 외부 링크 섹션 (스포츠/음악/게임 카테고리에서만 표시) */}
        {formData.category &&
          ['sports', 'music', 'game'].includes(formData.category) && (
            <div className="border-b border-navy-100 pb-6">
              <ExternalLinkForm
                links={formData.externalLinks}
                onChange={(links) => {
                  setFormData((prev) => ({
                    ...prev,
                    externalLinks: links,
                  }))
                }}
                category={formData.category as SpotCategory}
                disabled={isSubmitting || isDeleting}
              />
            </div>
          )}

        {/* 버튼 영역 */}
        <div
          className={`flex items-center pt-4 ${isEditMode ? 'justify-between' : 'justify-end'}`}
        >
          {/* 삭제 버튼 (수정 모드에서만) */}
          {isEditMode && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting || isSubmitting}
              className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  삭제 중...
                </span>
              ) : (
                '스팟 삭제'
              )}
            </button>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-navy-300 px-6 py-2.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="rounded-lg bg-navy-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  {submittingLabel}
                </span>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

/**
 * 스팟 폼 스켈레톤 컴포넌트
 */
export function SpotFormSkeleton() {
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
