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
  // ── Otaku_Category (상세 정보 포함) ──
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
    otakuDetails: {
      type: 'coin_locker',
      details: {
        sizes: ['small', 'medium', 'large'],
        prices: { small: 300, medium: 500, large: 700 },
        operatingHours: '05:00-24:00',
        hasLargeLocker: true,
      },
    },
  },
  {
    id: '5b',
    name: '이케부쿠로역 코인 로커 (미등록)',
    type: 'coin_locker',
    distance: 150,
    address: '東京都豊島区南池袋1-1',
    coordinates: [35.7295, 139.7109],
    status: 'active',
    verificationScore: 50,
    upvotes: 0,
    downvotes: 0,
    otakuDetails: {
      type: 'coin_locker',
      details: {
        sizes: [],
        prices: { small: null, medium: null, large: null },
        operatingHours: null,
        hasLargeLocker: null,
      },
    },
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
    otakuDetails: {
      type: 'solo_dining',
      details: {
        hasCounterSeat: true,
        hasSoloMenu: true,
        isQuickMeal: true,
        isLateNight: false,
      },
    },
  },
  {
    id: '6b',
    name: '혼밥 식당 (미등록)',
    type: 'solo_dining',
    distance: 400,
    address: '東京都千代田区外神田2-1',
    coordinates: [35.699, 139.774],
    status: 'active',
    verificationScore: 50,
    upvotes: 0,
    downvotes: 0,
    otakuDetails: {
      type: 'solo_dining',
      details: {
        hasCounterSeat: null,
        hasSoloMenu: null,
        isQuickMeal: null,
        isLateNight: null,
      },
    },
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
    otakuDetails: {
      type: 'charging_cafe',
      details: { hasCharging: true, hasWifi: true },
    },
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
    otakuDetails: {
      type: 'public_restroom',
      details: { isAccessible: true, is24Hours: false },
    },
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
    otakuDetails: {
      type: 'goods_shop',
      details: { subtype: 'subculture_shop', operatingHours: '10:00-21:00' },
    },
  },
  {
    id: '11',
    name: '돈키호테 아키하바라점',
    type: 'goods_shop',
    distance: 350,
    address: '東京都千代田区外神田3-11',
    coordinates: [35.6994, 139.7741],
    status: 'active',
    verificationScore: 98,
    upvotes: 45,
    downvotes: 1,
    otakuDetails: {
      type: 'goods_shop',
      details: { subtype: 'general_store', operatingHours: '24시간' },
    },
  },
]

export default function FacilityCardTestPage() {
  return (
    <main className="min-h-screen bg-navy-50 pt-14">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-navy-900">
          🧪 FacilityCard 상세 렌더링 테스트
        </h1>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-navy-700">
            테스트 안내
          </h2>
          <ul className="space-y-1 text-xs text-navy-500">
            <li>• 코인 로커: 크기별 가격 테이블, 대형 로커 배지, 이용 시간</li>
            <li>• 혼밥 식당: 1인 OK 태그, 카운터석/1인 메뉴/빠른 식사/심야</li>
            <li>• 충전 카페: 충전/와이파이 유무 아이콘</li>
            <li>• 화장실: 접근성/24시간 유무 아이콘</li>
            <li>• 굿즈샵: 매장 유형 배지, 영업시간</li>
            <li>• 미등록 필드에 &quot;정보 미등록&quot; 텍스트 확인</li>
            <li>• 신뢰도 점수 및 투표 수 표시 확인</li>
          </ul>
        </div>

        <NearbyFacilities facilities={MOCK_FACILITIES} />
      </div>
    </main>
  )
}
