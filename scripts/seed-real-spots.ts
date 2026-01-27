/**
 * 실제 스팟 데이터 시드 스크립트
 * 카테고리별 실제 존재하는 장소 데이터를 MongoDB에 추가합니다.
 *
 * 실행 방법:
 * npx tsx scripts/seed-real-spots.ts
 *
 * 옵션:
 * --append: 기존 데이터를 유지하고 새 데이터만 추가
 * npx tsx scripts/seed-real-spots.ts --append
 */

import { MongoClient } from 'mongodb'
import type {
  SpotCategory,
  ContentType,
  ExternalLink,
  ExternalLinkType,
} from '../src/types'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'anime-pilgrimage-map'

interface RelatedContent {
  name: string
  type: ContentType
  year?: number
  additionalInfo?: string
}

interface SeedSpot {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: { lat: number; lng: number }
  category: SpotCategory
  relatedContent: RelatedContent[]
  externalLinks?: ExternalLink[] // 외부 링크 (스포츠/음악 카테고리용)
  authorName: string
  isGuestSpot: boolean
  createdAt: Date
  updatedAt: Date
}

// 외부 링크 생성 헬퍼 함수
function createExternalLink(
  id: string,
  type: ExternalLinkType,
  label: string,
  url: string
): ExternalLink {
  return { id, type, label, url }
}

