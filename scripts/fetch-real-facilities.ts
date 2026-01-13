/**
 * Overpass API를 사용하여 실제 편의시설 데이터를 가져오는 스크립트
 *
 * 실행 방법:
 * npx tsx scripts/fetch-real-facilities.ts
 *
 * 스팟 좌표:
 * - SPOT-001 (스가 신사): lat: 35.6872, lng: 139.7197
 * - SPOT-002 (가마쿠라 건널목): lat: 35.3082, lng: 139.4952
 * - SPOT-003 (지우펀): lat: 25.1089, lng: 121.8443
 */

interface SpotInfo {
  id: string
  name: string
  lat: number
  lng: number
}

interface OverpassElement {
  type: string
  id: number
  lat: number
  lon: number
  tags: {
    name?: string
    'name:en'?: string
    'name:ja'?: string
    'name:zh'?: string
    amenity?: string
    shop?: string
    railway?: string
    'addr:full'?: string
    'addr:street'?: string
    'addr:housenumber'?: string
  }
}

interface Facility {
  name: string
  type: string
  address: string
  coordinates: { lat: number; lng: number }
  spotId: string
}

const SPOTS: SpotInfo[] = [
  { id: 'SPOT-001', name: '스가 신사', lat: 35.6872, lng: 139.7197 },
  { id: 'SPOT-002', name: '가마쿠라 건널목', lat: 35.3082, lng: 139.4952 },
  { id: 'SPOT-003', name: '지우펀', lat: 25.1089, lng: 121.8443 },
]

const OVERPASS_API = 'https://overpass-api.de/api/interpreter'

// 편의시설 타입 매핑
function mapFacilityType(element: OverpassElement): string | null {
  const { amenity, shop, railway } = element.tags

  if (amenity === 'cafe' || shop === 'coffee') return 'cafe'
  if (amenity === 'restaurant' || amenity === 'fast_food') return 'restaurant'
  if (shop === 'convenience' || shop === 'supermarket')
    return 'convenience_store'
  if (railway === 'station' || amenity === 'bus_station') return 'station'
  if (shop === 'bakery' || shop === 'confectionery') return 'restaurant'
  if (amenity === 'pharmacy' || shop === 'chemist') return 'other'

  return null
}

// 이름 추출 (다국어 지원)
function extractName(element: OverpassElement): string {
  const tags = element.tags
  return (
    tags.name ||
    tags['name:en'] ||
    tags['name:ja'] ||
    tags['name:zh'] ||
    `Unknown (${element.id})`
  )
}

// 주소 추출
function extractAddress(element: OverpassElement): string {
  const tags = element.tags
  if (tags['addr:full']) return tags['addr:full']
  if (tags['addr:street'] && tags['addr:housenumber']) {
    return `${tags['addr:street']} ${tags['addr:housenumber']}`
  }
  return '주소 정보 없음'
}

// Overpass API 쿼리 생성
function buildQuery(lat: number, lng: number, radius: number = 500): string {
  return `
[out:json][timeout:25];
(
  node["amenity"="cafe"](around:${radius},${lat},${lng});
  node["amenity"="restaurant"](around:${radius},${lat},${lng});
  node["amenity"="fast_food"](around:${radius},${lat},${lng});
  node["shop"="convenience"](around:${radius},${lat},${lng});
  node["shop"="supermarket"](around:${radius},${lat},${lng});
  node["railway"="station"](around:${radius},${lat},${lng});
  node["amenity"="pharmacy"](around:${radius},${lat},${lng});
);
out body;
`
}

// API 호출
async function fetchFacilities(spot: SpotInfo): Promise<Facility[]> {
  const query = buildQuery(spot.lat, spot.lng)

  console.log(`\n📍 ${spot.name} (${spot.id}) 주변 편의시설 검색 중...`)
  console.log(`   좌표: ${spot.lat}, ${spot.lng}`)

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const elements: OverpassElement[] = data.elements || []

    console.log(`   발견된 POI: ${elements.length}개`)

    const facilities: Facility[] = []

    for (const element of elements) {
      const type = mapFacilityType(element)
      if (!type) continue

      const name = extractName(element)
      if (name.startsWith('Unknown')) continue

      facilities.push({
        name,
        type,
        address: extractAddress(element),
        coordinates: { lat: element.lat, lng: element.lon },
        spotId: spot.id,
      })
    }

    // 타입별로 최대 3개씩만 선택
    const grouped = facilities.reduce(
      (acc, f) => {
        if (!acc[f.type]) acc[f.type] = []
        if (acc[f.type].length < 3) acc[f.type].push(f)
        return acc
      },
      {} as Record<string, Facility[]>
    )

    const selected = Object.values(grouped).flat()
    console.log(`   선택된 편의시설: ${selected.length}개`)

    return selected
  } catch (error) {
    console.error(`   ❌ 에러 발생:`, error)
    return []
  }
}

// 시드 파일 생성
function generateSeedFile(allFacilities: Facility[]): string {
  const facilityStrings = allFacilities.map(
    (f) => `  {
    name: '${f.name.replace(/'/g, "\\'")}',
    type: '${f.type}',
    address: '${f.address.replace(/'/g, "\\'")}',
    coordinates: { lat: ${f.coordinates.lat}, lng: ${f.coordinates.lng} },
  }`
  )

  return `/**
 * MongoDB 편의시설 시드 데이터 스크립트
 * Overpass API (OpenStreetMap)에서 가져온 실제 데이터입니다.
 *
 * 생성일: ${new Date().toISOString()}
 *
 * 실행 방법:
 * npx tsx scripts/seed-facilities.ts
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'anime-pilgrimage-map'

const SEED_FACILITIES = [
${facilityStrings.join(',\n')}
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

    console.log(\`✅ \${result.insertedCount}개의 편의시설 데이터가 추가되었습니다!\`)
  } catch (error) {
    console.error('❌ 편의시설 시드 데이터 삽입 실패:', error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('MongoDB 연결 종료')
  }
}

seedFacilities()
`
}

// 메인 실행
async function main() {
  console.log('🌍 Overpass API를 사용하여 실제 편의시설 데이터 수집 시작...\n')

  const allFacilities: Facility[] = []

  for (const spot of SPOTS) {
    const facilities = await fetchFacilities(spot)
    allFacilities.push(...facilities)

    // API 부하 방지를 위한 딜레이
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log(`\n\n📊 총 수집된 편의시설: ${allFacilities.length}개`)

  // 타입별 통계
  const stats = allFacilities.reduce(
    (acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  console.log('\n📈 타입별 통계:')
  Object.entries(stats).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}개`)
  })

  // 시드 파일 생성
  const seedContent = generateSeedFile(allFacilities)

  // 파일 저장
  const fs = await import('fs/promises')
  await fs.writeFile('scripts/seed-facilities.ts', seedContent, 'utf-8')

  console.log('\n✅ scripts/seed-facilities.ts 파일이 업데이트되었습니다!')
  console.log('   다음 명령어로 DB에 반영하세요:')
  console.log('   npx tsx scripts/seed-facilities.ts')
}

main().catch(console.error)
