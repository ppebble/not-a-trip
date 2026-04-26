/**
 * MongoDB 편의시설 시드 데이터 스크립트
 * 각 스팟 주변의 실제 편의시설 데이터입니다.
 *
 * 실행 방법:
 * npx tsx scripts/seed-facilities.ts
 */

import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'not-a-trip'

interface SeedFacility {
  name: string
  type: 'restaurant' | 'cafe' | 'convenience_store' | 'station' | 'other'
  address: string
  coordinates: { lat: number; lng: number }
  spotId?: string
}

// ============================================
// 기존 스팟 (SPOT-001 ~ SPOT-005) 주변 편의시설
// ============================================

// SPOT-001: 너의 이름은 - 스가 신사 (도쿄 요츠야)
const SPOT_001_FACILITIES: SeedFacility[] = [
  {
    name: 'セブン-イレブン 四谷三丁目店',
    type: 'convenience_store',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6878, lng: 139.7171 },
    spotId: 'SPOT-001',
  },
  {
    name: 'ファミリーマート 四谷三丁目店',
    type: 'convenience_store',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6875, lng: 139.7193 },
    spotId: 'SPOT-001',
  },
  {
    name: '山形うまいもん処 花笠庵',
    type: 'restaurant',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6875, lng: 139.7201 },
    spotId: 'SPOT-001',
  },
  {
    name: 'スターバックス 四谷三丁目店',
    type: 'cafe',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6876, lng: 139.7232 },
    spotId: 'SPOT-001',
  },
  {
    name: '四谷三丁目駅',
    type: 'station',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6879, lng: 139.7205 },
    spotId: 'SPOT-001',
  },
]

// SPOT-002: 슬램덩크 - 가마쿠라 건널목
const SPOT_002_FACILITIES: SeedFacility[] = [
  {
    name: '吉野家 134号線江ノ島店',
    type: 'restaurant',
    address: '神奈川県鎌倉市腰越1丁目',
    coordinates: { lat: 35.3082, lng: 139.4916 },
    spotId: 'SPOT-002',
  },
  {
    name: 'ケンタッキーフライドチキン 江ノ島店',
    type: 'restaurant',
    address: '神奈川県鎌倉市腰越1丁目',
    coordinates: { lat: 35.3082, lng: 139.4919 },
    spotId: 'SPOT-002',
  },
  {
    name: 'フレッシュストアヤオミネ',
    type: 'convenience_store',
    address: '神奈川県鎌倉市腰越2丁目',
    coordinates: { lat: 35.3094, lng: 139.4911 },
    spotId: 'SPOT-002',
  },
  {
    name: '腰越駅',
    type: 'station',
    address: '神奈川県鎌倉市腰越2丁目',
    coordinates: { lat: 35.3083, lng: 139.4932 },
    spotId: 'SPOT-002',
  },
  {
    name: '鎌倉高校前駅',
    type: 'station',
    address: '神奈川県鎌倉市腰越1丁目',
    coordinates: { lat: 35.3068, lng: 139.4962 },
    spotId: 'SPOT-002',
  },
]

// SPOT-003: 센과 치히로 - 지우펀 (대만)
const SPOT_003_FACILITIES: SeedFacility[] = [
  {
    name: '阿妹茶樓',
    type: 'restaurant',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1085, lng: 121.8436 },
    spotId: 'SPOT-003',
  },
  {
    name: '芋仔番薯茶坊',
    type: 'restaurant',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1086, lng: 121.8437 },
    spotId: 'SPOT-003',
  },
  {
    name: '7-Eleven 九份門市',
    type: 'convenience_store',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1097, lng: 121.8453 },
    spotId: 'SPOT-003',
  },
  {
    name: '全家便利商店 九份店',
    type: 'convenience_store',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1102, lng: 121.8453 },
    spotId: 'SPOT-003',
  },
  {
    name: '九份茶坊',
    type: 'cafe',
    address: '新北市瑞芳區基山街142號',
    coordinates: { lat: 25.1081, lng: 121.8435 },
    spotId: 'SPOT-003',
  },
]

// SPOT-004: 스즈메의 문단속 - 미야자키
const SPOT_004_FACILITIES: SeedFacility[] = [
  {
    name: 'セブン-イレブン 宮崎駅前店',
    type: 'convenience_store',
    address: '宮崎県宮崎市錦町',
    coordinates: { lat: 31.908, lng: 131.4205 },
    spotId: 'SPOT-004',
  },
  {
    name: 'ローソン 宮崎駅前店',
    type: 'convenience_store',
    address: '宮崎県宮崎市錦町',
    coordinates: { lat: 31.9075, lng: 131.42 },
    spotId: 'SPOT-004',
  },
  {
    name: '宮崎牛レストラン',
    type: 'restaurant',
    address: '宮崎県宮崎市橘通西',
    coordinates: { lat: 31.9082, lng: 131.421 },
    spotId: 'SPOT-004',
  },
  {
    name: 'スターバックス 宮崎店',
    type: 'cafe',
    address: '宮崎県宮崎市橘通西',
    coordinates: { lat: 31.9078, lng: 131.4198 },
    spotId: 'SPOT-004',
  },
  {
    name: '宮崎駅',
    type: 'station',
    address: '宮崎県宮崎市錦町1-8',
    coordinates: { lat: 31.9073, lng: 131.4245 },
    spotId: 'SPOT-004',
  },
]

// SPOT-005: 귀멸의 칼날 - 운젠 지옥
const SPOT_005_FACILITIES: SeedFacility[] = [
  {
    name: '雲仙温泉 湯元ホテル',
    type: 'restaurant',
    address: '長崎県雲仙市小浜町雲仙',
    coordinates: { lat: 32.7505, lng: 130.267 },
    spotId: 'SPOT-005',
  },
  {
    name: '雲仙地獄茶屋',
    type: 'cafe',
    address: '長崎県雲仙市小浜町雲仙',
    coordinates: { lat: 32.75, lng: 130.2665 },
    spotId: 'SPOT-005',
  },
  {
    name: 'ファミリーマート 雲仙店',
    type: 'convenience_store',
    address: '長崎県雲仙市小浜町雲仙',
    coordinates: { lat: 32.7508, lng: 130.2672 },
    spotId: 'SPOT-005',
  },
  {
    name: '雲仙温泉観光案内所',
    type: 'other',
    address: '長崎県雲仙市小浜町雲仙',
    coordinates: { lat: 32.7502, lng: 130.2668 },
    spotId: 'SPOT-005',
  },
]

// ============================================
// 애니메이션 스팟 주변 편의시설 (REAL-ANI-xxx)
// ============================================

