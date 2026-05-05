import type { SpotCategory } from '@/types/spot'
import { CATEGORY_CONFIG } from '@/types/spot'

// ============================================
// Interfaces
// ============================================

/**
 * 쇼케이스 카드 데이터 타입
 * 히어로 섹션 플로팅 카드 콜라주에 표시할 카드 데이터
 * - 정적 데이터 또는 실제 스팟 데이터 기반으로 생성
 */
export interface ShowcaseCard {
  /** 카드 고유 ID */
  id: string
  /** 스팟 이름 */
  spotName: string
  /** 관련 작품명 (없으면 스팟 이름 사용) */
  contentName: string
  /** 추가 작품명 목록 ("+N" 배지 계산용) */
  additionalContentNames?: string[]
  /** 카테고리 */
  category: SpotCategory
  /** 이미지 URL */
  imageUrl: string
}

/**
 * 카드 배치 설정
 * 데스크톱에서 absolute 배치 시 사용하는 위치/크기/애니메이션 설정
 */
export interface CardPlacement {
  /** top 위치 (%) */
  top: number
  /** left 위치 (%) */
  left: number
  /** 회전 각도 (deg) */
  rotate: number
  /** 카드 크기 */
  size: 'sm' | 'md' | 'lg'
  /** 애니메이션 딜레이 (s) */
  delay: number
  /** 애니메이션 주기 (s) */
  duration: number
  /** z-index */
  zIndex: number
}

// ============================================
// 쇼케이스 카드 정적 데이터 (12장)
// ============================================

/**
 * 히어로 섹션에 표시할 쇼케이스 카드 데이터
 * - 12장 (데스크톱 전체 표시, 모바일은 6장만)
 * - 6개 카테고리 균형 배분 (카테고리당 2장)
 * - 카테고리 순환 배치: [anim, sports, movie, music, game, other] × 2
 *   → 6장 슬라이스 시 각 카테고리 1장씩 보장
 */
export const SHOWCASE_CARDS: ShowcaseCard[] = [
  // ─── 1차 순환 (인덱스 0~5) ───
  {
    id: 'sc-1',
    spotName: '가마쿠라코코마에역',
    contentName: '슬램덩크',
    category: 'animation',
    imageUrl: '/images/showcase/kamakura.webp',
  },
  {
    id: 'sc-2',
    spotName: '캄프 노우',
    contentName: 'FC 바르셀로나',
    category: 'sports',
    imageUrl: '/images/showcase/camp-nou.webp',
  },
  {
    id: 'sc-3',
    spotName: '킹스크로스역 9¾ 플랫폼',
    contentName: '해리 포터',
    category: 'movie_drama',
    imageUrl: '/images/showcase/kings-cross.webp',
  },
  {
    id: 'sc-4',
    spotName: '애비 로드',
    contentName: '비틀즈',
    category: 'music',
    imageUrl: '/images/showcase/abbey-road.webp',
  },
  {
    id: 'sc-5',
    spotName: '닌텐도 본사',
    contentName: '닌텐도',
    category: 'game',
    imageUrl: '/images/showcase/nintendo-hq.webp',
  },
  {
    id: 'sc-6',
    spotName: '페트라',
    contentName: '인디아나 존스',
    category: 'other',
    imageUrl: '/images/showcase/petra.webp',
  },

  // ─── 2차 순환 (인덱스 6~11) ───
  {
    id: 'sc-7',
    spotName: '지브리 미술관',
    contentName: '스튜디오 지브리',
    category: 'animation',
    imageUrl: '/images/showcase/ghibli-museum.webp',
  },
  {
    id: 'sc-8',
    spotName: '올드 트래포드',
    contentName: '맨체스터 유나이티드',
    category: 'sports',
    imageUrl: '/images/showcase/old-trafford.webp',
  },
  {
    id: 'sc-9',
    spotName: '두브로브니크 구시가지',
    contentName: '왕좌의 게임',
    category: 'movie_drama',
    imageUrl: '/images/showcase/dubrovnik.webp',
  },
  {
    id: 'sc-10',
    spotName: '도쿄돔',
    contentName: '도쿄돔 콘서트',
    category: 'music',
    imageUrl: '/images/showcase/tokyo-dome.webp',
  },
  {
    id: 'sc-11',
    spotName: 'LA 컨벤션 센터',
    contentName: 'E3 게임쇼',
    category: 'game',
    imageUrl: '/images/showcase/la-convention.webp',
  },
  {
    id: 'sc-12',
    spotName: '앙코르 와트',
    contentName: '앙코르 와트',
    category: 'other',
    imageUrl: '/images/showcase/angkor-wat.webp',
  },
]

