import type { SpotCategory } from '@/types/spot'

/**
 * 소셜 프루프 실제 데이터
 * 웹 검색으로 검증된 실제 성지순례/팬 방문 명소 기반
 * 6개 카테고리 각 최소 2개, 총 14개 카드
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.3
 */

export interface ProofData {
  id: string
  categoryTag: SpotCategory
  spotName: string
  comment: string
  image: string
}

export const PROOF_DUMMY_DATA: ProofData[] = [
  {
    id: '1',
    categoryTag: 'animation',
    spotName: '가마쿠라코코마에 건널목',
    comment:
      '슬램덩크 오프닝 그 장면! 에노덴 전차가 지나가는 순간 소름이 돋았어요',
    image: '/icons/categories/animation.webp',
  },
  {
    id: '2',
    categoryTag: 'animation',
    spotName: '니시노미야키타 고등학교',
    comment: '하루히 덕후라면 필수 코스, 학교 앞에서 SOS단 포즈 찍었어요',
    image: '/icons/categories/animation.webp',
  },
  {
    id: '3',
    categoryTag: 'animation',
    spotName: '지브리 미술관',
    comment:
      '미타카의 숲속에 숨겨진 보물 같은 곳, 예약 전쟁이 치열하지만 그만한 가치가 있어요',
    image: '/icons/categories/animation.webp',
  },
  {
    id: '4',
    categoryTag: 'sports',
    spotName: '캄프 노우',
    comment:
      '바르셀로나 홈구장 투어에서 라커룸까지 들어가 봤는데 전율이 느껴졌어요',
    image: '/icons/categories/sports.webp',
  },
  {
    id: '5',
    categoryTag: 'sports',
    spotName: '올드 트래포드',
    comment:
      '꿈의 극장이라는 별명답게 경기장에 들어서는 순간 눈물이 날 뻔했어요',
    image: '/icons/categories/sports.webp',
  },
  {
    id: '6',
    categoryTag: 'sports',
    spotName: '한신 고시엔 구장',
    comment:
      '일본 야구의 성지, 고교야구 결승전 분위기는 정말 말로 표현이 안 돼요',
    image: '/icons/categories/sports.webp',
  },
  {
    id: '7',
    categoryTag: 'movie_drama',
    spotName: '주문진 방파제',
    comment:
      '도깨비에서 은탁이 김신을 처음 만난 그 방파제, 바다 바람이 드라마 속 그대로였어요',
    image: '/icons/categories/movie_drama.webp',
  },
  {
    id: '8',
    categoryTag: 'movie_drama',
    spotName: '킹스크로스역 9와 3/4 승강장',
    comment:
      '해리포터 팬이라면 필수! 카트 밀고 사진 찍는 줄이 길지만 꼭 해볼 만해요',
    image: '/icons/categories/movie_drama.webp',
  },
  {
    id: '9',
    categoryTag: 'movie_drama',
    spotName: '호비튼 무비 세트',
    comment:
      '뉴질랜드 마타마타의 실제 촬영지, 호빗 마을이 그대로 보존되어 있어서 감동이에요',
    image: '/icons/categories/movie_drama.webp',
  },
  {
    id: '10',
    categoryTag: 'music',
    spotName: '도쿄돔',
    comment: '5만 명이 함께 떼창하는 경험은 현장에서만 느낄 수 있는 감동이에요',
    image: '/icons/categories/music.webp',
  },
  {
    id: '11',
    categoryTag: 'music',
    spotName: 'HYBE 인사이트',
    comment:
      '용산 하이브 건물 앞에서 아미들과 함께한 시간, BTS 팬이라면 꼭 가보세요',
    image: '/icons/categories/music.webp',
  },
  {
    id: '12',
    categoryTag: 'game',
    spotName: '가부키초',
    comment:
      '용과 같이 카무로초의 실제 모델, 네온사인 거리를 걸으면 게임 속에 들어온 기분이에요',
    image: '/icons/categories/game.webp',
  },
  {
    id: '13',
    categoryTag: 'game',
    spotName: '슈퍼 닌텐도 월드',
    comment:
      'USJ 안의 마리오 세계가 현실로! 파워업 밴드 차고 코인 모으는 재미가 쏠쏠해요',
    image: '/icons/categories/game.webp',
  },
  {
    id: '14',
    categoryTag: 'other',
    spotName: '포켓몬 센터 메가 도쿄',
    comment:
      '이케부쿠로 선샤인시티의 포켓몬 천국, 한정판 굿즈 쇼핑에 시간 가는 줄 몰랐어요',
    image: '/icons/categories/other.webp',
  },
  {
    id: '15',
    categoryTag: 'other',
    spotName: '아키하바라 전기거리',
    comment:
      '오타쿠 문화의 중심지, 피규어샵과 메이드카페가 즐비한 거리를 걷는 것만으로도 행복해요',
    image: '/icons/categories/other.webp',
  },
]
