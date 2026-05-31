import type { SpotCategory } from '@/types/spot'

export interface ProofData {
  id: string
  categoryTag: SpotCategory
  spotName: string
  contentName?: string
  comment: string
  image: string
  sceneImage?: string
}

export const PROOF_DUMMY_DATA: ProofData[] = [
  {
    id: '1',
    categoryTag: 'animation',
    spotName: '가마쿠라코코마에역 건널목',
    contentName: '슬램덩크',
    comment:
      '슬램덩크 오프닝 그 장면! 에노덴 전차가 지나가는 순간 소름이 돋았어요',
    image:
      'https://pub-fb19ed767e5747d6b5dbc403bfce5486.r2.dev/spots/animation/real-ani-002-kamakurakokomae-crossing.webp',
  },
  {
    id: '2',
    categoryTag: 'animation',
    spotName: '토요사토 초등학교 구교사',
    contentName: '케이온!',
    comment:
      '방과후 티타임 부실 분위기가 그대로 남아 있어 케이온 팬이라면 오래 머물게 돼요',
    image:
      'https://pub-fb19ed767e5747d6b5dbc403bfce5486.r2.dev/spots/animation/real-ani-030-toyosato-elementary.webp',
  },
  {
    id: '3',
    categoryTag: 'animation',
    spotName: '지우펀 올드 스트리트',
    contentName: '센과 치히로의 행방불명',
    comment:
      '홍등이 켜진 골목을 걷다 보면 영화 속 온천 마을 분위기가 바로 떠올라요',
    image:
      'https://pub-fb19ed767e5747d6b5dbc403bfce5486.r2.dev/spots/animation/real-ani-003-jiufen.webp',
  },
  {
    id: '4',
    categoryTag: 'sports',
    spotName: '캄프 누',
    contentName: 'FC 바르셀로나',
    comment:
      '바르셀로나 홈구장 투어에서 라커룸까지 들어가 봤는데 전율이 느껴졌어요',
    image: '/uploads/spots/replacements/campnou-fd1ffbdfbd42.jpg',
  },
  {
    id: '5',
    categoryTag: 'sports',
    spotName: '올드 트래포드',
    contentName: '맨체스터 유나이티드',
    comment:
      '꿈의 극장이라는 별명답게 경기장에 들어서는 순간 눈물이 날 뻔했어요',
    image: '/uploads/spots/replacements/oldtrafford-7f887cb9ba62.jpg',
  },
  {
    id: '6',
    categoryTag: 'sports',
    spotName: '고시엔 구장',
    contentName: '한신 타이거스',
    comment:
      '일본 야구의 성지, 고교야구 결승전 분위기는 정말 말로 표현이 안 돼요',
    image: '/uploads/spots/replacements/koshien-c40c6888597b.jpg',
  },
  {
    id: '7',
    categoryTag: 'movie_drama',
    spotName: '강릉 주문진 방파제',
    contentName: '도깨비',
    comment:
      '도깨비에서 은탁이 김신을 처음 만난 그 방파제, 바다 바람이 드라마 속 그대로였어요',
    image: '/uploads/spots/replacements/real-mov-002-479e2e36332ac0.webp',
  },
  {
    id: '8',
    categoryTag: 'movie_drama',
    spotName: '글렌피난 고가교',
    contentName: '해리포터 시리즈',
    comment:
      '호그와트 급행열차가 지나가는 바로 그 풍경, 해리포터 팬이라면 놓칠 수 없어요',
    image: '/uploads/spots/replacements/real-mov-001-1913f25dddcbee.webp',
  },
  {
    id: '9',
    categoryTag: 'movie_drama',
    spotName: '호비튼 무비 세트',
    contentName: '반지의 제왕 시리즈',
    comment:
      '뉴질랜드 마타마타의 실제 촬영지, 호빗 마을이 그대로 보존되어 있어서 감동이에요',
    image: '/uploads/spots/replacements/hobbiton-4308cdfe0114.jpg',
  },
  {
    id: '10',
    categoryTag: 'music',
    spotName: '도쿄돔',
    contentName: 'BTS',
    comment: '5만 명이 함께 떼창하는 경험은 현장에서만 느낄 수 있는 감동이에요',
    image: '/uploads/scenes/REAL-MUS-002-scene-0.jpg',
  },
  {
    id: '11',
    categoryTag: 'music',
    spotName: 'HYBE 인사이트',
    contentName: 'BTS',
    comment:
      '용산 하이브 건물 앞에서 아미들과 함께한 시간, BTS 팬이라면 꼭 가보세요',
    image: '/uploads/scenes/REAL-MUS-004-scene-0.webp',
  },
  {
    id: '12',
    categoryTag: 'game',
    spotName: '가부키초',
    contentName: '용과 같이',
    comment:
      '용과 같이 카무로초의 실제 모델, 네온사인 거리를 걸으면 게임 속에 들어온 기분이에요',
    image: '/uploads/spots/replacements/real-gam-001-32171b51e344d8.webp',
  },
  {
    id: '13',
    categoryTag: 'game',
    spotName: '슈퍼 닌텐도 월드',
    contentName: '슈퍼 마리오',
    comment:
      'USJ 안의 마리오 세계가 현실로! 파워업 밴드 차고 코인 모으는 재미가 쏠쏠해요',
    image: '/uploads/spots/replacements/real-gam-004-2ec0e8240c45a6.webp',
  },
  {
    id: '14',
    categoryTag: 'game',
    spotName: '포켓몬 센터 메가 도쿄',
    contentName: '포켓몬스터',
    comment:
      '이케부쿠로 선샤인시티의 포켓몬 천국, 한정판 굿즈 쇼핑에 시간 가는 줄 몰랐어요',
    image: '/uploads/scenes/REAL-GAM-003-scene-0.jpg',
  },
  {
    id: '15',
    categoryTag: 'movie_drama',
    spotName: '호비튼 무비 세트',
    contentName: '반지의 제왕',
    comment:
      '샤이어 마을 세트장이 그대로 남아 있어 판타지 여행지에 들어온 느낌이에요',
    image: '/uploads/spots/replacements/hobbiton-4308cdfe0114.jpg',
  },
  {
    id: '16',
    categoryTag: 'animation',
    spotName: '스가 신사',
    contentName: '너의 이름은',
    comment:
      '너의 이름은 마지막 장면의 그 계단! 요츠야역에서 걸어가면 포스터 속 풍경이 그대로예요',
    image:
      'https://pub-fb19ed767e5747d6b5dbc403bfce5486.r2.dev/spots/animation/real-ani-001-suga-shrine.webp',
  },
  {
    id: '17',
    categoryTag: 'animation',
    spotName: '아키하바라',
    contentName: '슈타인즈 게이트',
    comment:
      '라디오회관과 전자상가 골목을 걷다 보면 시간여행이 시작될 것 같은 분위기예요',
    image: '/uploads/spots/replacements/real-ani-010-22623e39b4319d.webp',
  },
  {
    id: '18',
    categoryTag: 'animation',
    spotName: '신주쿠교엔',
    contentName: '언어의 정원',
    comment:
      '비 오는 날 정자와 정원을 걸으면 영화 속 장면의 차분한 공기가 그대로 느껴져요',
    image: '/images/spots/animation/real-ani-042-shinjuku-gyoen.webp',
  },
  {
    id: '19',
    categoryTag: 'animation',
    spotName: '나라공원',
    contentName: '여러 애니메이션 배경',
    comment:
      '사슴과 오래된 공원이 어우러진 풍경이라 일본 배경 애니의 산책 장면을 떠올리기 좋아요',
    image: '/images/spots/animation/real-ani-011-nara-park.webp',
  },
  {
    id: '20',
    categoryTag: 'animation',
    spotName: '도요사토 초등학교 구교사',
    contentName: '케이온!',
    comment:
      '방과후 티타임의 부실 분위기가 남아 있어 케이온 팬이라면 오래 머물게 돼요',
    image: '/images/spots/animation/real-ani-030-toyosato-elementary.webp',
  },
  {
    id: '21',
    categoryTag: 'animation',
    spotName: '지우펀 올드 스트리트',
    contentName: '센과 치히로의 행방불명',
    comment:
      '센과 치히로의 행방불명 분위기 그대로, 홍등이 켜진 골목을 걸으면 유바바의 목욕탕이 떠올라요',
    image:
      'https://pub-fb19ed767e5747d6b5dbc403bfce5486.r2.dev/spots/animation/real-ani-003-jiufen.webp',
  },
  {
    id: '22',
    categoryTag: 'animation',
    spotName: '스와호',
    contentName: '너의 이름은',
    comment:
      '호수와 산 능선이 겹치는 풍경이 영화 속 마을을 떠올리게 해 성지순례 코스로 좋아요',
    image: '/images/spots/animation/real-ani-039-lake-suwa.webp',
  },
  {
    id: '23',
    categoryTag: 'animation',
    spotName: '히다후루카와역',
    contentName: '너의 이름은',
    comment:
      '영화 속 역 장면을 떠올리며 플랫폼과 마을 풍경을 함께 둘러보기 좋은 장소예요',
    image: '/images/spots/animation/real-ani-007-hida-furukawa-station.webp',
  },
]