// REAL-ANI-001: 스가 신사 (도쿄 요츠야)
const SUGA_SHRINE_FACILITIES: SeedFacility[] = [
  {
    name: 'セブン-イレブン 四谷三丁目店',
    type: 'convenience_store',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6878, lng: 139.7171 },
    spotId: 'REAL-ANI-001',
  },
  {
    name: 'ファミリーマート 四谷三丁目店',
    type: 'convenience_store',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6875, lng: 139.7193 },
    spotId: 'REAL-ANI-001',
  },
  {
    name: '山形うまいもん処 花笠庵',
    type: 'restaurant',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6875, lng: 139.7201 },
    spotId: 'REAL-ANI-001',
  },
  {
    name: 'とみ吉',
    type: 'restaurant',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6871, lng: 139.7201 },
    spotId: 'REAL-ANI-001',
  },
  {
    name: 'スターバックス 四谷三丁目店',
    type: 'cafe',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6876, lng: 139.7232 },
    spotId: 'REAL-ANI-001',
  },
  {
    name: 'ドトールコーヒー',
    type: 'cafe',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6879, lng: 139.7198 },
    spotId: 'REAL-ANI-001',
  },
  {
    name: '四谷三丁目駅',
    type: 'station',
    address: '東京都新宿区四谷3丁目',
    coordinates: { lat: 35.6879, lng: 139.7205 },
    spotId: 'REAL-ANI-001',
  },
]

// REAL-ANI-002: 가마쿠라코코마에역 건널목 (슬램덩크)
const KAMAKURA_FACILITIES: SeedFacility[] = [
  {
    name: '吉野家 134号線江ノ島店',
    type: 'restaurant',
    address: '神奈川県鎌倉市腰越1丁目',
    coordinates: { lat: 35.3082, lng: 139.4916 },
    spotId: 'REAL-ANI-002',
  },
  {
    name: 'ケンタッキーフライドチキン 江ノ島店',
    type: 'restaurant',
    address: '神奈川県鎌倉市腰越1丁目',
    coordinates: { lat: 35.3082, lng: 139.4919 },
    spotId: 'REAL-ANI-002',
  },
  {
    name: '鎌倉 大勝軒',
    type: 'restaurant',
    address: '神奈川県鎌倉市腰越2丁目',
    coordinates: { lat: 35.3101, lng: 139.4904 },
    spotId: 'REAL-ANI-002',
  },
  {
    name: 'フレッシュストアヤオミネ',
    type: 'convenience_store',
    address: '神奈川県鎌倉市腰越2丁目',
    coordinates: { lat: 35.3094, lng: 139.4911 },
    spotId: 'REAL-ANI-002',
  },
  {
    name: '腰越駅',
    type: 'station',
    address: '神奈川県鎌倉市腰越2丁目',
    coordinates: { lat: 35.3083, lng: 139.4932 },
    spotId: 'REAL-ANI-002',
  },
  {
    name: '鎌倉高校前駅',
    type: 'station',
    address: '神奈川県鎌倉市腰越1丁目',
    coordinates: { lat: 35.3068, lng: 139.4962 },
    spotId: 'REAL-ANI-002',
  },
]

// REAL-ANI-003: 지우펀 (대만)
const JIUFEN_FACILITIES: SeedFacility[] = [
  {
    name: '阿妹茶樓',
    type: 'restaurant',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1085, lng: 121.8436 },
    spotId: 'REAL-ANI-003',
  },
  {
    name: '芋仔番薯茶坊',
    type: 'restaurant',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1086, lng: 121.8437 },
    spotId: 'REAL-ANI-003',
  },
  {
    name: '九份觀海樓',
    type: 'restaurant',
    address: '新北市瑞芳區基山街183之1號',
    coordinates: { lat: 25.1078, lng: 121.8431 },
    spotId: 'REAL-ANI-003',
  },
  {
    name: '7-Eleven 九份門市',
    type: 'convenience_store',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1097, lng: 121.8453 },
    spotId: 'REAL-ANI-003',
  },
  {
    name: '全家便利商店 九份店',
    type: 'convenience_store',
    address: '新北市瑞芳區基山街',
    coordinates: { lat: 25.1102, lng: 121.8453 },
    spotId: 'REAL-ANI-003',
  },
  {
    name: '九份茶坊',
    type: 'cafe',
    address: '新北市瑞芳區基山街142號',
    coordinates: { lat: 25.1081, lng: 121.8435 },
    spotId: 'REAL-ANI-003',
  },
]

// REAL-ANI-004: 이와토비 고등학교 모델 (돗토리현)
const IWAMI_FACILITIES: SeedFacility[] = [
  {
    name: 'ローソン 岩美店',
    type: 'convenience_store',
    address: '鳥取県岩美郡岩美町',
    coordinates: { lat: 35.5175, lng: 134.334 },
    spotId: 'REAL-ANI-004',
  },
  {
    name: '道の駅 きなんせ岩美',
    type: 'restaurant',
    address: '鳥取県岩美郡岩美町',
    coordinates: { lat: 35.518, lng: 134.332 },
    spotId: 'REAL-ANI-004',
  },
  {
    name: '岩美駅',
    type: 'station',
    address: '鳥取県岩美郡岩美町',
    coordinates: { lat: 35.519, lng: 134.335 },
    spotId: 'REAL-ANI-004',
  },
]

// REAL-ANI-005: 와시노미야 신사 (사이타마현)
const WASHINOMIYA_FACILITIES: SeedFacility[] = [
  {
    name: 'セブン-イレブン 鷲宮店',
    type: 'convenience_store',
    address: '埼玉県久喜市鷲宮',
    coordinates: { lat: 36.1035, lng: 139.601 },
    spotId: 'REAL-ANI-005',
  },
  {
    name: '大酉茶屋',
    type: 'restaurant',
    address: '埼玉県久喜市鷲宮1丁目',
    coordinates: { lat: 36.1025, lng: 139.6 },
    spotId: 'REAL-ANI-005',
  },
  {
    name: '鷲宮駅',
    type: 'station',
    address: '埼玉県久喜市鷲宮中央',
    coordinates: { lat: 36.101, lng: 139.5985 },
    spotId: 'REAL-ANI-005',
  },
]

// REAL-ANI-006: 오아라이 마을 (이바라키현)
const OARAI_FACILITIES: SeedFacility[] = [
  {
    name: 'セブン-イレブン 大洗店',
    type: 'convenience_store',
    address: '茨城県東茨城郡大洗町',
    coordinates: { lat: 36.314, lng: 140.575 },
    spotId: 'REAL-ANI-006',
  },
  {
    name: '大洗まいわい市場',
    type: 'restaurant',
    address: '茨城県東茨城郡大洗町',
    coordinates: { lat: 36.3125, lng: 140.574 },
    spotId: 'REAL-ANI-006',
  },
  {
    name: '味処 大森',
    type: 'restaurant',
    address: '茨城県東茨城郡大洗町',
    coordinates: { lat: 36.313, lng: 140.5755 },
    spotId: 'REAL-ANI-006',
  },
  {
    name: '大洗駅',
    type: 'station',
    address: '茨城県東茨城郡大洗町',
    coordinates: { lat: 36.3145, lng: 140.576 },
    spotId: 'REAL-ANI-006',
  },
]

