import type { SeedSpot } from '../seed-real-spots'

const COLLECTED_AT = '2026-08-30T00:00:00.000Z'
const OFFICIAL_2026_SELECTIONS_URL =
  'https://animetourism88.com/topic/%E3%80%8E%E8%A8%AA%E3%82%8C%E3%81%A6%E3%81%BF%E3%81%9F%E3%81%84%E6%97%A5%E6%9C%AC%E3%81%AE%E3%82%A2%E3%83%8B%E3%83%A1%E8%81%96%E5%9C%B0-88%E3%80%8F2026%E5%B9%B4%E7%89%88-%E9%81%B8%E5%AE%9A%E3%81%AB/'

function evidence(url: string, label: string) {
  return {
    url,
    label,
    evidenceType: 'official' as const,
    collectedAt: COLLECTED_AT,
  }
}

function timestamps() {
  return { createdAt: new Date(), updatedAt: new Date() }
}

export const JAPAN_ANIME_SPOT_ADDITIONS: SeedSpot[] = [
  {
    id: 'REAL-ANI-030',
    name: '도요사토 초등학교 구 교사 (케이온!)',
    description:
      '시가현 도요사토정의 역사적 학교 건물로, 「케이온!」 사쿠라가오카 고등학교 교사의 외관과 내부를 연상시키는 대표 순례지다. 교실과 계단, 음악실을 둘러보려는 팬 방문이 이어지는 지역 거점이다.',
    photos: [],
    address: '일본 시가현 이누카미군 도요사토정 이시바타 375',
    coordinates: { lat: 35.2028, lng: 136.2286 },
    category: 'animation',
    relatedContent: [
      { name: '케이온! (けいおん!)', type: 'anime', year: 2009 },
    ],
    externalLinks: [
      createLink(
        'REAL-ANI-030-official',
        '도요사토 초등학교 구 교사',
        'https://toyosato-elschool.net/toyosato/about/'
      ),
    ],
    sourceUrls: [
      evidence(
        'https://toyosato-elschool.net/toyosato/about/',
        '시설 공식 사이트'
      ),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-031',
    name: '지치부교 (아노하나)',
    description:
      '지치부 시가지를 잇는 교량으로 「그날 본 꽃의 이름을 우리는 아직 모른다」의 키 비주얼과 장면 배경으로 알려졌다. 2026년 공식 애니메이션 성지 선정 지역인 지치부의 핵심 방문 지점이다.',
    photos: [],
    address: '일본 사이타마현 지치부시 아보마치 지치부교',
    coordinates: { lat: 35.9996, lng: 139.0898 },
    category: 'animation',
    relatedContent: [
      {
        name: '그날 본 꽃의 이름을 우리는 아직 모른다. (あの日見た花の名前を僕達はまだ知らない。)',
        type: 'anime',
        year: 2011,
      },
    ],
    sourceUrls: [
      evidence(
        OFFICIAL_2026_SELECTIONS_URL,
        '2026 일본 애니메이션 성지 88 선정'
      ),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-032',
    name: '시라카와고 오기마치 (쓰르라미 울 적에)',
    description:
      '갓쇼즈쿠리 마을 경관이 보존된 오기마치는 「쓰르라미 울 적에」의 히나미자와를 떠올리게 하는 대표 순례 지역이다. 작품은 2026년 공식 애니메이션 성지 목록에서 시라카와촌과 함께 선정됐다.',
    photos: [],
    address: '일본 기후현 오노군 시라카와촌 오기마치',
    coordinates: { lat: 36.2579, lng: 136.9064 },
    category: 'animation',
    relatedContent: [
      {
        name: '쓰르라미 울 적에 (ひぐらしのなく頃に)',
        type: 'anime',
        year: 2006,
      },
    ],
    sourceUrls: [
      evidence(
        OFFICIAL_2026_SELECTIONS_URL,
        '2026 일본 애니메이션 성지 88 선정'
      ),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-033',
    name: '야쿠시마 시라타니 운수이쿄 (모노노케 히메 연상지)',
    description:
      '이끼 숲으로 유명한 야쿠시마의 협곡이다. 「모노노케 히메」의 숲과 시각적으로 자주 연결되지만 단일 장면의 공식 모델로 단정할 근거는 부족해 검토 필요 데이터로 유지한다.',
    photos: [],
    address: '일본 가고시마현 구마게군 야쿠시마정 미야노우라',
    coordinates: { lat: 30.3676, lng: 130.5573 },
    category: 'animation',
    relatedContent: [
      { name: '모노노케 히메 (もののけ姫)', type: 'anime', year: 1997 },
    ],
    sourceUrls: [
      evidence(
        'https://y-rekumori.com/',
        '야쿠시마 레크리에이션의 숲 공식 안내'
      ),
    ],
    reviewStatus: 'needs_review',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-034',
    name: '도모노우라 항구 (벼랑 위의 포뇨)',
    description:
      '세토나이카이의 항구 경관이 남아 있는 후쿠야마시 도모노우라다. 미야자키 하야오 감독의 체류와 「벼랑 위의 포뇨」 구상지로 지역 관광 안내에서 소개되는 순례 지역이다.',
    photos: [],
    address: '일본 히로시마현 후쿠야마시 도모초 도모',
    coordinates: { lat: 34.3845, lng: 133.3815 },
    category: 'animation',
    relatedContent: [
      { name: '벼랑 위의 포뇨 (崖の上のポニョ)', type: 'anime', year: 2008 },
    ],
    sourceUrls: [
      evidence(
        'https://www.city.fukuyama.hiroshima.jp/uploaded/attachment/45305.pdf',
        '후쿠야마시 공식 관광 자료'
      ),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-035',
    name: '누마즈 우치우라 미토 해안 (러브 라이브! 선샤인!!)',
    description:
      '아와시마를 바라보는 우치우라 해안은 「러브 라이브! 선샤인!!」의 주요 무대가 집중된 지역이다. 누마즈시는 작품과 지역 협업 정보를 공식적으로 운영하며 2026년 성지 목록에도 선정됐다.',
    photos: [],
    address: '일본 시즈오카현 누마즈시 우치우라미토',
    coordinates: { lat: 35.0183, lng: 138.8878 },
    category: 'animation',
    relatedContent: [
      { name: '러브 라이브! 선샤인!!', type: 'anime', year: 2016 },
    ],
    sourceUrls: [
      evidence(
        'https://www.city.numazu.shizuoka.jp/takara100/category/nigiwai/092.htm',
        '누마즈시 공식 성지 안내'
      ),
      evidence(
        OFFICIAL_2026_SELECTIONS_URL,
        '2026 일본 애니메이션 성지 88 선정'
      ),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-036',
    name: '세이세키사쿠라가오카역 (귀를 기울이면)',
    description:
      '다마시의 게이오선 역으로 「귀를 기울이면」의 언덕 마을 순례 출발점으로 알려져 있다. 역 주변에서 이로하자카와 사쿠라가오카 주택가로 이어지는 도보 동선을 구성할 수 있다.',
    photos: [],
    address: '일본 도쿄도 다마시 세키도 1-10-10',
    coordinates: { lat: 35.6508, lng: 139.4478 },
    category: 'animation',
    relatedContent: [
      { name: '귀를 기울이면 (耳をすませば)', type: 'anime', year: 1995 },
    ],
    sourceUrls: [
      evidence('https://www.city.tama.lg.jp/kanko/', '다마시 공식 관광 안내'),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-037',
    name: '우지교·우지 강변 (울려라! 유포니엄)',
    description:
      '우지교와 우지 강변을 잇는 산책 구간은 「울려라! 유포니엄」 우지 순례의 핵심 동선이다. 게이한 우지역에서 우지 신사와 다이키치야마 방면으로 이동할 때 자연스럽게 연결된다.',
    photos: [],
    address: '일본 교토부 우지시 우지 강변 일대',
    coordinates: { lat: 34.8911, lng: 135.8077 },
    category: 'animation',
    relatedContent: [
      {
        name: '울려라! 유포니엄 (響け！ユーフォニアム)',
        type: 'anime',
        year: 2015,
      },
    ],
    sourceUrls: [
      evidence(
        'https://www.city.uji.kyoto.jp/uploaded/attachment/32906.pdf',
        '우지시 공식 작품 무대 안내'
      ),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-038',
    name: '오가키역 (목소리의 형태)',
    description:
      '기후현 오가키시의 중심역으로 「목소리의 형태」에 등장하는 오가키 시내 순례의 교통 거점이다. 역에서 미도리바시와 시내 수로 주변 촬영지로 이동하기 좋다.',
    photos: [],
    address: '일본 기후현 오가키시 다카야초 1-145',
    coordinates: { lat: 35.3667, lng: 136.6178 },
    category: 'animation',
    relatedContent: [
      { name: '목소리의 형태 (聲の形)', type: 'anime', year: 2016 },
    ],
    sourceUrls: [
      evidence(
        'https://www.city.ogaki.lg.jp/0000043673.html',
        '오가키시 공식 작품 무대 안내'
      ),
    ],
    reviewStatus: 'approved',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  {
    id: 'REAL-ANI-039',
    name: '스와호 (너의 이름은. 연상지)',
    description:
      '나가노현 스와 분지의 호수다. 「너의 이름은.」의 이토모리 호수와 닮은 풍경으로 팬들이 찾지만 제작진이 단일 공식 모델로 확정한 장소는 아니므로 검토 필요 데이터로 유지한다.',
    photos: [],
    address: '일본 나가노현 스와시·오카야시·시모스와정 스와호',
    coordinates: { lat: 36.0504, lng: 138.0833 },
    category: 'animation',
    relatedContent: [
      { name: '너의 이름은. (君の名は。)', type: 'anime', year: 2016 },
    ],
    sourceUrls: [
      evidence('https://www.suwakanko.jp/', '스와 관광협회 공식 장소 안내'),
    ],
    reviewStatus: 'needs_review',
    authorName: 'System',
    isGuestSpot: false,
    ...timestamps(),
  },
  ...tokyoAndUjiSpots(),
  ...officialAnchorSpots(),
]

function createLink(id: string, label: string, url: string) {
  return { id, type: 'official' as const, label, url }
}

function tokyoAndUjiSpots(): SeedSpot[] {
  const records = [
    [
      '040',
      '간다묘진 신사 (러브 라이브!)',
      '아키하바라와 오차노미즈 사이의 신사로 「러브 라이브!」 팬 순례의 대표 지점이다. 작품은 2026년 공식 애니메이션 성지 목록에서 도쿄도 지요다구와 함께 선정됐다.',
      '일본 도쿄도 지요다구 소토칸다 2-16-2',
      35.702,
      139.7677,
      '러브 라이브! School idol project',
      2013,
      'https://www.kandamyoujin.or.jp/',
    ],
    [
      '041',
      '아키하바라 라디오회관 (STEINS;GATE)',
      'JR 아키하바라역 앞의 상업 시설로 「STEINS;GATE」의 핵심 배경 지점이다. 작품은 2026년 공식 애니메이션 성지 목록에서 지요다구와 함께 선정됐다.',
      '일본 도쿄도 지요다구 소토칸다 1-15-16',
      35.6987,
      139.7712,
      'STEINS;GATE',
      2011,
      'https://www.akihabara-radiokaikan.co.jp/',
    ],
    [
      '042',
      '신주쿠 교엔 (언어의 정원)',
      '도쿄 도심의 대형 정원으로 「언어의 정원」의 비 오는 정자 장면을 따라 찾는 대표 순례지다. 운영 시간과 휴원일은 환경성 공식 안내를 확인해야 한다.',
      '일본 도쿄도 신주쿠구 나이토마치 11',
      35.6852,
      139.71,
      '언어의 정원 (言の葉の庭)',
      2013,
      'https://www.env.go.jp/garden/shinjukugyoen/english/',
    ],
    [
      '043',
      '오다이바 레인보우 브리지 (디지몬 어드벤처)',
      '도쿄만과 오다이바를 잇는 상징적 교량으로 「디지몬 어드벤처」의 도쿄권 장면을 따라가는 동선에 포함된다. 작품과 오다이바는 2026년 공식 애니메이션 성지 목록에 선정됐다.',
      '일본 도쿄도 미나토구·고토구 오다이바 일대',
      35.6366,
      139.7631,
      '디지몬 어드벤처',
      1999,
      OFFICIAL_2026_SELECTIONS_URL,
    ],
    [
      '044',
      '도쿄 빅사이트 (러브 라이브! 니지가사키)',
      '아리아케의 대형 전시장으로 「러브 라이브! 니지가사키 학원 스쿨 아이돌 동호회」의 오다이바·고토구 순례 동선에 포함된다. 작품은 2026년 공식 성지 목록에 선정됐다.',
      '일본 도쿄도 고토구 아리아케 3-11-1',
      35.63,
      139.7946,
      '러브 라이브! 니지가사키 학원 스쿨 아이돌 동호회',
      2020,
      'https://www.bigsight.jp/english/visitor/',
    ],
    [
      '045',
      '이케부쿠로 선샤인60 거리',
      '이케부쿠로의 쇼핑·서브컬처 중심 거리다. 포켓몬센터 메가 도쿄로 이어지는 공식 방문 동선의 접근 지점으로 현재 조사 경로 데이터와 일치시켰다.',
      '일본 도쿄도 도시마구 히가시이케부쿠로 선샤인60 거리 일대',
      35.7295,
      139.7187,
      '포켓몬스터',
      1997,
      'https://www.pokemon.co.jp/shop/en/pokecen/megatokyo/',
    ],
    [
      '046',
      '나카노 브로드웨이',
      '나카노의 애니·만화·컬렉터 상점이 밀집한 문화 시설이다. 포켓몬 굿즈를 포함한 서브컬처 쇼핑 경로의 거점으로 현재 조사 경로 데이터와 일치시켰다.',
      '일본 도쿄도 나카노구 나카노 5-52-15',
      35.709,
      139.6657,
      '포켓몬스터',
      1997,
      'https://www.gotokyo.org/en/destinations/western-tokyo/nakano/',
    ],
    [
      '047',
      '오이즈미 애니메 게이트',
      '오이즈미가쿠엔역 앞에 조성된 애니메이션 캐릭터 전시 공간이다. 네리마 애니메이션 산업의 역사를 걷는 방문 동선의 출발점으로 활용된다.',
      '일본 도쿄도 네리마구 히가시오이즈미 1초메 일대',
      35.7498,
      139.5872,
      '드래곤볼',
      1986,
      'https://www.gotokyo.org/en/spot/1696/index.html',
    ],
    [
      '048',
      '도에이 애니메이션 뮤지엄',
      '도에이 애니메이션 스튜디오 인근의 공식 전시 시설이다. 드래곤볼·원피스 등 제작사 작품의 역사와 자료를 확인할 수 있다.',
      '일본 도쿄도 네리마구 히가시오이즈미 2-10-5',
      35.7517,
      139.5915,
      '드래곤볼',
      1986,
      'https://museum.toei-anim.co.jp/en/',
    ],
    [
      '049',
      '사자에상 거리',
      '후쿠오카시 사와라구의 해안 방향 도로로, 하세가와 마치코가 「사자에상」을 구상한 지역을 기념한다. 거리 표지와 캐릭터 조형물을 따라 걷는 작품 연고 순례지다.',
      '일본 후쿠오카현 후쿠오카시 사와라구 모모치하마 일대',
      33.5935,
      130.3524,
      '사자에상 (サザエさん)',
      1969,
      'https://www.city.fukuoka.lg.jp/sawaraku/sawaraku-tamatebako/kankou/sazaesan/index.html',
    ],
    [
      '050',
      '게이한 우지역 (울려라! 유포니엄)',
      '우지 강과 우지교 옆의 게이한 우지선 종착역으로 「울려라! 유포니엄」 우지 순례의 접근 거점이다.',
      '일본 교토부 우지시 우지오토가와 5-2',
      34.8951,
      135.8068,
      '울려라! 유포니엄 (響け！ユーフォニアム)',
      2015,
      'https://www.keihan.co.jp/traffic/station/stationinfo/310.html',
    ],
    [
      '051',
      '우지 신사 (울려라! 유포니엄)',
      '우지 강 동쪽의 신사로 작품의 강변·다이키치야마 동선과 함께 찾는 순례 지점이다. 사찰·신사 예절을 지키며 방문해야 한다.',
      '일본 교토부 우지시 우지야마다 1',
      34.8917,
      135.8116,
      '울려라! 유포니엄 (響け！ユーフォニアム)',
      2015,
      'https://www.city.uji.kyoto.jp/uploaded/attachment/32906.pdf',
    ],
    [
      '052',
      '다이키치야마 전망대 (울려라! 유포니엄)',
      '우지 시내와 강변을 내려다보는 전망 지점으로 「울려라! 유포니엄」의 상징적 야경 장면을 따라 찾는 핵심 순례지다. 산책로의 야간 안전과 소음에 주의해야 한다.',
      '일본 교토부 우지시 우지 히가시우치 일대',
      34.8899,
      135.8181,
      '울려라! 유포니엄 (響け！ユーフォニアム)',
      2015,
      'https://www.city.uji.kyoto.jp/uploaded/attachment/32906.pdf',
    ],
    [
      '053',
      '아가타 신사 (울려라! 유포니엄)',
      '아가타 축제로 알려진 우지의 신사로 작품의 축제 장면과 연결해 찾는 순례 지점이다. 실제 종교 시설과 지역 행사가 우선이므로 관람 예절을 지켜야 한다.',
      '일본 교토부 우지시 우지렌게 72',
      34.8901,
      135.8044,
      '울려라! 유포니엄 (響け！ユーフォニアム)',
      2015,
      'https://www.agatajinjya.com/',
    ],
  ] as const

  return records.map(
    ([id, name, description, address, lat, lng, title, year, sourceUrl]) => {
      const relatedContent: SeedSpot['relatedContent'] = [
        { name: title, type: 'anime', year },
      ]
      if (id === '047' || id === '048') {
        relatedContent.push({ name: '원피스', type: 'anime', year: 1999 })
      }

      return {
        id: `REAL-ANI-${id}`,
        name,
        description,
        photos: [],
        address,
        coordinates: { lat, lng },
        category: 'animation',
        relatedContent,
        sourceUrls: [evidence(sourceUrl, '공식 장소·성지 근거')],
        reviewStatus: 'approved',
        authorName: 'System',
        isGuestSpot: false,
        ...timestamps(),
      }
    }
  )
}

function coordinateEvidence(lat: number, lng: number) {
  return {
    url: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=19/${lat}/${lng}`,
    label: '공식 주소 기반 OpenStreetMap 좌표 확인',
    evidenceType: 'other' as const,
    collectedAt: COLLECTED_AT,
  }
}

function officialAnchorSpots(): SeedSpot[] {
  const records = [
    [
      '054',
      '다테바야시 쓰쓰지가오카 교류센터',
      '「우주보다 먼 곳」의 2026년 공식 성지인 다테바야시 방문 앵커다. 작품 무대 지역의 관광 정보와 이동 동선을 확인할 수 있는 공식 인증 거점이다.',
      '일본 군마현 다테바야시시 하나야마초 3181',
      36.24169,
      139.5512249,
      '우주보다 먼 곳 (宇宙よりも遠い場所)',
      2018,
      'https://animetourism88.com/en/places/a-place-further-than-the-universe/',
    ],
    [
      '055',
      '오치정 관광협회 (용과 주근깨 공주)',
      '고치현 오치정의 「용과 주근깨 공주」 공식 성지 인증 거점이다. 니요도강 유역의 실제 배경 지역을 탐방하기 전 정보 확인 지점으로 활용할 수 있다.',
      '일본 고치현 다카오카군 오치정 오치코 1736-7',
      33.5304441,
      133.2509597,
      '용과 주근깨 공주 (竜とそばかすの姫)',
      2021,
      'https://animetourism88.com/en/places/belle/',
    ],
    [
      '056',
      '와라비역 서쪽 출구 (안녕, 나의 크라머)',
      '「안녕, 나의 크라머」의 무대인 와라비시 순례 출발점이다. 공식 성지 안내는 와라비역 서쪽 출구에서 작품 배너와 실제 장면을 확인하며 도보 탐방을 시작하도록 소개한다.',
      '일본 사이타마현 와라비시 주오 1초메 와라비역',
      35.8281263,
      139.6903852,
      '안녕, 나의 크라머 (さよなら私のクラマー)',
      2021,
      'https://animetourism88.com/en/places/farewell-my-dear-cramer/',
    ],
    [
      '057',
      '하코다테 봉행소 (박앵귀 진개)',
      '고료카쿠 공원 안의 복원 역사 시설로 「박앵귀 진개」 하코다테 순례의 공식 인증 거점이다. 작품의 막부 말기 배경과 실제 역사 공간을 함께 확인할 수 있다.',
      '일본 홋카이도 하코다테시 고료카쿠초 44-3',
      41.796593,
      140.7563129,
      '박앵귀 진개 (薄桜鬼 真改)',
      2015,
      'https://animetourism88.com/en/places/hakuoki-shinkai/',
    ],
    [
      '058',
      '히미시 시오카제 갤러리',
      '후지코 후지오 A의 작품을 전시하는 히미시 공식 애니·만화 성지 시설이다. 특정 장면 재현형보다 작가 연고와 지역 만화 문화를 탐방하는 장기꼬리 거점이다.',
      '일본 도야마현 히미시 주오마치 3-4',
      36.8591512,
      136.9873297,
      '닌자 핫토리군 (忍者ハットリくん)',
      1981,
      'https://animetourism88.com/en/places/himi-city-shiokaze-gallery/',
    ],
    [
      '059',
      '고에도 쿠라리 (오늘부터 신령님)',
      '가와고에의 관광·산업 복합시설로 「오늘부터 신령님」 공식 성지 인증 거점이다. 구라즈쿠리 거리와 신사 배경지를 잇는 지역 순례의 출발점으로 적합하다.',
      '일본 사이타마현 가와고에시 신토미초 1-10-1',
      35.9162357,
      139.4837768,
      '오늘부터 신령님 (神様はじめました)',
      2012,
      'https://animetourism88.com/en/places/kamisama-hajime-mashita/',
    ],
    [
      '060',
      '기타큐슈 만화 뮤지엄',
      '기타큐슈 출신 작가와 일본 만화 문화를 다루는 공식 성지 시설이다. 특정 작품 장면보다 지역의 창작자 계보와 자료를 확인하는 장기꼬리 탐방 거점이다.',
      '일본 후쿠오카현 기타큐슈시 고쿠라키타구 아사노 2-14-5 아루아루시티 5·6층',
      33.8875431,
      130.884731,
      '기타큐슈 만화 문화',
      2012,
      'https://animetourism88.com/en/places/kitakyushu-manga-museum/',
    ],
    [
      '061',
      '지바미나토역 (역시 내 청춘 러브코메디는 잘못됐다.)',
      '지바 해안권의 철도역으로 「역시 내 청춘 러브코메디는 잘못됐다.」 공식 성지 인증 거점이다. 지바 포트타워와 해안 산책로 배경을 잇는 순례 동선에 포함된다.',
      '일본 지바현 지바시 주오구 주오코 1-17-12',
      35.6085128,
      140.1014636,
      '역시 내 청춘 러브코메디는 잘못됐다. (やはり俺の青春ラブコメはまちがっている。)',
      2013,
      'https://animetourism88.com/en/places/%E3%80%8Emy-teen-romantic-comedy-snafu%E3%80%8Fseries/',
    ],
    [
      '062',
      '나가토로 관광안내소 (나에게 천사가 내려왔다!)',
      '나가토로역 앞 관광안내소로 극장판 「나에게 천사가 내려왔다! 프레셔스 프렌즈」의 공식 성지 인증 거점이다. 강변과 상점가 촬영지를 확인하는 장기꼬리 순례 출발점이다.',
      '일본 사이타마현 지치부군 나가토로정 나가토로 529-1',
      36.0952228,
      139.1121154,
      '나에게 천사가 내려왔다! 프레셔스 프렌즈',
      2022,
      'https://animetourism88.com/en/places/wataten/',
    ],
    [
      '063',
      '아오야마 고쇼 후루사토관',
      '「명탐정 코난」 작가 아오야마 고쇼의 고향에 세워진 공식 기념관이다. 호쿠에이정의 코난 거리와 함께 작가 연고형 순례의 핵심 거점이다.',
      '일본 돗토리현 도하쿠군 호쿠에이정 유라슈쿠 1414',
      35.4981815,
      133.7619219,
      '명탐정 코난 (名探偵コナン)',
      1996,
      'https://animetourism88.com/en/places/gosho-aoyama-manga-factory/',
    ],
  ] as const

  return records.map(
    ([id, name, description, address, lat, lng, title, year, sourceUrl]) => ({
      id: `REAL-ANI-${id}`,
      name,
      description,
      photos: [],
      address,
      coordinates: { lat, lng },
      category: 'animation',
      relatedContent: [{ name: title, type: 'anime', year }],
      sourceUrls: [
        evidence(sourceUrl, 'Anime Tourism Association 공식 인증 장소'),
        ...(id === '056'
          ? [
              evidence(
                'https://www.city.warabi.saitama.jp/shisei/youkoso/promotion/1009392/1007326.html',
                '와라비시 공식 작품 무대 안내'
              ),
            ]
          : []),
        coordinateEvidence(lat, lng),
      ],
      reviewStatus: 'needs_review',
      authorName: 'System',
      isGuestSpot: false,
      ...timestamps(),
    })
  )
}
