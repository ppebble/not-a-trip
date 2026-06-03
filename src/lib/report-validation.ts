/**
 * 제보 입력 유효성 검사 함수
 * Requirements: 1.2, 4.2, 5.3
 */

import type {
  CreateSpotReportInput,
  CreateStatusReportInput,
  SpotStatus,
} from '@/types/report'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const VALID_SPOT_STATUSES: SpotStatus[] = [
  'normal',
  'partially_changed',
  'under_construction',
  'demolished',
  'inaccessible',
]

/**
 * 신규 성지 제보 입력 유효성 검사
 * - 필수 필드 검사 (name, description, address, coordinates, category, relatedContent, episodeInfo)
 * - evidencePairs 최소 1쌍 필수, 각 쌍의 captureImageUrl/realPhotoUrl 필수
 */
export function validateSpotReportInput(
  input: Partial<CreateSpotReportInput>
): ValidationResult {
  const errors: ValidationError[] = []

  if (!input.name?.trim()) {
    errors.push({ field: 'name', message: '장소명을 입력해주세요' })
  }
  if (!input.description?.trim()) {
    errors.push({ field: 'description', message: '설명을 입력해주세요' })
  }
  if (!input.address?.trim()) {
    errors.push({ field: 'address', message: '주소를 입력해주세요' })
  }

  if (
    !input.coordinates ||
    typeof input.coordinates.lat !== 'number' ||
    typeof input.coordinates.lng !== 'number'
  ) {
    errors.push({ field: 'coordinates', message: '위치 좌표를 입력해주세요' })
  }

  if (!input.category) {
    errors.push({ field: 'category', message: '카테고리를 선택해주세요' })
  }

  if (!input.relatedContent || input.relatedContent.length === 0) {
    errors.push({
      field: 'relatedContent',
      message: '작품 정보를 입력해주세요',
    })
  }

  if (!input.episodeInfo?.trim()) {
    errors.push({
      field: 'episodeInfo',
      message: '에피소드/타임스탬프 정보를 입력해주세요',
    })
  }

  // evidencePairs 검증: 최소 1쌍 필수
  if (!input.evidencePairs || input.evidencePairs.length === 0) {
    errors.push({
      field: 'evidencePairs',
      message: '애니메이션 캡처와 현장 사진을 쌍으로 최소 1쌍 등록해주세요',
    })
  } else {
    input.evidencePairs.forEach((pair, index) => {
      if (!pair.captureImageUrl?.trim()) {
        errors.push({
          field: `evidencePairs[${index}].captureImageUrl`,
          message: `증거 사진 ${index + 1}번째 쌍의 애니메이션 캡처 이미지를 등록해주세요`,
        })
      }
      if (!pair.realPhotoUrl?.trim()) {
        errors.push({
          field: `evidencePairs[${index}].realPhotoUrl`,
          message: `증거 사진 ${index + 1}번째 쌍의 현장 사진을 등록해주세요`,
        })
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 스팟 상태 신고 입력 유효성 검사
 * - status 값이 유효한 SpotStatus인지 검사
 */
export function validateStatusReportInput(
  input: Partial<CreateStatusReportInput>
): ValidationResult {
  const errors: ValidationError[] = []

  if (
    !input.status ||
    !VALID_SPOT_STATUSES.includes(input.status as SpotStatus)
  ) {
    errors.push({
      field: 'status',
      message: '유효하지 않은 상태입니다',
    })
  }

  if (!input.description?.trim()) {
    errors.push({
      field: 'description',
      message: '설명을 입력해주세요',
    })
  }

  return { valid: errors.length === 0, errors }
}

/**
 * 관리자 검토 액션 유효성 검사
 * - 반려(reject) 또는 수정요청(request_revision) 시 사유(comment) 필수
 */
export function validateReviewAction(
  action: string,
  comment?: string
): ValidationResult {
  const errors: ValidationError[] = []
  const validActions = ['approve', 'reject', 'request_revision']

  if (!validActions.includes(action)) {
    errors.push({
      field: 'action',
      message: '유효하지 않은 검토 액션입니다',
    })
  }

  if (
    (action === 'reject' || action === 'request_revision') &&
    (!comment || !comment.trim())
  ) {
    const label = action === 'reject' ? '반려' : '수정요청'
    errors.push({
      field: 'comment',
      message: `${label} 사유를 입력해주세요`,
    })
  }

  return { valid: errors.length === 0, errors }
}
