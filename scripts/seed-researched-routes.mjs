import fs from 'node:fs'
import { MongoClient } from 'mongodb'

const MODE = process.argv.includes('--apply') ? 'apply' : 'dry-run'
const RESEARCHED_AT = '2026-05-31'
const WALK_FACTOR = 1.3
const WALK_SPEED_M_PER_MIN = 80
const WALK_THRESHOLD_METERS = 3000
const TRANSIT_SPEED_M_PER_MIN = 500
const LONG_DISTANCE_SPEED_M_PER_MIN = 1200
const TRANSIT_BUFFER_MINUTES = 20
const STOP_BUFFER_MINUTES = 25
const LEGACY_TEST_ROUTE_IDS = ['ROUTE-001', 'ROUTE-002']

loadEnv()

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB || extractDbNameFromUri(mongoUri)

const newSpotPlans = [
  {
    id: 'REAL-ANI-050',
    name: '京阪宇治駅',
    description:
      '우지 강과 우지교 바로 옆에 있는 게이한 우지선 종착역입니다. 「울려라! 유포니엄」 우지 순례의 출발점으로 자주 언급되는 실제 역입니다.',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/7/7f/Keihan_Uji_station.jpg',
    ],
    address: '일본 교토부 우지시 우지오토가와 5-2',
    coordinates: { lat: 34.8951, lng: 135.8068 },
    category: 'animation',
    relatedContent: [{ name: '울려라! 유포니엄', type: 'anime', year: 2015 }],
    externalLinks: [
      {
        id: 'REAL-ANI-050-official',
        type: 'official',
        label: '게이한 전철 역 안내',
        url: 'https://www.keihan.co.jp/traffic/station/stationinfo/310.html',
      },
    ],
    sourceUrls: [
      'https://www.keihan.co.jp/traffic/station/stationinfo/310.html',
      'https://jatrabridge.com/2024/05/12/12298/pilgrimage-to-hibike-euphonium/',
      'https://futurely.blog/visit_animation/eupho-uji-202312/',
    ],
    sourceSummary:
      '공식 역 정보와 방문기들이 게이한 우지역을 우지 유포니엄 순례의 접근 거점으로 반복 언급합니다.',
  },
  {
    id: 'REAL-ANI-051',
    name: '宇治神社',
    description:
      '우지 강 동쪽에 있는 신사로, 「울려라! 유포니엄」 순례기에서 우지 강변·다이키치야마 동선과 함께 자주 묶이는 장소입니다.',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/8/84/101127_Uji-jinja_Uji_Kyoto_pref_Japan01s3.jpg',
    ],
    address: '일본 교토부 우지시 우지야마다 1',
    coordinates: { lat: 34.8917, lng: 135.8116 },
    category: 'animation',
    relatedContent: [{ name: '울려라! 유포니엄', type: 'anime', year: 2015 }],
    externalLinks: [
      {
        id: 'REAL-ANI-051-official',
        type: 'official',
        label: '우지시 관광 정보',
        url: 'https://www.city.uji.kyoto.jp/site/uji-kankou/',
      },
    ],
    sourceUrls: [
      'https://www.city.uji.kyoto.jp/site/uji-kankou/',
      'https://commons.wikimedia.org/wiki/File:101127_Uji-jinja_Uji_Kyoto_pref_Japan01s3.jpg',
      'https://book-journey.jp/2025/04/01/hibike1/',
      'https://futurely.blog/visit_animation/eupho-uji-202312/',
    ],
    sourceSummary:
      '우지시 관광권의 실제 신사이며 복수의 유포니엄 방문기가 우지 신사와 강변 순례 동선을 함께 기록합니다.',
  },
  {
    id: 'REAL-ANI-052',
    name: '大吉山展望台',
    description:
      '우지 시내와 강변을 내려다보는 전망 지점입니다. 「울려라! 유포니엄」 팬 방문기에서 도보 체감 난이도가 함께 언급되는 핵심 순례 지점입니다.',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/1/18/Mataburi_Uji%2C_Uji-shi%2C_Ky%C5%8Dto-fu_611-0021%2C_Japan_-_panoramio_%281%29.jpg',
    ],
    address: '일본 교토부 우지시 우지 히가시우치 일대',
    coordinates: { lat: 34.8899, lng: 135.8181 },
    category: 'animation',
    relatedContent: [{ name: '울려라! 유포니엄', type: 'anime', year: 2015 }],
    externalLinks: [
      {
        id: 'REAL-ANI-052-official',
        type: 'official',
        label: '우지시 관광 정보',
        url: 'https://www.city.uji.kyoto.jp/site/uji-kankou/',
      },
    ],
    sourceUrls: [
      'https://www.city.uji.kyoto.jp/site/uji-kankou/',
      'https://libert.co.jp/pilgrimage-guild/eupho-pilgrimage/',
      'https://www.reddit.com/r/HibikeEuphonium/comments/1grqmal/',
      'https://www.reddit.com/r/HibikeEuphonium/comments/1hjboyo/',
    ],
    sourceSummary:
      '우지 관광권의 전망 산책 지점이며 팬 방문기에서 다이키치야마 등반이 실제 순례 부담으로 반복 언급됩니다.',
  },
  {
    id: 'REAL-ANI-053',
    name: '縣神社',
    description:
      '아가타 축제로 알려진 우지의 신사입니다. 「울려라! 유포니엄」 순례 글에서 우지교·강변과 함께 축제 장면 동선으로 다뤄집니다.',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/7/75/AgataJinja-M1277.jpg',
    ],
    address: '일본 교토부 우지시 우지렌게 72',
    coordinates: { lat: 34.8901, lng: 135.8044 },
    category: 'animation',
    relatedContent: [{ name: '울려라! 유포니엄', type: 'anime', year: 2015 }],
    externalLinks: [
      {
        id: 'REAL-ANI-053-official',
        type: 'official',
        label: '아가타 신사',
        url: 'https://www.agatajinjya.com/',
      },
    ],
    sourceUrls: [
      'https://www.agatajinjya.com/',
      'https://commons.wikimedia.org/wiki/File:AgataJinja-M1277.jpg',
      'https://magazine.tabist.co.jp/area/kansai/15107/',
      'https://menehunephoto.net/entry/2015/03/29/153932',
    ],
    sourceSummary:
      '공식 신사 정보와 순례 글이 아가타 신사를 유포니엄 우지 강변·축제 장면 동선으로 다룹니다.',
  },
]

