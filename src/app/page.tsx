'use client'

import dynamic from 'next/dynamic'
import { SpotPin as SpotPinType } from '@/types'

// Leaflet은 SSR을 지원하지 않으므로 dynamic import 사용
const PilgrimageMap = dynamic(() => import('@/components/map/PilgrimageMap'), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
})

function MapLoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-navy-800">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-navy-400 border-t-white"></div>
        <p className="mt-4 text-navy-200">지도 로딩 중...</p>
      </div>
    </div>
  )
}

// 테스트용 더미 스팟 데이터 (서울 주변)
const DUMMY_SPOTS: SpotPinType[] = [
  {
    id: '1',
    name: '너의 이름은 - 스가 신사',
    coordinates: [35.6762, 139.6503], // 도쿄
    thumbnailUrl: 'https://picsum.photos/seed/spot1/400/300',
  },
  {
    id: '2',
    name: '슬램덩크 - 가마쿠라 건널목',
    coordinates: [35.3084, 139.5503], // 가마쿠라
    thumbnailUrl: 'https://picsum.photos/seed/spot2/400/300',
  },
  {
    id: '3',
    name: '센과 치히로 - 지우펀',
    coordinates: [25.1089, 121.8443], // 대만 지우펀
    thumbnailUrl: 'https://picsum.photos/seed/spot3/400/300',
  },
  {
    id: '4',
    name: '스즈메의 문단속 - 미야자키',
    coordinates: [31.9077, 131.4202], // 미야자키
    thumbnailUrl: 'https://picsum.photos/seed/spot4/400/300',
  },
  {
    id: '5',
    name: '귀멸의 칼날 - 운젠 지옥',
    coordinates: [32.7503, 130.2667], // 운젠
    thumbnailUrl: 'https://picsum.photos/seed/spot5/400/300',
  },
]

export default function Home() {
  const handleSpotSelect = (spotId: string) => {
    // eslint-disable-next-line no-console
    console.log('Selected spot:', spotId)
  }

  return (
    <main className="flex h-screen flex-col bg-navy-900">
      {/* 헤더 */}
      <header className="border-b border-navy-700 bg-navy-800 px-4 py-3">
        <h1 className="text-center text-xl font-bold text-white">
          🗾 Anime Pilgrimage Map
        </h1>
        <p className="mt-1 text-center text-sm text-navy-300">
          애니메이션 성지순례 스팟 공유 플랫폼
        </p>
      </header>

      {/* 지도 영역 */}
      <div className="relative flex-1">
        <PilgrimageMap
          initialCenter={[35.6762, 139.6503]} // 도쿄 중심
          initialZoom={6}
          className="h-full w-full"
          spots={DUMMY_SPOTS}
          onSpotSelect={handleSpotSelect}
        />
      </div>

      {/* 하단 정보 */}
      <footer className="border-t border-navy-700 bg-navy-800 px-4 py-2">
        <p className="text-center text-xs text-navy-400">
          📍 {DUMMY_SPOTS.length}개의 성지순례 스팟이 등록되어 있습니다
        </p>
      </footer>
    </main>
  )
}