// ============================================
// 애니메이션 성지순례 명소 (10개 이상)
// ============================================
const ANIMATION_SPOTS: SeedSpot[] = [
  {
    id: 'REAL-ANI-001',
    name: '스가 신사 (너의 이름은)',
    description:
      '신카이 마코토 감독의 "너의 이름은"에서 미츠하와 타키가 재회하는 명장면의 배경이 된 신사입니다. 도쿄 요츠야에 위치한 스가 신사의 계단은 영화의 상징적인 장면으로, 전 세계 팬들이 성지순례를 위해 방문하는 인기 명소입니다.',
    photos: ['https://picsum.photos/seed/suga-shrine/800/600'],
    address: '일본 도쿄도 신주쿠구 스가초 5',
    coordinates: { lat: 35.6872, lng: 139.7197 },
    category: 'animation',
    relatedContent: [
      { name: '너의 이름은 (君の名は。)', type: 'anime', year: 2016 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-002',
    name: '가마쿠라코코마에역 건널목 (슬램덩크)',
    description:
      '슬램덩크 오프닝에 등장하는 유명한 건널목입니다. 에노덴 가마쿠라코코마에역 앞에 위치하며, 바다를 배경으로 한 이 건널목은 슬램덩크 팬들의 필수 방문 코스입니다. 2022년 영화 "더 퍼스트 슬램덩크" 개봉 후 더욱 인기가 높아졌습니다.',
    photos: ['https://picsum.photos/seed/kamakura-crossing/800/600'],
    address: '일본 가나가와현 가마쿠라시 고시고에 1-1',
    coordinates: { lat: 35.3082, lng: 139.4952 },
    category: 'animation',
    relatedContent: [
      { name: '슬램덩크 (スラムダンク)', type: 'anime', year: 1993 },
      { name: '더 퍼스트 슬램덩크', type: 'movie', year: 2022 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-003',
    name: '지우펀 (센과 치히로의 행방불명)',
    description:
      '미야자키 하야오 감독의 "센과 치히로의 행방불명"의 모티브가 된 것으로 알려진 대만의 지우펀 마을입니다. 좁은 골목과 붉은 등불이 켜진 찻집들이 영화 속 온천마을의 분위기를 연상시킵니다.',
    photos: ['https://picsum.photos/seed/jiufen/800/600'],
    address: '대만 신베이시 루이팡구 지우펀',
    coordinates: { lat: 25.1089, lng: 121.8443 },
    category: 'animation',
    relatedContent: [
      {
        name: '센과 치히로의 행방불명 (千と千尋の神隠し)',
        type: 'anime',
        year: 2001,
      },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-004',
    name: '이와토비 고등학교 모델 (Free!)',
    description:
      '애니메이션 "Free!"의 이와토비 고등학교 모델이 된 돗토리현의 이와미 고등학교입니다. 수영부 애니메이션의 배경으로, 학교 건물과 주변 풍경이 애니메이션에 그대로 재현되었습니다.',
    photos: ['https://picsum.photos/seed/iwami-high/800/600'],
    address: '일본 돗토리현 이와미군 이와미초',
    coordinates: { lat: 35.5167, lng: 134.3333 },
    category: 'animation',
    relatedContent: [{ name: 'Free!', type: 'anime', year: 2013 }],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-005',
    name: '와시노미야 신사 (러키☆스타)',
    description:
      '애니메이션 "러키☆스타"의 성지로 유명한 와시노미야 신사입니다. 주인공 히이라기 자매의 집이 신사라는 설정으로, 방영 이후 애니메이션 성지순례의 선구자적 장소가 되었습니다.',
    photos: ['https://picsum.photos/seed/washinomiya/800/600'],
    address: '일본 사이타마현 구키시 와시노미야 1-6-1',
    coordinates: { lat: 36.1028, lng: 139.6003 },
    category: 'animation',
    relatedContent: [
      { name: '러키☆스타 (らき☆すた)', type: 'anime', year: 2007 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-006',
    name: '오아라이 마을 (걸즈 앤 판처)',
    description:
      '애니메이션 "걸즈 앤 판처"의 무대가 된 이바라키현 오아라이 마을입니다. 마을 전체가 애니메이션과 협력하여 캐릭터 패널과 굿즈를 곳곳에 배치하고 있습니다.',
    photos: ['https://picsum.photos/seed/oarai/800/600'],
    address: '일본 이바라키현 히가시이바라키군 오아라이마치',
    coordinates: { lat: 36.3133, lng: 140.5747 },
    category: 'animation',
    relatedContent: [
      { name: '걸즈 앤 판처 (ガールズ&パンツァー)', type: 'anime', year: 2012 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-007',
    name: '히다 후루카와 (너의 이름은)',
    description:
      '"너의 이름은"에서 미츠하가 사는 이토모리 마을의 모델이 된 기후현 히다 후루카와입니다. 히다 후루카와역, 케가와 다리, 미야가와 낙합 공원 등이 영화에 등장합니다.',
    photos: ['https://picsum.photos/seed/hida-furukawa/800/600'],
    address: '일본 기후현 히다시 후루카와초',
    coordinates: { lat: 36.2378, lng: 137.1861 },
    category: 'animation',
    relatedContent: [
      { name: '너의 이름은 (君の名は。)', type: 'anime', year: 2016 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-008',
    name: '도쿄 타워 (도쿄 구울)',
    description:
      '수많은 애니메이션에 등장하는 도쿄의 상징 도쿄 타워입니다. "도쿄 구울", "원피스", "세일러문" 등 다양한 작품에서 중요한 배경으로 등장합니다.',
    photos: ['https://picsum.photos/seed/tokyo-tower/800/600'],
    address: '일본 도쿄도 미나토구 시바코엔 4-2-8',
    coordinates: { lat: 35.6586, lng: 139.7454 },
    category: 'animation',
    relatedContent: [
      { name: '도쿄 구울 (東京喰種)', type: 'anime', year: 2014 },
      { name: '원피스 (ONE PIECE)', type: 'anime', year: 1999 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-009',
    name: '에노시마 (청춘 돼지 시리즈)',
    description:
      '"청춘 돼지는 바니걸 선배의 꿈을 꾸지 않는다"의 주요 배경인 에노시마입니다. 에노시마 전망대, 해변, 에노덴 등이 작품에 등장합니다.',
    photos: ['https://picsum.photos/seed/enoshima/800/600'],
    address: '일본 가나가와현 후지사와시 에노시마',
    coordinates: { lat: 35.3008, lng: 139.4797 },
    category: 'animation',
    relatedContent: [
      {
        name: '청춘 돼지는 바니걸 선배의 꿈을 꾸지 않는다',
        type: 'anime',
        year: 2018,
      },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-010',
    name: '아키하바라 (슈타인즈 게이트)',
    description:
      '"슈타인즈 게이트"의 주요 무대인 아키하바라입니다. 라디오 회관, 메이드 카페 거리 등 작품 속 장소들을 실제로 방문할 수 있습니다.',
    photos: ['https://picsum.photos/seed/akihabara/800/600'],
    address: '일본 도쿄도 치요다구 소토칸다',
    coordinates: { lat: 35.7023, lng: 139.7745 },
    category: 'animation',
    relatedContent: [
      { name: '슈타인즈 게이트 (STEINS;GATE)', type: 'anime', year: 2011 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-ANI-011',
    name: '나라 공원 (스즈메의 문단속)',
    description:
      '"스즈메의 문단속"에서 스즈메가 방문하는 나라의 배경이 된 나라 공원입니다. 사슴들과 도다이지 등이 영화에 등장합니다.',
    photos: ['https://picsum.photos/seed/nara-park/800/600'],
    address: '일본 나라현 나라시 조시초',
    coordinates: { lat: 34.6851, lng: 135.843 },
    category: 'animation',
    relatedContent: [
      { name: '스즈메의 문단속 (すずめの戸締まり)', type: 'anime', year: 2022 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ============================================
// 스포츠 관련 장소 (5개 이상)
// ============================================
const SPORTS_SPOTS: SeedSpot[] = [
  {
    id: 'REAL-SPO-001',
    name: '캄프 누 (FC 바르셀로나)',
    description:
      'FC 바르셀로나의 홈구장 캄프 누입니다. 유럽 최대 규모의 축구 경기장으로, 메시, 호나우지뉴 등 전설적인 선수들이 뛰었던 성지입니다. 경기장 투어와 박물관 관람이 가능합니다.',
    photos: ['https://picsum.photos/seed/camp-nou/800/600'],
    address: "스페인 바르셀로나 C. d'Arístides Maillol, s/n",
    coordinates: { lat: 41.3809, lng: 2.1228 },
    category: 'sports',
    relatedContent: [
      { name: 'FC 바르셀로나', type: 'sports_team', additionalInfo: '라리가' },
    ],
    externalLinks: [
      createExternalLink(
        'spo-001-1',
        'official',
        'FC 바르셀로나 공식',
        'https://www.fcbarcelona.com'
      ),
      createExternalLink(
        'spo-001-2',
        'ticket',
        '티켓 예매',
        'https://www.fcbarcelona.com/en/tickets'
      ),
      createExternalLink(
        'spo-001-3',
        'schedule',
        '경기 일정',
        'https://www.fcbarcelona.com/en/football/first-team/schedule'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-SPO-002',
    name: '올드 트래포드 (맨체스터 유나이티드)',
    description:
      '"꿈의 극장"이라 불리는 맨체스터 유나이티드의 홈구장입니다. 퍼거슨 감독 시대의 영광을 간직한 곳으로, 전 세계 축구 팬들의 성지입니다.',
    photos: ['https://picsum.photos/seed/old-trafford/800/600'],
    address: '영국 맨체스터 Sir Matt Busby Way, Old Trafford',
    coordinates: { lat: 53.4631, lng: -2.2913 },
    category: 'sports',
    relatedContent: [
      {
        name: '맨체스터 유나이티드',
        type: 'sports_team',
        additionalInfo: '프리미어리그',
      },
    ],
    externalLinks: [
      createExternalLink(
        'spo-002-1',
        'official',
        '맨유 공식',
        'https://www.manutd.com'
      ),
      createExternalLink(
        'spo-002-2',
        'ticket',
        '티켓 예매',
        'https://www.manutd.com/en/tickets-and-hospitality'
      ),
      createExternalLink(
        'spo-002-3',
        'schedule',
        '경기 일정',
        'https://www.manutd.com/en/matches/first-team'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-SPO-003',
    name: '고시엔 구장',
    description:
      '일본 고교야구의 성지 고시엔 구장입니다. 매년 봄과 여름에 열리는 전국 고교야구 선수권대회의 무대로, 일본 야구 팬들에게 특별한 의미를 가진 장소입니다.',
    photos: ['https://picsum.photos/seed/koshien/800/600'],
    address: '일본 효고현 니시노미야시 고시엔초 1-82',
    coordinates: { lat: 34.7214, lng: 135.3617 },
    category: 'sports',
    relatedContent: [
      {
        name: '한신 타이거스',
        type: 'sports_team',
        additionalInfo: '일본프로야구 센트럴리그',
      },
    ],
    externalLinks: [
      createExternalLink(
        'spo-003-1',
        'official',
        '한신 타이거스 공식',
        'https://hanshintigers.jp'
      ),
      createExternalLink(
        'spo-003-2',
        'ticket',
        '티켓 예매',
        'https://hanshintigers.jp/ticket/'
      ),
      createExternalLink(
        'spo-003-3',
        'schedule',
        '경기 일정',
        'https://hanshintigers.jp/game/schedule/'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-SPO-004',
    name: '산티아고 베르나베우 (레알 마드리드)',
    description:
      '레알 마드리드의 홈구장 산티아고 베르나베우입니다. 최근 대규모 리모델링을 거쳐 최첨단 시설을 갖춘 경기장으로 재탄생했습니다.',
    photos: ['https://picsum.photos/seed/bernabeu/800/600'],
    address: '스페인 마드리드 Av. de Concha Espina, 1',
    coordinates: { lat: 40.4531, lng: -3.6883 },
    category: 'sports',
    relatedContent: [
      { name: '레알 마드리드', type: 'sports_team', additionalInfo: '라리가' },
    ],
    externalLinks: [
      createExternalLink(
        'spo-004-1',
        'official',
        '레알 마드리드 공식',
        'https://www.realmadrid.com'
      ),
      createExternalLink(
        'spo-004-2',
        'ticket',
        '티켓 예매',
        'https://www.realmadrid.com/en/tickets'
      ),
      createExternalLink(
        'spo-004-3',
        'schedule',
        '경기 일정',
        'https://www.realmadrid.com/en/football/schedule'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-SPO-005',
    name: '잠실 야구장',
    description:
      'LG 트윈스와 두산 베어스의 홈구장인 잠실 야구장입니다. 한국 프로야구의 중심지로, 수많은 명승부가 펼쳐진 곳입니다.',
    photos: ['https://picsum.photos/seed/jamsil/800/600'],
    address: '대한민국 서울특별시 송파구 올림픽로 25',
    coordinates: { lat: 37.5122, lng: 127.0719 },
    category: 'sports',
    relatedContent: [
      { name: 'LG 트윈스', type: 'sports_team', additionalInfo: 'KBO 리그' },
      { name: '두산 베어스', type: 'sports_team', additionalInfo: 'KBO 리그' },
    ],
    externalLinks: [
      createExternalLink(
        'spo-005-1',
        'official',
        'KBO 리그 공식',
        'https://www.koreabaseball.com'
      ),
      createExternalLink(
        'spo-005-2',
        'ticket',
        '티켓링크 예매',
        'https://www.ticketlink.co.kr'
      ),
      createExternalLink(
        'spo-005-3',
        'schedule',
        '경기 일정',
        'https://www.koreabaseball.com/Schedule/Schedule.aspx'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-SPO-006',
    name: '앤필드 (리버풀 FC)',
    description:
      '"You\'ll Never Walk Alone"의 성지, 리버풀 FC의 홈구장 앤필드입니다. 더 콥(The Kop) 스탠드의 열정적인 응원은 세계적으로 유명합니다.',
    photos: ['https://picsum.photos/seed/anfield/800/600'],
    address: '영국 리버풀 Anfield Rd, Anfield',
    coordinates: { lat: 53.4308, lng: -2.9608 },
    category: 'sports',
    relatedContent: [
      {
        name: '리버풀 FC',
        type: 'sports_team',
        additionalInfo: '프리미어리그',
      },
    ],
    externalLinks: [
      createExternalLink(
        'spo-006-1',
        'official',
        '리버풀 FC 공식',
        'https://www.liverpoolfc.com'
      ),
      createExternalLink(
        'spo-006-2',
        'ticket',
        '티켓 예매',
        'https://www.liverpoolfc.com/tickets'
      ),
      createExternalLink(
        'spo-006-3',
        'schedule',
        '경기 일정',
        'https://www.liverpoolfc.com/fixtures'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ============================================
// 영화/드라마 촬영지 (5개 이상)
// ============================================
const MOVIE_DRAMA_SPOTS: SeedSpot[] = [
  {
    id: 'REAL-MOV-001',
    name: '호그와트 익스프레스 (해리포터)',
    description:
      '해리포터 시리즈에서 호그와트 익스프레스가 달리는 글렌피넌 고가교입니다. 스코틀랜드의 아름다운 풍경과 함께 영화 속 장면을 재현할 수 있습니다.',
    photos: ['https://picsum.photos/seed/glenfinnan/800/600'],
    address: '영국 스코틀랜드 글렌피넌',
    coordinates: { lat: 56.8711, lng: -5.4319 },
    category: 'movie_drama',
    relatedContent: [{ name: '해리포터 시리즈', type: 'movie', year: 2001 }],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MOV-002',
    name: '북촌 한옥마을 (도깨비)',
    description:
      '드라마 "도깨비"의 촬영지로 유명한 북촌 한옥마을입니다. 공유와 김고은이 걸었던 골목길을 따라 걸으며 드라마 속 장면을 떠올릴 수 있습니다.',
    photos: ['https://picsum.photos/seed/bukchon/800/600'],
    address: '대한민국 서울특별시 종로구 계동길 37',
    coordinates: { lat: 37.5826, lng: 126.985 },
    category: 'movie_drama',
    relatedContent: [
      { name: '도깨비 (쓸쓸하고 찬란하神-도깨비)', type: 'drama', year: 2016 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MOV-003',
    name: '뉴질랜드 호비튼 (반지의 제왕)',
    description:
      '"반지의 제왕"과 "호빗" 시리즈의 촬영지인 호비튼 무비 세트입니다. 영화 속 샤이어 마을이 그대로 보존되어 있어 중간계를 직접 체험할 수 있습니다.',
    photos: ['https://picsum.photos/seed/hobbiton/800/600'],
    address: '뉴질랜드 마타마타 501 Buckland Road',
    coordinates: { lat: -37.8722, lng: 175.683 },
    category: 'movie_drama',
    relatedContent: [
      { name: '반지의 제왕 시리즈', type: 'movie', year: 2001 },
      { name: '호빗 시리즈', type: 'movie', year: 2012 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MOV-004',
    name: '강릉 주문진 방파제 (도깨비)',
    description:
      '드라마 "도깨비"에서 김신과 은탁이 처음 만나는 장면이 촬영된 주문진 방파제입니다. 드라마 방영 후 많은 팬들이 찾는 명소가 되었습니다.',
    photos: ['https://picsum.photos/seed/jumunjin/800/600'],
    address: '대한민국 강원도 강릉시 주문진읍 주문리',
    coordinates: { lat: 37.8986, lng: 128.8308 },
    category: 'movie_drama',
    relatedContent: [
      { name: '도깨비 (쓸쓸하고 찬란하神-도깨비)', type: 'drama', year: 2016 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MOV-005',
    name: '로마 스페인 광장 (로마의 휴일)',
    description:
      '오드리 헵번 주연의 "로마의 휴일"에서 젤라또를 먹는 장면으로 유명한 스페인 광장입니다. 영화 팬들의 필수 방문 코스입니다.',
    photos: ['https://picsum.photos/seed/spanish-steps/800/600'],
    address: '이탈리아 로마 Piazza di Spagna',
    coordinates: { lat: 41.9058, lng: 12.4823 },
    category: 'movie_drama',
    relatedContent: [
      { name: '로마의 휴일 (Roman Holiday)', type: 'movie', year: 1953 },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MOV-006',
    name: '부산 해운대 (해운대)',
    description:
      '영화 "해운대"의 배경이 된 해운대 해수욕장입니다. 영화 속 쓰나미 장면의 배경으로, 한국 재난영화의 대표적인 촬영지입니다.',
    photos: ['https://picsum.photos/seed/haeundae/800/600'],
    address: '대한민국 부산광역시 해운대구 해운대해변로 264',
    coordinates: { lat: 35.1587, lng: 129.1604 },
    category: 'movie_drama',
    relatedContent: [{ name: '해운대', type: 'movie', year: 2009 }],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ============================================
// 음악/콘서트 관련 장소 (5개 이상)
// ============================================
const MUSIC_SPOTS: SeedSpot[] = [
  {
    id: 'REAL-MUS-001',
    name: '애비 로드 횡단보도 (비틀즈)',
    description:
      '비틀즈의 앨범 "Abbey Road" 재킷 사진이 촬영된 횡단보도입니다. 전 세계 비틀즈 팬들이 앨범 재킷을 재현하기 위해 방문하는 성지입니다.',
    photos: ['https://picsum.photos/seed/abbey-road/800/600'],
    address: "영국 런던 Abbey Road, St John's Wood",
    coordinates: { lat: 51.532, lng: -0.178 },
    category: 'music',
    relatedContent: [{ name: '비틀즈 (The Beatles)', type: 'artist' }],
    externalLinks: [
      createExternalLink(
        'mus-001-1',
        'official',
        'Abbey Road Studios',
        'https://www.abbeyroad.com'
      ),
      createExternalLink(
        'mus-001-2',
        'other',
        '실시간 웹캠',
        'https://www.abbeyroad.com/crossing'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MUS-002',
    name: '도쿄돔',
    description:
      '일본 최대 규모의 돔 공연장으로, K-POP 아티스트들의 일본 투어 필수 코스입니다. BTS, 블랙핑크 등 수많은 아티스트들이 공연한 곳입니다.',
    photos: ['https://picsum.photos/seed/tokyo-dome/800/600'],
    address: '일본 도쿄도 분쿄구 고라쿠 1-3-61',
    coordinates: { lat: 35.7056, lng: 139.7519 },
    category: 'music',
    relatedContent: [
      { name: 'BTS', type: 'artist' },
      { name: '블랙핑크', type: 'artist' },
    ],
    externalLinks: [
      createExternalLink(
        'mus-002-1',
        'official',
        '도쿄돔 공식',
        'https://www.tokyo-dome.co.jp'
      ),
      createExternalLink(
        'mus-002-2',
        'schedule',
        '이벤트 일정',
        'https://www.tokyo-dome.co.jp/dome/schedule/'
      ),
      createExternalLink(
        'mus-002-3',
        'ticket',
        '티켓 예매 (e+)',
        'https://eplus.jp'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MUS-003',
    name: '그레이스랜드 (엘비스 프레슬리)',
    description:
      '록큰롤의 황제 엘비스 프레슬리의 저택 그레이스랜드입니다. 엘비스의 삶과 음악을 체험할 수 있는 박물관으로 운영되고 있습니다.',
    photos: ['https://picsum.photos/seed/graceland/800/600'],
    address: '미국 테네시주 멤피스 3764 Elvis Presley Blvd',
    coordinates: { lat: 35.0477, lng: -90.0261 },
    category: 'music',
    relatedContent: [
      { name: '엘비스 프레슬리 (Elvis Presley)', type: 'artist' },
    ],
    externalLinks: [
      createExternalLink(
        'mus-003-1',
        'official',
        '그레이스랜드 공식',
        'https://www.graceland.com'
      ),
      createExternalLink(
        'mus-003-2',
        'ticket',
        '투어 예매',
        'https://www.graceland.com/tours'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MUS-004',
    name: 'HYBE 인사이트',
    description:
      'BTS 소속사 HYBE의 전시 공간입니다. BTS를 비롯한 HYBE 아티스트들의 역사와 음악을 체험할 수 있는 팬들의 성지입니다.',
    photos: ['https://picsum.photos/seed/hybe-insight/800/600'],
    address: '대한민국 서울특별시 용산구 한강대로 42',
    coordinates: { lat: 37.5283, lng: 126.9654 },
    category: 'music',
    relatedContent: [
      { name: 'BTS', type: 'artist' },
      { name: '세븐틴', type: 'artist' },
    ],
    externalLinks: [
      createExternalLink(
        'mus-004-1',
        'official',
        'HYBE 인사이트 공식',
        'https://www.hybeinsight.com'
      ),
      createExternalLink(
        'mus-004-2',
        'ticket',
        '예약하기',
        'https://www.hybeinsight.com/reservation'
      ),
      createExternalLink(
        'mus-004-3',
        'sns',
        '인스타그램',
        'https://www.instagram.com/hlobal_official'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MUS-005',
    name: 'SM타운 코엑스아티움',
    description:
      'SM엔터테인먼트의 복합 문화 공간입니다. EXO, NCT, 에스파 등 SM 아티스트들의 굿즈와 전시를 즐길 수 있습니다.',
    photos: ['https://picsum.photos/seed/smtown/800/600'],
    address: '대한민국 서울특별시 강남구 영동대로 513',
    coordinates: { lat: 37.5116, lng: 127.0595 },
    category: 'music',
    relatedContent: [
      { name: 'EXO', type: 'artist' },
      { name: 'NCT', type: 'artist' },
      { name: '에스파', type: 'artist' },
    ],
    externalLinks: [
      createExternalLink(
        'mus-005-1',
        'official',
        'SM타운 공식',
        'https://www.smtown.com'
      ),
      createExternalLink(
        'mus-005-2',
        'sns',
        '트위터',
        'https://twitter.com/SMTOWN'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-MUS-006',
    name: '올림픽공원 체조경기장 (KSPO DOME)',
    description:
      '한국 최대 규모의 실내 공연장 중 하나로, 수많은 K-POP 콘서트가 열리는 곳입니다. 팬들에게 "체조경기장"으로 친숙한 공연 성지입니다.',
    photos: ['https://picsum.photos/seed/kspo-dome/800/600'],
    address: '대한민국 서울특별시 송파구 올림픽로 424',
    coordinates: { lat: 37.5209, lng: 127.115 },
    category: 'music',
    relatedContent: [
      {
        name: 'K-POP 콘서트',
        type: 'other',
        additionalInfo: '다양한 아티스트',
      },
    ],
    externalLinks: [
      createExternalLink(
        'mus-006-1',
        'official',
        'KSPO DOME 공식',
        'https://www.ksponco.or.kr'
      ),
      createExternalLink(
        'mus-006-2',
        'ticket',
        '인터파크 티켓',
        'https://tickets.interpark.com'
      ),
      createExternalLink(
        'mus-006-3',
        'ticket',
        '멜론티켓',
        'https://ticket.melon.com'
      ),
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ============================================
// 게임/e스포츠 관련 장소 (3개 이상)
// ============================================
const GAME_SPOTS: SeedSpot[] = [
  {
    id: 'REAL-GAM-001',
    name: 'LoL 파크 (LCK 아레나)',
    description:
      '리그 오브 레전드 한국 리그(LCK)의 전용 경기장입니다. T1, 젠지 등 세계 최강 팀들의 경기를 직접 관람할 수 있는 e스포츠 팬들의 성지입니다.',
    photos: ['https://picsum.photos/seed/lol-park/800/600'],
    address: '대한민국 서울특별시 종로구 종로 33',
    coordinates: { lat: 37.57, lng: 126.992 },
    category: 'game',
    relatedContent: [
      { name: '리그 오브 레전드 (League of Legends)', type: 'game' },
      { name: 'T1', type: 'sports_team', additionalInfo: 'e스포츠' },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-GAM-002',
    name: '닌텐도 도쿄',
    description:
      '닌텐도의 공식 스토어 닌텐도 도쿄입니다. 마리오, 젤다, 포켓몬 등 닌텐도 게임 캐릭터들의 굿즈와 체험 공간이 있습니다.',
    photos: ['https://picsum.photos/seed/nintendo-tokyo/800/600'],
    address: '일본 도쿄도 시부야구 시부야 파르코 6F',
    coordinates: { lat: 35.662, lng: 139.6983 },
    category: 'game',
    relatedContent: [
      { name: '슈퍼 마리오', type: 'game' },
      { name: '젤다의 전설', type: 'game' },
      { name: '포켓몬스터', type: 'game' },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-GAM-003',
    name: '포켓몬 센터 메가 도쿄',
    description:
      '일본 최대 규모의 포켓몬 센터입니다. 포켓몬 굿즈, 게임, 카드 등을 구매할 수 있으며, 포켓몬 팬들의 필수 방문 코스입니다.',
    photos: ['https://picsum.photos/seed/pokemon-center/800/600'],
    address: '일본 도쿄도 토시마구 히가시이케부쿠로 3-1-2',
    coordinates: { lat: 35.7295, lng: 139.7186 },
    category: 'game',
    relatedContent: [{ name: '포켓몬스터', type: 'game' }],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'REAL-GAM-004',
    name: '슈퍼 닌텐도 월드 (유니버설 스튜디오 재팬)',
    description:
      '유니버설 스튜디오 재팬 내 닌텐도 테마 구역입니다. 마리오 카트 어트랙션, 쿠파 성 등 마리오 세계를 실제로 체험할 수 있습니다.',
    photos: ['https://picsum.photos/seed/nintendo-world/800/600'],
    address: '일본 오사카부 오사카시 코노하나구 사쿠라지마 2-1-33',
    coordinates: { lat: 34.6654, lng: 135.4323 },
    category: 'game',
    relatedContent: [
      { name: '슈퍼 마리오', type: 'game' },
      { name: '마리오 카트', type: 'game' },
    ],
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// ============================================
// 모든 스팟 데이터 합치기
// ============================================
const ALL_REAL_SPOTS: SeedSpot[] = [
  ...ANIMATION_SPOTS,
  ...SPORTS_SPOTS,
  ...MOVIE_DRAMA_SPOTS,
  ...MUSIC_SPOTS,
  ...GAME_SPOTS,
]

async function seedRealSpots() {
  const client = new MongoClient(MONGODB_URI)
  const isAppendMode = process.argv.includes('--append')

  try {
    // eslint-disable-next-line no-console
    console.log('MongoDB에 연결 중...')
    await client.connect()
    // eslint-disable-next-line no-console
    console.log('MongoDB 연결 성공!')

    const db = client.db(MONGODB_DB)
    const collection = db.collection('spots')

    if (!isAppendMode) {
      // eslint-disable-next-line no-console
      console.log('기존 스팟 데이터 삭제 중...')
      await collection.deleteMany({})
    } else {
      // eslint-disable-next-line no-console
      console.log('--append 모드: 기존 데이터 유지')
      // 중복 ID 제거를 위해 기존 ID 확인
      const existingIds = await collection.distinct('id')
      const newSpots = ALL_REAL_SPOTS.filter(
        (spot) => !existingIds.includes(spot.id)
      )
      if (newSpots.length < ALL_REAL_SPOTS.length) {
        // eslint-disable-next-line no-console
        console.log(
          `${ALL_REAL_SPOTS.length - newSpots.length}개의 중복 스팟 제외`
        )
      }
      if (newSpots.length === 0) {
        // eslint-disable-next-line no-console
        console.log('추가할 새 스팟이 없습니다.')
        return
      }
      // eslint-disable-next-line no-console
      console.log(`${newSpots.length}개의 새 스팟 추가 중...`)
      const result = await collection.insertMany(newSpots)
      // eslint-disable-next-line no-console
      console.log(
        `✅ ${result.insertedCount}개의 스팟 데이터가 추가되었습니다!`
      )
      return
    }

    // id 필드에 유니크 인덱스 생성
    await collection.createIndex({ id: 1 }, { unique: true })

    // eslint-disable-next-line no-console
    console.log('실제 스팟 시드 데이터 삽입 중...')
    const result = await collection.insertMany(ALL_REAL_SPOTS)

    // eslint-disable-next-line no-console
    console.log(`✅ ${result.insertedCount}개의 스팟 데이터가 추가되었습니다!`)
    // eslint-disable-next-line no-console
    console.log('')
    // eslint-disable-next-line no-console
    console.log('카테고리별 스팟 수:')
    // eslint-disable-next-line no-console
    console.log(`  - 애니메이션: ${ANIMATION_SPOTS.length}개`)
    // eslint-disable-next-line no-console
    console.log(`  - 스포츠: ${SPORTS_SPOTS.length}개`)
    // eslint-disable-next-line no-console
    console.log(`  - 영화/드라마: ${MOVIE_DRAMA_SPOTS.length}개`)
    // eslint-disable-next-line no-console
    console.log(`  - 음악/콘서트: ${MUSIC_SPOTS.length}개`)
    // eslint-disable-next-line no-console
    console.log(`  - 게임: ${GAME_SPOTS.length}개`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 실제 스팟 시드 데이터 삽입 실패:', error)
    process.exit(1)
  } finally {
    await client.close()
    // eslint-disable-next-line no-console
    console.log('MongoDB 연결 종료')
  }
}

seedRealSpots()