const routePlans = [
  {
    id: 'ROUTE-101',
    seedKey: 'researched-2026-05-30-akihabara-core',
    name: '아키하바라 애니·게임 성지 핵심 코스',
    description:
      '간다묘진에서 라디오회관과 아키하바라 전자상가까지 이어지는 도쿄 대표 오타쿠 문화 반나절 코스입니다.',
    spotIds: ['REAL-ANI-040', 'REAL-ANI-041', 'REAL-ANI-010'],
    relatedContentNames: [
      '러브 라이브! School idol project',
      '슈타인즈 게이트 (STEINS;GATE)',
      'STEINS;GATE',
    ],
    regionTags: ['도쿄', '아키하바라', '간다'],
    isOfficial: true,
    sourceSummary:
      'GO TOKYO와 JNTO가 아키하바라를 애니·게임 문화권으로 소개하고, 간다묘진·라디오회관은 등록 spot의 작품 관계와 지리적으로 연결됩니다.',
    sourceUrls: [
      'https://www.gotokyo.org/en/destinations/central-tokyo/akihabara/',
      'https://www.japan.travel/en/spot/2178/',
      'https://www.gotokyo.org/en/spot/1771/index.html',
      'https://www.japan.travel/en/spot/1701/',
    ],
  },
  {
    id: 'ROUTE-102',
    seedKey: 'researched-2026-05-30-shibuya-game-idol',
    name: '시부야 게임·아이돌 팝컬처 코스',
    description:
      '시부야 교차로와 109를 먼저 걷고, 닌텐도 도쿄와 포켓몬 센터 메가 도쿄까지 이어가는 도심 팝컬처 코스입니다.',
    spotIds: ['REAL-ANI-020', 'REAL-ANI-021', 'REAL-GAM-002', 'REAL-GAM-003'],
    relatedContentNames: [
      '최애의 아이 (【推しの子】)',
      '슈퍼 마리오',
      '포켓몬스터',
    ],
    regionTags: ['도쿄', '시부야', '이케부쿠로'],
    isOfficial: true,
    sourceSummary:
      'GO TOKYO의 시부야 문화권 설명, Nintendo TOKYO 공식 주소, 포켓몬센터 공식 점포 정보를 묶어 시부야 중심 방문 후 이케부쿠로 포켓몬 거점으로 이동합니다.',
    sourceUrls: [
      'https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html',
      'https://www.nintendo.com/jp/officialstore/index.html',
      'https://shop.pokemon.co.jp/ja/shop/pokemoncenter-shibuya/',
      'https://www.pokemon.co.jp/shop/en/pokecen/megatokyo/',
    ],
  },
  {
    id: 'ROUTE-103',
    seedKey: 'researched-2026-05-30-kamakura-shonan-slam-dunk',
    name: '쇼난·가마쿠라 슬램덩크 해안 코스',
    description:
      '가마쿠라코코마에역 건널목에서 에노시마까지 해안선을 따라 이동하는 쇼난 클래식 순례 코스입니다.',
    spotIds: ['REAL-ANI-002', 'REAL-ANI-009'],
    relatedContentNames: ['슬램덩크 (スラムダンク)', '더 퍼스트 슬램덩크'],
    regionTags: ['가마쿠라', '쇼난', '에노시마'],
    isOfficial: true,
    sourceSummary:
      '가마쿠라 현지 가이드와 관광 자료가 건널목·에노시마 해안권을 함께 다루며, 두 spot 모두 슬램덩크 관계가 등록되어 있습니다.',
    sourceUrls: [
      'https://kamakuraguide.com/en/inamuragasaki-shichirigahama/kamakurakokomae-no1-crossing/',
      'https://www.japan.travel/en/destinations/kanto/kanagawa/kamakura-and-enoshima/',
      'https://www.fujisawa-kanko.jp/spot/enoshima/',
    ],
  },
  {
    id: 'ROUTE-104',
    seedKey: 'researched-2026-05-30-nerima-animation-origin',
    name: '네리마 애니메이션 산업 산책 코스',
    description:
      '오이즈미 애니메 게이트에서 도에이 애니메이션 뮤지엄까지 이어지는 네리마 애니 산업 테마 코스입니다.',
    spotIds: ['REAL-ANI-047', 'REAL-ANI-048'],
    relatedContentNames: ['드래곤볼', '원피스'],
    regionTags: ['도쿄', '네리마', '오이즈미'],
    isOfficial: true,
    sourceSummary:
      'GO TOKYO는 오이즈미 애니메 게이트를 네리마 애니 산업의 상징으로 설명하고, 도에이 애니메이션 뮤지엄은 기존 작품 관계 spot입니다.',
    sourceUrls: [
      'https://www.gotokyo.org/en/spot/1696/index.html',
      'https://museum.toei-anim.co.jp/en/',
      'https://animetourism88.com/en/places/toei-animation-museum/',
    ],
  },
  {
    id: 'ROUTE-105',
    seedKey: 'researched-2026-05-30-nakano-ikebukuro-subculture',
    name: '나카노·이케부쿠로 서브컬처 쇼핑 코스',
    description:
      '나카노 브로드웨이의 레트로 굿즈 밀집 지역을 본 뒤 이케부쿠로 선샤인60 거리와 포켓몬 센터로 이동하는 쇼핑 코스입니다.',
    spotIds: ['REAL-ANI-046', 'REAL-ANI-045', 'REAL-GAM-003'],
    relatedContentNames: ['포켓몬스터'],
    regionTags: ['도쿄', '나카노', '이케부쿠로'],
    isOfficial: true,
    sourceSummary:
      'GO TOKYO와 JNTO가 나카노 브로드웨이를 애니·만화·서브컬처 쇼핑 거점으로 소개하며, 이케부쿠로 포켓몬 센터는 등록 게임 spot입니다.',
    sourceUrls: [
      'https://www.gotokyo.org/en/destinations/western-tokyo/nakano/',
      'https://www.japan.travel/id/experiences-in-japan/3363/',
      'https://www.pokemon.co.jp/shop/en/pokecen/megatokyo/',
    ],
  },
  {
    id: 'ROUTE-106',
    seedKey: 'researched-2026-05-30-odaiba-ariake-event',
    name: '오다이바·아리아케 애니 이벤트 코스',
    description:
      '레인보우 브리지 전망권에서 도쿄 빅사이트까지 이동하는 오다이바·아리아케 이벤트 방문 코스입니다.',
    spotIds: ['REAL-ANI-043', 'REAL-ANI-044'],
    relatedContentNames: [
      '디지몬 어드벤처',
      '러브 라이브! 니지가사키 학원 스쿨 아이돌 동호회',
    ],
    regionTags: ['도쿄', '오다이바', '아리아케'],
    isOfficial: true,
    sourceSummary:
      'GO TOKYO와 JNTO가 오다이바·레인보우 브리지 관광 동선을 설명하고, 도쿄 빅사이트는 아리아케 이벤트 거점으로 등록되어 있습니다.',
    sourceUrls: [
      'https://www.gotokyo.org/en/destinations/southern-tokyo/odaiba/index.html',
      'https://www.japan.travel/en/spot/371',
      'https://www.bigsight.jp/english/visitor/',
    ],
  },
  {
    id: 'ROUTE-107',
    seedKey: 'researched-2026-05-30-umamusume-racecourse',
    name: '우마무스메 수도권 경마장 코스',
    description:
      '도쿄 경마장과 나카야마 경마장을 하루에 묶어 보는 우마무스메 팬 대상 수도권 이동 코스입니다.',
    spotIds: ['REAL-ANI-026', 'REAL-ANI-027'],
    relatedContentNames: ['우마무스메 PRETTY DERBY'],
    regionTags: ['도쿄', '후추', '지바', '후나바시'],
    isOfficial: true,
    sourceSummary:
      'JRA 공식 경마장 정보와 기존 우마무스메 관계 spot을 기준으로 수도권의 대표 경마장 두 곳을 연결합니다.',
    sourceUrls: [
      'https://jra.jp/facilities/race/tokyo/',
      'https://jra.jp/facilities/race/nakayama/',
    ],
  },
  {
    id: 'ROUTE-108',
    seedKey: 'researched-2026-05-30-shinjuku-anime-background',
    name: '신주쿠 애니 배경 산책 코스',
    description:
      '신주쿠 교엔, 스가 신사, 가부키초를 연결해 도쿄 도심 애니 배경을 짧게 훑는 코스입니다.',
    spotIds: ['REAL-ANI-042', 'REAL-ANI-001', 'REAL-ANI-017'],
    relatedContentNames: [
      '언어의 정원',
      '너의 이름은 (君の名は。)',
      '은혼 (銀魂)',
      '용과 같이 (龍が如く)',
    ],
    regionTags: ['도쿄', '신주쿠', '요츠야', '가부키초'],
    isOfficial: true,
    sourceSummary:
      'GO TOKYO의 신주쿠 관광권과 기존 spot-작품 관계를 기준으로 도심 내 짧은 이동 순서로 구성했습니다.',
    sourceUrls: [
      'https://www.gotokyo.org/en/destinations/western-tokyo/shinjuku/',
      'https://www.env.go.jp/garden/shinjukugyoen/english/',
      'https://www.gotokyo.org/en/destinations/western-tokyo/shinjuku/kabukicho/index.html',
    ],
  },
  {
    id: 'ROUTE-109',
    seedKey: 'researched-2026-05-31-uji-euphonium-expanded',
    name: '우지 유포니엄 현지 체험 확장 코스',
    description:
      '게이한 우지역에서 우지교, 우지신사, 다이키치야마 전망대, 아가타신사까지 걷는 「울려라! 유포니엄」 우지 핵심 순례 코스입니다.',
    spotIds: [
      'REAL-ANI-050',
      'REAL-ANI-037',
      'REAL-ANI-051',
      'REAL-ANI-052',
      'REAL-ANI-053',
    ],
    relatedContentNames: ['울려라! 유포니엄'],
    regionTags: ['교토', '우지'],
    isOfficial: true,
    sourceSummary:
      '공식 관광·교통 정보로 실제 장소를 확인하고, 2024~2026년 방문기와 블로그가 게이한 우지역·우지교·우지신사·다이키치야마·아가타신사를 유포니엄 우지 순례 핵심 동선으로 반복 기록합니다.',
    sourceUrls: [
      'https://www.keihan.co.jp/traffic/station/stationinfo/310.html',
      'https://www.city.uji.kyoto.jp/site/uji-kankou/',
      'https://www.agatajinjya.com/',
      'https://jatrabridge.com/2024/05/12/12298/pilgrimage-to-hibike-euphonium/',
      'https://futurely.blog/visit_animation/eupho-uji-202312/',
      'https://book-journey.jp/2025/04/01/hibike1/',
      'https://libert.co.jp/pilgrimage-guild/eupho-pilgrimage/',
      'https://www.reddit.com/r/HibikeEuphonium/comments/1szqmr5/should_i_be_based_in_kyoto_or_uji_proper_for_a/',
    ],
  },
]

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

