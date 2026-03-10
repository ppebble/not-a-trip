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

  // Check-ins (순례 인증)
  CHECKINS: {
    BASE: '/api/checkins',
    DETAIL: (id: string) => `/api/checkins/${id}`,
    RANKING: '/api/checkins/ranking',
    STATS: '/api/checkins/stats',
  },

  // Routes (순례 코스)
  ROUTES: {
    BASE: '/api/routes',
    DETAIL: (id: string) => `/api/routes/${id}`,
    RECOMMENDED: '/api/routes/recommended',
    BOOKMARK: (id: string) => `/api/routes/${id}/bookmark`,
    COMPLETE: (id: string) => `/api/routes/${id}/complete`,
  },

  // Users (유저)
  USERS: {
    STATS: (id: string) => `/api/users/${id}/stats`,
    BADGES: (id: string) => `/api/users/${id}/badges`,
    PROGRESS: (id: string) => `/api/users/${id}/progress`,
  },

  // Admin
  ADMIN: {
    REPORTS: '/api/admin/reports',
    REPORT_DETAIL: (id: string) => `/api/admin/reports/${id}`,
    STATUS_REPORTS: '/api/admin/status-reports',
    STATUS_REPORT_DETAIL: (id: string) => `/api/admin/status-reports/${id}`,
    SUPPLEMENTS: '/api/admin/supplements',
    SUPPLEMENT_DETAIL: (id: string) => `/api/admin/supplements/${id}`,
    CONTENT_IMAGES: '/api/admin/content-images',
    CONTENT_IMAGES_SYNC: '/api/admin/content-images/sync',
    DASHBOARD_SUMMARY: '/api/admin/dashboard/summary',
  },

  // Content Names (자동완성)
  CONTENT_NAMES: '/api/content-names',

  // Content Images (콘텐츠 이미지)
  CONTENT_IMAGES: '/api/content-images',

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
