'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useSpots } from '@/hooks/useSpots'
import SpotPreview from '@/components/map/SpotPreview'
import CategoryFilter from '@/components/map/CategoryFilter'
import ContentSearchFilter from '@/components/map/ContentSearchFilter'
import { useSelectedCategories, useSearchQuery } from '@/stores/filterStore'

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
 * Requirements 1.1, 1.4, 2.2를 만족하는 지도 기반 메인 페이지
 * - 전체 화면 인터랙티브 지도 표시
 * - 네이비 테마 색상 스킴 적용
 * - 반응형 레이아웃 지원
 * - 실제 API 데이터 연동 (Task 6.2)
 * - 카테고리 필터링 지원 (Requirements 2.2)
 * - filterStore 전역 상태 사용 (Requirements 3.3)
 */
export default function Home() {
  // filterStore에서 필터 상태 가져오기
  const selectedCategories = useSelectedCategories()
  const searchQuery = useSearchQuery()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // 카테고리가 전부 해제되었는지 확인
  const isNoCategorySelected = selectedCategories.length === 0

  // 실제 API에서 스팟 데이터 가져오기 (카테고리 + 검색 필터 적용)
  // 카테고리가 전부 해제되면 API 호출하지 않음 (빈 결과 표시)
  const {
    data: spots,
    isLoading,
    error,
    refetch,
  } = useSpots(
    isNoCategorySelected ? undefined : selectedCategories,
    searchQuery || undefined,
    !isNoCategorySelected // 카테고리가 전부 해제되면 쿼리 비활성화
  )

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
      <main className="flex h-[calc(100vh-3.5rem)] flex-col bg-navy-900">
        <SpotLoadingSkeleton />
      </main>
    )
  }

  // 스팟 데이터 로딩 에러일 때
  if (error) {
    return (
      <main className="flex h-[calc(100vh-3.5rem)] flex-col bg-navy-900">
        <SpotErrorDisplay error={error} onRetry={() => refetch()} />
      </main>
    )
  }

  // 스팟 데이터가 없을 때 빈 배열 사용
  // 카테고리가 전부 해제되면 빈 배열 강제 적용
  const spotData = isNoCategorySelected ? [] : spots || []
  const spotCount = spotData.length

  // 빈 상태 확인:
  // 1. 검색어가 있고 결과가 없을 때
  // 2. 카테고리가 전부 해제되었을 때
  const isEmptySearchResult = searchQuery && spotCount === 0
  const isEmptyFilterResult = isNoCategorySelected

  return (
    <main className="flex h-[calc(100vh-3.5rem)] flex-col bg-navy-900">
      {/* 메인 지도 영역 - 전체 화면 인터랙티브 지도 */}
      <div className="relative flex-1 overflow-hidden">
        <PilgrimageMap
          initialCenter={[35.6762, 139.6503]} // 도쿄 중심 좌표
          initialZoom={6}
          className="h-full w-full"
          spots={spotData}
          onSpotSelect={handleSpotSelect}
        />

        {/* 검색 결과 없음 오버레이 (Requirements 3.4) */}
        {isEmptySearchResult && (
          <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
            <div className="pointer-events-auto rounded-xl bg-white/95 px-8 py-6 text-center shadow-xl backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-100">
                <svg
                  className="h-8 w-8 text-navy-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-navy-800">
                검색 결과가 없습니다
              </p>
              <p className="mt-2 text-sm text-navy-500">
                &quot;{searchQuery}&quot;에 해당하는 스팟을 찾을 수 없습니다
              </p>
              <p className="mt-1 text-xs text-navy-400">
                다른 검색어를 입력하거나 필터를 조정해 보세요
              </p>
            </div>
          </div>
        )}

        {/* 카테고리 필터 전체 해제 시 빈 상태 오버레이 */}
        {isEmptyFilterResult && !isEmptySearchResult && (
          <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
            <div className="pointer-events-auto rounded-xl bg-white/95 px-8 py-6 text-center shadow-xl backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-100">
                <svg
                  className="h-8 w-8 text-navy-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <p className="text-lg font-semibold text-navy-800">
                카테고리를 선택해주세요
              </p>
              <p className="mt-2 text-sm text-navy-500">
                표시할 스팟 카테고리가 선택되지 않았습니다
              </p>
              <p className="mt-1 text-xs text-navy-400">
                아래 필터에서 원하는 카테고리를 선택하세요
              </p>
            </div>
          </div>
        )}

        {/* 필터 영역 (하단 중앙 플로팅 바) */}
        <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
          <div className="flex items-center gap-2">
            {/* 콘텐츠 검색 필터 (토글 버튼) */}
            <ContentSearchFilter onExpandChange={setIsSearchExpanded} />
            {/* 카테고리 필터 - 검색창이 열리면 숨김 */}
            {!isSearchExpanded && (
              <div className="rounded-full bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
                <CategoryFilter />
              </div>
            )}
          </div>
        </div>

        {/* 데스크톱용 플로팅 정보 패널 */}
        <div className="absolute left-4 top-4 hidden rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm md:block">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-600 text-white">
              📍
            </div>
            <div>
              <p className="text-sm font-semibold text-navy-800">
                {spotCount}개의 특별한 여행지
              </p>
              <p className="text-xs text-navy-600">
                {spotCount > 0
                  ? '클릭하여 상세 정보를 확인하세요'
                  : '스팟 데이터를 불러오는 중...'}
              </p>
            </div>
          </div>
        </div>

        {/* 스팟 미리보기 툴팁 (지도 내부에 표시) */}
        <SpotPreview />
      </div>
    </main>
  )
}