// REAL-ANI-007: 히다 후루카와 (기후현)
const HIDA_FACILITIES: SeedFacility[] = [
  {
    name: '飛騨牛料理 匠家',
    type: 'restaurant',
    address: '岐阜県飛騨市古川町',
    coordinates: { lat: 36.238, lng: 137.1865 },
    spotId: 'REAL-ANI-007',
  },
  {
    name: '蕪水亭',
    type: 'restaurant',
    address: '岐阜県飛騨市古川町',
    coordinates: { lat: 36.2375, lng: 137.1858 },
    spotId: 'REAL-ANI-007',
  },
  {
    name: 'ファミリーマート 飛騨古川店',
    type: 'convenience_store',
    address: '岐阜県飛騨市古川町',
    coordinates: { lat: 36.2385, lng: 137.187 },
    spotId: 'REAL-ANI-007',
  },
  {
    name: '飛騨古川駅',
    type: 'station',
    address: '岐阜県飛騨市古川町',
    coordinates: { lat: 36.237, lng: 137.1855 },
    spotId: 'REAL-ANI-007',
  },
]

// REAL-ANI-008: 도쿄 타워
const TOKYO_TOWER_FACILITIES: SeedFacility[] = [
  {
    name: 'セブン-イレブン 芝公園店',
    type: 'convenience_store',
    address: '東京都港区芝公園',
    coordinates: { lat: 35.659, lng: 139.746 },
    spotId: 'REAL-ANI-008',
  },
  {
    name: 'ファミリーマート 東京タワー店',
    type: 'convenience_store',
    address: '東京都港区芝公園',
    coordinates: { lat: 35.6582, lng: 139.7448 },
    spotId: 'REAL-ANI-008',
  },
  {
    name: 'タワーレストラン',
    type: 'restaurant',
    address: '東京都港区芝公園4丁目',
    coordinates: { lat: 35.6585, lng: 139.7452 },
    spotId: 'REAL-ANI-008',
  },
  {
    name: 'スカイラウンジ',
    type: 'cafe',
    address: '東京都港区芝公園4丁目',
    coordinates: { lat: 35.6588, lng: 139.7456 },
    spotId: 'REAL-ANI-008',
  },
  {
    name: '赤羽橋駅',
    type: 'station',
    address: '東京都港区東麻布',
    coordinates: { lat: 35.6555, lng: 139.7445 },
    spotId: 'REAL-ANI-008',
  },
]

// REAL-ANI-009: 에노시마
const ENOSHIMA_FACILITIES: SeedFacility[] = [
  {
    name: 'しらす問屋 とびっちょ',
    type: 'restaurant',
    address: '神奈川県藤沢市江の島',
    coordinates: { lat: 35.301, lng: 139.48 },
    spotId: 'REAL-ANI-009',
  },
  {
    name: '江ノ島小屋',
    type: 'restaurant',
    address: '神奈川県藤沢市江の島',
    coordinates: { lat: 35.3005, lng: 139.4795 },
    spotId: 'REAL-ANI-009',
  },
  {
    name: 'イルキャンティ カフェ 江の島',
    type: 'cafe',
    address: '神奈川県藤沢市江の島',
    coordinates: { lat: 35.3012, lng: 139.4802 },
    spotId: 'REAL-ANI-009',
  },
  {
    name: '片瀬江ノ島駅',
    type: 'station',
    address: '神奈川県藤沢市片瀬海岸',
    coordinates: { lat: 35.3095, lng: 139.4815 },
    spotId: 'REAL-ANI-009',
  },
]

// REAL-ANI-010: 아키하바라
const AKIHABARA_FACILITIES: SeedFacility[] = [
  {
    name: 'セブン-イレブン 秋葉原駅前店',
    type: 'convenience_store',
    address: '東京都千代田区外神田',
    coordinates: { lat: 35.7025, lng: 139.7748 },
    spotId: 'REAL-ANI-010',
  },
  {
    name: 'ローソン 秋葉原中央通り店',
    type: 'convenience_store',
    address: '東京都千代田区外神田',
    coordinates: { lat: 35.702, lng: 139.774 },
    spotId: 'REAL-ANI-010',
  },
  {
    name: '牛丼専門サンボ',
    type: 'restaurant',
    address: '東京都千代田区外神田',
    coordinates: { lat: 35.7028, lng: 139.775 },
    spotId: 'REAL-ANI-010',
  },
  {
    name: 'メイドカフェ @ほぉ~むカフェ',
    type: 'cafe',
    address: '東京都千代田区外神田',
    coordinates: { lat: 35.7022, lng: 139.7742 },
    spotId: 'REAL-ANI-010',
  },
  {
    name: '秋葉原駅',
    type: 'station',
    address: '東京都千代田区外神田',
    coordinates: { lat: 35.6984, lng: 139.7731 },
    spotId: 'REAL-ANI-010',
  },
]

// REAL-ANI-011: 나라 공원
const NARA_FACILITIES: SeedFacility[] = [
  {
    name: '志津香 公園店',
    type: 'restaurant',
    address: '奈良県奈良市登大路町',
    coordinates: { lat: 34.6855, lng: 135.8435 },
    spotId: 'REAL-ANI-011',
  },
  {
    name: '春日荷茶屋',
    type: 'cafe',
    address: '奈良県奈良市春日野町',
    coordinates: { lat: 34.6848, lng: 135.844 },
    spotId: 'REAL-ANI-011',
  },
  {
    name: 'セブン-イレブン 奈良公園前店',
    type: 'convenience_store',
    address: '奈良県奈良市登大路町',
    coordinates: { lat: 34.686, lng: 135.8425 },
    spotId: 'REAL-ANI-011',
  },
  {
    name: '近鉄奈良駅',
    type: 'station',
    address: '奈良県奈良市東向中町',
    coordinates: { lat: 34.682, lng: 135.83 },
    spotId: 'REAL-ANI-011',
  },
]

