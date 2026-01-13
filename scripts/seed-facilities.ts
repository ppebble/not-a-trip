/**
 * MongoDB 편의시설 시드 데이터 스크립트
 * 테스트용 편의시설 데이터를 MongoDB에 추가합니다.
 *
 * 실행 방법:
 * npx tsx scripts/seed-facilities.ts
 *
 * 스팟 좌표 기준:
 * - SPOT-001 (스가 신사): lat: 35.6762, lng: 139.6503
 * - SPOT-002 (가마쿠라 건널목): lat: 35.3084, lng: 139.5503
 * - SPOT-003 (지우펀): lat: 25.1089, lng: 121.8443
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'anime-pilgrimage-map'

// 시드 데이터 - 각 스팟 좌표 기준 반경 100~500m 이내 편의시설
const SEED_FACILITIES = [
  // ========================================
  // 스가 신사 (SPOT-001) 근처 편의시설들
  // 기준 좌표: lat: 35.6762, lng: 139.6503
  // ========================================
  {
    name: '세븐일레븐 요츠야점',
    type: 'convenience_store',
    address: '도쿄도 신주쿠구 요츠야 1-2-3',
    coordinates: { lat: 35.6758, lng: 139.6498 }, // 스가 신사에서 약 60m
  },
  {
    name: '스타벅스 요츠야점',
    type: 'cafe',
    address: '도쿄도 신주쿠구 요츠야 1-3-4',
    coordinates: { lat: 35.677, lng: 139.651 }, // 스가 신사에서 약 110m
  },
  {
    name: '요츠야 라멘',
    type: 'restaurant',
    address: '도쿄도 신주쿠구 요츠야 1-4-5',
    coordinates: { lat: 35.6755, lng: 139.6515 }, // 스가 신사에서 약 130m
  },
  {
    name: 'JR 요츠야역',
    type: 'station',
    address: '도쿄도 신주쿠구 요츠야 1-1-1',
    coordinates: { lat: 35.685, lng: 139.73 }, // 요츠야역 실제 좌표 (약 7km - 역은 멀리 있음)
  },
  {
    name: '패밀리마트 스가초점',
    type: 'convenience_store',
    address: '도쿄도 신주쿠구 스가초 5-1',
    coordinates: { lat: 35.6768, lng: 139.6495 }, // 스가 신사에서 약 90m
  },
  {
    name: '도토루 커피 요츠야점',
    type: 'cafe',
    address: '도쿄도 신주쿠구 요츠야 1-5-6',
    coordinates: { lat: 35.6752, lng: 139.6508 }, // 스가 신사에서 약 120m
  },
  {
    name: '요츠야 스시',
    type: 'restaurant',
    address: '도쿄도 신주쿠구 요츠야 1-6-7',
    coordinates: { lat: 35.6775, lng: 139.6498 }, // 스가 신사에서 약 150m
  },
  {
    name: '요츠야 약국',
    type: 'other',
    address: '도쿄도 신주쿠구 요츠야 1-7-8',
    coordinates: { lat: 35.676, lng: 139.6518 }, // 스가 신사에서 약 140m
  },

  // ========================================
  // 가마쿠라 건널목 (SPOT-002) 근처 편의시설들
  // 기준 좌표: lat: 35.3084, lng: 139.5503
  // ========================================
  {
    name: '로손 가마쿠라점',
    type: 'convenience_store',
    address: '가나가와현 가마쿠라시 고시고에 1-2-1',
    coordinates: { lat: 35.308, lng: 139.551 }, // 건널목에서 약 80m
  },
  {
    name: '가마쿠라 해변 카페',
    type: 'cafe',
    address: '가나가와현 가마쿠라시 고시고에 1-3-2',
    coordinates: { lat: 35.3078, lng: 139.5498 }, // 건널목에서 약 80m
  },
  {
    name: '에노덴 가마쿠라코코마에역',
    type: 'station',
    address: '가나가와현 가마쿠라시 고시고에 1-1-32',
    coordinates: { lat: 35.3082, lng: 139.5495 }, // 건널목에서 약 80m (실제 역 위치)
  },
  {
    name: '가마쿠라 해산물 레스토랑',
    type: 'restaurant',
    address: '가나가와현 가마쿠라시 고시고에 1-4-3',
    coordinates: { lat: 35.309, lng: 139.5508 }, // 건널목에서 약 80m
  },
  {
    name: '세븐일레븐 가마쿠라코코마에점',
    type: 'convenience_store',
    address: '가나가와현 가마쿠라시 고시고에 1-5-1',
    coordinates: { lat: 35.3088, lng: 139.5495 }, // 건널목에서 약 90m
  },
  {
    name: '쇼난 서핑 카페',
    type: 'cafe',
    address: '가나가와현 가마쿠라시 고시고에 1-6-2',
    coordinates: { lat: 35.3075, lng: 139.5512 }, // 건널목에서 약 130m
  },

  // ========================================
  // 지우펀 (SPOT-003) 근처 편의시설들
  // 기준 좌표: lat: 25.1089, lng: 121.8443
  // ========================================
  {
    name: '지우펀 찻집 (아메이차루)',
    type: 'cafe',
    address: '대만 신베이시 루이팡구 지우펀 기산가 142호',
    coordinates: { lat: 25.1092, lng: 121.8448 }, // 지우펀에서 약 60m
  },
  {
    name: '지우펀 전통 레스토랑',
    type: 'restaurant',
    address: '대만 신베이시 루이팡구 지우펀 기산가 156호',
    coordinates: { lat: 25.1085, lng: 121.8438 }, // 지우펀에서 약 70m
  },
  {
    name: '지우펀 편의점',
    type: 'convenience_store',
    address: '대만 신베이시 루이팡구 지우펀 기산가 120호',
    coordinates: { lat: 25.1095, lng: 121.845 }, // 지우펀에서 약 100m
  },
  {
    name: '지우펀 타로볼 가게',
    type: 'restaurant',
    address: '대만 신베이시 루이팡구 지우펀 수치로 35호',
    coordinates: { lat: 25.1082, lng: 121.8448 }, // 지우펀에서 약 90m
  },
  {
    name: '지우펀 기념품점',
    type: 'other',
    address: '대만 신베이시 루이팡구 지우펀 기산가 100호',
    coordinates: { lat: 25.1093, lng: 121.8435 }, // 지우펀에서 약 100m
  },
  {
    name: '루이팡역',
    type: 'station',
    address: '대만 신베이시 루이팡구 밍덩로 1단 82호',
    coordinates: { lat: 25.1086, lng: 121.8065 }, // 루이팡역 (지우펀에서 버스로 이동)
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