async function main() {
  const client = new MongoClient(mongoUri)
  await client.connect()

  try {
    const db = client.db(dbName)
    const spotsCollection = db.collection('spots')
    const routesCollection = db.collection('routes')
    const contentCollection = db.collection('content_masters')
    const relationsCollection = db.collection('spot_content_relations')
    const facilitiesCollection = db.collection('facilities')

    const contentByName = new Map(
      (
        await contentCollection
          .find(
            {},
            {
              projection: {
                displayName: 1,
                normalizedName: 1,
                type: 1,
                imageUrl: 1,
              },
            }
          )
          .toArray()
      ).flatMap((content) =>
        [content.displayName, content.normalizedName]
          .filter(Boolean)
          .map((name) => [name, content])
      )
    )

    const spotUpserts = await upsertNewSpots(
      spotsCollection,
      relationsCollection,
      facilitiesCollection,
      contentCollection,
      contentByName
    )

    const existingIds = new Set(
      (
        await routesCollection.find({}, { projection: { id: 1 } }).toArray()
      ).map((route) => route.id)
    )

    const contentNames = new Set(contentByName.keys())

    const spotIds = [...new Set(routePlans.flatMap((route) => route.spotIds))]
    const spots = await spotsCollection
      .find({ id: { $in: spotIds } })
      .project({ _id: 0, id: 1, name: 1, coordinates: 1, photos: 1 })
      .toArray()
    const spotById = new Map(spots.map((spot) => [spot.id, spot]))
    for (const spot of newSpotPlans) {
      if (!spotById.has(spot.id)) {
        spotById.set(spot.id, {
          id: spot.id,
          name: spot.name,
          coordinates: spot.coordinates,
          photos: spot.photos,
        })
      }
    }

    const plannedRoutes = routePlans.map((plan) =>
      buildRoute(plan, spotById, contentNames, existingIds)
    )

    printPlan(plannedRoutes)
    printSpotPlan(spotUpserts)

    if (MODE !== 'apply') {
      console.log('\nDry-run only. Re-run with --apply to upsert these routes.')
      console.log(
        `Apply mode also hides legacy public test routes when present: ${LEGACY_TEST_ROUTE_IDS.join(', ')}`
      )
      return
    }

    const results = []
    for (const route of plannedRoutes) {
      const existing = await routesCollection.findOne({
        'sourceAudit.seedKey': route.sourceAudit.seedKey,
      })

      if (!existing && existingIds.has(route.id)) {
        throw new Error(
          `Cannot insert ${route.id}: id already exists without matching seedKey`
        )
      }

      const result = await routesCollection.updateOne(
        { 'sourceAudit.seedKey': route.sourceAudit.seedKey },
        {
          $set: {
            ...route,
            id: existing?.id || route.id,
            createdAt: existing?.createdAt || route.createdAt,
            bookmarkCount: existing?.bookmarkCount ?? route.bookmarkCount,
            completionCount: existing?.completionCount ?? route.completionCount,
          },
        },
        { upsert: true }
      )
      results.push({
        id: existing?.id || route.id,
        seedKey: route.sourceAudit.seedKey,
        matched: result.matchedCount,
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
      })
    }

    const archiveResult = await routesCollection.updateMany(
      {
        id: { $in: LEGACY_TEST_ROUTE_IDS },
        name: { $regex: /테스트/ },
        isPublic: true,
      },
      {
        $set: {
          isPublic: false,
          updatedAt: new Date(),
          'sourceAudit.archivedBy': 'scripts/seed-researched-routes.mjs',
          'sourceAudit.archivedAt': new Date(),
          'sourceAudit.archiveReason':
            'Legacy test route hidden so public course discovery only exposes researched routes.',
        },
      }
    )

    console.log('\nApply result')
    console.log(
      JSON.stringify(
        {
          upserts: results,
          archivedLegacyTestRoutes: archiveResult.modifiedCount,
        },
        null,
        2
      )
    )
  } finally {
    await client.close()
  }
}

