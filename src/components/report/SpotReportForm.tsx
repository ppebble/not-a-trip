'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReportStore,
  useReportCurrentStep,
  useReportFormData,
  useNearbyCheckPassed,
} from '@/stores/reportStore'
import { useNearbyCheck } from '@/hooks/useNearbyCheck'
import { useCreateReport } from '@/hooks/useSpotReport'
import { EvidencePairUpload } from './EvidencePairUpload'
import { NearbySpotWarning } from './NearbySpotWarning'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'
import type { EvidencePair } from '@/types/report'
import type { RelatedContent } from '@/types/spot'

const STEP_LABELS = [
  '위치 선택',
  '중복 검사',
  '장소 정보',
  '증거 업로드',
  '확인/제출',
]

/**
 * 멀티스텝 성지 제보 폼
 * Requirements: 1.1, 1.2, 1.3
 */
export function SpotReportForm() {
  const router = useRouter()
  const currentStep = useReportCurrentStep()
  const formData = useReportFormData()
  const nearbyCheckPassed = useNearbyCheckPassed()
  const {
    setStep,
    nextStep,
    prevStep,
    updateFormData,
    setNearbyCheckPassed,
    resetForm,
  } = useReportStore()

  const {
    nearbyItems,
    hasNearby,
    isLoading: isCheckingNearby,
  } = useNearbyCheck(currentStep === 2 ? formData.coordinates : null)

  const createReport = useCreateReport()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (
      !formData.coordinates ||
      !formData.name ||
      !formData.category ||
      formData.evidencePairs.length === 0
    ) {
      setSubmitError('필수 항목을 모두 입력해주세요')
      return
    }

    setSubmitError(null)
    try {
      await createReport.mutateAsync({
        name: formData.name,
        description: formData.description,
        address: formData.address,
        coordinates: formData.coordinates,
        category: formData.category,
        relatedContent: formData.relatedContent,
        evidencePairs: formData.evidencePairs,
        episodeInfo: formData.episodeInfo,
        additionalPhotos: formData.additionalPhotos,
      })
      resetForm()
      router.push('/reports')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : '제보 제출에 실패했습니다'
      )
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* 스텝 인디케이터 */}
      <div className="mb-6 flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1
          const isActive = step === currentStep
          const isDone = step < currentStep
          return (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : isDone
                      ? 'bg-green-500 text-white'
                      : 'bg-surface text-muted'
                }`}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className={`mt-1 text-[10px] ${isActive ? 'font-medium text-secondary' : 'text-muted'}`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Step 1: 위치 선택 */}
      {currentStep === 1 && (
        <StepLocation
          coordinates={formData.coordinates}
          address={formData.address}
          onUpdate={(coords, address) => {
            updateFormData({ coordinates: coords, address })
          }}
          onNext={nextStep}
        />
      )}

      {/* Step 2: 지오펜싱 검사 */}
      {currentStep === 2 && (
        <StepNearbyCheck
          nearbyItems={nearbyItems}
          hasNearby={hasNearby}
          isLoading={isCheckingNearby}
          nearbyCheckPassed={nearbyCheckPassed}
          onContinue={() => {
            setNearbyCheckPassed(true)
            nextStep()
          }}
          onSelectSpot={(spotId) => {
            resetForm()
            router.push(`/spots/${spotId}`)
          }}
          onAutoPass={() => {
            setNearbyCheckPassed(true)
            nextStep()
          }}
          onBack={prevStep}
        />
      )}

      {/* Step 3: 장소 정보 입력 */}
      {currentStep === 3 && (
        <StepInfo
          formData={formData}
          onUpdate={updateFormData}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {/* Step 4: 증거 업로드 */}
      {currentStep === 4 && (
        <StepEvidence
          evidencePairs={formData.evidencePairs}
          onUpdate={(pairs) => updateFormData({ evidencePairs: pairs })}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {/* Step 5: 확인/제출 */}
      {currentStep === 5 && (
        <StepConfirm
          formData={formData}
          onSubmit={handleSubmit}
          isSubmitting={createReport.isPending}
          error={submitError}
          onBack={prevStep}
          onEdit={(step) => setStep(step)}
        />
      )}
    </div>
  )
}

/** Step 1: 위치 선택 */
function StepLocation({
  coordinates,
  address,
  onUpdate,
  onNext,
}: {
  coordinates: { lat: number; lng: number } | null
  address: string
  onUpdate: (coords: { lat: number; lng: number }, address: string) => void
  onNext: () => void
}) {
  const [lat, setLat] = useState(coordinates?.lat?.toString() || '')
  const [lng, setLng] = useState(coordinates?.lng?.toString() || '')
  const [addr, setAddr] = useState(address)

  const isValid = lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))

  const handleNext = () => {
    if (!isValid) return
    onUpdate({ lat: Number(lat), lng: Number(lng) }, addr)
    onNext()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-primary">
        성지 위치를 입력해주세요
      </h3>
      <p className="text-xs text-muted">
        Google Maps 등에서 좌표를 복사하여 입력하거나, 주소를 입력해주세요
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-secondary">
            위도 (Latitude) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="35.6762"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-secondary">
            경도 (Longitude) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="139.6503"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">
          주소
        </label>
        <input
          type="text"
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="도쿄도 치요다구..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!isValid}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:bg-neutral-200"
      >
        다음
      </button>
    </div>
  )
}

/** Step 2: 지오펜싱 검사 */
function StepNearbyCheck({
  nearbyItems,
  hasNearby,
  isLoading,
  nearbyCheckPassed,
  onContinue,
  onSelectSpot,
  onAutoPass,
  onBack,
}: {
  nearbyItems: import('@/hooks/useNearbyCheck').NearbyItem[]
  hasNearby: boolean
  isLoading: boolean
  nearbyCheckPassed: boolean
  onContinue: () => void
  onSelectSpot: (spotId: string) => void
  onAutoPass: () => void
  onBack: () => void
}) {
  // 검사 완료 후 근처 스팟 없으면 자동 통과
  if (!isLoading && !hasNearby && !nearbyCheckPassed) {
    onAutoPass()
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-primary">중복 검사</h3>

      <NearbySpotWarning
        nearbyItems={nearbyItems}
        isLoading={isLoading}
        onContinue={onContinue}
        onSelectSpot={onSelectSpot}
      />

      {!isLoading && !hasNearby && (
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <p className="text-sm text-green-700">
            ✓ 주변에 중복 스팟이 없습니다
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-lg border border-border py-2 text-sm text-secondary hover:bg-surface"
      >
        이전
      </button>
    </div>
  )
}

/** Step 3: 장소 정보 입력 */
function StepInfo({
  formData,
  onUpdate,
  onNext,
  onBack,
}: {
  formData: import('@/stores/reportStore').ReportFormData
  onUpdate: (
    data: Partial<import('@/stores/reportStore').ReportFormData>
  ) => void
  onNext: () => void
  onBack: () => void
}) {
  const [contentName, setContentName] = useState('')

  const isValid =
    formData.name.trim() &&
    formData.description.trim() &&
    formData.category &&
    formData.relatedContent.length > 0

  const addContent = useCallback(() => {
    if (!contentName.trim()) return
    const newContent: RelatedContent = {
      name: contentName.trim(),
      type: 'anime',
    }
    onUpdate({
      relatedContent: [...formData.relatedContent, newContent],
    })
    setContentName('')
  }, [contentName, formData.relatedContent, onUpdate])

  const removeContent = (index: number) => {
    onUpdate({
      relatedContent: formData.relatedContent.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-primary">장소 정보</h3>

      {/* 장소명 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">
          장소명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="예: 스와 신사 (諏訪神社)"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            Object.entries(CATEGORY_CONFIG) as [
              SpotCategory,
              (typeof CATEGORY_CONFIG)[SpotCategory],
            ][]
          ).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => onUpdate({ category: key })}
              className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
                formData.category === key
                  ? 'border-primary bg-primary-50 font-medium text-secondary'
                  : 'border-border text-secondary hover:border-neutral-300'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* 관련 작품 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">
          관련 작품 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={contentName}
            onChange={(e) => setContentName(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addContent())
            }
            placeholder="작품명 입력 후 추가"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={addContent}
            disabled={!contentName.trim()}
            className="rounded-lg bg-surface px-3 text-sm text-secondary hover:bg-neutral-200 disabled:opacity-40"
          >
            추가
          </button>
        </div>
        {formData.relatedContent.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {formData.relatedContent.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs text-secondary"
              >
                {c.name}
                <button
                  type="button"
                  onClick={() => removeContent(i)}
                  className="text-muted hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">
          설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="이 장소에 대한 설명을 작성해주세요"
          rows={3}
          className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* 에피소드 정보 */}
      <div>
        <label className="mb-1 block text-xs font-medium text-secondary">
          에피소드/타임스탬프
        </label>
        <input
          type="text"
          value={formData.episodeInfo}
          onChange={(e) => onUpdate({ episodeInfo: e.target.value })}
          placeholder="예: 1화 12:30, 3화 오프닝"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* 네비게이션 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm text-secondary hover:bg-surface"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-neutral-200"
        >
          다음
        </button>
      </div>
    </div>
  )
}

/** Step 4: 증거 업로드 */
function StepEvidence({
  evidencePairs,
  onUpdate,
  onNext,
  onBack,
}: {
  evidencePairs: EvidencePair[]
  onUpdate: (pairs: EvidencePair[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const hasCompletePair = evidencePairs.length > 0

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-primary">증거 사진 업로드</h3>

      <EvidencePairUpload pairs={evidencePairs} onChange={onUpdate} />

      {!hasCompletePair && (
        <p className="text-xs text-amber-600">
          최소 1쌍의 증거 사진(작품 캡처 + 현장 사진)을 등록해야 제출할 수
          있습니다
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm text-secondary hover:bg-surface"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasCompletePair}
          className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-neutral-200"
        >
          다음
        </button>
      </div>
    </div>
  )
}

/** Step 5: 확인/제출 */
function StepConfirm({
  formData,
  onSubmit,
  isSubmitting,
  error,
  onBack,
  onEdit,
}: {
  formData: import('@/stores/reportStore').ReportFormData
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
  onBack: () => void
  onEdit: (step: import('@/stores/reportStore').ReportFormStep) => void
}) {
  const categoryLabel = formData.category
    ? CATEGORY_CONFIG[formData.category].label
    : ''

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-primary">제보 내용 확인</h3>

      {/* 요약 카드 */}
      <div className="space-y-3 rounded-lg border border-border bg-primary-50/30 p-4">
        <SummaryRow
          label="장소명"
          value={formData.name}
          onEdit={() => onEdit(3)}
        />
        <SummaryRow
          label="카테고리"
          value={categoryLabel}
          onEdit={() => onEdit(3)}
        />
        <SummaryRow
          label="관련 작품"
          value={formData.relatedContent.map((c) => c.name).join(', ')}
          onEdit={() => onEdit(3)}
        />
        <SummaryRow
          label="주소"
          value={formData.address || '(미입력)'}
          onEdit={() => onEdit(1)}
        />
        <SummaryRow
          label="좌표"
          value={
            formData.coordinates
              ? `${formData.coordinates.lat.toFixed(6)}, ${formData.coordinates.lng.toFixed(6)}`
              : ''
          }
          onEdit={() => onEdit(1)}
        />
        <SummaryRow
          label="증거 사진"
          value={`${formData.evidencePairs.length}쌍`}
          onEdit={() => onEdit(4)}
        />
        {formData.episodeInfo && (
          <SummaryRow
            label="에피소드"
            value={formData.episodeInfo}
            onEdit={() => onEdit(3)}
          />
        )}
      </div>

      <p className="text-xs text-muted">
        제출 후 관리자 검토를 거쳐 지도에 등록됩니다
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 rounded-lg border border-border py-2.5 text-sm text-secondary hover:bg-surface disabled:opacity-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-neutral-300"
        >
          {isSubmitting ? '제출 중...' : '제보하기'}
        </button>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  onEdit,
}: {
  label: string
  value: string
  onEdit: () => void
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm text-secondary">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="ml-2 text-xs text-muted hover:text-secondary"
      >
        수정
      </button>
    </div>
  )
}
