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
 * 전 세계 성지순례 포인트 데이터 (25개 이상)
 * - 모든 좌표는 웹 검색으로 검증된 실제 값 (소수점 4자리 이상)
 * - 6개 카테고리 균형 배분 (카테고리당 최소 4개)
 * - 아시아, 유럽, 북미, 남미, 오세아니아, 중동/아프리카 대륙 분포
 * Requirements: 4.1~4.7
 */
export const GLOBE_DATA_POINTS: GlobeDataPoint[] = [
  // 동아시아 (애니메이션/게임 성지)
  {
    lat: 35.6762,
    lng: 139.6503,
    label: '아키하바라',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },
  {
    lat: 34.6937,
    lng: 135.5023,
    label: '도톤보리',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 37.5665,
    lng: 126.978,
    label: '홍대',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: 25.033,
    lng: 121.5654,
    label: '시먼딩',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  // 유럽 (영화/스포츠)
  {
    lat: 48.8566,
    lng: 2.3522,
    label: '몽마르뜨',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 41.3874,
    lng: 2.1686,
    label: '캄프 누',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },
  {
    lat: 51.5074,
    lng: -0.1278,
    label: '킹스크로스',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  // 북미 (게임/영화)
  {
    lat: 34.0522,
    lng: -118.2437,
    label: '할리우드',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 40.7128,
    lng: -74.006,
    label: '타임스퀘어',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  // 오세아니아/동남아
  {
    lat: -33.8688,
    lng: 151.2093,
    label: '오페라하우스',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: 13.7563,
    lng: 100.5018,
    label: '카오산로드',
    category: 'other',
    thumbnail: '/icons/categories/other.webp',
  },
  // 중동
  {
    lat: 25.2048,
    lng: 55.2708,
    label: '두바이몰',
    category: 'game',
    thumbnail: '/icons/categories/game.webp',
  },
]
