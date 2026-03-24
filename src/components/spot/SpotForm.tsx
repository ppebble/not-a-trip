'use client'

import { FormEvent, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AddressSearch } from '@/components/spot/AddressSearch'
import { RelatedContentForm } from '@/components/spot/RelatedContentForm'
import { UploadedImage } from '@/components/spot/ImageUpload'
import {
  CATEGORY_CONFIG,
  SpotCategory,
  Coordinates,
  RelatedContent,
  ExternalLink,
} from '@/types'
import { ExternalLinkForm } from '@/components/spot/ExternalLinkForm'
import {
  ErrorMessages,
  UserInfoBanner,
  PhotoUploadSection,
  LoadingSpinner,
} from './form'

const LocationPicker = dynamic(
  () =>
    import('@/components/spot/LocationPicker').then(
      (mod) => mod.LocationPicker
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-neutral-100" />
    ),
  }
)

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

interface SpotFormProps {
  mode: 'create' | 'edit'
  formData: SpotFormData
  setFormData: React.Dispatch<React.SetStateAction<SpotFormData>>
  errors: string[]
  isSubmitting: boolean
  isDeleting?: boolean
  onSubmit: (e: FormEvent) => void
  onCancel: () => void
  onDelete?: () => void
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void
  userInfo?: { name: string; email?: string }
  uploadedImages?: UploadedImage[]
  onImagesChange?: (images: UploadedImage[]) => void
}

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

  const handleImagesChange = useCallback(
    (images: UploadedImage[]) => {
      onImagesChange?.(images)
      const completedUrls = images
        .filter((img) => img.status === 'completed')
        .map((img) => img.url)
      setFormData((prev) => ({ ...prev, photos: completedUrls }))
    },
    [onImagesChange, setFormData]
  )

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <ErrorMessages errors={errors} />

      {!isEditMode && userInfo && <UserInfoBanner userInfo={userInfo} />}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* 기본 정보 섹션 */}
        <div className="border-b border-border pb-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            기본 정보
          </h2>

          <div className="mb-4">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-text-secondary"
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
              className="w-full rounded-lg border border-border px-4 py-3 text-text-primary placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={100}
            />
            <p className="mt-1 text-right text-xs text-muted">
              {formData.name.length}/100
            </p>
          </div>

          <div className="mb-4">
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-text-secondary"
            >
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-4 py-3 text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">카테고리를 선택하세요</option>
              {(Object.keys(CATEGORY_CONFIG) as SpotCategory[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_CONFIG[key].icon} {CATEGORY_CONFIG[key].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-text-secondary"
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
              className="w-full resize-none rounded-lg border border-border px-4 py-3 text-text-primary placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              maxLength={2000}
            />
            <p className="mt-1 text-right text-xs text-muted">
              {formData.description.length}/2000
            </p>
          </div>
        </div>

        {/* 위치 정보 섹션 */}
        <div className="border-b border-border pb-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            위치 정보
          </h2>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              주소 <span className="text-red-500">*</span>
            </label>
            <AddressSearch
              initialValue={formData.address}
              onSelect={(address, coordinates) => {
                setFormData((prev) => ({ ...prev, address, coordinates }))
              }}
            />
          </div>

          <LocationPicker
            initialCoordinates={formData.coordinates || undefined}
            onLocationChange={(coordinates) => {
              setFormData((prev) => ({ ...prev, coordinates }))
            }}
            onAddressSuggestion={(address) => {
              if (!formData.address) {
                setFormData((prev) => ({ ...prev, address }))
              }
            }}
          />
        </div>

        <PhotoUploadSection
          images={uploadedImages}
          onChange={handleImagesChange}
          disabled={isSubmitting || isDeleting}
        />

        {/* 관련 콘텐츠 섹션 */}
        <div className="border-b border-border pb-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            관련 콘텐츠{' '}
            <span className="text-xs font-normal text-muted">(선택)</span>
          </h2>
          <RelatedContentForm
            value={formData.relatedContent}
            onChange={(contents) => {
              setFormData((prev) => ({ ...prev, relatedContent: contents }))
            }}
          />
        </div>

        {/* 외부 링크 섹션 */}
        {formData.category &&
          ['sports', 'music', 'game'].includes(formData.category) && (
            <div className="border-b border-border pb-6">
              <ExternalLinkForm
                links={formData.externalLinks}
                onChange={(links) => {
                  setFormData((prev) => ({ ...prev, externalLinks: links }))
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
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
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

export { SpotFormSkeleton } from './form'
