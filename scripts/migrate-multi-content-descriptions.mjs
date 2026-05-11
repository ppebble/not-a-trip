/**
 * Multi-content spot description / relation summary migration
 *
 * Usage:
 * - Dry run: node scripts/migrate-multi-content-descriptions.mjs
 * - Apply:   node scripts/migrate-multi-content-descriptions.mjs --apply
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'

function loadEnvLocal() {
  try {
    const envContent = readFileSync('.env.local', 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const value = trimmed.slice(idx + 1).trim()
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // ignore missing .env.local
  }
}

const SPOT_UPDATES = [
  {
    id: 'REAL-ANI-002',
    description:
      '에노덴 가마쿠라코코마에역 앞에 위치한 유명한 건널목으로, 바다와 철길이 함께 보이는 가마쿠라 대표 풍경입니다. 애니메이션과 극장판을 포함해 여러 작품에서 인상적인 장면의 배경으로 활용되며, 팬들이 사진을 남기기 위해 자주 찾는 성지입니다.',
    relations: {
      '슬램덩크 (スラムダンク)':
        '애니메이션 오프닝과 작품 이미지로 널리 알려진 대표 성지입니다. 바다를 배경으로 한 건널목 풍경이 슬램덩크 특유의 청춘 분위기를 떠올리게 합니다.',
      '더 퍼스트 슬램덩크':
        '극장판 개봉 이후 다시 주목받은 장소로, 슬램덩크 팬들이 작품의 여운을 느끼기 위해 찾는 대표 코스입니다.',
    },
  },
  {
    id: 'REAL-ANI-008',
    description:
      '도쿄를 상징하는 랜드마크로, 전망대와 야경, 주변 도시 풍경 덕분에 다양한 작품에서 배경으로 자주 등장하는 장소입니다. 특정 한 작품보다도 “도쿄다움”을 보여주는 아이콘으로 소비되어 여러 장르의 팬들이 함께 찾는 스팟입니다.',
    relations: {
      '도쿄 구울 (東京喰種)':
        '도쿄의 음울하고 비현실적인 분위기를 강조하는 배경으로 자주 언급되는 랜드마크입니다.',
      '원피스 (ONE PIECE)':
        '도쿄를 상징하는 장소로서 각종 협업, 이벤트, 도시 배경 연상 포인트로 함께 회자되는 스팟입니다.',
      '미소녀 전사 세일러문 (美少女戦士セーラームーン)':
        '도쿄의 상징적인 스카이라인을 보여주는 요소로, 세일러문이 그리는 도시적 감성과 잘 어울리는 장소입니다.',
      '명탐정 코난 (名探偵コナン)':
        '도쿄를 배경으로 한 사건과 추격, 야경 장면을 연상시키는 대표 랜드마크 중 하나입니다.',
    },
  },
  {
    id: 'REAL-ANI-009',
    description:
      '바다와 언덕, 전망대, 에노덴 풍경이 어우러진 쇼난 대표 관광지로 여러 청춘물과 일상물의 배경이 되는 지역입니다. 작품마다 다른 정서를 담아내지만, 산책과 해변, 섬 풍경을 함께 즐길 수 있다는 점에서 공통된 성지 경험을 제공합니다.',
    relations: {
      '청춘 돼지는 바니걸 선배의 꿈을 꾸지 않는다':
        '주요 배경 지역으로, 해변과 전망대, 에노덴을 따라 이어지는 장면들이 작품의 청춘 멜로 분위기를 형성합니다.',
      '슬램덩크 (スラムダンク)':
        '가마쿠라 일대 성지 코스를 함께 묶어 방문하는 경우가 많으며, 쇼난 해안 특유의 풍경이 작품의 감성과 잘 맞닿아 있습니다.',
      '츠리타마 (つり球)':
        '에노시마와 바다 풍경이 작품의 밝고 개성적인 분위기를 만드는 핵심 배경 중 하나로 기억됩니다.',
    },
  },
  {
    id: 'REAL-ANI-010',
    description:
      '도쿄 치요다구의 전자상가이자 서브컬처 중심지로, 애니메이션·게임·피규어·메이드 카페 문화가 밀집한 대표 성지입니다. 라디오회관과 전기상가 거리, 각종 굿즈 숍과 카페가 모여 있어 여러 작품의 배경과 팬 문화가 겹쳐지는 스팟입니다.',
    relations: {
      '슈타인즈 게이트 (STEINS;GATE)':
        '라디오회관과 골목 풍경, 메이드 카페 거리 등 작품에서 익숙한 배경을 직접 떠올릴 수 있는 대표 성지입니다.',
      '러브라이브! (ラブライブ!)':
        '오토노키자카 일대와 함께 팬들이 자주 묶어 방문하는 지역으로, 아이돌 문화와 서브컬처 분위기를 함께 체감할 수 있습니다.',
      '소드 아트 온라인 (Sword Art Online)':
        '게임과 전자기기, 서브컬처 상점이 밀집한 공간이라는 점에서 작품 속 오프라인 배경 감성을 떠올리게 하는 장소입니다.',
    },
  },
  {
    id: 'REAL-ANI-017',
    description:
      '도쿄 신주쿠의 대표 번화가로, 네온사인과 유흥가, 뒷골목 분위기가 강한 지역입니다. 코믹한 패러디부터 하드보일드한 범죄 서사까지 다양한 작품이 이 거리의 복합적인 이미지를 각자 다른 방식으로 활용합니다.',
    relations: {
      '은혼 (銀魂)':
        '작중 가부키쵸의 모델로 자주 거론되는 지역으로, 난장판 같은 활기와 코믹한 에너지를 떠올리게 합니다.',
      '용과 같이 (龍が如く)':
        '가무로초의 모티프로 잘 알려진 공간으로, 화려한 번화가와 뒷골목의 대비가 게임 분위기와 맞닿아 있습니다.',
      '가부키초 셜록 (歌舞伎町シャーロック)':
        '제목 그대로 가부키초를 전면에 내세운 작품으로, 지역의 혼잡하고 독특한 분위기를 배경으로 삼습니다.',
    },
  },
  {
    id: 'REAL-ANI-020',
    description:
      '수많은 보행자가 한 번에 오가는 세계적인 교차로로, 시부야를 상징하는 대표 장면을 만들어내는 장소입니다. 군중, 네온, 대형 전광판이 한 화면에 들어와 현대 도쿄의 속도감과 혼잡함을 표현하기 좋은 배경으로 자주 등장합니다.',
    relations: {
      '주술회전 (呪術廻戦)':
        '시부야 사변을 떠올리게 하는 핵심 배경으로, 대규모 전투와 긴장감 있는 도시 연출의 중심 장소입니다.',
      '최애의 아이 (【推しの子】)':
        '연예 산업과 도심 이미지를 상징하는 시부야의 풍경을 떠올리게 하는 대표 배경 포인트입니다.',
      '듀라라라!! (デュラララ!!)':
        '도쿄 도심의 복잡한 흐름과 군중성을 보여주는 장면과 잘 어울리는 장소로, 도시 군상극의 분위기를 강화합니다.',
    },
  },
  {
    id: 'REAL-SPO-005',
    description:
      '서울 잠실에 위치한 대표 야구장으로, 두 구단이 홈구장으로 함께 사용하는 국내 야구 성지입니다. 같은 장소라도 응원 문화와 팀 분위기가 달라 경기일마다 전혀 다른 현장감을 체험할 수 있습니다.',
    relations: {
      'LG 트윈스':
        'LG 트윈스의 홈경기를 직관할 수 있는 구장으로, 응원석 분위기와 팀 상징 요소를 현장에서 함께 체험할 수 있습니다.',
      '두산 베어스':
        '두산 베어스의 홈구장으로도 사용되며, 같은 구장 안에서도 팀에 따라 다른 응원 문화와 팬 분위기를 느낄 수 있습니다.',
    },
  },
  {
    id: 'REAL-MOV-003',
    description:
      '뉴질랜드 마타마타 지역에 조성된 실물 영화 세트장으로, 중간계의 샤이어를 현실에서 가장 생생하게 체험할 수 있는 장소입니다. 반지의 제왕과 호빗 시리즈 모두와 깊게 연결되어 있어 판타지 영화 팬들에게 상징적인 성지입니다.',
    relations: {
      '반지의 제왕 시리즈':
        '샤이어와 호빗 마을의 정서를 직접 체험할 수 있는 대표 촬영지로, 영화 팬들의 필수 방문 코스입니다.',
      '호빗 시리즈':
        '호빗 시리즈에서도 같은 세트장이 적극 활용되어, 비주얼적으로 더 확장된 샤이어의 분위기를 떠올리게 합니다.',
    },
  },
  {
    id: 'REAL-MUS-002',
    description:
      '일본을 대표하는 대형 공연장으로, 해외 아티스트와 K-POP 팀들에게도 상징적인 투어 무대입니다. 공연장 자체가 목표 지점이 되는 만큼 특정 한 팀보다 “도쿄돔 입성”이라는 상징성을 체험하려는 팬들의 방문이 이어지는 장소입니다.',
    relations: {
      BTS: '일본 공연과 투어의 상징적 무대 중 하나로, 대규모 콘서트의 현장감을 떠올리게 하는 장소입니다.',
      블랙핑크:
        '대형 해외 투어 무대의 상징으로, 블랙핑크의 공연 스케일과 팬덤 열기를 함께 연상시키는 장소입니다.',
    },
  },
  {
    id: 'REAL-MUS-004',
    description:
      'HYBE 아티스트 관련 전시와 체험 요소를 중심으로 운영되던 복합 문화 공간으로, 소속 아티스트 팬들이 함께 찾는 장소였습니다. 특정 팀 하나만의 성지라기보다 레이블 전체의 세계관과 아카이브를 경험하는 성격이 강한 스팟입니다.',
    relations: {
      BTS: 'BTS 관련 전시와 아카이브, 음악 세계관을 체험하려는 팬들이 가장 먼저 떠올리는 공간 중 하나였습니다.',
      세븐틴:
        'HYBE 레이블 소속 아티스트로서 세븐틴 관련 전시, 콘텐츠, 팬 경험과 함께 연결되는 공간입니다.',
    },
  },
  {
    id: 'REAL-MUS-005',
    description:
      'SM엔터테인먼트 소속 아티스트의 굿즈, 전시, 팬 체험 요소가 모인 복합 문화 공간입니다. 한 팀 전용 공간이 아니라 여러 팀 팬층이 동시에 방문하는 허브 역할을 하며, 세대별 SM 아티스트 팬 문화가 겹쳐지는 장소입니다.',
    relations: {
      EXO: 'EXO 굿즈와 전시, 팬 체험 요소를 찾는 방문자들이 자주 들르는 대표 SM 관련 스팟입니다.',
      NCT: 'NCT 관련 상품과 전시 콘텐츠를 현장에서 확인할 수 있어 팬들이 자주 찾는 장소입니다.',
      에스파:
        '에스파 관련 굿즈와 전시, 팬 경험 요소를 한 자리에서 만날 수 있는 SM 팬 허브 공간입니다.',
    },
  },
  {
    id: 'REAL-GAM-001',
    description:
      'LCK 경기가 열리는 대표 e스포츠 경기장으로, 게임 팬과 팀 팬이 함께 모이는 현장형 성지입니다. 리그 전체의 상징성과 특정 팀 응원 경험이 동시에 겹쳐지는 장소라서 여러 층위의 팬 경험을 제공합니다.',
    relations: {
      '리그 오브 레전드 (League of Legends)':
        'LCK를 통해 리그 오브 레전드 e스포츠를 현장에서 체감할 수 있는 대표 무대입니다.',
      T1: 'T1 경기를 직접 관람하거나 팀 팬덤 문화를 현장에서 느끼려는 방문자에게 상징적인 장소입니다.',
    },
  },
  {
    id: 'REAL-GAM-002',
    description:
      '시부야 PARCO에 위치한 닌텐도 공식 스토어로, 대표 프랜차이즈 굿즈와 전시 연출이 한데 모여 있는 공간입니다. 특정 게임 하나보다 닌텐도 브랜드 전체를 체험하는 성격이 강해 여러 시리즈 팬들이 함께 찾는 스팟입니다.',
    relations: {
      '슈퍼 마리오':
        '마리오 시리즈 굿즈와 캐릭터 상품을 가장 쉽게 만날 수 있는 대표 닌텐도 오프라인 공간입니다.',
      '젤다의 전설':
        '젤다 시리즈 관련 상품과 아트워크를 현장에서 접할 수 있어 팬들이 자주 방문하는 장소입니다.',
      포켓몬스터:
        '포켓몬 굿즈와 캐릭터 상품을 포함해 닌텐도 대표 IP를 함께 체험할 수 있는 스토어형 성지입니다.',
    },
  },
  {
    id: 'REAL-GAM-004',
    description:
      '유니버설 스튜디오 재팬 내 닌텐도 테마 구역으로, 실내외 어트랙션과 공간 연출을 통해 게임 세계를 몸으로 체험할 수 있는 장소입니다. 마리오 시리즈 전반의 이미지와 마리오 카트 같은 개별 타이틀 경험이 함께 겹쳐지는 대표 스팟입니다.',
    relations: {
      '슈퍼 마리오':
        '버섯왕국과 캐릭터 세계관을 현실 공간으로 옮긴 구역으로, 마리오 팬들에게 가장 직관적인 체험형 성지입니다.',
      '마리오 카트':
        '마리오 카트 테마 어트랙션을 통해 게임 특유의 경쟁과 코스 체험을 오프라인에서 재현하는 장소입니다.',
    },
  },
]

async function main() {
  loadEnvLocal()

  const isApply = process.argv.includes('--apply')
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/not-a-trip'
  const dbName =
    process.env.MONGODB_DB || uri.match(/\/([^/?]+)(\?|$)/)?.[1] || 'not-a-trip'

  console.log(
    `Starting multi-content description migration (${isApply ? 'apply' : 'dry-run'})`
  )
  console.log(`DB: ${dbName}`)
  console.log(`URI: ${uri}\n`)

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
  await client.connect()

  try {
    const db = client.db(dbName)
    const spotsCollection = db.collection('spots')
    const relationsCollection = db.collection('spot_content_relations')

    let spotUpdates = 0
    let relationUpdates = 0
    let relationMisses = 0

    for (const update of SPOT_UPDATES) {
      const currentSpot = await spotsCollection.findOne(
        { id: update.id },
        { projection: { _id: 0, id: 1, name: 1, description: 1 } }
      )

      if (!currentSpot) {
        console.log(`[missing spot] ${update.id}`)
        continue
      }

      const needsSpotUpdate = currentSpot.description !== update.description
      console.log(`[${update.id}] ${currentSpot.name}`)
      if (needsSpotUpdate) {
        console.log(`  description:`)
        console.log(`  - before: ${currentSpot.description}`)
        console.log(`  - after : ${update.description}`)
      } else {
        console.log(`  description already up to date`)
      }

      if (isApply && needsSpotUpdate) {
        await spotsCollection.updateOne(
          { id: update.id },
          { $set: { description: update.description } }
        )
        spotUpdates++
      }

      for (const [contentName, summary] of Object.entries(update.relations)) {
        const currentRelation = await relationsCollection.findOne(
          { spotId: update.id, contentName, status: 'active' },
          { projection: { _id: 0, summary: 1 } }
        )

        if (!currentRelation) {
          relationMisses++
          console.log(`  [missing relation] ${contentName}`)
          continue
        }

        const needsRelationUpdate = currentRelation.summary !== summary
        if (needsRelationUpdate) {
          console.log(`  summary -> ${contentName}`)
        }

        if (isApply && needsRelationUpdate) {
          await relationsCollection.updateOne(
            { spotId: update.id, contentName, status: 'active' },
            { $set: { summary } }
          )
          relationUpdates++
        }
      }

      console.log('')
    }

    if (!isApply) {
      console.log(
        'Dry run complete. Re-run with --apply to update the database.'
      )
      return
    }

    console.log('Applied changes:')
    console.log(`- spot descriptions updated: ${spotUpdates}`)
    console.log(`- relation summaries updated: ${relationUpdates}`)
    console.log(`- missing relations skipped: ${relationMisses}`)
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
