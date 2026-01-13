/**
 * MongoDB 편의시설 시드 데이터 스크립트
 * 테스트용 편의시설 데이터를 MongoDB에 추가합니다.
 *
 * 실행 방법:
 * npx tsx scripts/seed-facilities.ts
 *
 * 스팟 좌표 기준 (실제 위치):
 * - SPOT-001 (스가 신사): lat: 35.6872, lng: 139.7197
 * - SPOT-002 (가마쿠라 건널목): lat: 35.3082, lng: 139.4952
 * - SPOT-003 (지우펀): lat: 25.1089, lng: 121.8443
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'anime-pilgrimage-map'

// 시드 데이터 - 각 스팟 좌표 기준 반경 100~500m 이내 편의시설
const SEED_FACILITIES = [
  // ========================================
  // 스가 신사 (SPOT-001) 근처 편의시설들
  // 기준 좌표: lat: 35.6872, lng: 139.7197
  // ========================================
  {
    name: '세븐일레븐 요츠야3초메점',
    type: 'convenience_store',
    address: '도쿄도 신주쿠구 요츠야 3-11',
    coordinates: { lat: 35.6868, lng: 139.7192 },
  },
  {
    name: '스타벅스 요츠야점',
    type: 'cafe',
    address: '도쿄도 신주쿠구 요츠야 1-3-4',
    coordinates: { lat: 35.6878, lng: 139.7205 },
  },
  {
    name: '요츠야 라멘',
    type: 'restaurant',
    address: '도쿄도 신주쿠구 요츠야 1-4-5',
    coordinates: { lat: 35.6865, lng: 139.7188 },
  },
  {
    name: '도쿄메트로 요츠야3초메역',
    type: 'station',
    address: '도쿄도 신주쿠구 요츠야 3-8',
    coordinates: { lat: 35.6875, lng: 139.721 },
  },
  {
    name: '패밀리마트 스가초점',
    type: 'convenience_store',
    address: '도쿄도 신주쿠구 스가초 5-1',
    coordinates: { lat: 35.688, lng: 139.719 },
  },
  {
    name: '도토루 커피 요츠야점',
    type: 'cafe',
    address: '도쿄도 신주쿠구 요츠야 1-5-6',
    coordinates: { lat: 35.6862, lng: 139.72 },
  },
  {
    name: '요츠야 스시',
    type: 'restaurant',
    address: '도쿄도 신주쿠구 요츠야 1-6-7',
    coordinates: { lat: 35.6885, lng: 139.7195 },
  },
  {
    name: '요츠야 약국',
    type: 'other',
    address: '도쿄도 신주쿠구 요츠야 1-7-8',
    coordinates: { lat: 35.687, lng: 139.7185 },
  },

  // ========================================
  // 가마쿠라 건널목 (SPOT-002) 근처 편의시설들
  // 기준 좌표: lat: 35.3082, lng: 139.4952
  // ========================================
  {
    name: '로손 가마쿠라코코마에점',
    type: 'convenience_store',
    address: '가나가와현 가마쿠라시 고시고에 1-2-1',
    coordinates: { lat: 35.3078, lng: 139.4958 },
  },
  {
    name: '가마쿠라 해변 카페',
    type: 'cafe',
    address: '가나가와현 가마쿠라시 고시고에 1-3-2',
    coordinates: { lat: 35.3085, lng: 139.4945 },
  },
  {
    name: '에노덴 가마쿠라코코마에역',
    type: 'station',
    address: '가나가와현 가마쿠라시 고시고에 1-1-32',
    coordinates: { lat: 35.308, lng: 139.4948 },
  },
  {
    name: '가마쿠라 해산물 레스토랑',
    type: 'restaurant',
    address: '가나가와현 가마쿠라시 고시고에 1-4-3',
    coordinates: { lat: 35.3088, lng: 139.496 },
  },
  {
    name: '세븐일레븐 가마쿠라코코마에점',
    type: 'convenience_store',
    address: '가나가와현 가마쿠라시 고시고에 1-5-1',
    coordinates: { lat: 35.3075, lng: 139.4955 },
  },
  {
    name: '쇼난 서핑 카페',
    type: 'cafe',
    address: '가나가와현 가마쿠라시 고시고에 1-6-2',
    coordinates: { lat: 35.309, lng: 139.494 },
  },

  // ========================================
  // 지우펀 (SPOT-003) 근처 편의시설들
  // 기준 좌표: lat: 25.1089, lng: 121.8443
  // ========================================
  {
    name: '지우펀 찻집 (아메이차루)',
    type: 'cafe',
    address: '대만 신베이시 루이팡구 지우펀 기산가 142호',
    coordinates: { lat: 25.1092, lng: 121.8448 },
  },
  {
    name: '지우펀 전통 레스토랑',
    type: 'restaurant',
    address: '대만 신베이시 루이팡구 지우펀 기산가 156호',
    coordinates: { lat: 25.1085, lng: 121.8438 },
  },
  {
    name: '지우펀 편의점',
    type: 'convenience_store',
    address: '대만 신베이시 루이팡구 지우펀 기산가 120호',
    coordinates: { lat: 25.1095, lng: 121.845 },
  },
  {
    name: '지우펀 타로볼 가게',
    type: 'restaurant',
    address: '대만 신베이시 루이팡구 지우펀 수치로 35호',
    coordinates: { lat: 25.1082, lng: 121.8448 },
  },
  {
    name: '지우펀 기념품점',
    type: 'other',
    address: '대만 신베이시 루이팡구 지우펀 기산가 100호',
    coordinates: { lat: 25.1093, lng: 121.8435 },
  },
  {
    name: '루이팡역',
    type: 'station',
    address: '대만 신베이시 루이팡구 밍덩로 1단 82호',
    coordinates: { lat: 25.1086, lng: 121.8065 },
  },
]

async function seedFacilities() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log('MongoDB에 연결 중...')
    await client.connect()
    console.log('MongoDB 연결 성공!')

    const db = client.db(MONGODB_DB)
    const collection = db.collection('facilities')

    // 기존 데이터 삭제
    console.log('기존 편의시설 데이터 삭제 중...')
    await collection.deleteMany({})

    // 시드 데이터 삽입
    console.log('편의시설 시드 데이터 삽입 중...')
    const result = await collection.insertMany(SEED_FACILITIES)

    console.log(
      `✅ ${result.insertedCount}개의 편의시설 데이터가 추가되었습니다!`
    )

    // 스팟별 편의시설 수 출력
    console.log('\n📍 스팟별 편의시설 배치 현황:')
    console.log('- 스가 신사 (SPOT-001) 근처: 8개')
    console.log('- 가마쿠라 건널목 (SPOT-002) 근처: 6개')
    console.log('- 지우펀 (SPOT-003) 근처: 6개')
  } catch (error) {
    console.error('❌ 편의시설 시드 데이터 삽입 실패:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nMongoDB 연결 종료')
  }
}

seedFacilities()
