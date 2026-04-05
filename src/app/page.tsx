'use client'

import { AppIcon } from '@/components/common/AppIcon'
import dynamic from 'next/dynamic'
import { useSpotsSuspense } from '@/hooks/useSpots'
import CategoryFilter from '@/components/map/CategoryFilter'
import ContentSearchFilter from '@/components/map/ContentSearchFilter'
import { useSelectedCategories, useSearchQuery } from '@/stores/filterStore'
import { MapSkeleton } from '@/components/common/SkeletonUI'
import { SpotLoadingSkeleton } from '@/components/common/SpotLoadingSkeleton'
import { SpotErrorDisplay } from '@/components/common/SpotErrorDisplay'
import { EmptySearchOverlay } from '@/components/common/EmptySearchOverlay'
import { EmptyFilterOverlay } from '@/components/common/EmptyFilterOverlay'
import { AsyncBoundary } from '@/components/common/AsyncBoundary'

// Leaflet은 SSR을 지원하지 않으므로 dynamic import 사용
const PilgrimageMap = dynamic(() => import('@/components/map/PilgrimageMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

/** Home 에러 fallback — 컴포넌트 외부 정의로 참조 안정성 확보 */
const HomeErrorFallback = ({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) => <SpotErrorDisplay error={error} onRetry={reset} />

/**
 * 메인 페이지 컴포넌트
 * Requirements 1.1, 1.4, 2.1, 2.2를 만족하는 지도 기반 메인 페이지
 * - AsyncBoundary로 선언적 로딩/에러 처리
 * - 카테고리 필터링 지원
 * - filterStore 전역 상태 사용
 */
export default function Home() {
  return (
    <main className="flex h-[calc(100vh-3.5rem)] flex-col bg-neutral-900">
      <AsyncBoundary
        pendingFallback={<SpotLoadingSkeleton />}
        rejectedFallback={HomeErrorFallback}
      >
        <HomeContent />
      </AsyncBoundary>
    </main>
  )
}

/**
 * 메인 페이지 내부 콘텐츠 컴포넌트
 * AsyncBoundary 내부에서만 사용 — 로딩/에러 상태는 경계로 위임
 * useSuspenseQuery를 통해 데이터가 있는 상태만 다룬다
 */
function HomeContent() {
  // filterStore에서 필터 상태 가져오기
  const selectedCategories = useSelectedCategories()
  const searchQuery = useSearchQuery()
  // 카테고리가 전부 해제되었는지 확인
  const isNoCategorySelected = selectedCategories.length === 0

  // useSuspenseQuery로 스팟 데이터 가져오기 (카테고리 + 검색 필터 적용)
  // 카테고리가 전부 해제되면 빈 배열 사용 (쿼리는 전체 조회)
  const { data: spots } = useSpotsSuspense(
    isNoCategorySelected ? undefined : selectedCategories,
    searchQuery || undefined
  )

  /**
   * 스팟 선택 핸들러
   * 현재는 콘솔 로그만 출력하며, 향후 상세 페이지 네비게이션으로 확장 예정
   */
  const handleSpotSelect = (spotId: string) => {
    // eslint-disable-next-line no-console
    console.log('Selected spot:', spotId)
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
    <div className="relative flex-1 overflow-hidden">
      <PilgrimageMap
        initialCenter={[35.6762, 139.6503]} // 도쿄 중심 좌표
        initialZoom={6}
        className="h-full w-full"
        spots={spotData}
        onSpotSelect={handleSpotSelect}
      />

      {/* 검색 결과 없음 오버레이 (Requirements 3.4) */}
      {isEmptySearchResult && <EmptySearchOverlay searchQuery={searchQuery} />}

      {/* 카테고리 필터 전체 해제 시 빈 상태 오버레이 */}
      {isEmptyFilterResult && !isEmptySearchResult && <EmptyFilterOverlay />}

      {/* 필터 영역 (상단 통합 바) — Requirements 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4 */}
      <div className="absolute left-0 right-0 top-0 z-[1000]">
        <div className="flex items-center bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm dark:bg-neutral-900/95">
          <ContentSearchFilter />
          <div className="mx-2 h-8 w-px flex-shrink-0 bg-neutral-300 dark:bg-neutral-700" />
          <div className="min-w-0 flex-1">
            <CategoryFilter />
          </div>
        </div>
      </div>

      {/* 데스크톱용 플로팅 정보 패널 */}
      <div className="absolute bottom-4 left-4 hidden rounded-lg bg-white/90 p-4 shadow-lg backdrop-blur-sm dark:bg-neutral-900/90 md:block">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-white">
            <AppIcon name="location" size="lg" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary dark:text-primary-400">
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
