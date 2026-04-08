'use client'

/**
 * SkeletonUI 공통 컴포넌트
 * 로딩 중 스켈레톤 UI를 표시하여 체감 로딩 시간을 줄임
 *
 * @requirements 5.4
 */

interface SkeletonBaseProps {
  className?: string
}

/**
 * 기본 스켈레톤 블록
 * 다른 스켈레톤 컴포넌트의 빌딩 블록
 */
export function SkeletonBlock({ className = '' }: SkeletonBaseProps) {
  return (
    <div
      className={`animate-pulse rounded bg-neutral-200 dark:bg-neutral-700 ${className}`}
      role="status"
      aria-label="로딩 중"
    />
  )
}

/**
 * 스팟 카드 스켈레톤
 * 스팟 목록, 검색 결과 등에서 사용
 */
export function SpotCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-neutral-800">
      {/* 이미지 영역 */}
      <SkeletonBlock className="h-48 w-full rounded-none" />
      <div className="p-4">
        {/* 카테고리 배지 */}
        <SkeletonBlock className="mb-2 h-5 w-20" />
        {/* 제목 */}
        <SkeletonBlock className="mb-2 h-5 w-3/4" />
        {/* 주소 */}
        <SkeletonBlock className="h-4 w-1/2" />
      </div>
    </div>
  )
}

/**
 * 갤러리 카드 스켈레톤
 * 갤러리 피드, 명예의 전당 등에서 사용
 */
export function GalleryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-neutral-800">
      <SkeletonBlock className="h-48 w-full rounded-none" />
      <div className="p-3">
        <SkeletonBlock className="mb-2 h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
    </div>
  )
}

/**
 * 갤러리 그리드 스켈레톤
 * 갤러리 페이지 콘텐츠 영역에서 사용
 */
export function GalleryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <GalleryCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * 지도 스켈레톤
 * 메인 지도 페이지 로딩 시 사용
 */
export function MapSkeleton() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800"
      role="status"
      aria-label="지도 로딩 중"
    >
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-primary dark:border-neutral-600 dark:border-t-primary-400" />
        <p className="mt-4 text-neutral-500 dark:text-neutral-300">
          지도 로딩 중...
        </p>
      </div>
    </div>
  )
}

/**
 * 스팟 상세 페이지 스켈레톤
 * 스팟 상세 페이지 전체 로딩 시 사용
 */
export function SpotDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <div className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <SkeletonBlock className="h-5 w-32 bg-neutral-200" />
          <SkeletonBlock className="mt-2 h-6 w-40 bg-neutral-200" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* 스팟 정보 카드 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <SkeletonBlock className="mb-4 h-8 w-64 bg-neutral-200" />
            <SkeletonBlock className="mb-4 h-4 w-48 bg-neutral-200" />
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-full bg-neutral-200" />
              <SkeletonBlock className="h-4 w-3/4 bg-neutral-200" />
            </div>
          </div>

          {/* 사진 그리드 */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <SkeletonBlock className="mb-4 h-6 w-16 bg-neutral-200" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock
                  key={i}
                  className="aspect-video bg-neutral-200"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * 갤러리 페이지 전체 스켈레톤
 * 갤러리 페이지 초기 로딩 시 사용
 */
export function GalleryPageSkeleton() {
  return (
    <main className="min-h-screen bg-primary-50">
      {/* 헤더 */}
      <div className="border-b border-neutral-200 bg-white px-4 py-6">
        <div className="mx-auto max-w-6xl">
          <SkeletonBlock className="h-8 w-32" />
          <SkeletonBlock className="mt-2 h-4 w-48 bg-surface" />
          <div className="mt-4 flex gap-4">
            <SkeletonBlock className="h-6 w-24 bg-surface" />
            <SkeletonBlock className="h-6 w-24 bg-surface" />
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl gap-2">
          <SkeletonBlock className="h-10 w-28" />
          <SkeletonBlock className="h-10 w-28" />
          <SkeletonBlock className="h-10 w-28" />
        </div>
      </div>

      {/* 콘텐츠 그리드 */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <GalleryGridSkeleton />
      </div>
    </main>
  )
}