// REAL-ANI-026: Tokyo Racecourse (Uma Musume PRETTY DERBY)
const TOKYO_RACECOURSE_UMAMUSUME_FACILITIES: SeedFacility[] = [
  {
    name: 'Ministop Fuchu Hachimancho',
    type: 'convenience_store',
    address: 'Hachimancho, Fuchu, Tokyo',
    coordinates: { lat: 35.670181, lng: 139.4826863 },
    spotId: 'REAL-ANI-026',
  },
  {
    name: '7-Eleven Fuchu Keiba Area',
    type: 'convenience_store',
    address: 'Hachimancho, Fuchu, Tokyo',
    coordinates: { lat: 35.6699289, lng: 139.4860831 },
    spotId: 'REAL-ANI-026',
  },
  {
    name: 'Lawson Fuchu Hiyoshicho',
    type: 'convenience_store',
    address: 'Hiyoshicho, Fuchu, Tokyo',
    coordinates: { lat: 35.6653974, lng: 139.4791364 },
    spotId: 'REAL-ANI-026',
  },
  {
    name: 'Cafe&Bar ipini',
    type: 'cafe',
    address: 'Hachimancho, Fuchu, Tokyo',
    coordinates: { lat: 35.669889, lng: 139.4826836 },
    spotId: 'REAL-ANI-026',
  },
  {
    name: 'Apollo Base',
    type: 'restaurant',
    address: 'Hachimancho, Fuchu, Tokyo',
    coordinates: { lat: 35.6680876, lng: 139.4843678 },
    spotId: 'REAL-ANI-026',
  },
  {
    name: 'Wine Terrace Yu-me',
    type: 'restaurant',
    address: 'Hachimancho, Fuchu, Tokyo',
    coordinates: { lat: 35.6693303, lng: 139.4804877 },
    spotId: 'REAL-ANI-026',
  },
  {
    name: 'Fuchukeibajo-Seimonmae Station',
    type: 'station',
    address: 'Hachimancho, Fuchu, Tokyo',
    coordinates: { lat: 35.6684223, lng: 139.4847109 },
    spotId: 'REAL-ANI-026',
  },
]

// REAL-ANI-027: Nakayama Racecourse (Uma Musume PRETTY DERBY)
const NAKAYAMA_RACECOURSE_UMAMUSUME_FACILITIES: SeedFacility[] = [
  {
    name: 'Sukiya Nakayama Area',
    type: 'restaurant',
    address: 'Kosaku, Funabashi, Chiba',
    coordinates: { lat: 35.7217857, lng: 139.9585693 },
    spotId: 'REAL-ANI-027',
  },
  {
    name: 'Gusto Funabashi Kosaku',
    type: 'restaurant',
    address: 'Kosaku, Funabashi, Chiba',
    coordinates: { lat: 35.7296212, lng: 139.959264 },
    spotId: 'REAL-ANI-027',
  },
  {
    name: 'Gonzaemon',
    type: 'restaurant',
    address: 'Kosaku, Funabashi, Chiba',
    coordinates: { lat: 35.7283522, lng: 139.9592849 },
    spotId: 'REAL-ANI-027',
  },
  {
    name: 'FamilyMart Nakayama Racecourse Area',
    type: 'convenience_store',
    address: 'Kosaku, Funabashi, Chiba',
    coordinates: { lat: 35.7215502, lng: 139.9583748 },
    spotId: 'REAL-ANI-027',
  },
  {
    name: '7-Eleven Funabashi Hokubo',
    type: 'convenience_store',
    address: 'Funabashi, Chiba',
    coordinates: { lat: 35.7314966, lng: 139.9445385 },
    spotId: 'REAL-ANI-027',
  },
  {
    name: 'Ministop Ichikawa Wakamiya',
    type: 'convenience_store',
    address: 'Wakamiya, Ichikawa, Chiba',
    coordinates: { lat: 35.7259363, lng: 139.9516587 },
    spotId: 'REAL-ANI-027',
  },
]

// REAL-ANI-028: Hitachi Seaside Park Miharashi Hill (Frieren-inspired)
const HITACHI_SEASIDE_FRIEREN_FACILITIES: SeedFacility[] = [
  {
    name: 'Flying Garden Hitachinaka',
    type: 'restaurant',
    address: 'Mawatari, Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4007802, lng: 140.5801509 },
    spotId: 'REAL-ANI-028',
  },
  {
    name: 'Yamada Udon Hitachinaka',
    type: 'restaurant',
    address: 'Mawatari, Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4007217, lng: 140.5809016 },
    spotId: 'REAL-ANI-028',
  },
  {
    name: 'Mos Burger Hitachinaka',
    type: 'restaurant',
    address: 'Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4068469, lng: 140.5867086 },
    spotId: 'REAL-ANI-028',
  },
  {
    name: 'Lawson Hitachinaka Mawatari',
    type: 'convenience_store',
    address: 'Mawatari, Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4004098, lng: 140.5808912 },
    spotId: 'REAL-ANI-028',
  },
  {
    name: 'Sanyu Store Hitachinaka',
    type: 'convenience_store',
    address: 'Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4060581, lng: 140.5839916 },
    spotId: 'REAL-ANI-028',
  },
  {
    name: 'Starbucks Hitachinaka',
    type: 'cafe',
    address: 'Mawatari, Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4012439, lng: 140.5814002 },
    spotId: 'REAL-ANI-028',
  },
  {
    name: 'Tullys Coffee Hitachinaka',
    type: 'cafe',
    address: 'Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4056448, lng: 140.5859507 },
    spotId: 'REAL-ANI-028',
  },
  {
    name: 'ape',
    type: 'cafe',
    address: 'Hitachinaka, Ibaraki',
    coordinates: { lat: 36.4053372, lng: 140.5856975 },
    spotId: 'REAL-ANI-028',
  },
]

// REAL-ANI-029: Dogo Onsen Honkan (Spirited Away-inspired)
const DOGO_ONSEN_FACILITIES: SeedFacility[] = [
  {
    name: 'FamilyMart Dogo Yunomachi',
    type: 'convenience_store',
    address: '18-7 Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8523573, lng: 132.7837914 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: '7-Eleven Dogo Area',
    type: 'convenience_store',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8520672, lng: 132.7826256 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Dogo Nikitatsu Sunday Market',
    type: 'convenience_store',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8515456, lng: 132.7834548 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Dogo Onsen Station',
    type: 'station',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8504258, lng: 132.7850817 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Sushimaru',
    type: 'restaurant',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8523199, lng: 132.7862855 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Iyo Tanuki',
    type: 'restaurant',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8521905, lng: 132.7843171 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Uotake',
    type: 'restaurant',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8520052, lng: 132.7859387 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Petit Madonna',
    type: 'cafe',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8519331, lng: 132.7852831 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Hado Honpo',
    type: 'cafe',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8515492, lng: 132.7852744 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Dogo no Machiya',
    type: 'cafe',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8517463, lng: 132.7851428 },
    spotId: 'REAL-ANI-029',
  },
  {
    name: 'Josai Pharmacy Dogo',
    type: 'other',
    address: 'Dogoyunomachi, Matsuyama, Ehime',
    coordinates: { lat: 33.8500276, lng: 132.7845463 },
    spotId: 'REAL-ANI-029',
  },
]

// ============================================
// 스포츠 스팟 주변 편의시설
// ============================================

