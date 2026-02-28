/**
 * API 엔드포인트 상수
 * 모든 API URL을 중앙에서 관리
 */

export const API_ROUTES = {
  // Auth
  AUTH: {
    REGISTER: '/api/auth/register',
  },

  // Spots
  SPOTS: {
    BASE: '/api/spots',
    DETAIL: (id: string) => `/api/spots/${id}`,
    FACILITIES: (id: string) => `/api/spots/${id}/facilities`,
    SCENES: (id: string) => `/api/spots/${id}/scenes`,
    COMMUNITY_SUMMARY: '/api/spots/community-summary',
  },

  // Scenes
  SCENES: {
    LIKE: (id: string) => `/api/scenes/${id}/like`,
  },

  // Posts
  POSTS: {
    BASE: '/api/posts',
    DETAIL: (id: string) => `/api/posts/${id}`,
    COMMENTS: (postId: string) => `/api/posts/${postId}/comments`,
    COMMENT_DETAIL: (postId: string, commentId: string) =>
      `/api/posts/${postId}/comments/${commentId}`,
  },

  // Facilities
  FACILITIES: {
    REPORT: '/api/facilities/report',
    VOTE: (id: string) => `/api/facilities/${id}/vote`,
  },

  // Media
  MEDIA: {
    COMMUNITY_SUMMARY: '/api/media/community-summary',
  },

  // Reports (성지 제보)
  REPORTS: {
    BASE: '/api/reports',
    DETAIL: (id: string) => `/api/reports/${id}`,
    NEARBY: '/api/reports/nearby',
  },

  // Spot Supplements (정보 보완)
  SUPPLEMENTS: {
    BASE: (spotId: string) => `/api/spots/${spotId}/supplements`,
  },

  // Spot Status Reports (상태 신고)
  STATUS_REPORTS: {
    BASE: (spotId: string) => `/api/spots/${spotId}/status-reports`,
  },

  // Content Names (자동완성)
  CONTENT_NAMES: '/api/content-names',

  // Upload
  UPLOAD: '/api/upload',
} as const

/**
 * URL에 쿼리 파라미터 추가
 */
export function buildUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return baseUrl

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}