async function upsertNewSpots(
  spotsCollection,
  relationsCollection,
  facilitiesCollection,
  contentCollection,
  contentByName
) {
  const now = new Date()
  const summaries = []

  for (const spot of newSpotPlans) {
    const existing = await spotsCollection.findOne({ id: spot.id })
    summaries.push({
      id: spot.id,
      name: spot.name,
      exists: Boolean(existing),
      relatedContent: spot.relatedContent.map((content) => content.name),
      facilityCount: buildFacilitiesForSpot(spot).length,
      sourceUrls: spot.sourceUrls,
    })

    if (MODE !== 'apply') continue

    await spotsCollection.updateOne(
      { id: spot.id },
      {
        $set: {
          name: spot.name,
          description: spot.description,
          photos: spot.photos,
          address: spot.address,
          coordinates: spot.coordinates,
          category: spot.category,
          relatedContent: spot.relatedContent,
          relatedMedia: spot.relatedContent.map((content) => ({
            title: content.name,
            type: content.type,
            year: content.year,
          })),
          externalLinks: spot.externalLinks,
          authorId: 'system:route-seed',
          authorName: 'Not A Trip 편집부',
          lifecycleStatus: 'approved',
          closureSuspected: false,
          duplicateSuspected: false,
          pendingSupplementCount: 0,
          urgentReviewRequired: false,
          updatedAt: now,
          sourceAudit: {
            generatedBy: 'scripts/seed-researched-routes.mjs',
            researchedAt: RESEARCHED_AT,
            sourceUrls: spot.sourceUrls,
            sourceSummary: spot.sourceSummary,
          },
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    )

    for (const [index, content] of spot.relatedContent.entries()) {
      const contentMaster = contentByName.get(content.name)
      if (!contentMaster) {
        throw new Error(
          `${spot.id} references missing content: ${content.name}`
        )
      }

      await relationsCollection.updateOne(
        { id: `REL-${spot.id}-${String(index + 1).padStart(2, '0')}` },
        {
          $set: {
            id: `REL-${spot.id}-${String(index + 1).padStart(2, '0')}`,
            spotId: spot.id,
            contentId: `${spot.id}_${normalizeContentId(content.name)}`,
            contentName: content.name,
            contentType: content.type,
            contentImageUrl: contentMaster.imageUrl,
            relationType: 'fan_inferred',
            confidenceLevel: 'medium',
            officialness: 'community_verified',
            displayPriority: index,
            status: 'active',
            summary: spot.sourceSummary,
            sourceCount: spot.sourceUrls.length,
            verificationScore: 1,
            createdBy: 'system:route-seed',
            updatedBy: 'system:route-seed',
            updatedAt: now,
            sourceAudit: {
              generatedBy: 'scripts/seed-researched-routes.mjs',
              sourceUrls: spot.sourceUrls,
              sourceSummary: spot.sourceSummary,
            },
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      )
    }

    for (const facility of buildFacilitiesForSpot(spot)) {
      await facilitiesCollection.updateOne(
        { sourceId: facility.sourceId, spotId: spot.id },
        {
          $set: {
            ...facility,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      )
    }
  }

  if (MODE === 'apply') {
    const affectedContentNames = [
      ...new Set(
        newSpotPlans.flatMap((spot) =>
          spot.relatedContent.map((content) => content.name)
        )
      ),
    ]
    for (const contentName of affectedContentNames) {
      const spotIds = await relationsCollection.distinct('spotId', {
        contentName,
        status: 'active',
      })
      await contentCollection.updateOne(
        { displayName: contentName },
        { $set: { spotCount: spotIds.length, updatedAt: new Date() } }
      )
    }
  }

  return summaries
}

function buildFacilitiesForSpot(spot) {
  const sharedUjiFacilities = [
    {
      sourceId: `manual:${spot.id}:keihan-uji-station`,
      name: '京阪宇治駅',
      type: 'station',
      address: '일본 교토부 우지시 우지오토가와 5-2',
      fullAddress: '일본 교토부 우지시 우지오토가와 5-2',
      coordinates: { lat: 34.8951, lng: 135.8068 },
      spotId: spot.id,
      status: 'active',
      verificationScore: 1,
      upvotes: 1,
      downvotes: 0,
      source: 'manual_researched_route_seed',
      addressSource: 'official_or_public_map_reference',
    },
    {
      sourceId: `manual:${spot.id}:tsuen-tea`,
      name: '通圓',
      type: 'cafe',
      address: '일본 교토부 우지시 우지히가시우치 1',
      fullAddress: '일본 교토부 우지시 우지히가시우치 1',
      coordinates: { lat: 34.8936, lng: 135.8076 },
      spotId: spot.id,
      status: 'active',
      verificationScore: 1,
      upvotes: 1,
      downvotes: 0,
      source: 'manual_researched_route_seed',
      addressSource: 'public_map_reference',
    },
    {
      sourceId: `manual:${spot.id}:uji-tourist-center`,
      name: '宇治市観光センター',
      type: 'other',
      address: '일본 교토부 우지시 우지토우가와 2',
      fullAddress: '일본 교토부 우지시 우지토우가와 2',
      coordinates: { lat: 34.8912, lng: 135.8075 },
      spotId: spot.id,
      status: 'active',
      verificationScore: 1,
      upvotes: 1,
      downvotes: 0,
      source: 'manual_researched_route_seed',
      addressSource: 'public_map_reference',
    },
  ]

  return sharedUjiFacilities.map((facility) => ({
    ...facility,
    distanceFromSeedSpotMeters: Math.round(
      calculateDistanceMeters(
        spot.coordinates.lat,
        spot.coordinates.lng,
        facility.coordinates.lat,
        facility.coordinates.lng
      )
    ),
  }))
}

function printSpotPlan(spots) {
  console.log(
    JSON.stringify(
      {
        mode: MODE,
        newSpotCount: spots.length,
        newSpots: spots,
      },
      null,
      2
    )
  )
}

function normalizeContentId(contentName) {
  return contentName
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
}

function buildRoute(plan, spotById, contentNames, existingIds) {
  const missingSpots = plan.spotIds.filter((spotId) => !spotById.has(spotId))
  if (missingSpots.length > 0) {
    throw new Error(`${plan.id} has missing spots: ${missingSpots.join(', ')}`)
  }

  const missingContents = plan.relatedContentNames.filter(
    (contentName) => !contentNames.has(contentName)
  )
  if (missingContents.length > 0) {
    throw new Error(
      `${plan.id} has missing content names: ${missingContents.join(', ')}`
    )
  }

  if (existingIds.has(plan.id)) {
    // Allowed only when the existing document is this seed. The apply path checks that.
  }

  const orderedSpots = plan.spotIds.map((spotId, index, allSpotIds) => {
    const spot = spotById.get(spotId)
    const previousSpot = index > 0 ? spotById.get(allSpotIds[index - 1]) : null
    const distance = previousSpot
      ? Math.round(
          calculateDistanceMeters(
            previousSpot.coordinates.lat,
            previousSpot.coordinates.lng,
            spot.coordinates.lat,
            spot.coordinates.lng
          )
        )
      : null
    const mode = distance === null ? null : getTravelMode(distance)

    return {
      spotId: spot.id,
      spotName: spot.name,
      coordinates: spot.coordinates,
      thumbnailUrl: spot.photos?.[0] || '',
      distanceFromPrev: distance,
      walkTimeFromPrev:
        distance !== null && mode === 'walking'
          ? estimateWalkTimeMinutes(distance)
          : null,
      note: buildSpotNote(index, spot.name, mode),
      isAvailable: true,
    }
  })

  const totalDistance = orderedSpots.reduce(
    (sum, spot) => sum + (spot.distanceFromPrev || 0),
    0
  )
  const movementMinutes = orderedSpots.reduce(
    (sum, spot) => sum + estimateMovementMinutes(spot.distanceFromPrev),
    0
  )
  const estimatedDuration =
    Math.ceil(
      (movementMinutes + orderedSpots.length * STOP_BUFFER_MINUTES) / 5
    ) * 5
  const difficulty = pickDifficulty(
    totalDistance,
    estimatedDuration,
    orderedSpots.length
  )
  const now = new Date()

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    estimatedDuration,
    difficulty,
    spots: orderedSpots,
    totalDistance,
    relatedContentNames: plan.relatedContentNames,
    regionTags: plan.regionTags,
    isPublic: true,
    isOfficial: plan.isOfficial,
    bookmarkCount: 0,
    completionCount: 0,
    authorId: 'system:route-seed',
    authorName: 'Not A Trip 편집부',
    createdAt: now,
    updatedAt: now,
    sourceAudit: {
      seedKey: plan.seedKey,
      sourceUrls: plan.sourceUrls,
      sourceSummary: plan.sourceSummary,
      researchedAt: RESEARCHED_AT,
      insertedAt: now,
      allStopsAlreadyInDb: plan.spotIds.every(
        (spotId) => !newSpotPlans.some((newSpot) => newSpot.id === spotId)
      ),
      newSpotIds: plan.spotIds.filter((spotId) =>
        newSpotPlans.some((newSpot) => newSpot.id === spotId)
      ),
      generatedBy: 'scripts/seed-researched-routes.mjs',
    },
  }
}

function printPlan(routes) {
  console.log(
    JSON.stringify(
      {
        mode: MODE,
        dbName,
        routeCount: routes.length,
        routes: routes.map((route) => ({
          id: route.id,
          name: route.name,
          spotIds: route.spots.map((spot) => spot.spotId),
          totalDistance: route.totalDistance,
          estimatedDuration: route.estimatedDuration,
          difficulty: route.difficulty,
          relatedContentNames: route.relatedContentNames,
          sourceUrls: route.sourceAudit.sourceUrls,
        })),
      },
      null,
      2
    )
  )
}

function estimateMovementMinutes(distanceMeters) {
  if (!distanceMeters) return 0
  if (distanceMeters <= WALK_THRESHOLD_METERS) {
    return estimateWalkTimeMinutes(distanceMeters)
  }
  const speed =
    distanceMeters <= 50000
      ? TRANSIT_SPEED_M_PER_MIN
      : LONG_DISTANCE_SPEED_M_PER_MIN
  return Math.ceil(distanceMeters / speed) + TRANSIT_BUFFER_MINUTES
}

function estimateWalkTimeMinutes(distanceMeters) {
  return Math.ceil((distanceMeters * WALK_FACTOR) / WALK_SPEED_M_PER_MIN)
}

function getTravelMode(distanceMeters) {
  if (distanceMeters <= WALK_THRESHOLD_METERS) return 'walking'
  if (distanceMeters <= 50000) return 'transit'
  return 'long_distance'
}

function pickDifficulty(totalDistance, estimatedDuration, spotCount) {
  if (totalDistance <= 5000 && estimatedDuration <= 150 && spotCount <= 3)
    return 'easy'
  if (totalDistance <= 30000 && estimatedDuration <= 240) return 'moderate'
  return 'hard'
}

function buildSpotNote(index, spotName, mode) {
  if (index === 0) return `${spotName}에서 코스를 시작합니다.`
  if (mode === 'walking')
    return `${spotName}까지 도보 이동이 현실적인 구간입니다.`
  if (mode === 'transit') return `${spotName}까지 대중교통 이동을 권장합니다.`
  return `${spotName}까지 장거리 이동이 필요하므로 시간 여유를 두세요.`
}

function calculateDistanceMeters(lat1, lng1, lat2, lng2) {
  const earthRadiusMeters = 6371000
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusMeters * c
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!fs.existsSync(file)) continue
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match || process.env[match[1]]) continue
      let value = match[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      process.env[match[1]] = value
    }
  }
}

function extractDbNameFromUri(uri) {
  const match = uri.match(/\/([^/?]+)(\?|$)/)
  return match ? match[1] : 'not-a-trip'
}