// REAL-SPO-001: 캄프 누 (바르셀로나)
const CAMP_NOU_FACILITIES: SeedFacility[] = [
  {
    name: 'Bar Camp Nou',
    type: 'restaurant',
    address: "C. d'Arístides Maillol, Barcelona",
    coordinates: { lat: 41.3812, lng: 2.123 },
    spotId: 'REAL-SPO-001',
  },
  {
    name: 'Restaurant La Masía',
    type: 'restaurant',
    address: 'Av. Joan XXIII, Barcelona',
    coordinates: { lat: 41.3805, lng: 2.1225 },
    spotId: 'REAL-SPO-001',
  },
  {
    name: 'Starbucks Camp Nou',
    type: 'cafe',
    address: "C. d'Arístides Maillol, Barcelona",
    coordinates: { lat: 41.3815, lng: 2.1235 },
    spotId: 'REAL-SPO-001',
  },
  {
    name: 'Carrefour Express',
    type: 'convenience_store',
    address: 'Av. de Joan XXIII, Barcelona',
    coordinates: { lat: 41.38, lng: 2.122 },
    spotId: 'REAL-SPO-001',
  },
  {
    name: 'Collblanc Metro',
    type: 'station',
    address: 'Collblanc, Barcelona',
    coordinates: { lat: 41.3785, lng: 2.1135 },
    spotId: 'REAL-SPO-001',
  },
]

// REAL-SPO-002: 올드 트래포드 (맨체스터)
const OLD_TRAFFORD_FACILITIES: SeedFacility[] = [
  {
    name: 'Red Café',
    type: 'restaurant',
    address: 'Sir Matt Busby Way, Manchester',
    coordinates: { lat: 41.3812, lng: 2.123 },
    spotId: 'REAL-SPO-002',
  },
  {
    name: "Lou Macari's Chip Shop",
    type: 'restaurant',
    address: 'Chester Road, Manchester',
    coordinates: { lat: 53.4635, lng: -2.292 },
    spotId: 'REAL-SPO-002',
  },
  {
    name: 'Costa Coffee Old Trafford',
    type: 'cafe',
    address: 'Sir Matt Busby Way, Manchester',
    coordinates: { lat: 53.4628, lng: -2.2908 },
    spotId: 'REAL-SPO-002',
  },
  {
    name: 'Tesco Express',
    type: 'convenience_store',
    address: 'Chester Road, Manchester',
    coordinates: { lat: 53.464, lng: -2.2925 },
    spotId: 'REAL-SPO-002',
  },
  {
    name: 'Old Trafford Metrolink',
    type: 'station',
    address: 'Old Trafford, Manchester',
    coordinates: { lat: 53.4565, lng: -2.2845 },
    spotId: 'REAL-SPO-002',
  },
]

// REAL-SPO-003: 고시엔 구장 (효고현)
const KOSHIEN_FACILITIES: SeedFacility[] = [
  {
    name: '甲子園カレー',
    type: 'restaurant',
    address: '兵庫県西宮市甲子園町',
    coordinates: { lat: 34.7218, lng: 135.362 },
    spotId: 'REAL-SPO-003',
  },
  {
    name: 'ローソン 甲子園駅前店',
    type: 'convenience_store',
    address: '兵庫県西宮市甲子園町',
    coordinates: { lat: 34.721, lng: 135.3612 },
    spotId: 'REAL-SPO-003',
  },
  {
    name: 'セブン-イレブン 甲子園店',
    type: 'convenience_store',
    address: '兵庫県西宮市甲子園町',
    coordinates: { lat: 34.722, lng: 135.3625 },
    spotId: 'REAL-SPO-003',
  },
  {
    name: '甲子園駅',
    type: 'station',
    address: '兵庫県西宮市甲子園町',
    coordinates: { lat: 34.7205, lng: 135.3608 },
    spotId: 'REAL-SPO-003',
  },
]

// REAL-SPO-004: 산티아고 베르나베우 (마드리드)
const BERNABEU_FACILITIES: SeedFacility[] = [
  {
    name: 'Restaurante Puerta 57',
    type: 'restaurant',
    address: 'Av. de Concha Espina, Madrid',
    coordinates: { lat: 40.4535, lng: -3.688 },
    spotId: 'REAL-SPO-004',
  },
  {
    name: 'Café Bernabéu',
    type: 'cafe',
    address: 'Av. de Concha Espina, Madrid',
    coordinates: { lat: 40.4528, lng: -3.6878 },
    spotId: 'REAL-SPO-004',
  },
  {
    name: 'Carrefour Express Bernabéu',
    type: 'convenience_store',
    address: 'Paseo de la Castellana, Madrid',
    coordinates: { lat: 40.454, lng: -3.689 },
    spotId: 'REAL-SPO-004',
  },
  {
    name: 'Santiago Bernabéu Metro',
    type: 'station',
    address: 'Paseo de la Castellana, Madrid',
    coordinates: { lat: 40.4525, lng: -3.6905 },
    spotId: 'REAL-SPO-004',
  },
]

// REAL-SPO-005: 잠실 야구장 (서울)
const JAMSIL_FACILITIES: SeedFacility[] = [
  {
    name: '롯데리아 잠실야구장점',
    type: 'restaurant',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5125, lng: 127.0722 },
    spotId: 'REAL-SPO-005',
  },
  {
    name: '스타벅스 잠실야구장점',
    type: 'cafe',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.512, lng: 127.0715 },
    spotId: 'REAL-SPO-005',
  },
  {
    name: 'CU 잠실야구장점',
    type: 'convenience_store',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5128, lng: 127.0725 },
    spotId: 'REAL-SPO-005',
  },
  {
    name: 'GS25 잠실종합운동장점',
    type: 'convenience_store',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5118, lng: 127.0712 },
    spotId: 'REAL-SPO-005',
  },
  {
    name: '종합운동장역',
    type: 'station',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5108, lng: 127.0735 },
    spotId: 'REAL-SPO-005',
  },
]

// REAL-SPO-006: 앤필드 (리버풀)
const ANFIELD_FACILITIES: SeedFacility[] = [
  {
    name: 'The Sandon Pub',
    type: 'restaurant',
    address: 'Oakfield Road, Liverpool',
    coordinates: { lat: 53.4312, lng: -2.9612 },
    spotId: 'REAL-SPO-006',
  },
  {
    name: 'Homebaked Anfield',
    type: 'restaurant',
    address: 'Oakfield Road, Liverpool',
    coordinates: { lat: 53.4305, lng: -2.9605 },
    spotId: 'REAL-SPO-006',
  },
  {
    name: 'Costa Coffee Anfield',
    type: 'cafe',
    address: 'Walton Breck Road, Liverpool',
    coordinates: { lat: 53.4315, lng: -2.9615 },
    spotId: 'REAL-SPO-006',
  },
  {
    name: 'Tesco Express Anfield',
    type: 'convenience_store',
    address: 'Walton Breck Road, Liverpool',
    coordinates: { lat: 53.4302, lng: -2.96 },
    spotId: 'REAL-SPO-006',
  },
]

// ============================================
// 영화/드라마 스팟 주변 편의시설
// ============================================

