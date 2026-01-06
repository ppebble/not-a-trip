/**
 * MongoDB 편의시설 시드 데이터 스크립트
 * 테스트용 편의시설 데이터를 MongoDB에 추가합니다.
 *
 * 실행 방법:
 * npx tsx scripts/seed-facilities.ts
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'anime-pilgrimage-map'

// 시드 데이터 - 스가 신사 (SPOT-001) 근처 편의시설
const SEED_FACILITIES = [
  // 스가 신사 근처 편의시설들
  {
    name: '세븐일레븐 요츠야점',
    type: 'convenience_store',
    address: '도쿄도 신주쿠구 요츠야 1-2-3',
    coordinates: { lat: 35.6772, lng: 139.6513 },
  },
  {
    name: '스타벅스 요츠야점',
    type: 'cafe',
    address: '도쿄도 신주쿠구 요츠야 1-3-4',
    coordinates: { lat: 35.6752, lng: 139.6493 },
  },
  {
    name: '요츠야 라멘',
    type: 'restaurant',
    address: '도쿄도 신주쿠구 요츠야 1-4-5',
    coordinates: { lat: 35.6782, lng: 139.6523 },
  },
  {
    name: 'JR 요츠야역',
    type: 'station',
    address: '도쿄도 신주쿠구 요츠야 1-1-1',
    coordinates: { lat: 35.6742, lng: 139.6483 },
  },
  {
    name: '패밀리마트 스가초점',
    type: 'convenience_store',
    address: '도쿄도 신주쿠구 스가초 5-1',
    coordinates: { lat: 35.6792, lng: 139.6533 },
  },
  {
    name: '도토루 커피 요츠야점',
    type: 'cafe',
    address: '도쿄도 신주쿠구 요츠야 1-5-6',
    coordinates: { lat: 35.6732, lng: 139.6473 },
  },
  {
    name: '요츠야 스시',
    type: 'restaurant',
    address: '도쿄도 신주쿠구 요츠야 1-6-7',
    coordinates: { lat: 35.6802, lng: 139.6543 },
  },
  {
    name: '요츠야 약국',
    type: 'other',
    address: '도쿄도 신주쿠구 요츠야 1-7-8',
    coordinates: { lat: 35.6722, lng: 139.6463 },
  },

  // 가마쿠라 건널목 (SPOT-002) 근처 편의시설들
  {
    name: '로손 가마쿠라점',
    type: 'convenience_store',
    address: '가나가와현 가마쿠라시 고시고에 1-2-1',
    coordinates: { lat: 35.3094, lng: 139.5513 },
  },
  {
    name: '가마쿠라 해변 카페',
    type: 'cafe',
    address: '가나가와현 가마쿠라시 고시고에 1-3-2',
    coordinates: { lat: 35.3074, lng: 139.5493 },
  },
  {
    name: '에노덴 가마쿠라코코마에역',
    type: 'station',
    address: '가나가와현 가마쿠라시 고시고에 1-1-32',
    coordinates: { lat: 35.3084, lng: 139.5503 },
  },
  {
    name: '가마쿠라 해산물 레스토랑',
    type: 'restaurant',
    address: '가나가와현 가마쿠라시 고시고에 1-4-3',
    coordinates: { lat: 35.3104, lng: 139.5523 },
  },

  // 지우펀 (SPOT-003) 근처 편의시설들
  {
    name: '지우펀 찻집',
    type: 'cafe',
    address: '대만 신베이시 루이팡구 지우펀 기산가 142호',
    coordinates: { lat: 25.1099, lng: 121.8453 },
  },
  {
    name: '지우펀 전통 레스토랑',
    type: 'restaurant',
    address: '대만 신베이시 루이팡구 지우펀 기산가 156호',
    coordinates: { lat: 25.1079, lng: 121.8433 },
  },
  {
    name: '지우펀 편의점',
    type: 'convenience_store',
    address: '대만 신베이시 루이팡구 지우펀 기산가 120호',
    coordinates: { lat: 25.1109, lng: 121.8463 },
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
  } catch (error) {
    console.error('❌ 편의시설 시드 데이터 삽입 실패:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('MongoDB 연결 종료')
  }
}

seedFacilities()
