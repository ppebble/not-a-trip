import type { SeedSpot } from '../seed-real-spots'
import type { SourceEvidence } from '../../src/lib/real-image-data'

const COLLECTED_AT = '2026-08-31T00:00:00.000Z'
const OFFICIAL_2026_GUIDE_URL = 'https://animetourism88.com/en/88navi-en/'

function evidence(
  url: string,
  label: string,
  evidenceType: SourceEvidence['evidenceType'] = 'official'
) {
  return { url, label, evidenceType, collectedAt: COLLECTED_AT }
}

function coordinateEvidence(lat: number, lng: number) {
  return evidence(
    `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=19/${lat}/${lng}`,
    'OpenStreetMap 좌표 확인',
    'other'
  )
}

const records = [
  {
    id: 'REAL-ANI-088',
    name: '미야자와 겐지 동화마을',
    description:
      '은하철도의 밤 등 미야자와 겐지의 동화 세계를 공간 전시로 체험하는 하나마키시 공식 시설이다. 문학 원작과 애니메이션 각색, 문호 스트레이독스의 작가 모티브까지 연결되는 북일본 문화 순례 거점이다.',
    address: '일본 이와테현 하나마키시 다카마쓰 26-19',
    lat: 39.3981893,
    lng: 141.1691421,
    contentName: '은하철도의 밤·문호 스트레이독스',
    year: 1985,
    sourceUrl: 'https://animetourism88.com/en/places/miyazawa-kenji-dowa-mura/',
    reviewStatus: 'approved' as const,
  },
  {
    id: 'REAL-ANI-089',
    name: '오모차노마치 반다이 뮤지엄',
    description:
      '반다이의 캐릭터 완구와 일본·세계 완구, 에디슨 관련 소장품을 전시하는 미부마치의 박물관이다. 애니메이션 캐릭터가 상품과 놀이 문화로 확장된 역사를 확인하는 공식 성지 시설이다.',
    address: '일본 도치기현 시모쓰가군 미부마치 오모차노마치 3-6-20',
    lat: 36.4654291,
    lng: 139.8383503,
    contentName: '반다이 캐릭터·완구 문화',
    year: 2007,
    sourceUrl: OFFICIAL_2026_GUIDE_URL,
    reviewStatus: 'approved' as const,
  },
  {
    id: 'REAL-ANI-090',
    name: '오아시스21 월드 코스프레 서밋 행사장',
    description:
      '나고야 월드 코스프레 서밋의 대표 무대와 퍼레이드 동선으로 사용되는 도심 복합공간이다. 행사는 해마다 복수 장소에서 열리므로 방문 전 최신 개최 동선을 확인해야 한다.',
    address: '일본 아이치현 나고야시 히가시구 히가시사쿠라 1-11-1 오아시스21',
    lat: 35.171088,
    lng: 136.9096446,
    contentName: '월드 코스프레 서밋',
    year: 2003,
    sourceUrl: OFFICIAL_2026_GUIDE_URL,
    reviewStatus: 'needs_review' as const,
  },
  {
    id: 'REAL-ANI-091',
    name: '니가타시 만화의 집',
    description:
      '니가타 연고 개그 만화가의 캐릭터 전시, 약 1만 권의 만화 열람실, 무료 만화 강좌를 운영하는 공식 문화시설이다. 좌표는 공식 주소가 위치한 후루마치도리 6번가 중심점이므로 현장 입구 검토가 필요하다.',
    address: '일본 니가타현 니가타시 주오구 후루마치도리 6-971-7',
    lat: 37.921126,
    lng: 139.044556,
    contentName: '니가타 연고 만화가 문화',
    year: 2013,
    sourceUrl:
      'https://animetourism88.com/en/places/the-niigata-city-manga-house/',
    reviewStatus: 'needs_review' as const,
  },
  {
    id: 'REAL-ANI-092',
    name: '산리오 캐릭터파크 하모니랜드',
    description:
      '헬로키티 등 산리오 캐릭터를 테마로 놀이기구와 라이브 공연을 운영하는 오이타현의 야외 테마파크다. 공식 2026 성지 시설 가운데 규슈권 가족형 캐릭터 관광을 대표한다.',
    address: '일본 오이타현 하야미군 히지마치 후지와라 5933',
    lat: 33.4005916,
    lng: 131.5461047,
    contentName: '산리오 캐릭터 애니메이션',
    year: 1991,
    sourceUrl:
      'https://animetourism88.com/en/places/sanrio-character-park-harmonyland/',
    reviewStatus: 'approved' as const,
  },
  {
    id: 'REAL-ANI-093',
    name: '진다이지 기타로 찻집',
    description:
      '미즈키 시게루가 장기간 활동한 조후시 진다이지 앞의 게게게의 기타로 테마 찻집이다. 캐릭터 장식과 관련 상품을 볼 수 있지만 공식 선정 단위는 조후시 전체이므로 개별 지점은 검토 상태로 유지한다.',
    address: '일본 도쿄도 조후시 진다이지모토마치 5초메 기타로 찻집',
    lat: 35.666889,
    lng: 139.549519,
    contentName: '게게게의 기타로',
    year: 1968,
    sourceUrl: OFFICIAL_2026_GUIDE_URL,
    reviewStatus: 'needs_review' as const,
  },
] as const

export const JAPAN_ANIME_FACILITY_EXPANSION: SeedSpot[] = records.map(
  ({
    id,
    name,
    description,
    address,
    lat,
    lng,
    contentName,
    year,
    sourceUrl,
    reviewStatus,
  }) => ({
    id,
    name,
    description,
    photos: [],
    address,
    coordinates: { lat, lng },
    category: 'animation',
    relatedContent: [{ name: contentName, type: 'anime', year }],
    sourceUrls: [
      evidence(sourceUrl, 'Anime Tourism Association 공식 시설·행사 근거'),
      coordinateEvidence(lat, lng),
    ],
    reviewStatus,
    authorName: 'System',
    isGuestSpot: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
)
