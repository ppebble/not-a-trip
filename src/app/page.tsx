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
      {/* 개선된 헤더 */}
      <header className="relative border-b border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-xl">
                🗾
              </div>
              <div>
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  Anime Pilgrimage Map
                </h1>
                <p className="text-xs text-navy-300 md:text-sm">
                  애니메이션 성지순례 스팟 공유 플랫폼
                </p>
              </div>
            </div>

            {/* 네비게이션 메뉴 (모바일에서는 숨김) */}
            <nav className="hidden space-x-6 md:flex">
              <button className="text-sm text-navy-300 transition-colors hover:text-white">
                지도
              </button>
              <button className="text-sm text-navy-300 transition-colors hover:text-white">
                커뮤니티
              </button>
              <button className="text-sm text-navy-300 transition-colors hover:text-white">
                내 스팟
              </button>
            </nav>

            {/* 모바일 메뉴 버튼 */}
            <button className="flex h-8 w-8 items-center justify-center rounded text-navy-300 hover:text-white md:hidden">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 헤더 하단 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy-500 to-transparent"></div>
      </header>

      {/* 지도 영역 */}
      <div className="relative flex-1 overflow-hidden">
        <PilgrimageMap
          initialCenter={[35.6762, 139.6503]} // 도쿄 중심
          initialZoom={6}
          className="h-full w-full"
          spots={DUMMY_SPOTS}
          onSpotSelect={handleSpotSelect}
        />

        {/* 플로팅 정보 패널 (데스크톱) */}
        <div className="absolute bottom-4 left-4 hidden rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm md:block">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-white">
              📍
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-800">
                {DUMMY_SPOTS.length}개의 성지순례 스팟
              </p>
              <p className="text-xs text-navy-600">
                클릭하여 상세 정보를 확인하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 개선된 푸터 */}
      <footer className="border-t border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-4 text-xs text-navy-400">
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span>{DUMMY_SPOTS.length}개 스팟</span>
              </span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center space-x-1">
                <span>🌏</span>
                <span>일본, 대만 지역</span>
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-navy-400">
              <button className="transition-colors hover:text-navy-200">
                도움말
              </button>
              <span className="hidden md:inline">|</span>
              <button className="transition-colors hover:text-navy-200">
                피드백
              </button>
              <span className="hidden md:inline">|</span>
              <span>© 2024 Anime Pilgrimage Map</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
