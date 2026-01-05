'use client'

import dynamic from 'next/dynamic'
import { useSpots } from '@/hooks/useSpots'
import SpotPreview from '@/components/map/SpotPreview'

// Leaflet은 SSR을 지원하지 않으므로 dynamic import 사용
const PilgrimageMap = dynamic(() => import('@/components/map/PilgrimageMap'), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
})

/**
 * 지도 로딩 중 표시되는 스켈레톤 컴포넌트
 * 네이비 테마를 적용한 로딩 인디케이터
 */
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

/**
 * 스팟 데이터 로딩 중 표시되는 컴포넌트
 */
function SpotLoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-navy-800">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-navy-400 border-t-white"></div>
        <p className="mt-2 text-sm text-navy-200">스팟 데이터 로딩 중...</p>
      </div>
    </div>
  )
}

/**
 * 스팟 데이터 로딩 에러 표시 컴포넌트
 */
function SpotErrorDisplay({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-navy-800">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 p-3">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <p className="mt-4 text-navy-200">스팟 데이터를 불러올 수 없습니다</p>
        <p className="mt-1 text-xs text-navy-400">{error.message}</p>
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-navy-600 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-500"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}

/**
 * 메인 페이지 컴포넌트
 * Requirements 1.1, 1.4를 만족하는 지도 기반 메인 페이지
 * - 전체 화면 인터랙티브 지도 표시
 * - 네이비 테마 색상 스킴 적용
 * - 반응형 레이아웃 지원
 * - 실제 API 데이터 연동 (Task 6.2)
 */
export default function Home() {
  // 실제 API에서 스팟 데이터 가져오기
  const { data: spots, isLoading, error, refetch } = useSpots()

  /**
   * 스팟 선택 핸들러
   * 현재는 콘솔 로그만 출력하며, 향후 상세 페이지 네비게이션으로 확장 예정
   */
  const handleSpotSelect = (spotId: string) => {
    // eslint-disable-next-line no-console
    console.log('Selected spot:', spotId)
  }

  // 스팟 데이터 로딩 중일 때
  if (isLoading) {
    return (
      <main className="flex h-screen flex-col bg-navy-900">
        <SpotLoadingSkeleton />
      </main>
    )
  }

  // 스팟 데이터 로딩 에러일 때
  if (error) {
    return (
      <main className="flex h-screen flex-col bg-navy-900">
        <SpotErrorDisplay error={error} onRetry={() => refetch()} />
      </main>
    )
  }

  // 스팟 데이터가 없을 때 빈 배열 사용
  const spotData = spots || []
  const spotCount = spotData.length

  return (
    <main className="flex h-screen flex-col bg-navy-900">
      {/* 메인 헤더 - 네이비 테마 그라데이션 적용 */}
      <header className="relative border-b border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            {/* 로고 및 타이틀 영역 */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-xl">
                🗾
              </div>
              <div>
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  Anime Pilgrim
                </h1>
                <p className="text-xs text-navy-300 md:text-sm">
                  애니메이션 성지순례 스팟 공유 플랫폼
                </p>
              </div>
            </div>

            {/* 데스크톱 네비게이션 메뉴 */}
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

            {/* 모바일 햄버거 메뉴 버튼 */}
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

        {/* 헤더 하단 장식용 그라데이션 라인 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy-500 to-transparent"></div>
      </header>

      {/* 메인 지도 영역 - 전체 화면 인터랙티브 지도 */}
      <div className="relative flex-1 overflow-hidden">
        <PilgrimageMap
          initialCenter={[35.6762, 139.6503]} // 도쿄 중심 좌표
          initialZoom={6}
          className="h-full w-full"
          spots={spotData}
          onSpotSelect={handleSpotSelect}
        />

        {/* 데스크톱용 플로팅 정보 패널 */}
        <div className="absolute bottom-4 left-4 hidden rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm md:block">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-white">
              📍
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-800">
                {spotCount}개의 성지순례 스팟
              </p>
              <p className="text-xs text-navy-600">
                {spotCount > 0
                  ? '클릭하여 상세 정보를 확인하세요'
                  : '스팟 데이터를 불러오는 중...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 스팟 미리보기 팝업 컴포넌트 */}
      <SpotPreview />

      {/* 메인 푸터 - 네이비 테마 그라데이션 적용 */}
      <footer className="border-t border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0">
            {/* 좌측 통계 정보 */}
            <div className="flex items-center space-x-4 text-xs text-navy-400">
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span>{spotCount}개 스팟</span>
              </span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center space-x-1">
                <span>🌏</span>
                <span>일본, 대만 지역</span>
              </span>
            </div>

            {/* 우측 링크 및 저작권 정보 */}
            <div className="flex items-center space-x-4 text-xs text-navy-400">
              <button className="transition-colors hover:text-navy-200">
                도움말
              </button>
              <span className="hidden md:inline">|</span>
              <button className="transition-colors hover:text-navy-200">
                피드백
              </button>
              <span className="hidden md:inline">|</span>
              <span>© 2024 Anime Pilgrim</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
