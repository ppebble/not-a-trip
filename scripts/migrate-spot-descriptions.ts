/**
 * 스팟 description 및 relation summary 마이그레이션
 *
 * 1. 다중 작품 스팟의 description을 장소 자체 설명으로 교체
 * 2. spot_content_relations.summary에 작품별 설명 채우기
 *
 * 실행: node scripts/run-migration.mjs scripts/migrate-spot-descriptions.ts
 */
import { connectToDatabase, COLLECTIONS } from '../src/lib/db'

interface SpotUpdate {
  id: string
  description: string
  relations: {
    contentName: string
    summary: string
  }[]
}

/**
 * 마이그레이션 데이터
 * - description: 장소 자체 설명 (작품 무관)
 * - relations: 각 작품별 summary
 */
const SPOT_UPDATES: SpotUpdate[] = [
  {
    id: 'REAL-ANI-002',
    description:
      '에노덴 가마쿠라코코마에역 바로 앞에 위치한 건널목입니다. 바다를 배경으로 한 탁 트인 전망이 특징이며, 에노덴 열차가 지나가는 모습을 가까이서 볼 수 있습니다.',
    relations: [
      {
        contentName: '슬램덩크 (スラムダンク)',
        summary:
          '슬램덩크 오프닝에서 강백호가 달리는 장면의 배경으로 등장합니다. 바다를 배경으로 한 건널목 장면이 팬들에게 가장 유명한 성지입니다.',
      },
      {
        contentName: '더 퍼스트 슬램덩크',
        summary:
          '극장판 "더 퍼스트 슬램덩크"에서도 동일한 건널목이 등장합니다. 오리지널 시리즈와 같은 장소를 배경으로 사용했습니다.',
      },
    ],
  },
  {
    id: 'REAL-ANI-008',
    description:
      '1958년 완공된 도쿄의 상징적인 철탑으로 높이 333m입니다. 도쿄 미나토구 시바공원에 위치하며, 전망대에서 도쿄 시내를 한눈에 내려다볼 수 있습니다.',
    relations: [
      {
        contentName: '도쿄 구울 (東京喰種)',
        summary:
          '도쿄 구울에서 도쿄의 상징적 배경으로 여러 장면에 등장합니다. 구울과 인간이 공존하는 도쿄의 랜드마크로 묘사됩니다.',
      },
      {
        contentName: '원피스 (ONE PIECE)',
        summary:
          '원피스 실사판 및 콜라보 이벤트에서 도쿄 타워가 배경으로 활용되었습니다.',
      },
      {
        contentName: '미소녀 전사 세일러문 (美少女戦士セーラームーン)',
        summary:
          '세일러문에서 도쿄의 주요 랜드마크로 여러 에피소드에 등장합니다. 세일러 전사들의 활동 무대인 도쿄를 상징하는 장소입니다.',
      },
      {
        contentName: '명탐정 코난 (名探偵コナン)',
        summary:
          '명탐정 코난에서 도쿄를 배경으로 한 에피소드에 등장합니다. 도쿄의 대표 랜드마크로 자주 활용됩니다.',
      },
    ],
  },
  {
    id: 'REAL-ANI-009',
    description:
      '가나가와현 후지사와시에 위치한 섬으로, 에노덴 종점인 가타세에노시마역에서 도보로 접근 가능합니다. 에노시마 신사, 이와야 동굴, 에노시마 전망대 등이 있으며 해변과 함께 관광지로 유명합니다.',
    relations: [
      {
        contentName: '청춘 돼지는 바니걸 선배의 꿈을 꾸지 않는다',
        summary:
          '작품의 주요 배경으로 에노시마 전망대, 해변, 에노덴이 등장합니다. 주인공 사쿠타와 마이의 만남과 이야기가 펼쳐지는 핵심 무대입니다.',
      },
      {
        contentName: '슬램덩크 (スラムダンク)',
        summary:
          '에노시마 해변이 슬램덩크 오프닝 장면의 배경으로 등장합니다. 가마쿠라코코마에역 건널목과 함께 슬램덩크 성지순례 코스에 포함됩니다.',
      },
      {
        contentName: '츠리타마 (つり球)',
        summary:
          '에노시마를 주요 무대로 한 낚시 애니메이션입니다. 에노시마 해변과 주변 바다가 작품 전반에 걸쳐 등장합니다.',
      },
    ],
  },
  {
    id: 'REAL-ANI-010',
    description:
      '도쿄 치요다구에 위치한 전자상가 및 서브컬처의 중심지입니다. 전자제품, 애니메이션 굿즈, 만화, 게임 등을 판매하는 수많은 상점이 밀집해 있으며 메이드 카페로도 유명합니다.',
    relations: [
      {
        contentName: '슈타인즈 게이트 (STEINS;GATE)',
        summary:
          '슈타인즈 게이트의 주요 무대로, 라디오 회관과 메이드 카페 거리 등 작품 속 장소들을 실제로 방문할 수 있습니다. 오카베 린타로의 미래 가젯 연구소가 위치한 곳입니다.',
      },
      {
        contentName: '러브라이브! (ラブライブ!)',
        summary:
          '러브라이브!의 배경인 오토노키자카 학원의 모델이 된 지역 근처에 위치합니다. 아이돌 활동의 무대로 아키하바라가 등장합니다.',
      },
      {
        contentName: '소드 아트 온라인 (Sword Art Online)',
        summary:
          '소드 아트 온라인에서 주인공 키리토가 게임 관련 장비를 구입하는 배경으로 아키하바라가 등장합니다.',
      },
    ],
  },
  {
    id: 'REAL-ANI-017',
    description:
      '도쿄 신주쿠구에 위치한 번화가로, 가부키초 1번가와 2번가로 구성됩니다. 음식점, 오락시설, 클럽 등이 밀집한 도쿄의 대표적인 유흥가이자 관광지입니다.',
    relations: [
      {
        contentName: '은혼 (銀魂)',
        summary:
          '은혼의 가부키초 배경의 모델이 된 실제 장소입니다. 작품 속 코믹하고 활기찬 분위기를 실제로 체험할 수 있습니다.',
      },
      {
        contentName: '용과 같이 (龍が如く)',
        summary:
          '용과 같이 시리즈의 가상 도시 "카무로초"의 모델이 된 장소입니다. 게임 속 거리 풍경과 실제 가부키초를 비교하며 방문하는 팬들이 많습니다.',
      },
      {
        contentName: '가부키초 셜록 (歌舞伎町シャーロック)',
        summary:
          '작품 제목 그대로 가부키초를 주요 무대로 한 애니메이션입니다. 작품 속 탐정 사무소와 주변 거리가 실제 가부키초를 배경으로 합니다.',
      },
    ],
  },
  {
    id: 'REAL-ANI-020',
    description:
      '도쿄 시부야구에 위치한 세계에서 가장 유명한 스크램블 교차로 중 하나입니다. 한 번에 수천 명이 동시에 건너는 독특한 교통 시스템으로 유명하며, 시부야역 하치코 출구 앞에 위치합니다.',
    relations: [
      {
        contentName: '주술회전 (呪術廻戦)',
        summary:
          '주술회전 시부야 사변 편의 핵심 배경입니다. 작품 속 긴박감 넘치는 전투 장면이 이 교차로 일대에서 펼쳐집니다.',
      },
      {
        contentName: '최애의 아이 (【推しの子】)',
        summary:
          '최애의 아이에서 도쿄 연예계를 배경으로 한 장면에 시부야 스크램블 교차로가 등장합니다.',
      },
      {
        contentName: '듀라라라!! (デュラララ!!)',
        summary:
          '듀라라라!!의 주요 무대인 이케부쿠로와 함께 시부야가 작품의 배경으로 등장합니다.',
      },
    ],
  },
  {
    id: 'REAL-ANI-026',
    description:
      '도쿄도 후추시에 위치한 JRA(일본중앙경마회)의 대표 경마장입니다. 일본 더비, 재팬컵 등 굵직한 레이스가 열리는 곳으로, 수용 인원 22만 명의 대규모 시설을 갖추고 있습니다.',
    relations: [
      {
        contentName: '우마무스메 PRETTY DERBY',
        summary:
          '우마무스메에 등장하는 경마 소녀들의 실제 모델이 된 경주마들이 활약한 경마장입니다. 도쿄 경마장을 배경으로 한 레이스 장면이 작품에 등장합니다.',
      },
    ],
  },
  {
    id: 'REAL-ANI-027',
    description:
      '치바현 후나바시시에 위치한 JRA 경마장입니다. 아리마 기념과 사츠키상 같은 상징적인 레이스로 유명하며, 내회 코스가 특징적인 경마장입니다.',
    relations: [
      {
        contentName: '우마무스메 PRETTY DERBY',
        summary:
          '우마무스메에 등장하는 경마 소녀들의 실제 모델이 된 경주마들이 활약한 경마장입니다. 나카야마 경마장을 배경으로 한 레이스 장면이 작품에 등장합니다.',
      },
    ],
  },
  {
    id: 'REAL-SPO-005',
    description:
      '서울 송파구 잠실동에 위치한 야구장으로, 수용 인원 약 25,000명 규모입니다. 1982년 개장 이후 한국 프로야구의 중심지로 자리잡았으며, 잠실 올림픽 주경기장 인근에 위치합니다.',
    relations: [
      {
        contentName: 'LG 트윈스',
        summary:
          'LG 트윈스의 홈구장입니다. 잠실 야구장에서 LG 트윈스의 홈 경기를 직접 관람할 수 있습니다.',
      },
      {
        contentName: '두산 베어스',
        summary:
          '두산 베어스의 홈구장입니다. LG 트윈스와 함께 잠실 야구장을 공동 홈구장으로 사용합니다.',
      },
    ],
  },
  {
    id: 'REAL-MOV-003',
    description:
      '뉴질랜드 와이카토 지역 마타마타에 위치한 영화 세트장입니다. 1999년 반지의 제왕 촬영을 위해 조성된 이후 현재까지 관광지로 운영되고 있으며, 44개의 호빗 구멍 집과 그린 드래곤 여관 등이 보존되어 있습니다.',
    relations: [
      {
        contentName: '반지의 제왕 시리즈',
        summary:
          '반지의 제왕 3부작에서 호빗들의 고향 샤이어 마을로 등장합니다. 프로도와 빌보의 집이 있는 백엔드 힐 등 주요 장면의 배경입니다.',
      },
      {
        contentName: '호빗 시리즈',
        summary:
          '호빗 3부작에서도 동일한 세트장이 샤이어로 등장합니다. 빌보 배긴스의 모험이 시작되는 백엔드 힐이 이곳에 있습니다.',
      },
    ],
  },
  {
    id: 'REAL-MUS-002',
    description:
      '도쿄 분쿄구에 위치한 일본 최대 규모의 돔 공연장으로 수용 인원 약 55,000명입니다. 1988년 개장 이후 국내외 대형 콘서트와 스포츠 이벤트가 열리는 일본의 대표적인 공연장입니다.',
    relations: [
      {
        contentName: 'BTS',
        summary:
          'BTS가 일본 투어에서 공연한 장소입니다. BTS의 일본 팬들에게 중요한 성지 중 하나입니다.',
      },
      {
        contentName: '블랙핑크',
        summary:
          '블랙핑크가 일본 투어에서 공연한 장소입니다. K-POP 아티스트들의 일본 대형 공연 필수 코스입니다.',
      },
    ],
  },
  {
    id: 'REAL-MUS-004',
    description:
      '서울 용산구 한남동에 위치한 HYBE의 복합 문화 공간입니다. 2021년 개관하였으며 HYBE 아티스트들의 역사와 음악을 체험할 수 있는 전시 공간으로 운영됩니다.',
    relations: [
      {
        contentName: 'BTS',
        summary:
          'BTS의 역사와 음악을 체험할 수 있는 전시가 상설 운영됩니다. BTS 멤버들의 친필 사인과 공연 의상 등을 전시하고 있습니다.',
      },
      {
        contentName: '세븐틴',
        summary:
          '세븐틴을 비롯한 HYBE 아티스트들의 전시도 함께 운영됩니다. 세븐틴 관련 굿즈와 전시물을 관람할 수 있습니다.',
      },
    ],
  },
  {
    id: 'REAL-MUS-005',
    description:
      '서울 강남구 삼성동 코엑스몰 내에 위치한 SM엔터테인먼트의 복합 문화 공간입니다. 2019년 개관하였으며 SM 아티스트들의 굿즈 판매, 전시, 체험 공간으로 운영됩니다.',
    relations: [
      {
        contentName: 'EXO',
        summary:
          'EXO의 굿즈와 전시를 즐길 수 있는 공간입니다. EXO 관련 한정판 상품과 포토존이 마련되어 있습니다.',
      },
      {
        contentName: 'NCT',
        summary:
          'NCT의 굿즈와 전시를 즐길 수 있는 공간입니다. NCT 각 유닛의 관련 상품을 구매할 수 있습니다.',
      },
      {
        contentName: '에스파',
        summary:
          '에스파의 굿즈와 전시를 즐길 수 있는 공간입니다. 에스파 관련 한정판 상품과 포토존이 마련되어 있습니다.',
      },
    ],
  },
  {
    id: 'REAL-GAM-001',
    description:
      '서울 종로구 종로3가에 위치한 LCK(리그 오브 레전드 챔피언스 코리아) 전용 경기장입니다. 2019년 개장하였으며 약 700석 규모의 e스포츠 전용 시설로 운영됩니다.',
    relations: [
      {
        contentName: '리그 오브 레전드 (League of Legends)',
        summary:
          'LCK 리그의 공식 경기장입니다. 리그 오브 레전드 한국 리그 경기를 직접 관람할 수 있는 곳입니다.',
      },
      {
        contentName: 'T1',
        summary:
          'T1의 홈 경기장입니다. 페이커를 비롯한 T1 선수들의 경기를 직접 관람할 수 있습니다.',
      },
    ],
  },
  {
    id: 'REAL-GAM-002',
    description:
      '도쿄 시부야구 파르코 6층에 위치한 닌텐도의 공식 직영 스토어입니다. 2019년 개장하였으며 닌텐도 게임 캐릭터들의 굿즈와 한정판 상품을 판매합니다.',
    relations: [
      {
        contentName: '슈퍼 마리오',
        summary:
          '슈퍼 마리오 관련 굿즈와 한정판 상품을 구매할 수 있습니다. 마리오 캐릭터 상품이 가장 풍부하게 갖춰져 있습니다.',
      },
      {
        contentName: '젤다의 전설',
        summary:
          '젤다의 전설 관련 굿즈와 한정판 상품을 구매할 수 있습니다. 링크와 젤다 관련 아이템을 찾는 팬들이 많이 방문합니다.',
      },
      {
        contentName: '포켓몬스터',
        summary:
          '포켓몬스터 관련 굿즈도 판매합니다. 닌텐도 공식 스토어이므로 포켓몬 센터와는 별개의 상품 라인업을 갖추고 있습니다.',
      },
    ],
  },
  {
    id: 'REAL-GAM-004',
    description:
      '오사카 유니버설 스튜디오 재팬 내에 위치한 닌텐도 테마 구역입니다. 2021년 개장하였으며 마리오 카트 어트랙션, 쿠파 성, 요시 어드벤처 등의 시설을 갖추고 있습니다.',
    relations: [
      {
        contentName: '슈퍼 마리오',
        summary:
          '슈퍼 마리오 세계를 실제로 체험할 수 있는 테마파크 구역입니다. 쿠파 성, 피치 성 등 게임 속 배경이 실물로 구현되어 있습니다.',
      },
      {
        contentName: '마리오 카트',
        summary:
          '마리오 카트를 AR 기술로 체험하는 "마리오 카트: 쿠파의 도전장!" 어트랙션이 있습니다. 실제 카트를 타며 마리오 카트 게임을 즐길 수 있습니다.',
      },
    ],
  },
]

