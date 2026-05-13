// ============================================
// 스팟 품질 워크플로 TypeScript 타입/인터페이스 정의
// Spec: 40-spot-quality-workflow
// Requirements: 2.1, 3.1, 4.1, 5.1
// ============================================

// ============================================
// 유니온 타입 정의
// ============================================

/**
 * 스팟 라이프사이클 상태
 * Requirements 2.1
 */
export type SpotLifecycleStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'archived'
  | 'closed'

/**
 * 품질 신고 유형
 * Requirements 3.1
 */
export type QualityReportType =
  | 'inaccurate_info'
  | 'closed_permanently'
  | 'duplicate'
  | 'inappropriate'
  | 'other'

/**
 * 신고 처리 상태
 * Requirements 3.2, 4.1
 */
export type ReportProcessingStatus =
  | 'pending'
  | 'in_review'
  | 'resolved'
  | 'rejected'
  | 'sla_exceeded'

/**
 * 보완 요청 유형
 * Requirements 5.1
 */
export type SupplementRequestType =
  | 'photo_add'
  | 'description_update'
  | 'address_verify'
  | 'operation_info'

/**
 * 보완 요청 상태
 * Requirements 5.1, 5.5
 */
export type SupplementRequestStatus =
  | 'pending'
  | 'responded'
  | 'approved'
  | 'expired'

// ============================================
// 상수 정의
// ============================================

/**
 * 허용된 상태 전이 맵
 * Requirements 2.1, 2.7
 *
 * 참고: closure_suspected는 상태 머신 다이어그램의 가상 상태로,
 * SpotLifecycleStatus에 포함되지 않으며 spots.closureSuspected 불리언 필드로 표현됨
 */
export const ALLOWED_TRANSITIONS: Record<
  SpotLifecycleStatus,
  SpotLifecycleStatus[]
> = {
  draft: ['pending'],
  pending: ['approved'],
  approved: ['archived', 'closed'],
  archived: ['approved'],
  closed: ['approved'],
}

/**
 * SLA 기한 설정 (시간 단위)
 * Requirements 4.1
 */
export const SLA_DEADLINES: Record<QualityReportType, number> = {
  inappropriate: 24,
  closed_permanently: 48,
  duplicate: 72,
  inaccurate_info: 120,
  other: 120,
}

// ============================================
// 인터페이스 정의
// ============================================

/**
 * 스팟 품질 신고
 * Requirements 3.1, 3.2, 4.1
 */
export interface SpotQualityReport {
  id: string
  spotId: string
  reportType: QualityReportType
  description: string
  evidencePhotos?: string[]
  reporterId: string
  reporterName: string
  status: ReportProcessingStatus
  /** SLA 기한 */
  deadline: Date
  /** 긴급 검토 플래그 (동일 유형 3건+ 누적 시 true) */
  isUrgent: boolean
  /** 처리 결과 */
  resolution?: {
    action: 'approved' | 'rejected' | 'deferred'
    reason: string
    resolvedBy: string
    resolvedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * 라이프사이클 상태 전이 이력
 * Requirements 2.6
 */
export interface LifecycleTransition {
  from: SpotLifecycleStatus
  to: SpotLifecycleStatus
  reason: string
  changedBy: string
  changedAt: Date
}

/**
 * 상태 전이 결과
 * Requirements 2.7
 */
export interface TransitionResult {
  success: boolean
  newStatus?: SpotLifecycleStatus
  error?: string
  allowedTransitions?: SpotLifecycleStatus[]
}

/**
 * 근접 스팟/제보 항목 (200m 이내 조회 결과)
 * Requirements 1.1, 1.3
 */
export interface NearbyItem {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  distance: number
  type: 'spot' | 'report'
  category?: string
}

/**
 * 중복 후보 항목 (유사도 >= 0.7 AND 200m 이내)
 * Requirements 1.2
 */
export interface DuplicateCandidate {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  distance: number
  similarityScore: number
  type: 'spot' | 'report'
  category?: string
}

/**
 * 중복 감지 결과
 * Requirements 1.1, 1.2, 1.3
 */
export interface DuplicateCheckResult {
  /** 200m 이내 근접 항목 */
  nearbyItems: NearbyItem[]
  /** 높은 중복 가능성 항목 (유사도 >= 0.7 AND 200m 이내) */
  highDuplicates: DuplicateCandidate[]
  /** 근접 스팟 항목 (50m 이내) */
  proximityWarnings: NearbyItem[]
}

/**
 * 보완 요청
 * Requirements 5.1, 5.4, 5.5
 */
export interface SupplementRequest {
  id: string
  spotId: string
  requestType: SupplementRequestType
  content: string
  deadline: Date
  status: SupplementRequestStatus
  createdBy: string
  /** 응답 정보 */
  response?: {
    responderId: string
    content: string
    photos?: string[]
    respondedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

/**
 * 폐쇄 감지 결과
 * Requirements 6.1
 */
export interface ClosureDetectionResult {
  shouldSuspect: boolean
  reportCount: number
  latestReportDate: Date
}

/**
 * SLA 집계 통계
 * Requirements 4.4
 */
export interface SlaStatistics {
  /** SLA 준수율 (%) */
  complianceRate: number
  /** 평균 처리 시간 (밀리초) */
  averageProcessingTime: number
  /** SLA 초과 건수 */
  exceededCount: number
  /** 유형별 통계 (선택) */
  byType?: Partial<Record<QualityReportType, SlaStatistics>>
}

/**
 * spots 컬렉션 품질 확장 필드
 * Requirements 2.1, 3.3, 5.3, 6.1, 6.2
 */
export interface SpotQualityExtension {
  /** 라이프사이클 상태 */
  lifecycleStatus: SpotLifecycleStatus
  /** 폐쇄 의심 여부 (closed_permanently 신고 2건+ 시 true) */
  closureSuspected: boolean
  /** 폐쇄 확인 일자 */
  closureConfirmedAt?: Date
  /** 중복 의심 플래그 (제보 시 설정) */
  duplicateSuspected: boolean
  /** 미처리 보완 요청 수 */
  pendingSupplementCount: number
  /** 긴급 검토 필요 여부 (동일 유형 신고 3건+ 시 true) */
  urgentReviewRequired: boolean
}

// ============================================
// 입력 인터페이스 (API 요청용)
// ============================================

/**
 * 품질 신고 생성 입력
 * Requirements 3.2
 */
export interface CreateQualityReportInput {
  spotId: string
  reportType: QualityReportType
  description: string
  evidencePhotos?: string[]
  reporterId: string
  reporterName: string
}

/**
 * 보완 요청 생성 입력
 * Requirements 5.1
 */
export interface CreateSupplementRequestInput {
  spotId: string
  requestType: SupplementRequestType
  content: string
  deadline: Date
  createdBy: string
}

/**
 * 보완 응답 입력
 * Requirements 5.4
 */
export interface SupplementResponseInput {
  responderId: string
  content: string
  photos?: string[]
}
