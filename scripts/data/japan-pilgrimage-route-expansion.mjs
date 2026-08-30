const RESEARCHED_AT = '2026-08-31'

function sources(entries) {
  return {
    sourceUrls: entries.map((entry) => entry.url),
    pilgrimSources: entries,
  }
}

export const JAPAN_PILGRIMAGE_ROUTE_SPOTS = [
  {
    id: 'REAL-ANI-006',
    name: '오아라이 마을 (걸즈 앤 판처)',
    coordinates: { lat: 36.3133, lng: 140.5747 },
    photos: ['/images/spots/animation/real-ani-006-oarai-town.webp'],
  },
  {
    id: 'REAL-ANI-022',
    name: '모토스코 캠프장 (유루캠△)',
    coordinates: { lat: 35.4851, lng: 138.6186 },
    photos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Lake%20Motosu%20%282015-12-17%29.jpg',
    ],
  },
  {
    id: 'REAL-ANI-071',
    name: '니가타시 만화·애니메이션 정보관',
    coordinates: { lat: 37.916071, lng: 139.0531746 },
    photos: [
      '/images/spots/animation/real-ani-071-niigata-manga-animation-museum.webp',
    ],
  },
  {
    id: 'REAL-ANI-076',
    name: '오아라이 이소사키 신사 (걸즈 앤 판처)',
    coordinates: { lat: 36.3149635, lng: 140.5895239 },
    photos: ['/images/spots/animation/real-ani-076-oarai-isosaki-shrine.webp'],
  },
  {
    id: 'REAL-ANI-077',
    name: '오아라이 마린 타워 (걸즈 앤 판처)',
    coordinates: { lat: 36.3103845, lng: 140.5707396 },
    photos: ['/images/spots/animation/real-ani-077-oarai-marine-tower.webp'],
  },
  {
    id: 'REAL-ANI-080',
    name: '다케하라 중요전통적건조물군 보존지구 (타마유라)',
    coordinates: { lat: 34.3471879, lng: 132.909819 },
    photos: [
      '/images/spots/animation/real-ani-080-takehara-preservation-district.webp',
    ],
  },
  {
    id: 'REAL-ANI-081',
    name: '미치노에키 다케하라 (타마유라)',
    coordinates: { lat: 34.3438541, lng: 132.9122629 },
    photos: [
      '/images/spots/animation/real-ani-081-roadside-station-takehara.webp',
    ],
  },
  {
    id: 'REAL-ANI-083',
    name: '덴란산 (야마노스스메)',
    coordinates: { lat: 35.8620377, lng: 139.308305 },
    photos: ['/images/spots/animation/real-ani-083-mount-tenran.webp'],
  },
  {
    id: 'REAL-ANI-084',
    name: '한노 강변 (야마노스스메)',
    coordinates: { lat: 35.8549148, lng: 139.3116912 },
    photos: ['/images/spots/animation/real-ani-084-hanno-riverbank.webp'],
  },
  {
    id: 'REAL-ANI-085',
    name: '미노부역 (유루캠△)',
    coordinates: { lat: 35.3614072, lng: 138.4531094 },
    photos: ['/images/spots/animation/real-ani-085-minobu-station.webp'],
  },
  {
    id: 'REAL-ANI-086',
    name: '모토스호 (유루캠△)',
    coordinates: { lat: 35.4643056, lng: 138.585505 },
    photos: ['/images/spots/animation/real-ani-086-lake-motosu.webp'],
  },
  {
    id: 'REAL-ANI-091',
    name: '니가타시 만화의 집',
    coordinates: { lat: 37.921126, lng: 139.044556 },
    photos: [
      '/images/spots/animation/real-ani-091-niigata-city-manga-house.webp',
    ],
  },
]

