import type { SpotCategory } from '@/types/spot'

/**
 * 카테고리 스토리텔링 섹션 설정 데이터
 * 6개 카테고리별 제목, 설명, 마스코트 소품, 대표 이미지, 컬러 토큰 정의
 * Requirements: 2.1, 2.5, 2.7
 */

export interface CategoryStoryConfig {
  category: SpotCategory
  title: string
  description: string
  /** 마스코트 큐레이터 소품 이미지 경로 */
  mascotProp: string
  /** 대표 스팟 이미지 경로 */
  spotImage: string
  /** CSS 변수 접두사 (--category-{token}-bg/fg) */
  colorToken: string
}

export const CATEGORY_STORIES: CategoryStoryConfig[] = [
  {
    category: 'animation',
    title: '애니메이션 성지순례',
    description: '좋아하는 작품 속 그 장소를 직접 걸어보세요',
    mascotProp: '/icons/categories/animation.webp',
    spotImage: '/icons/categories/animation.webp',
    colorToken: 'category-anime',
  },
  {
    category: 'sports',
    title: '스포츠 직관 여행',
    description: '경기장의 열기를 현장에서 느껴보세요',
    mascotProp: '/icons/categories/sports.webp',
    spotImage: '/icons/categories/sports.webp',
    colorToken: 'category-sports',
  },
  {
    category: 'movie_drama',
    title: '영화/드라마 촬영지',
    description: '스크린 속 그 장면, 직접 서보세요',
    mascotProp: '/icons/categories/movie_drama.webp',
    spotImage: '/icons/categories/movie_drama.webp',
    colorToken: 'category-movie-drama',
  },
  {
    category: 'music',
    title: '음악/콘서트 장소',
    description: '아티스트의 무대를 직접 찾아가 보세요',
    mascotProp: '/icons/categories/music.webp',
    spotImage: '/icons/categories/music.webp',
    colorToken: 'category-music',
  },
  {
    category: 'game',
    title: '게임 속 세계',
    description: '게임 속 배경이 된 실제 장소를 탐험하세요',
    mascotProp: '/icons/categories/game.webp',
    spotImage: '/icons/categories/game.webp',
    colorToken: 'category-game',
  },
  {
    category: 'other',
    title: '특별한 장소',
    description: '팬들만 아는 숨겨진 명소를 발견하세요',
    mascotProp: '/icons/categories/other.webp',
    spotImage: '/icons/categories/other.webp',
    colorToken: 'category-other',
  },
]
