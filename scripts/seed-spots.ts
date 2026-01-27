/**
 * MongoDB 시드 데이터 스크립트
 * 테스트용 스팟 데이터를 MongoDB에 추가합니다.
 *
 * 실행 방법:
 * npx tsx scripts/seed-spots.ts
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'not-a-trip'

// 시드 데이터 - 커스텀 ID 사용 (SPOT-001 형식)
const SEED_SPOTS = [
  {
    id: 'SPOT-001',
    name: '너의 이름은 - 스가 신사',
    description:
      '신카이 마코토 감독의 애니메이션 "너의 이름은"에서 미츠하와 타키가 만나는 장면의 배경이 된 신사입니다. 도쿄 요츠야에 위치한 스가 신사의 계단은 영화의 상징적인 장면으로, 전 세계 팬들이 성지순례를 위해 방문하는 인기 명소입니다.',
    photos: [
      'https://picsum.photos/seed/spot1/800/600',
      'https://picsum.photos/seed/spot1-2/800/600',
      'https://picsum.photos/seed/spot1-3/800/600',
    ],
    address: '일본 도쿄도 신주쿠구 스가초 5',
    coordinates: { lat: 35.6872, lng: 139.7197 }, // 스가 신사 실제 좌표
    relatedMedia: [
      { title: '너의 이름은 (君の名は。)', type: 'anime', year: 2016 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'SPOT-002',
    name: '슬램덩크 - 가마쿠라 건널목',
    description:
      '슬램덩크 오프닝에 등장하는 유명한 건널목입니다. 에노덴 가마쿠라코코마에역 앞에 위치하며, 바다를 배경으로 한 이 건널목은 슬램덩크 팬들의 필수 방문 코스입니다.',
    photos: [
      'https://picsum.photos/seed/spot2/800/600',
      'https://picsum.photos/seed/spot2-2/800/600',
    ],
    address: '일본 가나가와현 가마쿠라시 고시고에 1-1',
    coordinates: { lat: 35.3082, lng: 139.4952 }, // 가마쿠라코코마에역 건널목 실제 좌표
    relatedMedia: [
      { title: '슬램덩크 (スラムダンク)', type: 'anime', year: 1993 },
      { title: '더 퍼스트 슬램덩크', type: 'movie', year: 2022 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'SPOT-003',
    name: '센과 치히로 - 지우펀',
    description:
      '미야자키 하야오 감독의 "센과 치히로의 행방불명"의 모티브가 된 것으로 알려진 대만의 지우펀 마을입니다. 좁은 골목과 붉은 등불이 켜진 찻집들이 영화 속 온천마을의 분위기를 연상시킵니다.',
    photos: [
      'https://picsum.photos/seed/spot3/800/600',
      'https://picsum.photos/seed/spot3-2/800/600',
      'https://picsum.photos/seed/spot3-3/800/600',
    ],
    address: '대만 신베이시 루이팡구 지우펀',
    coordinates: { lat: 25.1089, lng: 121.8443 },
    relatedMedia: [
      {
        title: '센과 치히로의 행방불명 (千と千尋の神隠し)',
        type: 'anime',
        year: 2001,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'SPOT-004',
    name: '스즈메의 문단속 - 미야자키',
    description:
      '신카이 마코토 감독의 "스즈메의 문단속"에서 주인공 스즈메가 살던 마을의 배경이 된 미야자키현입니다. 영화에 등장하는 해안가 풍경과 폐허가 된 온천마을의 모티브를 찾아볼 수 있습니다.',
    photos: [
      'https://picsum.photos/seed/spot4/800/600',
      'https://picsum.photos/seed/spot4-2/800/600',
    ],
    address: '일본 미야자키현 미야자키시',
    coordinates: { lat: 31.9077, lng: 131.4202 },
    relatedMedia: [
      {
        title: '스즈메의 문단속 (すずめの戸締まり)',
        type: 'anime',
        year: 2022,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'SPOT-005',
    name: '귀멸의 칼날 - 운젠 지옥',
    description:
      '귀멸의 칼날에 등장하는 지옥 같은 풍경의 모티브가 된 운젠 지옥입니다. 유황 연기가 피어오르는 독특한 화산 지형은 애니메이션의 분위기와 잘 어울립니다.',
    photos: [
      'https://picsum.photos/seed/spot5/800/600',
      'https://picsum.photos/seed/spot5-2/800/600',
    ],
    address: '일본 나가사키현 운젠시 오바마초 운젠',
    coordinates: { lat: 32.7503, lng: 130.2667 },
    relatedMedia: [
      { title: '귀멸의 칼날 (鬼滅の刃)', type: 'anime', year: 2019 },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    // eslint-disable-next-line no-console
    console.log('MongoDB에 연결 중...')
    await client.connect()
    // eslint-disable-next-line no-console
    console.log('MongoDB 연결 성공!')

    const db = client.db(MONGODB_DB)
    const collection = db.collection('spots')

    // 기존 데이터 삭제
    // eslint-disable-next-line no-console
    console.log('기존 스팟 데이터 삭제 중...')
    await collection.deleteMany({})

    // id 필드에 유니크 인덱스 생성
    await collection.createIndex({ id: 1 }, { unique: true })

    // 시드 데이터 삽입
    // eslint-disable-next-line no-console
    console.log('시드 데이터 삽입 중...')
    const result = await collection.insertMany(SEED_SPOTS)

    // eslint-disable-next-line no-console
    console.log(`✅ ${result.insertedCount}개의 스팟 데이터가 추가되었습니다!`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ 시드 데이터 삽입 실패:', error)
    process.exit(1)
  } finally {
    await client.close()
    // eslint-disable-next-line no-console
    console.log('MongoDB 연결 종료')
  }
}

seedDatabase()
