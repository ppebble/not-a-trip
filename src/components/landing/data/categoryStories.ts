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
    description:
      '슬램덩크의 가마쿠라 건널목, 스즈미야 하루히의 니시노미야를 직접 걸어보세요',
    mascotProp: '/icons/categories/animation.webp',
    spotImage:
      'https://pub-fb19ed767e5747d6b5dbc403bfce5486.r2.dev/spots/animation/real-ani-002-kamakurakokomae-crossing.webp',
    colorToken: 'category-anime',
  },
  {
    category: 'sports',
    title: '스포츠 직관 여행',
    description:
      '캄프 노우의 함성, 웸블리 스타디움의 열기를 현장에서 느껴보세요',
    mascotProp: '/icons/categories/sports.webp',
    spotImage: '/uploads/spots/replacements/campnou-fd1ffbdfbd42.jpg',
    colorToken: 'category-sports',
  },
  {
    category: 'movie_drama',
    title: '영화/드라마 촬영지',
    description:
      '해리 포터의 킹스크로스역, 도깨비의 주문진 방파제에 직접 서보세요',
    mascotProp: '/icons/categories/movie_drama.webp',
    spotImage: '/uploads/spots/replacements/real-mov-001-1913f25dddcbee.webp',
    colorToken: 'category-movie-drama',
  },
  {
    category: 'music',
    title: '음악/콘서트 장소',
    description:
      '비틀즈의 캐번 클럽, 런던 애비 로드 횡단보도를 직접 찾아가 보세요',
    mascotProp: '/icons/categories/music.webp',
    spotImage: '/uploads/scenes/REAL-MUS-001-scene-0.jpg',
    colorToken: 'category-music',
  },
  {
    category: 'game',
    title: '게임 속 세계',
    description:
      '용과 같이의 가부키초, 어쌔신 크리드의 피렌체를 실제로 탐험하세요',
    mascotProp: '/icons/categories/game.webp',
    spotImage: '/uploads/scenes/REAL-GAM-002-scene-0.jpg',
    colorToken: 'category-game',
  },
  {
    category: 'other',
    title: '특별한 장소',
    description:
      '셜록 홈즈의 베이커가 221B, 엘비스의 그레이스랜드 같은 숨겨진 명소를 발견하세요',
    mascotProp: '/icons/categories/other.webp',
    spotImage: '/icons/categories/other.webp',
    colorToken: 'category-other',
  },
]