// REAL-MOV-001: 글렌피넌 고가교 (스코틀랜드)
const GLENFINNAN_FACILITIES: SeedFacility[] = [
  {
    name: 'Glenfinnan House Hotel',
    type: 'restaurant',
    address: 'Glenfinnan, Scotland',
    coordinates: { lat: 56.8715, lng: -5.4325 },
    spotId: 'REAL-MOV-001',
  },
  {
    name: 'Glenfinnan Dining Car',
    type: 'cafe',
    address: 'Glenfinnan Station, Scotland',
    coordinates: { lat: 56.8708, lng: -5.4315 },
    spotId: 'REAL-MOV-001',
  },
  {
    name: 'Glenfinnan Station',
    type: 'station',
    address: 'Glenfinnan, Scotland',
    coordinates: { lat: 56.8705, lng: -5.431 },
    spotId: 'REAL-MOV-001',
  },
]

// REAL-MOV-002: 북촌 한옥마을 (서울)
const BUKCHON_FACILITIES: SeedFacility[] = [
  {
    name: '북촌손만두',
    type: 'restaurant',
    address: '서울특별시 종로구 계동길',
    coordinates: { lat: 37.5828, lng: 126.9852 },
    spotId: 'REAL-MOV-002',
  },
  {
    name: '차마시는뜰',
    type: 'cafe',
    address: '서울특별시 종로구 계동길',
    coordinates: { lat: 37.5824, lng: 126.9848 },
    spotId: 'REAL-MOV-002',
  },
  {
    name: '동네커피',
    type: 'cafe',
    address: '서울특별시 종로구 북촌로',
    coordinates: { lat: 37.583, lng: 126.9855 },
    spotId: 'REAL-MOV-002',
  },
  {
    name: 'CU 북촌점',
    type: 'convenience_store',
    address: '서울특별시 종로구 계동길',
    coordinates: { lat: 37.5822, lng: 126.9845 },
    spotId: 'REAL-MOV-002',
  },
  {
    name: '안국역',
    type: 'station',
    address: '서울특별시 종로구 율곡로',
    coordinates: { lat: 37.576, lng: 126.9855 },
    spotId: 'REAL-MOV-002',
  },
]

// REAL-MOV-003: 호비튼 (뉴질랜드)
const HOBBITON_FACILITIES: SeedFacility[] = [
  {
    name: 'The Green Dragon Inn',
    type: 'restaurant',
    address: '501 Buckland Road, Matamata',
    coordinates: { lat: -37.8725, lng: 175.6835 },
    spotId: 'REAL-MOV-003',
  },
  {
    name: 'Hobbiton Café',
    type: 'cafe',
    address: '501 Buckland Road, Matamata',
    coordinates: { lat: -37.872, lng: 175.6828 },
    spotId: 'REAL-MOV-003',
  },
  {
    name: 'The Shire Store',
    type: 'other',
    address: '501 Buckland Road, Matamata',
    coordinates: { lat: -37.8718, lng: 175.6825 },
    spotId: 'REAL-MOV-003',
  },
]

// REAL-MOV-004: 주문진 방파제 (강릉)
const JUMUNJIN_FACILITIES: SeedFacility[] = [
  {
    name: '주문진항 회센터',
    type: 'restaurant',
    address: '강원도 강릉시 주문진읍',
    coordinates: { lat: 37.899, lng: 128.8312 },
    spotId: 'REAL-MOV-004',
  },
  {
    name: '주문진 커피거리',
    type: 'cafe',
    address: '강원도 강릉시 주문진읍',
    coordinates: { lat: 37.8982, lng: 128.8305 },
    spotId: 'REAL-MOV-004',
  },
  {
    name: 'GS25 주문진점',
    type: 'convenience_store',
    address: '강원도 강릉시 주문진읍',
    coordinates: { lat: 37.8988, lng: 128.831 },
    spotId: 'REAL-MOV-004',
  },
  {
    name: '주문진역',
    type: 'station',
    address: '강원도 강릉시 주문진읍',
    coordinates: { lat: 37.895, lng: 128.828 },
    spotId: 'REAL-MOV-004',
  },
]

// REAL-MOV-005: 스페인 광장 (로마)
const SPANISH_STEPS_FACILITIES: SeedFacility[] = [
  {
    name: 'Caffè Greco',
    type: 'cafe',
    address: 'Via dei Condotti, Roma',
    coordinates: { lat: 41.9055, lng: 12.482 },
    spotId: 'REAL-MOV-005',
  },
  {
    name: 'Ristorante Nino',
    type: 'restaurant',
    address: 'Via Borgognona, Roma',
    coordinates: { lat: 41.906, lng: 12.4825 },
    spotId: 'REAL-MOV-005',
  },
  {
    name: 'Babingtons Tea Rooms',
    type: 'cafe',
    address: 'Piazza di Spagna, Roma',
    coordinates: { lat: 41.9056, lng: 12.4822 },
    spotId: 'REAL-MOV-005',
  },
  {
    name: 'Spagna Metro',
    type: 'station',
    address: 'Piazza di Spagna, Roma',
    coordinates: { lat: 41.9062, lng: 12.4828 },
    spotId: 'REAL-MOV-005',
  },
]

// REAL-MOV-006: 해운대 (부산)
const HAEUNDAE_FACILITIES: SeedFacility[] = [
  {
    name: '해운대 암소갈비집',
    type: 'restaurant',
    address: '부산광역시 해운대구 해운대해변로',
    coordinates: { lat: 35.159, lng: 129.1608 },
    spotId: 'REAL-MOV-006',
  },
  {
    name: '밀면 본가',
    type: 'restaurant',
    address: '부산광역시 해운대구 해운대해변로',
    coordinates: { lat: 35.1585, lng: 129.16 },
    spotId: 'REAL-MOV-006',
  },
  {
    name: '스타벅스 해운대점',
    type: 'cafe',
    address: '부산광역시 해운대구 해운대해변로',
    coordinates: { lat: 35.1592, lng: 129.161 },
    spotId: 'REAL-MOV-006',
  },
  {
    name: 'CU 해운대해변점',
    type: 'convenience_store',
    address: '부산광역시 해운대구 해운대해변로',
    coordinates: { lat: 35.1582, lng: 129.1598 },
    spotId: 'REAL-MOV-006',
  },
  {
    name: '해운대역',
    type: 'station',
    address: '부산광역시 해운대구 해운대로',
    coordinates: { lat: 35.1628, lng: 129.1635 },
    spotId: 'REAL-MOV-006',
  },
]

// ============================================
// 음악/콘서트 스팟 주변 편의시설
// ============================================

