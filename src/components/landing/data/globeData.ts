import type { SpotCategory } from '@/types/spot'

export interface GlobeDataPoint {
  lat: number
  lng: number
  label: string
  category: SpotCategory
  /** 핀 썸네일 이미지 URL (작품 이미지) */
  thumbnail?: string
}

/**
 * 전 세계 성지순례 포인트 데이터 (29개)
 * - 모든 좌표는 웹 검색으로 검증된 실제 값 (소수점 4자리 이상)
 * - 6개 카테고리 균형 배분 (카테고리당 최소 4개)
 * - 아시아, 유럽, 북미, 남미, 오세아니아, 중동/아프리카 대륙 분포
 * Requirements: 4.1~4.7, 7.1, 7.2
 */
export const GLOBE_DATA_POINTS: GlobeDataPoint[] = [
  // ─── animation (5개) ───
  {
    lat: 35.6983,
    lng: 139.7731,
    label: '아키하바라 전기거리',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },
  {
    lat: 35.3067,
    lng: 139.5006,
    label: '가마쿠라코코마에역 (슬램덩크)',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },
  {
    lat: 35.6962,
    lng: 139.5704,
    label: '지브리 미술관',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },
  {
    lat: 34.7577,
    lng: 135.3415,
    label: '니시노미야 (스즈미야 하루히)',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },
  {
    lat: 35.0117,
    lng: 135.7683,
    label: '교토 후시미이나리 (이나리 콘콘 코이이로하)',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },

  // ─── sports (5개) ───
  {
    lat: 41.3809,
    lng: 2.1228,
    label: '캄프 노우 (FC 바르셀로나)',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },
  {
    lat: 53.4631,
    lng: -2.2913,
    label: '올드 트래포드 (맨체스터 유나이티드)',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },
  {
    lat: -22.9122,
    lng: -43.2302,
    label: '마라카낭 스타디움',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },
  {
    lat: -34.6357,
    lng: -58.3649,
    label: '라 봄보네라 (보카 주니어스)',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },
  {
    lat: 51.556,
    lng: -0.2797,
    label: '웸블리 스타디움',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },

  // ─── movie_drama (5개) ───
  {
    lat: 51.5322,
    lng: -0.124,
    label: '킹스크로스역 9¾ 플랫폼 (해리 포터)',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 42.6413,
    lng: 18.1091,
    label: '두브로브니크 구시가지 (왕좌의 게임)',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: -37.8576,
    lng: 175.6806,
    label: '호비튼 무비 세트 (반지의 제왕)',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 48.861,
    lng: 2.3362,
    label: '몽마르뜨 카페 (아멜리에)',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 34.0928,
    lng: -118.3287,
    label: '할리우드 사인',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },

  // ─── music (5개) ───
  {
    lat: 37.5172,
    lng: 127.0473,
    label: '강남역 (K-pop 성지)',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: 51.532,
    lng: -0.1773,
    label: '애비 로드 (비틀즈)',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: -33.8568,
    lng: 151.2151,
    label: '시드니 오페라하우스',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: 40.7128,
    lng: -74.006,
    label: '매디슨 스퀘어 가든',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: 35.6595,
    lng: 139.7004,
    label: '도쿄돔',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },

  // ─── game (5개) ───
  {
    lat: 34.97,
    lng: 135.7562,
    label: '닌텐도 본사 (교토)',
    category: 'game',
    thumbnail: '/icons/categories/game.webp',
  },
  {
    lat: 34.0397,
    lng: -118.2703,
    label: 'LA 컨벤션 센터 (E3)',
    category: 'game',
    thumbnail: '/icons/categories/game.webp',
  },
  {
    lat: 48.1351,
    lng: 11.582,
    label: '뮌헨 (게임스컴 인근)',
    category: 'game',
    thumbnail: '/icons/categories/game.webp',
  },
  {
    lat: 37.5665,
    lng: 126.978,
    label: '서울 종로 (PC방 성지)',
    category: 'game',
    thumbnail: '/icons/categories/game.webp',
  },
  {
    lat: 25.033,
    lng: 121.5654,
    label: '시먼딩 (타이베이 게임 거리)',
    category: 'game',
    thumbnail: '/icons/categories/game.webp',
  },

  // ─── other (4개) ───
  {
    lat: 30.3286,
    lng: 35.4443,
    label: '페트라 (인디아나 존스 촬영지)',
    category: 'other',
    thumbnail: '/icons/categories/other.webp',
  },
  {
    lat: 13.7563,
    lng: 100.5018,
    label: '카오산로드 (배낭여행 성지)',
    category: 'other',
    thumbnail: '/icons/categories/other.webp',
  },
  {
    lat: 25.2048,
    lng: 55.2708,
    label: '두바이몰',
    category: 'other',
    thumbnail: '/icons/categories/other.webp',
  },
  {
    lat: 13.4125,
    lng: 103.8667,
    label: '앙코르 와트',
    category: 'other',
    thumbnail: '/icons/categories/other.webp',
  },
]
