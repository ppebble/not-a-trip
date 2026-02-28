import { SpotCategory, RelatedContent } from './spot'

// ============================================
// 제보 상태 타입
// ============================================

export type ReportStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'revision_requested'

// ============================================
// 검토 히스토리 (상태 변경 추적)
// ============================================

/** 관리자 검토 이력 (반려/수정요청/승인 히스토리 추적) */
export interface ReviewHistory {
  /** 변경된 상태 */
  status: ReportStatus
  /** 관리자 코멘트 (반려 사유, 수정 요청 내용 등) */
  comment: string
  /** 검토 시각 */
  reviewedAt: Date
  /** 검토자 ID */
  reviewedBy: string
}

// ============================================
// 증거 사진 쌍 (필수)
// ============================================

/** 애니메이션 캡처 + 현장 사진 쌍 */
export interface EvidencePair {
  /** 애니메이션/작품 원본 캡처 이미지 URL */
  captureImageUrl: string
  /** 현장 사진 또는 로드뷰 캡처 URL */
  realPhotoUrl: string
  /** 설명 (선택) */
  description?: string
}

// ============================================
// 성지 제보 (SpotReport)
// ============================================

export interface SpotReport {
  id: string
  /** 제보자 정보 */
  reporterId: string
  reporterName: string
  /** 제보 상태 */
  status: ReportStatus
  /** 장소 정보 */
  name: string
  description: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  category: SpotCategory
  /** 작품 정보 */
  relatedContent: RelatedContent[]
  /** 증거 사진 쌍 (최소 1쌍 필수) */
  evidencePairs: EvidencePair[]
  /** 에피소드/타임스탬프 정보 */
  episodeInfo: string
  /** 추가 사진 (선택) */
  additionalPhotos?: string[]
  /** 관리자 검토 (최신 검토 정보 - 빠른 조회용) */
  reviewedBy?: string
  reviewedAt?: Date
  reviewComment?: string
  /** 검토 히스토리 (반려/수정요청/재제출 전체 이력 추적) */
  reviewHistory?: ReviewHistory[]
  /** 승인 시 생성된 스팟 ID */
  approvedSpotId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSpotReportInput {
  name: string
  description: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  category: SpotCategory
  relatedContent: RelatedContent[]
  evidencePairs: EvidencePair[]
  episodeInfo: string
  additionalPhotos?: string[]
}

// ============================================
// 정보 보완 제보 (SpotSupplement)
// ============================================

export type SupplementType = 'scene_info' | 'description' | 'photo' | 'other'

export interface SpotSupplement {
  id: string
  spotId: string
  /** 기여자 정보 */
  contributorId: string
  contributorName: string
  /** 보완 유형 */
  type: SupplementType
  /** 보완 내용 */
  content: string
  /** 추가 씬 정보 (scene_info 타입일 때) */
  sceneInfo?: {
    animeTitle: string
    episodeInfo?: string
    captureImageUrl?: string
  }
  /** 추가 사진 */
  photos?: string[]
  /** 처리 상태 (3-state) */
  status: 'pending' | 'approved' | 'rejected'
  /** 반려 사유 (status: 'rejected' 시 필수) */
  rejectionReason?: string
  createdAt: Date
}

export interface CreateSupplementInput {
  type: SupplementType
  content: string
  sceneInfo?: {
    animeTitle: string
    episodeInfo?: string
    captureImageUrl?: string
  }
  photos?: string[]
}

// ============================================
// 스팟 상태 신고 (SpotStatusReport)
// ============================================

export type SpotStatus =
  | 'normal'
  | 'partially_changed'
  | 'under_construction'
  | 'demolished'
  | 'inaccessible'

export interface SpotStatusReport {
  id: string
  spotId: string
  /** 신고자 정보 */
  reporterId: string
  reporterName: string
  /** 신고 상태 */
  status: SpotStatus
  /** 설명 */
  description: string
  /** 증거 사진 (선택, 있으면 즉시 '검토 중' 전환 트리거) */
  photoUrl?: string
  /** 처리 상태 */
  reviewStatus: 'pending' | 'resolved'
  createdAt: Date
}

export interface CreateStatusReportInput {
  status: SpotStatus
  description: string
  photoUrl?: string
}

// ============================================
// 스팟 확장 필드 (기존 Spot 인터페이스에 추가)
// ============================================

/** 기존 Spot 인터페이스에 추가할 필드 */
export interface SpotReportExtension {
  /** 최초 제보자 ID */
  firstReporterId?: string
  /** 최초 제보자 이름 */
  firstReporterName?: string
  /** 현재 스팟 상태 */
  spotStatus?: SpotStatus
  /** 상태 신고 누적 수 */
  statusReportCount?: number
}

// ============================================
// 관리자 API 요청/응답 인터페이스 (13-admin-dashboard)
// ============================================

/** PUT /api/admin/supplements/[id]/review 요청 */
export interface SupplementReviewRequest {
  action: 'approve' | 'reject'
  rejectionReason?: string
}

/** PUT /api/admin/status-reports/[id]/review 요청 */
export interface StatusReportReviewRequest {
  action: 'resolve'
}

/** PUT /api/admin/status-reports/spots/[spotId]/status 요청 */
export interface SpotStatusUpdateRequest {
  status: SpotStatus
}

/** GET /api/admin/dashboard/summary 응답 */
export interface DashboardSummaryResponse {
  pendingReports: number
  pendingSupplements: number
  pendingStatusReports: number
}

/** GET /api/admin/supplements 응답 */
export interface AdminSupplementsResponse {
  supplements: SpotSupplement[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** GET /api/admin/status-reports 응답 */
export interface AdminStatusReportsResponse {
  reports: SpotStatusReport[]
  total: number
  page: number
  limit: number
  totalPages: number
}