// REAL-MUS-001: 애비 로드 (런던)
const ABBEY_ROAD_FACILITIES: SeedFacility[] = [
  {
    name: 'Abbey Road Café',
    type: 'cafe',
    address: "Abbey Road, St John's Wood, London",
    coordinates: { lat: 51.5322, lng: -0.1782 },
    spotId: 'REAL-MUS-001',
  },
  {
    name: 'The Clifton Pub',
    type: 'restaurant',
    address: "Clifton Hill, St John's Wood, London",
    coordinates: { lat: 51.5325, lng: -0.1785 },
    spotId: 'REAL-MUS-001',
  },
  {
    name: "Tesco Express St John's Wood",
    type: 'convenience_store',
    address: "St John's Wood High Street, London",
    coordinates: { lat: 51.5318, lng: -0.1778 },
    spotId: 'REAL-MUS-001',
  },
  {
    name: "St John's Wood Station",
    type: 'station',
    address: "St John's Wood, London",
    coordinates: { lat: 51.5345, lng: -0.174 },
    spotId: 'REAL-MUS-001',
  },
]

// REAL-MUS-002: 도쿄돔
const TOKYO_DOME_FACILITIES: SeedFacility[] = [
  {
    name: 'ラクーア フードコート',
    type: 'restaurant',
    address: '東京都文京区後楽',
    coordinates: { lat: 35.7058, lng: 139.7522 },
    spotId: 'REAL-MUS-002',
  },
  {
    name: 'プロント 東京ドームシティ店',
    type: 'cafe',
    address: '東京都文京区後楽',
    coordinates: { lat: 35.7054, lng: 139.7515 },
    spotId: 'REAL-MUS-002',
  },
  {
    name: 'セブン-イレブン 東京ドーム店',
    type: 'convenience_store',
    address: '東京都文京区後楽',
    coordinates: { lat: 35.706, lng: 139.7525 },
    spotId: 'REAL-MUS-002',
  },
  {
    name: '後楽園駅',
    type: 'station',
    address: '東京都文京区後楽',
    coordinates: { lat: 35.7075, lng: 139.7535 },
    spotId: 'REAL-MUS-002',
  },
  {
    name: '水道橋駅',
    type: 'station',
    address: '東京都千代田区三崎町',
    coordinates: { lat: 35.702, lng: 139.7545 },
    spotId: 'REAL-MUS-002',
  },
]

// REAL-MUS-003: 그레이스랜드 (멤피스)
const GRACELAND_FACILITIES: SeedFacility[] = [
  {
    name: "Gladys's Diner",
    type: 'restaurant',
    address: '3764 Elvis Presley Blvd, Memphis',
    coordinates: { lat: 35.048, lng: -90.0265 },
    spotId: 'REAL-MUS-003',
  },
  {
    name: 'Rockabilly Café',
    type: 'cafe',
    address: '3764 Elvis Presley Blvd, Memphis',
    coordinates: { lat: 35.0475, lng: -90.0258 },
    spotId: 'REAL-MUS-003',
  },
  {
    name: 'Graceland Gift Shop',
    type: 'other',
    address: '3764 Elvis Presley Blvd, Memphis',
    coordinates: { lat: 35.0478, lng: -90.0262 },
    spotId: 'REAL-MUS-003',
  },
]

// REAL-MUS-004: HYBE 인사이트 (서울)
const HYBE_FACILITIES: SeedFacility[] = [
  {
    name: 'HYBE 카페',
    type: 'cafe',
    address: '서울특별시 용산구 한강대로',
    coordinates: { lat: 37.5285, lng: 126.9656 },
    spotId: 'REAL-MUS-004',
  },
  {
    name: '이태원 맛집거리',
    type: 'restaurant',
    address: '서울특별시 용산구 이태원로',
    coordinates: { lat: 37.528, lng: 126.965 },
    spotId: 'REAL-MUS-004',
  },
  {
    name: 'CU 용산역점',
    type: 'convenience_store',
    address: '서울특별시 용산구 한강대로',
    coordinates: { lat: 37.5288, lng: 126.966 },
    spotId: 'REAL-MUS-004',
  },
  {
    name: '용산역',
    type: 'station',
    address: '서울특별시 용산구 한강대로',
    coordinates: { lat: 37.5298, lng: 126.9648 },
    spotId: 'REAL-MUS-004',
  },
]

// REAL-MUS-005: SM타운 코엑스아티움 (서울)
const SMTOWN_FACILITIES: SeedFacility[] = [
  {
    name: 'SM타운 카페',
    type: 'cafe',
    address: '서울특별시 강남구 영동대로',
    coordinates: { lat: 37.5118, lng: 127.0598 },
    spotId: 'REAL-MUS-005',
  },
  {
    name: '코엑스 푸드코트',
    type: 'restaurant',
    address: '서울특별시 강남구 영동대로',
    coordinates: { lat: 37.5112, lng: 127.059 },
    spotId: 'REAL-MUS-005',
  },
  {
    name: 'GS25 코엑스점',
    type: 'convenience_store',
    address: '서울특별시 강남구 영동대로',
    coordinates: { lat: 37.512, lng: 127.06 },
    spotId: 'REAL-MUS-005',
  },
  {
    name: '삼성역',
    type: 'station',
    address: '서울특별시 강남구 테헤란로',
    coordinates: { lat: 37.5088, lng: 127.063 },
    spotId: 'REAL-MUS-005',
  },
]

// REAL-MUS-006: KSPO DOME (서울)
const KSPO_FACILITIES: SeedFacility[] = [
  {
    name: '올림픽공원 푸드코트',
    type: 'restaurant',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5212, lng: 127.1155 },
    spotId: 'REAL-MUS-006',
  },
  {
    name: '스타벅스 올림픽공원점',
    type: 'cafe',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5205, lng: 127.1145 },
    spotId: 'REAL-MUS-006',
  },
  {
    name: 'CU 올림픽공원점',
    type: 'convenience_store',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5215, lng: 127.1158 },
    spotId: 'REAL-MUS-006',
  },
  {
    name: '올림픽공원역',
    type: 'station',
    address: '서울특별시 송파구 올림픽로',
    coordinates: { lat: 37.5165, lng: 127.1215 },
    spotId: 'REAL-MUS-006',
  },
]

// ============================================
// 게임/e스포츠 스팟 주변 편의시설
// ============================================

// REAL-GAM-001: LoL 파크 (서울)
const LOL_PARK_FACILITIES: SeedFacility[] = [
  {
    name: '종로 맛집거리',
    type: 'restaurant',
    address: '서울특별시 종로구 종로',
    coordinates: { lat: 37.5702, lng: 126.9922 },
    spotId: 'REAL-GAM-001',
  },
  {
    name: '스타벅스 종로점',
    type: 'cafe',
    address: '서울특별시 종로구 종로',
    coordinates: { lat: 37.5698, lng: 126.9918 },
    spotId: 'REAL-GAM-001',
  },
  {
    name: 'CU 종로점',
    type: 'convenience_store',
    address: '서울특별시 종로구 종로',
    coordinates: { lat: 37.5705, lng: 126.9925 },
    spotId: 'REAL-GAM-001',
  },
  {
    name: '종로3가역',
    type: 'station',
    address: '서울특별시 종로구 종로',
    coordinates: { lat: 37.571, lng: 126.992 },
    spotId: 'REAL-GAM-001',
  },
]