async function migrateSpotDescriptions() {
  console.log('🚀 스팟 description 및 relation summary 마이그레이션 시작...\n')

  const { db } = await connectToDatabase()
  const spotsCollection = db.collection(COLLECTIONS.SPOTS)
  const relationsCollection = db.collection(COLLECTIONS.SPOT_CONTENT_RELATIONS)

  const stats = {
    spotsUpdated: 0,
    relationsUpdated: 0,
    relationsSkipped: 0,
    failed: 0,
  }

  for (const update of SPOT_UPDATES) {
    try {
      // 1. spots.description 업데이트
      const spotResult = await spotsCollection.updateOne(
        { id: update.id },
        { $set: { description: update.description } }
      )

      if (spotResult.matchedCount === 0) {
        console.log(`⚠️  스팟 없음: ${update.id}`)
        continue
      }

      console.log(`✅ 스팟 description 업데이트: ${update.id}`)
      stats.spotsUpdated++

      // 2. 각 relation의 summary 업데이트
      for (const rel of update.relations) {
        const relResult = await relationsCollection.updateOne(
          {
            spotId: update.id,
            contentName: rel.contentName,
            status: 'active',
          },
          { $set: { summary: rel.summary } }
        )

        if (relResult.matchedCount === 0) {
          console.log(
            `   ⚠️  relation 없음: spotId=${update.id}, contentName="${rel.contentName}"`
          )
          stats.relationsSkipped++
        } else {
          console.log(`   ✅ summary 업데이트: "${rel.contentName}"`)
          stats.relationsUpdated++
        }
      }
    } catch (error) {
      stats.failed++
      console.error(
        `❌ 실패: spotId=${update.id}`,
        error instanceof Error ? error.message : error
      )
    }

    console.log()
  }

  console.log('='.repeat(50))
  console.log('=== 마이그레이션 결과 ===')
  console.log('='.repeat(50))
  console.log(`스팟 description 업데이트: ${stats.spotsUpdated}건`)
  console.log(`relation summary 업데이트: ${stats.relationsUpdated}건`)
  console.log(`relation 없음 (스킵): ${stats.relationsSkipped}건`)
  console.log(`실패: ${stats.failed}건`)
  console.log('='.repeat(50))
  console.log('\n🎉 완료!')

  process.exit(0)
}

migrateSpotDescriptions().catch((error) => {
  console.error('❌ 마이그레이션 실패:', error)
  process.exit(1)
})
