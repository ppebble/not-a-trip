/**
 * Overpass API를 사용하여 실제 편의시설 데이터를 가져오는 스크립트
 *
 * 실행 방법:
 * npx tsx scripts/fetch-real-facilities.ts
 *
 * seed-real-spots.ts의 모든 스팟에 대해 주변 편의시설을 검색합니다.
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
    'name:ko'?: string
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

// ============================================
// 모든 실제 스팟 좌표 (seed-real-spots.ts 기반)
// ============================================
const SPOTS: SpotInfo[] = [
  // 애니메이션 스팟
  { id: 'REAL-ANI-001', name: '스가 신사', lat: 35.6872, lng: 139.7197 },
  {
    id: 'REAL-ANI-002',
    name: '가마쿠라코코마에역 건널목',
    lat: 35.3082,
    lng: 139.4952,
  },
  { id: 'REAL-ANI-003', name: '지우펀', lat: 25.1089, lng: 121.8443 },
  {
    id: 'REAL-ANI-004',
    name: '이와토비 고등학교 모델',
    lat: 35.5167,
    lng: 134.3333,
  },
  { id: 'REAL-ANI-005', name: '와시노미야 신사', lat: 36.1028, lng: 139.6003 },
  { id: 'REAL-ANI-006', name: '오아라이 마을', lat: 36.3133, lng: 140.5747 },
  { id: 'REAL-ANI-007', name: '히다 후루카와', lat: 36.2378, lng: 137.1861 },
  { id: 'REAL-ANI-008', name: '도쿄 타워', lat: 35.6586, lng: 139.7454 },
  { id: 'REAL-ANI-009', name: '에노시마', lat: 35.3008, lng: 139.4797 },
  { id: 'REAL-ANI-010', name: '아키하바라', lat: 35.7023, lng: 139.7745 },
  { id: 'REAL-ANI-011', name: '나라 공원', lat: 34.6851, lng: 135.843 },
  // 스포츠 스팟
  { id: 'REAL-SPO-001', name: '캄프 누', lat: 41.3809, lng: 2.1228 },
  { id: 'REAL-SPO-002', name: '올드 트래포드', lat: 53.4631, lng: -2.2913 },
  { id: 'REAL-SPO-003', name: '고시엔 구장', lat: 34.7214, lng: 135.3617 },
  {
    id: 'REAL-SPO-004',
    name: '산티아고 베르나베우',
    lat: 40.4531,
    lng: -3.6883,
  },
  { id: 'REAL-SPO-005', name: '잠실 야구장', lat: 37.5122, lng: 127.0719 },
  { id: 'REAL-SPO-006', name: '앤필드', lat: 53.4308, lng: -2.9608 },
  // 영화/드라마 스팟
  { id: 'REAL-MOV-001', name: '글렌피넌 고가교', lat: 56.8711, lng: -5.4319 },
  { id: 'REAL-MOV-002', name: '북촌 한옥마을', lat: 37.5826, lng: 126.985 },
  { id: 'REAL-MOV-003', name: '호비튼', lat: -37.8722, lng: 175.683 },
  { id: 'REAL-MOV-004', name: '주문진 방파제', lat: 37.8986, lng: 128.8308 },
  { id: 'REAL-MOV-005', name: '스페인 광장', lat: 41.9058, lng: 12.4823 },
  { id: 'REAL-MOV-006', name: '해운대', lat: 35.1587, lng: 129.1604 },
  // 음악 스팟
  { id: 'REAL-MUS-001', name: '애비 로드', lat: 51.532, lng: -0.178 },
  { id: 'REAL-MUS-002', name: '도쿄돔', lat: 35.7056, lng: 139.7519 },
  { id: 'REAL-MUS-003', name: '그레이스랜드', lat: 35.0477, lng: -90.0261 },
  { id: 'REAL-MUS-004', name: 'HYBE 인사이트', lat: 37.5283, lng: 126.9654 },
  {
    id: 'REAL-MUS-005',
    name: 'SM타운 코엑스아티움',
    lat: 37.5116,
    lng: 127.0595,
  },
  { id: 'REAL-MUS-006', name: 'KSPO DOME', lat: 37.5209, lng: 127.115 },
  // 게임 스팟
  { id: 'REAL-GAM-001', name: 'LoL 파크', lat: 37.57, lng: 126.992 },
  { id: 'REAL-GAM-002', name: '닌텐도 도쿄', lat: 35.662, lng: 139.6983 },
  {
    id: 'REAL-GAM-003',
    name: '포켓몬 센터 메가 도쿄',
    lat: 35.7295,
    lng: 139.7186,
  },
  { id: 'REAL-GAM-004', name: '슈퍼 닌텐도 월드', lat: 34.6654, lng: 135.4323 },
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
    tags['name:ko'] ||
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
const MONGODB_DB = process.env.MONGODB_DB || 'not-a-trip'

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
  console.log(`총 ${SPOTS.length}개의 스팟에 대해 편의시설을 검색합니다.\n`)

  const allFacilities: Facility[] = []

  for (const spot of SPOTS) {
    const facilities = await fetchFacilities(spot)
    allFacilities.push(...facilities)

    // API 부하 방지를 위한 딜레이 (2초)
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
