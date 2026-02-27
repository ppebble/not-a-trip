/**
 * 성지순례 코스/루트 시스템 타입 정의
 * Spec: 10-pilgrimage-route
 */

// ============================================
// Route (코스) 타입
// ============================================

/** 코스 난이도 */
export type RouteDifficulty = 'easy' | 'moderate' | 'hard'

/** 코스 내 스팟 정보 (순서는 배열 인덱스로 보장) */
export interface RouteSpot {
  /** 스팟 ID (spots 컬렉션 참조) */
  spotId: string
  /** 스팟명 (비정규화, 조회 성능용) */
  spotName: string
  /** 좌표 (비정규화, 지도 표시용) */
  coordinates: { lat: number; lng: number }
  /** 썸네일 URL (비정규화, 오프라인 캐싱용) */
  thumbnailUrl: string
  /** 이전 스팟으로부터의 거리 (m), 첫 스팟은 null */
  distanceFromPrev: number | null
  /** 이전 스팟으로부터의 예상 도보 시간 (분), 첫 스팟은 null */
  walkTimeFromPrev: number | null
  /** 스팟별 메모 (선택) */
  note?: string
  /**
   * 스팟 유효성 플래그 (비정규화)
   * - true: 정상 (기본값)
   * - false: 원본 스팟이 삭제되었거나 '소실됨' 상태
   */
  isAvailable?: boolean
}

/** 코스 문서 */
export interface Route {
  id: string
  /** 코스명 */
  name: string
  /** 코스 설명 */
  description: string
  /** 예상 총 소요시간 (분) */
  estimatedDuration: number
  /** 난이도 */
  difficulty: RouteDifficulty
  /** 스팟 목록 (배열 인덱스 = 순서) */
  spots: RouteSpot[]
  /** 총 거리 (m) */
  totalDistance: number
  /** 관련 작품명 목록 */
  relatedContentNames: string[]
  /** 지역 태그 (예: "도쿄", "가마쿠라") */
  regionTag?: string
  /** 공개 여부 */
  isPublic: boolean
  /** 공식 추천 코스 여부 (관리자 설정) */
  isOfficial: boolean
  /** 북마크 수 (비정규화) */
  bookmarkCount: number
  /** 완주 수 (비정규화) */
  completionCount: number
  /** 작성자 ID */
  authorId: string
  /** 작성자 이름 */
  authorName: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// RouteBookmark (코스 저장) 타입
// ============================================

/** 코스 북마크 */
export interface RouteBookmark {
  id: string
  routeId: string
  userId: string
  createdAt: Date
}

// ============================================
// RouteCompletion (코스 완주 기록) 타입
// ============================================

/** 코스 완주 기록 */
export interface RouteCompletion {
  id: string
  routeId: string
  userId: string
  /** 완주 시 인증한 스팟 ID 목록 */
  checkedSpotIds: string[]
  /** 소요 시간 (분) */
  duration: number
  completedAt: Date
}
