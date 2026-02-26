import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SpotCategory, RelatedContent } from '@/types/spot'
import type { EvidencePair } from '@/types/report'

/**
 * 멀티스텝 제보 폼 단계
 * 1: 위치 선택 → 2: 지오펜싱 검사 → 3: 장소 정보 입력 → 4: 증거 업로드 → 5: 확인/제출
 */
export type ReportFormStep = 1 | 2 | 3 | 4 | 5

/** 제보 폼 임시 저장 데이터 */
export interface ReportFormData {
  /** 위치 정보 */
  coordinates: { lat: number; lng: number } | null
  address: string
  /** 장소 정보 */
  name: string
  description: string
  category: SpotCategory | null
  /** 작품 정보 */
  relatedContent: RelatedContent[]
  episodeInfo: string
  /** 증거 사진 쌍 */
  evidencePairs: EvidencePair[]
  /** 추가 사진 */
  additionalPhotos: string[]
}

const INITIAL_FORM_DATA: ReportFormData = {
  coordinates: null,
  address: '',
  name: '',
  description: '',
  category: null,
  relatedContent: [],
  episodeInfo: '',
  evidencePairs: [],
  additionalPhotos: [],
}

interface ReportStore {
  /** 현재 폼 단계 */
  currentStep: ReportFormStep
  /** 임시 저장 데이터 */
  formData: ReportFormData
  /** 지오펜싱 검사 통과 여부 */
  nearbyCheckPassed: boolean

  /** 단계 이동 */
  setStep: (step: ReportFormStep) => void
  nextStep: () => void
  prevStep: () => void
  /** 폼 데이터 업데이트 */
  updateFormData: (data: Partial<ReportFormData>) => void
  /** 지오펜싱 검사 결과 설정 */
  setNearbyCheckPassed: (passed: boolean) => void
  /** 폼 초기화 */
  resetForm: () => void
}

export const useReportStore = create<ReportStore>()(
  devtools(
    (set) => ({
      currentStep: 1,
      formData: { ...INITIAL_FORM_DATA },
      nearbyCheckPassed: false,

      setStep: (step) =>
        set({ currentStep: step }, false, 'reportStore/setStep'),

      nextStep: () =>
        set(
          (state) => ({
            currentStep: Math.min(state.currentStep + 1, 5) as ReportFormStep,
          }),
          false,
          'reportStore/nextStep'
        ),

      prevStep: () =>
        set(
          (state) => ({
            currentStep: Math.max(state.currentStep - 1, 1) as ReportFormStep,
          }),
          false,
          'reportStore/prevStep'
        ),

      updateFormData: (data) =>
        set(
          (state) => ({
            formData: { ...state.formData, ...data },
          }),
          false,
          'reportStore/updateFormData'
        ),

      setNearbyCheckPassed: (passed) =>
        set(
          { nearbyCheckPassed: passed },
          false,
          'reportStore/setNearbyCheckPassed'
        ),

      resetForm: () =>
        set(
          {
            currentStep: 1,
            formData: { ...INITIAL_FORM_DATA },
            nearbyCheckPassed: false,
          },
          false,
          'reportStore/resetForm'
        ),
    }),
    { name: 'report-store' }
  )
)

// Selectors
export const useReportCurrentStep = () =>
  useReportStore((state) => state.currentStep)
export const useReportFormData = () => useReportStore((state) => state.formData)
export const useNearbyCheckPassed = () =>
  useReportStore((state) => state.nearbyCheckPassed)
