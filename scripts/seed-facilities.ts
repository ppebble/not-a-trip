/**
 * MongoDB 편의시설 시드 데이터 스크립트
 * Overpass API (OpenStreetMap)에서 가져온 실제 데이터입니다.
 *
 * 생성일: 2026-01-13T13:22:29.080Z
 *
 * 실행 방법:
 * npx tsx scripts/seed-facilities.ts
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'anime-pilgrimage-map'

const SEED_FACILITIES = [
  {
    name: 'セブン-イレブン',
    type: 'convenience_store',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6878874, lng: 139.7171508 },
  },
  {
    name: 'セブン-イレブン',
    type: 'convenience_store',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6875906, lng: 139.7193686 },
  },
  {
    name: 'セブン-イレブン',
    type: 'convenience_store',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6871668, lng: 139.7204977 },
  },
  {
    name: '山形うまいもん処 花笠庵',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6875723, lng: 139.7201565 },
  },
  {
    name: 'とみ吉',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6871138, lng: 139.7201022 },
  },
  {
    name: '浅野屋',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 35.686098, lng: 139.7200206 },
  },
  {
    name: 'しなのCafe',
    type: 'cafe',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6840391, lng: 139.7196139 },
  },
  {
    name: 'Moriva Coffee',
    type: 'cafe',
    address: '주소 정보 없음',
    coordinates: { lat: 35.687629, lng: 139.72521 },
  },
  {
    name: 'スターバックス',
    type: 'cafe',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6876227, lng: 139.7232641 },
  },
  {
    name: 'シナノ薬局',
    type: 'other',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6839021, lng: 139.7197422 },
  },
  {
    name: 'SEIYODO',
    type: 'other',
    address: '주소 정보 없음',
    coordinates: { lat: 35.684549, lng: 139.7171061 },
  },
  {
    name: '左門町薬局',
    type: 'other',
    address: '주소 정보 없음',
    coordinates: { lat: 35.6853859, lng: 139.7203191 },
  },
  {
    name: '四谷三丁目',
    type: 'station',
    address: '주소 정보 없음',
    coordinates: { lat: 35.687988, lng: 139.7205752 },
  },
  {
    name: '吉野屋 134号線江ノ島店',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 35.3082376, lng: 139.4916537 },
  },
  {
    name: 'ケンタッキーフライドチキン 江ノ島店',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 35.3082409, lng: 139.4919085 },
  },
  {
    name: '鎌倉 大勝軒',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 35.3101549, lng: 139.4904953 },
  },
  {
    name: '腰越',
    type: 'station',
    address: '주소 정보 없음',
    coordinates: { lat: 35.3083817, lng: 139.4932077 },
  },
  {
    name: 'フレッシュストアヤオミネ Fresh Store YAOMINE',
    type: 'convenience_store',
    address: '주소 정보 없음',
    coordinates: { lat: 35.3094946, lng: 139.4911943 },
  },
  {
    name: '阿妹茶樓',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 25.1085348, lng: 121.8436634 },
  },
  {
    name: '芋仔番薯茶坊',
    type: 'restaurant',
    address: '주소 정보 없음',
    coordinates: { lat: 25.1086667, lng: 121.8437667 },
  },
  {
    name: '九份觀海樓',
    type: 'restaurant',
    address: '新北市瑞芳區基山街183之1號',
    coordinates: { lat: 25.1078162, lng: 121.84311 },
  },
  {
    name: '7-Eleven',
    type: 'convenience_store',
    address: '주소 정보 없음',
    coordinates: { lat: 25.1097369, lng: 121.845348 },
  },
  {
    name: '全家便利商店',
    type: 'convenience_store',
    address: '주소 정보 없음',
    coordinates: { lat: 25.1102002, lng: 121.8453651 },
  },
  {
    name: '九份茶坊',
    type: 'cafe',
    address: '基山街 142',
    coordinates: { lat: 25.1081545, lng: 121.8435344 },
  },
  {
    name: '喝杯咖啡 Her back Cafe',
    type: 'cafe',
    address: '주소 정보 없음',
    coordinates: { lat: 25.1070142, lng: 121.8417376 },
  },
  {
    name: '分子冰琪淋',
    type: 'cafe',
    address: '주소 정보 없음',
    coordinates: { lat: 25.1100206, lng: 121.8454052 },
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

    console.log('기존 편의시설 데이터 삭제 중...')
    await collection.deleteMany({})

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