// ============================================
// 카드 배치 데이터 (12개)
// ============================================

/**
 * 각 카드의 위치/크기/애니메이션 설정
 * - top, left: 0~100% 범위 내 배치
 * - rotate: 카드 기울기 (deg)
 * - size: sm | md | lg
 * - delay: 애니메이션 시작 딜레이 (0~2.5초)
 * - duration: 애니메이션 주기 (6~8.5초)
 * - zIndex: 겹침 순서
 */
export const CARD_PLACEMENTS: CardPlacement[] = [
  // 좌상단 영역
  { top: 2, left: 2, rotate: -8, size: 'lg', delay: 0, duration: 6, zIndex: 3 },
  {
    top: 8,
    left: 48,
    rotate: 5,
    size: 'md',
    delay: 0.5,
    duration: 7,
    zIndex: 2,
  },
  // 중상단 영역
  {
    top: 30,
    left: -2,
    rotate: 3,
    size: 'md',
    delay: 1,
    duration: 8,
    zIndex: 2,
  },
  {
    top: 28,
    left: 58,
    rotate: -5,
    size: 'lg',
    delay: 1.5,
    duration: 6.5,
    zIndex: 3,
  },
  // 중앙 영역
  {
    top: 52,
    left: 18,
    rotate: 7,
    size: 'sm',
    delay: 2,
    duration: 7.5,
    zIndex: 1,
  },
  {
    top: 55,
    left: 62,
    rotate: -3,
    size: 'md',
    delay: 0.8,
    duration: 8.5,
    zIndex: 2,
  },
  // 좌측 중간
  {
    top: 5,
    left: 28,
    rotate: -12,
    size: 'sm',
    delay: 1.2,
    duration: 7,
    zIndex: 1,
  },
  // 중앙 하단
  {
    top: 44,
    left: 38,
    rotate: 10,
    size: 'sm',
    delay: 1.8,
    duration: 6,
    zIndex: 1,
  },
  // 하단 영역
  {
    top: 72,
    left: 2,
    rotate: -6,
    size: 'sm',
    delay: 2.5,
    duration: 8,
    zIndex: 1,
  },
  {
    top: 76,
    left: 44,
    rotate: 4,
    size: 'md',
    delay: 0.3,
    duration: 7,
    zIndex: 2,
  },
  // 우측 영역
  {
    top: 18,
    left: 78,
    rotate: -10,
    size: 'sm',
    delay: 1.6,
    duration: 6.5,
    zIndex: 1,
  },
  {
    top: 50,
    left: 82,
    rotate: 8,
    size: 'sm',
    delay: 2.2,
    duration: 7.5,
    zIndex: 1,
  },
]

// ============================================
// 유틸 함수
// ============================================

/**
 * 카테고리별 accent 색상을 반환한다
 * 기존 CATEGORY_CONFIG의 fgColor를 활용
 *
 * @param category - SpotCategory 값
 * @returns CSS 색상 문자열 (rgb(var(--category-*-fg)) 형태)
 */
export function getCategoryAccentColor(category: SpotCategory): string {
  const config = CATEGORY_CONFIG[category]
  if (!config) {
    return CATEGORY_CONFIG.other.fgColor
  }
  return config.fgColor
}