export const JAPAN_PILGRIMAGE_ROUTE_EXPANSION = [
  {
    id: 'ROUTE-110',
    seedKey: 'pilgrim-pattern-2026-08-31-oarai-girls-und-panzer',
    name: '오아라이 걸즈 앤 판처 마을 종단 코스',
    description:
      '마린 타워에서 출발해 상점가가 이어지는 오아라이 중심부를 지나 이소사키 신사까지 북쪽으로 걷는 걸즈 앤 판처 성지순례 코스입니다.',
    spotIds: ['REAL-ANI-077', 'REAL-ANI-006', 'REAL-ANI-076'],
    relatedContentNames: [
      '걸즈 앤 판처 (ガールズ&パンツァー)',
      '걸즈 앤 판처 최종장',
    ],
    regionTags: ['이바라키', '오아라이', '걸즈 앤 판처'],
    isOfficial: true,
    routeType: 'walking',
    estimatedDurationMinutes: 180,
    observedTravelPattern:
      '팬 영상과 방문 후기에 반복되는 마린 타워 방문, 마을 상점가 산책, 이소사키 신사 참배를 남쪽에서 북쪽 순서로 연결했습니다.',
    sourceSummary:
      '팬 순례 영상은 마린 타워 뒤 이소사키 신사를 방문하고, 최근 팬 후기들은 타워의 Panzer Vor와 마을 상점가 산책, 북쪽 신사를 핵심 방문 패턴으로 설명합니다.',
    researchedAt: RESEARCHED_AT,
    ...sources([
      {
        url: 'https://anime-pilgrimage.com/girls-und-panzer/',
        kind: 'pilgrimage_guide',
        label: '걸즈 앤 판처 오아라이 성지순례 가이드',
      },
      {
        url: 'https://www.youtube.com/watch?v=LyU2HnTFHEQ',
        kind: 'video_trip_report',
        label: '마린 타워에서 이소사키 신사로 이동한 팬 순례 영상',
      },
      {
        url: 'https://www.reddit.com/r/GIRLSundPANZER/comments/1s7sekj/planning_a_day_trip_to_ooarai_what_are_some/',
        kind: 'fan_trip_report',
        label: '타워, 상점가, 신사를 추천한 팬 방문 조언',
      },
    ]),
  },
  {
    id: 'ROUTE-111',
    seedKey: 'pilgrim-pattern-2026-08-31-takehara-tamayura',
    name: '다케하라 타마유라 반나절 산책 코스',
    description:
      '타마유라 상설 코너가 있는 미치노에키 다케하라를 출발점으로 삼아 작품 장면이 집중된 전통거리 보존지구를 천천히 걷는 반나절 코스입니다.',
    spotIds: ['REAL-ANI-081', 'REAL-ANI-080'],
    relatedContentNames: ['타마유라'],
    regionTags: ['히로시마', '다케하라', '타마유라'],
    isOfficial: true,
    routeType: 'walking',
    estimatedDurationMinutes: 210,
    observedTravelPattern:
      '자가용 방문 후기는 미치노에키에 주차한 뒤 보존지구를 걷고, 철도 방문 가이드는 다케하라역에서 같은 중심부를 도보로 순례합니다.',
    sourceSummary:
      '다케하라 공식 관광 안내는 중심부 순례를 3~4시간 도보 코스로 설명하고 미치노에키의 타마유라 상설 코너와 전통거리 보존지구를 함께 안내합니다. 팬 여행기는 미치노에키 주차 후 보존지구를 2~3시간 걸은 실제 동선을 기록합니다.',
    researchedAt: RESEARCHED_AT,
    ...sources([
      {
        url: 'https://www.takeharakankou.jp/beginner/tamayura-animation/',
        kind: 'official_route',
        label: '다케하라 관광협회 타마유라 순례 안내',
      },
      {
        url: 'https://www.city.takehara.lg.jp/soshikikarasagasu/sangyoshinkoka/gyomuannai/3/2073.html',
        kind: 'official_route',
        label: '다케하라시 공식 타마유라 탐방 코스',
      },
      {
        url: 'https://hacogaki.hatenablog.com/entry/2015/06/23/005634',
        kind: 'fan_trip_report',
        label: '미치노에키 주차 후 보존지구를 걸은 팬 여행기',
      },
    ]),
  },
  {
    id: 'ROUTE-112',
    seedKey: 'pilgrim-pattern-2026-08-31-hanno-yama-no-susume',
    name: '한노 야마노스스메 강변·덴란산 코스',
    description:
      '작품의 일상 배경인 한노 강변을 먼저 둘러보고 실제 팬들처럼 덴란산의 짧은 등산 구간으로 이어가는 야마노스스메 도보 코스입니다.',
    spotIds: ['REAL-ANI-084', 'REAL-ANI-083'],
    relatedContentNames: ['야마노스스메 Next Summit'],
    regionTags: ['사이타마', '한노', '야마노스스메'],
    isOfficial: true,
    routeType: 'walking',
    estimatedDurationMinutes: 120,
    observedTravelPattern:
      '한노 방문과 덴란산 등산을 결합한 팬 순례 패턴에 맞춰, 세이부 공식 하이킹 순서의 한노 강변 뒤 덴란산 구간을 채택했습니다.',
    sourceSummary:
      '팬 방문기는 한노 성지순례와 덴란산 등산을 한 일정으로 기록합니다. 세이부철도 공식 하이킹 지도도 한노역에서 강변을 거쳐 덴란산으로 향하는 순서를 제시합니다.',
    researchedAt: RESEARCHED_AT,
    ...sources([
      {
        url: 'https://www.reddit.com/r/anime/comments/1oic0t0',
        kind: 'fan_trip_report',
        label: '한노 방문과 덴란산 등산을 결합한 팬 순례기',
      },
      {
        url: 'https://wattention.com/seibu-railway-en/wp-content/uploads/sites/5/2022/09/SEIBU_EN.pdf',
        kind: 'official_route',
        label: '한노 강변에서 덴란산으로 이어지는 세이부 공식 하이킹 지도',
      },
    ]),
  },
  {
    id: 'ROUTE-113',
    seedKey: 'pilgrim-pattern-2026-08-31-minobu-motosu-yuru-camp',
    name: '미노부·모토스호 유루캠△ 원정 코스',
    description:
      '미노부역과 마을에서 출발해 모토스호의 대표 전망 지점과 캠프장까지 이동하는 유루캠△ 광역 성지순례 코스입니다. 구간 이동은 버스 시간표 확인 또는 차량 이용이 필요합니다.',
    spotIds: ['REAL-ANI-085', 'REAL-ANI-086', 'REAL-ANI-022'],
    relatedContentNames: ['유루캠△ 시리즈', '유루캠△ (ゆるキャン△)'],
    regionTags: ['야마나시', '미노부', '모토스호', '유루캠△'],
    isOfficial: true,
    routeType: 'mixed_transit',
    estimatedDurationMinutes: 240,
    observedTravelPattern:
      '팬 여행기의 미노부 방문 뒤 차량으로 모토스호에 들어가는 순서를 따르며, 대중교통 이용자는 미노부역에서 모토스호 방면 버스를 이용하는 별도 선택지가 있습니다.',
    sourceSummary:
      '최근 팬 여행기는 미노부에서 식료품을 준비한 뒤 차량으로 모토스호를 방문했습니다. 순례 가이드는 미노부역에서 모토스호까지 버스로 약 50분이 걸리는 대중교통 대안을 설명하며, 영상 순례기는 모토스호와 코안 캠프장 구간을 함께 방문합니다.',
    researchedAt: RESEARCHED_AT,
    ...sources([
      {
        url: 'https://www.reddit.com/r/laidbackcamp/comments/1py3jzw/yuru_camp_pilgrimage_day_1_pt_2_minobu_lake_motosu/',
        kind: 'fan_trip_report',
        label: '미노부에서 모토스호로 이동한 팬 여행기',
      },
      {
        url: 'https://otakutrips.com/en/blog/laid-back-camp-yamanashi-shizuoka-pilgrimage-guide',
        kind: 'pilgrimage_guide',
        label: '미노부역과 모토스호 대중교통 순례 가이드',
      },
      {
        url: 'https://www.youtube.com/watch?v=3bFm-_EOUFg',
        kind: 'video_trip_report',
        label: '모토스호와 코안 캠프장을 방문한 팬 영상',
      },
    ]),
  },
  {
    id: 'ROUTE-114',
    seedKey: 'pilgrim-pattern-2026-08-31-niigata-manga-culture',
    name: '니가타 만화·애니메이션 문화 산책 코스',
    description:
      '니가타시 만화·애니메이션 정보관에서 전시를 본 뒤 실제 가이드 투어 순서대로 만화의 집까지 걷는 도심 문화 순례 코스입니다.',
    spotIds: ['REAL-ANI-071', 'REAL-ANI-091'],
    relatedContentNames: [
      '니가타 만화·애니메이션 문화',
      '니가타 연고 만화가 문화',
    ],
    regionTags: ['니가타', '만화', '애니메이션 박물관'],
    isOfficial: true,
    routeType: 'walking',
    estimatedDurationMinutes: 150,
    observedTravelPattern:
      '여행자 리뷰가 축적된 현지 도보 투어의 니가타역, 만화·애니메이션 정보관, 만화의 집 순서 중 현재 등록된 두 핵심 시설 구간을 그대로 사용했습니다.',
    sourceSummary:
      '3시간 30분 도보 투어는 니가타역에서 만화·애니메이션 정보관을 거쳐 만화의 집으로 이동합니다. 두 시설의 공식 관광 정보로 운영 위치와 접근 정보도 교차 확인했습니다.',
    researchedAt: RESEARCHED_AT,
    ...sources([
      {
        url: 'https://gowithguide.com/japan/tour/niigata-manga-and-anime-walking-tour-4415',
        kind: 'guided_itinerary',
        label: '여행자 리뷰가 있는 니가타 만화·애니메이션 도보 투어',
      },
      {
        url: 'https://niigata-kankou.or.jp/spot/12931',
        kind: 'official_route',
        label: '니가타시 만화의 집 공식 관광 정보',
      },
      {
        url: 'https://sado-niigata.com/media/images/pamphlet/09_NiigataCityTouristGuideMap_EN.pdf',
        kind: 'official_route',
        label: '니가타시 공식 관광 지도',
      },
    ]),
  },
]
