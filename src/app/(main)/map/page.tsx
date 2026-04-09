'use client'

import { AppIcon } from '@/components/common/AppIcon'
import dynamic from 'next/dynamic'
import { useSpots } from '@/hooks/useSpots'
import CategoryFilter from '@/components/map/CategoryFilter'
import ContentSearchFilter from '@/components/map/ContentSearchFilter'
import { useSelectedCategories, useSearchQuery } from '@/stores/filterStore'
import { MapSkeleton } from '@/components/common/SkeletonUI'
import { SpotLoadingSkeleton } from '@/components/common/SpotLoadingSkeleton'
import { SpotErrorDisplay } from '@/components/common/SpotErrorDisplay'
import { EmptySearchOverlay } from '@/components/common/EmptySearchOverlay'
import { EmptyFilterOverlay } from '@/components/common/EmptyFilterOverlay'

// Leaflet은 SSR을 지원하지 않으므로 dynamic import 사용
const PilgrimageMap = dynamic(() => import('@/components/map/PilgrimageMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

/**
 * 지도 메인 페이지 컴포넌트 (/map)
 * Requirements 1.1, 1.4, 2.1, 2.2를 만족하는 지도 기반 메인 페이지
 * - useQuery로 필터 변경 시 지도 유지 (번쩍임 방지)
 * - 카테고리 필터링 지원
 * - filterStore 전역 상태 사용
 */
export default function MapPage() {
  return (
    <main className="flex h-[calc(100vh-3.5rem)] flex-col bg-background">
      <MapContent />
    </main>
  )
}

/**
 * 지도 페이지 내부 콘텐츠 컴포넌트
 * useQuery를 사용하여 필터 변경 시 지도가 유지되고 로딩 인디케이터만 표시
 */
function MapContent() {
  const selectedCategories = useSelectedCategories()
  const searchQuery = useSearchQuery()
  const isNoCategorySelected = selectedCategories.length === 0

  const {
    data: spots,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useSpots(
    isNoCategorySelected ? undefined : selectedCategories,
    searchQuery || undefined
  )

  // 초기 로딩 (데이터가 아직 없을 때)
  if (isLoading) {
    return <SpotLoadingSkeleton />
  }

  // 에러 상태
  if (isError) {
    return <SpotErrorDisplay error={error} onRetry={() => refetch()} />
  }

  const spotData = isNoCategorySelected ? [] : spots || []
  const spotCount = spotData.length

  const isEmptySearchResult = searchQuery && spotCount === 0
  const isEmptyFilterResult = isNoCategorySelected

  const handleSpotSelect = (spotId: string) => {
    // eslint-disable-next-line no-console
    console.log('Selected spot:', spotId)
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <PilgrimageMap
        initialCenter={[35.6762, 139.6503]}
        initialZoom={6}
        className="h-full w-full"
        spots={spotData}
        onSpotSelect={handleSpotSelect}
      />

      {isEmptySearchResult && <EmptySearchOverlay searchQuery={searchQuery} />}
      {isEmptyFilterResult && !isEmptySearchResult && <EmptyFilterOverlay />}

      {/* 필터 영역 (상단 통합 바) */}
      <div className="absolute left-0 right-0 top-0 z-[1000]">
        <div className="flex items-center border-b border-neutral-200 bg-surface/95 px-4 py-3 shadow-sm backdrop-blur-sm">
          <ContentSearchFilter />
          <div className="mx-2 h-8 w-px flex-shrink-0 bg-neutral-300" />
          <div className="min-w-0 flex-1">
            <CategoryFilter />
          </div>
        </div>
        {/* 필터 변경 시 얇은 로딩 프로그레스 바 */}
        {(isFetching || isPlaceholderData) && (
          <div className="h-0.5 w-full overflow-hidden bg-neutral-200">
            <div className="animate-loading-bar h-full w-1/3 bg-primary" />
          </div>
        )}
      </div>

      {/* 데스크톱용 플로팅 정보 패널 */}
      <div className="absolute bottom-4 left-4 hidden rounded-lg bg-surface/90 p-4 shadow-lg backdrop-blur-sm md:block">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-white">
            <AppIcon name="location" size="lg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">
              {spotCount}개의 특별한 여행지
            </p>
            <p className="text-xs text-secondary dark:text-neutral-400">
              {spotCount > 0
                ? '클릭하여 상세 정보를 확인하세요'
                : '스팟 데이터를 불러오는 중...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
