import type { SpotCategory } from '@/types/spot'

/**
 * 소셜 프루프 실제 데이터
 * 웹 검색으로 검증된 실제 성지순례/팬 방문 명소 기반
 * 6개 카테고리 각 최소 2개, 총 23개 카드
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 7.3
 */

export interface ProofData {
  id: string
  categoryTag: SpotCategory
  spotName: string
  comment: string
  /** 스팟 실제 사진 */
  image: string
  /** 작품 속 장면 이미지 (선택) */
  sceneImage?: string
}

export const PROOF_DUMMY_DATA: ProofData[] = [
  {
    id: '1',
    categoryTag: 'animation',
    spotName: '가마쿠라코코마에 건널목',
    comment:
      '슬램덩크 오프닝 그 장면! 에노덴 전차가 지나가는 순간 소름이 돋았어요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 슬램덩크 오프닝 장면으로 교체
  },
  {
    id: '2',
    categoryTag: 'animation',
    spotName: '니시노미야키타 고등학교',
    comment: '하루히 덕후라면 필수 코스, 학교 앞에서 SOS단 포즈 찍었어요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 하루히 학교 장면으로 교체
  },
  {
    id: '3',
    categoryTag: 'animation',
    spotName: '지브리 미술관',
    comment:
      '미타카의 숲속에 숨겨진 보물 같은 곳, 예약 전쟁이 치열하지만 그만한 가치가 있어요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 지브리 작품 장면으로 교체
  },
  {
    id: '4',
    categoryTag: 'sports',
    spotName: '캄프 노우',
    comment:
      '바르셀로나 홈구장 투어에서 라커룸까지 들어가 봤는데 전율이 느껴졌어요',
    image: '/icons/categories/sports.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/sports.webp', // TODO: 경기 장면으로 교체
  },
  {
    id: '5',
    categoryTag: 'sports',
    spotName: '올드 트래포드',
    comment:
      '꿈의 극장이라는 별명답게 경기장에 들어서는 순간 눈물이 날 뻔했어요',
    image: '/icons/categories/sports.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/sports.webp', // TODO: 경기 장면으로 교체
  },
  {
    id: '6',
    categoryTag: 'sports',
    spotName: '한신 고시엔 구장',
    comment:
      '일본 야구의 성지, 고교야구 결승전 분위기는 정말 말로 표현이 안 돼요',
    image: '/icons/categories/sports.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/sports.webp', // TODO: 고교야구 장면으로 교체
  },
  {
    id: '7',
    categoryTag: 'movie_drama',
    spotName: '주문진 방파제',
    comment:
      '도깨비에서 은탁이 김신을 처음 만난 그 방파제, 바다 바람이 드라마 속 그대로였어요',
    image: '/icons/categories/movie_drama.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/movie_drama.webp', // TODO: 도깨비 방파제 장면으로 교체
  },
  {
    id: '8',
    categoryTag: 'movie_drama',
    spotName: '킹스크로스역 9와 3/4 승강장',
    comment:
      '해리포터 팬이라면 필수! 카트 밀고 사진 찍는 줄이 길지만 꼭 해볼 만해요',
    image: '/icons/categories/movie_drama.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/movie_drama.webp', // TODO: 해리포터 장면으로 교체
  },
  {
    id: '9',
    categoryTag: 'movie_drama',
    spotName: '호비튼 무비 세트',
    comment:
      '뉴질랜드 마타마타의 실제 촬영지, 호빗 마을이 그대로 보존되어 있어서 감동이에요',
    image: '/icons/categories/movie_drama.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/movie_drama.webp', // TODO: 반지의 제왕 장면으로 교체
  },
  {
    id: '10',
    categoryTag: 'music',
    spotName: '도쿄돔',
    comment: '5만 명이 함께 떼창하는 경험은 현장에서만 느낄 수 있는 감동이에요',
    image: '/icons/categories/music.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/music.webp', // TODO: 콘서트 장면으로 교체
  },
  {
    id: '11',
    categoryTag: 'music',
    spotName: 'HYBE 인사이트',
    comment:
      '용산 하이브 건물 앞에서 아미들과 함께한 시간, BTS 팬이라면 꼭 가보세요',
    image: '/icons/categories/music.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/music.webp', // TODO: BTS 관련 장면으로 교체
  },
  {
    id: '12',
    categoryTag: 'game',
    spotName: '가부키초',
    comment:
      '용과 같이 카무로초의 실제 모델, 네온사인 거리를 걸으면 게임 속에 들어온 기분이에요',
    image: '/icons/categories/game.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/game.webp', // TODO: 용과 같이 게임 장면으로 교체
  },
  {
    id: '13',
    categoryTag: 'game',
    spotName: '슈퍼 닌텐도 월드',
    comment:
      'USJ 안의 마리오 세계가 현실로! 파워업 밴드 차고 코인 모으는 재미가 쏠쏠해요',
    image: '/icons/categories/game.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/game.webp', // TODO: 마리오 게임 장면으로 교체
  },
  {
    id: '14',
    categoryTag: 'other',
    spotName: '포켓몬 센터 메가 도쿄',
    comment:
      '이케부쿠로 선샤인시티의 포켓몬 천국, 한정판 굿즈 쇼핑에 시간 가는 줄 몰랐어요',
    image: '/icons/categories/other.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/other.webp', // TODO: 포켓몬 관련 장면으로 교체
  },
  {
    id: '15',
    categoryTag: 'other',
    spotName: '아키하바라 전기거리',
    comment:
      '오타쿠 문화의 중심지, 피규어샵과 메이드카페가 즐비한 거리를 걷는 것만으로도 행복해요',
    image: '/icons/categories/other.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/other.webp', // TODO: 아키하바라 관련 장면으로 교체
  },
  {
    id: '16',
    categoryTag: 'animation',
    spotName: '스가 신사 계단',
    comment:
      '너의 이름은 마지막 장면의 그 계단! 요츠야역에서 걸어가면 포스터 속 풍경이 그대로예요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 너의 이름은 계단 장면으로 교체
  },
  {
    id: '17',
    categoryTag: 'animation',
    spotName: '하코네 유모토',
    comment:
      '에반게리온의 제3신도쿄시 모델, 온천 마을 곳곳에 에바 콜라보가 숨어있어요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 에반게리온 하코네 장면으로 교체
  },
  {
    id: '18',
    categoryTag: 'animation',
    spotName: '시부야 스크램블 교차로',
    comment:
      '주술회전 시부야 사변의 무대, 하치코 앞에서 고죠 사토루를 떠올리며 사진 찍었어요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 주술회전 시부야 장면으로 교체
  },
  {
    id: '19',
    categoryTag: 'animation',
    spotName: '구마모토현 루피 동상',
    comment:
      '원피스 작가 오다 에이이치로의 고향, 밀짚모자 해적단 동상 10개를 찾아다니는 재미가 있어요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 원피스 루피 장면으로 교체
  },
  {
    id: '20',
    categoryTag: 'animation',
    spotName: '히타시 오야마댐',
    comment:
      '진격의 거인 작가 이사야마 하지메의 고향, 댐 앞 에렌·미카사·아르민 동상이 압도적이에요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 진격의 거인 장면으로 교체
  },
  {
    id: '21',
    categoryTag: 'animation',
    spotName: '지우펀 올드 스트리트',
    comment:
      '센과 치히로의 행방불명 분위기 그대로, 홍등이 켜진 골목을 걸으면 유바바의 목욕탕이 떠올라요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 센과 치히로 장면으로 교체
  },
  {
    id: '22',
    categoryTag: 'animation',
    spotName: '모토스코 캠프장',
    comment:
      '유루캠 1화의 그 캠프장! 후지산을 바라보며 컵라면 먹는 린의 기분을 직접 느낄 수 있어요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 유루캠 후지산 장면으로 교체
  },
  {
    id: '23',
    categoryTag: 'animation',
    spotName: '메이지무라 박물관',
    comment:
      '귀멸의 칼날 나비저택의 모델, 다이쇼 시대 건축물이 그대로 보존되어 있어 팬이라면 감동이에요',
    image: '/icons/categories/animation.webp', // TODO: 실제 스팟 사진으로 교체
    sceneImage: '/icons/categories/animation.webp', // TODO: 귀멸의 칼날 나비저택 장면으로 교체
  },
]
