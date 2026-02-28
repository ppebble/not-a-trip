'use client'

import { NearbyFacility } from '@/types'
import NearbyFacilities from '@/components/spot/NearbyFacilities'

const MOCK_FACILITIES: NearbyFacility[] = [
  {
    id: '1',
    name: '스키야 아키하바라점',
    type: 'restaurant',
    distance: 120,
    address: '東京都千代田区外神田1-1',
    coordinates: [35.6984, 139.7731],
  },
  {
    id: '2',
    name: '세븐일레븐 아키하바라역점',
    type: 'convenience_store',
    distance: 50,
    address: '東京都千代田区外神田1-2',
    coordinates: [35.6985, 139.7732],
  },
  {
    id: '3',
    name: '스타벅스 아키하바라점',
    type: 'cafe',
    distance: 200,
    address: '東京都千代田区外神田1-3',
    coordinates: [35.6986, 139.7733],
  },
  {
    id: '4',
    name: '아키하바라역',
    type: 'station',
    distance: 80,
    address: '東京都千代田区外神田1-4',
    coordinates: [35.6987, 139.7734],
  },
  {
    id: '5',
    name: '아키하바라역 코인 로커',
    type: 'coin_locker',
    distance: 90,
    address: '東京都千代田区外神田1-5',
    coordinates: [35.6988, 139.7735],
    status: 'active',
    verificationScore: 85,
    upvotes: 12,
    downvotes: 2,
  },
  {
    id: '6',
    name: '이치란 라멘 아키하바라점',
    type: 'solo_dining',
    distance: 300,
    address: '東京都千代田区外神田1-6',
    coordinates: [35.6989, 139.7736],
    status: 'active',
    verificationScore: 72,
    upvotes: 8,
    downvotes: 3,
  },
  {
    id: '7',
    name: '도토루 커피 아키하바라점',
    type: 'charging_cafe',
    distance: 180,
    address: '東京都千代田区外神田1-7',
    coordinates: [35.699, 139.7737],
    status: 'active',
    verificationScore: 90,
    upvotes: 18,
    downvotes: 2,
  },
  {
    id: '8',
    name: '아키하바라역 공중화장실',
    type: 'public_restroom',
    distance: 100,
    address: '東京都千代田区外神田1-8',
    coordinates: [35.6991, 139.7738],
    status: 'active',
    verificationScore: 65,
    upvotes: 6,
    downvotes: 3,
  },
  {
    id: '9',
    name: '애니메이트 아키하바라점',
    type: 'goods_shop',
    distance: 250,
    address: '東京都千代田区外神田1-9',
    coordinates: [35.6992, 139.7739],
    status: 'active',
    verificationScore: 95,
    upvotes: 20,
    downvotes: 1,
  },
  {
    id: '10',
    name: '마츠야 아키하바라점',
    type: 'restaurant',
    distance: 350,
    address: '東京都千代田区外神田1-10',
    coordinates: [35.6993, 139.774],
  },
  {
    id: '11',
    name: '만다라케 컴플렉스',
    type: 'goods_shop',
    distance: 400,
    address: '東京都千代田区外神田3-11',
    coordinates: [35.6994, 139.7741],
    status: 'active',
    verificationScore: 98,
    upvotes: 45,
    downvotes: 1,
  },
]

export default function FacilityFilterTestPage() {
  return (
    <main className="min-h-screen bg-navy-50 pt-14">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-navy-900">
          🧪 FacilityFilter 테스트
        </h1>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-navy-700">
            테스트 안내
          </h2>
          <ul className="space-y-1 text-xs text-navy-500">
            <li>• 필터 칩을 클릭하여 카테고리별 필터링 테스트</li>
            <li>• 복수 선택 지원 확인</li>
            <li>• &quot;전체&quot; 클릭 시 필터 초기화 확인</li>
            <li>• Legacy + Otaku 카테고리 모두 표시 확인</li>
          </ul>
        </div>

        <NearbyFacilities facilities={MOCK_FACILITIES} />
      </div>
    </main>
  )
}
