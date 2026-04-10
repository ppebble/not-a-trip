import type { SpotCategory } from '@/types/spot'

/**
 * 소셜 프루프 더미 데이터
 * 초기 단계에서 실제 사용자 데이터 대신 마스코트 일러스트 기반 더미 카드로 대체
 * 6개 카테고리를 모두 커버하는 8개 카드
 * Requirements: 3.2
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
    spotName: '스즈미야 하루히 성지',
    comment: '실제로 가보니 감동이었어요! 작품 속 그 장면이 눈앞에 펼쳐지다니',
    image: '/icons/categories/animation.webp',
  },
  {
    id: '2',
    categoryTag: 'sports',
    spotName: '캄프 누 스타디움',
    comment: '경기장 투어하면서 소름 돋았어요, 직관은 역시 현장이 최고',
    image: '/icons/categories/sports.webp',
  },
  {
    id: '3',
    categoryTag: 'movie_drama',
    spotName: '도깨비 촬영지 강릉',
    comment: '드라마 속 그 해변을 직접 걸어보니 감회가 새로웠어요',
    image: '/icons/categories/movie_drama.webp',
  },
  {
    id: '4',
    categoryTag: 'music',
    spotName: '도쿄돔',
    comment: '최애 아티스트 콘서트 다녀왔는데 평생 잊지 못할 경험이에요',
    image: '/icons/categories/music.webp',
  },
  {
    id: '5',
    categoryTag: 'game',
    spotName: '용과 같이 카무로초',
    comment: '게임 속 거리를 실제로 걸으니 현실과 게임의 경계가 사라져요',
    image: '/icons/categories/game.webp',
  },
  {
    id: '6',
    categoryTag: 'other',
    spotName: '지브리 미술관',
    comment: '팬이라면 꼭 한 번은 가봐야 할 곳, 예약 필수!',
    image: '/icons/categories/other.webp',
  },
  {
    id: '7',
    categoryTag: 'animation',
    spotName: '슬램덩크 건널목',
    comment: '오프닝 장면 그대로! 사진 찍으려는 팬들로 항상 북적여요',
    image: '/icons/categories/animation.webp',
  },
  {
    id: '8',
    categoryTag: 'movie_drama',
    spotName: '해리포터 킹스크로스역',
    comment: '9와 3/4 승강장 앞에서 사진 찍으니 마법사가 된 기분이에요',
    image: '/icons/categories/movie_drama.webp',
  },
]