// REAL-GAM-002: 닌텐도 도쿄 (시부야)
const NINTENDO_TOKYO_FACILITIES: SeedFacility[] = [
  {
    name: '渋谷パルコ フードコート',
    type: 'restaurant',
    address: '東京都渋谷区宇田川町',
    coordinates: { lat: 35.6622, lng: 139.6985 },
    spotId: 'REAL-GAM-002',
  },
  {
    name: 'スターバックス 渋谷パルコ店',
    type: 'cafe',
    address: '東京都渋谷区宇田川町',
    coordinates: { lat: 35.6618, lng: 139.698 },
    spotId: 'REAL-GAM-002',
  },
  {
    name: 'ファミリーマート 渋谷パルコ店',
    type: 'convenience_store',
    address: '東京都渋谷区宇田川町',
    coordinates: { lat: 35.6625, lng: 139.6988 },
    spotId: 'REAL-GAM-002',
  },
  {
    name: '渋谷駅',
    type: 'station',
    address: '東京都渋谷区道玄坂',
    coordinates: { lat: 35.658, lng: 139.7016 },
    spotId: 'REAL-GAM-002',
  },
]

// REAL-GAM-003: 포켓몬 센터 메가 도쿄 (이케부쿠로)
const POKEMON_CENTER_FACILITIES: SeedFacility[] = [
  {
    name: 'サンシャインシティ フードコート',
    type: 'restaurant',
    address: '東京都豊島区東池袋',
    coordinates: { lat: 35.7298, lng: 139.7188 },
    spotId: 'REAL-GAM-003',
  },
  {
    name: 'タリーズコーヒー サンシャイン店',
    type: 'cafe',
    address: '東京都豊島区東池袋',
    coordinates: { lat: 35.7292, lng: 139.7182 },
    spotId: 'REAL-GAM-003',
  },
  {
    name: 'セブン-イレブン サンシャイン店',
    type: 'convenience_store',
    address: '東京都豊島区東池袋',
    coordinates: { lat: 35.73, lng: 139.719 },
    spotId: 'REAL-GAM-003',
  },
  {
    name: '東池袋駅',
    type: 'station',
    address: '東京都豊島区東池袋',
    coordinates: { lat: 35.7285, lng: 139.7175 },
    spotId: 'REAL-GAM-003',
  },
  {
    name: '池袋駅',
    type: 'station',
    address: '東京都豊島区南池袋',
    coordinates: { lat: 35.7295, lng: 139.7109 },
    spotId: 'REAL-GAM-003',
  },
]

// REAL-GAM-004: 슈퍼 닌텐도 월드 (오사카 USJ)
const NINTENDO_WORLD_FACILITIES: SeedFacility[] = [
  {
    name: 'キノピオ・カフェ',
    type: 'cafe',
    address: '大阪府大阪市此花区桜島',
    coordinates: { lat: 34.6656, lng: 135.4325 },
    spotId: 'REAL-GAM-004',
  },
  {
    name: 'ヨッシー・スナック・アイランド',
    type: 'restaurant',
    address: '大阪府大阪市此花区桜島',
    coordinates: { lat: 34.6652, lng: 135.432 },
    spotId: 'REAL-GAM-004',
  },
  {
    name: 'ローソン USJ店',
    type: 'convenience_store',
    address: '大阪府大阪市此花区桜島',
    coordinates: { lat: 34.666, lng: 135.433 },
    spotId: 'REAL-GAM-004',
  },
  {
    name: 'ユニバーサルシティ駅',
    type: 'station',
    address: '大阪府大阪市此花区島屋',
    coordinates: { lat: 34.668, lng: 135.438 },
    spotId: 'REAL-GAM-004',
  },
]

// ============================================
// 모든 편의시설 데이터 합치기
// ============================================
const SEED_FACILITIES: SeedFacility[] = [
  // 기존 스팟 (SPOT-001 ~ SPOT-005)
  ...SPOT_001_FACILITIES,
  ...SPOT_002_FACILITIES,
  ...SPOT_003_FACILITIES,
  ...SPOT_004_FACILITIES,
  ...SPOT_005_FACILITIES,
  // 애니메이션 (REAL-ANI-xxx)
  ...SUGA_SHRINE_FACILITIES,
  ...KAMAKURA_FACILITIES,
  ...JIUFEN_FACILITIES,
  ...IWAMI_FACILITIES,
  ...WASHINOMIYA_FACILITIES,
  ...OARAI_FACILITIES,
  ...HIDA_FACILITIES,
  ...TOKYO_TOWER_FACILITIES,
  ...ENOSHIMA_FACILITIES,
  ...AKIHABARA_FACILITIES,
  ...NARA_FACILITIES,
  ...TOKYO_RACECOURSE_UMAMUSUME_FACILITIES,
  ...NAKAYAMA_RACECOURSE_UMAMUSUME_FACILITIES,
  ...HITACHI_SEASIDE_FRIEREN_FACILITIES,
  ...DOGO_ONSEN_FACILITIES,
  // 스포츠
  ...CAMP_NOU_FACILITIES,
  ...OLD_TRAFFORD_FACILITIES,
  ...KOSHIEN_FACILITIES,
  ...BERNABEU_FACILITIES,
  ...JAMSIL_FACILITIES,
  ...ANFIELD_FACILITIES,
  // 영화/드라마
  ...GLENFINNAN_FACILITIES,
  ...BUKCHON_FACILITIES,
  ...HOBBITON_FACILITIES,
  ...JUMUNJIN_FACILITIES,
  ...SPANISH_STEPS_FACILITIES,
  ...HAEUNDAE_FACILITIES,
  // 음악
  ...ABBEY_ROAD_FACILITIES,
  ...TOKYO_DOME_FACILITIES,
  ...GRACELAND_FACILITIES,
  ...HYBE_FACILITIES,
  ...SMTOWN_FACILITIES,
  ...KSPO_FACILITIES,
  // 게임
  ...LOL_PARK_FACILITIES,
  ...NINTENDO_TOKYO_FACILITIES,
  ...POKEMON_CENTER_FACILITIES,
  ...NINTENDO_WORLD_FACILITIES,
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

    // 통계 출력
    const stats = SEED_FACILITIES.reduce(
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

    // 스팟별 통계
    const spotStats = SEED_FACILITIES.reduce(
      (acc, f) => {
        if (f.spotId) {
          acc[f.spotId] = (acc[f.spotId] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>
    )

    console.log(
      `\n📍 총 ${Object.keys(spotStats).length}개 스팟에 편의시설 데이터 추가됨`
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
