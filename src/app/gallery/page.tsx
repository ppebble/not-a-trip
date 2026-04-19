'use client'

import { Suspense, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { GalleryContent } from '@/components/gallery/GalleryContent'
import { FloatingActionButton } from '@/components/gallery/FloatingActionButton'
import { SpotSearchModal } from '@/components/gallery/SpotSearchModal'
import { CheckInModal } from '@/components/checkin/CheckInModal'
import { BadgeEarnedModal } from '@/components/checkin/BadgeEarnedModal'
import { Spot, UserBadge } from '@/types'
import {
  GalleryPageSkeleton as GalleryPageSkeletonUI,
  SkeletonBlock,
  GalleryGridSkeleton,
} from '@/components/common/SkeletonUI'

/**
 * 갤러리 탭 타입
 */
type GalleryTab = 'feed' | 'hall-of-fame' | 'content'

/**
 * 순례 갤러리 메인 페이지
 * Requirements 1.2: /gallery 라우트로 갤러리 페이지 접근
 */
export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryPageSkeleton />}>
      <GalleryPageContent />
    </Suspense>
  )
}

/**
 * 갤러리 페이지 로딩 스켈레톤
 */
function GalleryPageSkeleton() {
  return <GalleryPageSkeletonUI />
}

/**
 * 갤러리 페이지 실제 콘텐츠
 * GalleryHeader, GalleryTabs, GalleryContent, FloatingActionButton 컴포넌트를 통합
 */
function GalleryPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 현재 활성 탭 (기본값: feed)
  const tabParam = searchParams.get('tab')
  const activeTab: GalleryTab =
    tabParam === 'feed' || tabParam === 'hall-of-fame' || tabParam === 'content'
      ? tabParam
      : 'feed'
  // 작품별 탭에서 선택된 작품명
  const selectedContent = searchParams.get('content') || undefined

  // 인증 플로우 상태 관리
  const [isSpotSearchOpen, setIsSpotSearchOpen] = useState(false)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([])
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false)

  // 플로팅 버튼 클릭 → 스팟 검색 모달 열기
  const handleFloatingButtonClick = useCallback(() => {
    setIsSpotSearchOpen(true)
  }, [])

  // 스팟 선택 → 체크인 모달 열기
  const handleSpotSelect = useCallback((spot: Spot) => {
    setSelectedSpot(spot)
    setIsSpotSearchOpen(false)
    setIsCheckInOpen(true)
  }, [])

  // 체크인 성공 처리
  const handleCheckInSuccess = useCallback(
    (badges?: UserBadge[]) => {
      setIsCheckInOpen(false)
      setSelectedSpot(null)

      // 뱃지 획득 시 모달 표시
      if (badges && badges.length > 0) {
        setEarnedBadges(badges)
        setIsBadgeModalOpen(true)
      }

      // 피드 새로고침을 위해 페이지 리로드
      router.refresh()
    },
    [router]
  )

  // 체크인 모달 닫기
  const handleCheckInClose = useCallback(() => {
    setIsCheckInOpen(false)
    setSelectedSpot(null)
  }, [])

  // 뱃지 모달 닫기
  const handleBadgeModalClose = useCallback(() => {
    setIsBadgeModalOpen(false)
    setEarnedBadges([])
  }, [])

  return (
    <main className="min-h-screen bg-surface">
      {/* GalleryHeader 컴포넌트 영역 (Task 2.1에서 구현) */}
      <Suspense fallback={<HeaderSkeleton />}>
        <GalleryHeaderPlaceholder />
      </Suspense>

      {/* GalleryTabs 컴포넌트 영역 (Task 3.1에서 구현) */}
      <Suspense fallback={<TabsSkeleton />}>
        <GalleryTabsPlaceholder activeTab={activeTab} />
      </Suspense>

      {/* GalleryContent 컴포넌트 영역 (Task 3.2에서 구현) */}
      <Suspense fallback={<ContentSkeleton />}>
        <GalleryContentPlaceholder
          activeTab={activeTab}
          selectedContent={selectedContent}
        />
      </Suspense>

      {/* FloatingActionButton - 순례 인증 시작 */}
      <FloatingActionButton onClick={handleFloatingButtonClick} />

      {/* SpotSearchModal - 스팟 검색 */}
      <SpotSearchModal
        isOpen={isSpotSearchOpen}
        onClose={() => setIsSpotSearchOpen(false)}
        onSelectSpot={handleSpotSelect}
      />

      {/* CheckInModal - 인증샷 업로드 */}
      {selectedSpot && (
        <CheckInModal
          isOpen={isCheckInOpen}
          onClose={handleCheckInClose}
          spotId={selectedSpot.id}
          spotName={selectedSpot.name}
          onSuccess={handleCheckInSuccess}
        />
      )}

      {/* BadgeEarnedModal - 뱃지 획득 알림 */}
      {isBadgeModalOpen && earnedBadges.length > 0 && (
        <BadgeEarnedModal
          onClose={handleBadgeModalClose}
          badges={earnedBadges}
        />
      )}
    </main>
  )
}

/**
 * 헤더 스켈레톤
 */
function HeaderSkeleton() {
  return (
    <div className="border-b border-neutral-200 bg-surface px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <SkeletonBlock className="h-8 w-32" />
        <SkeletonBlock className="mt-2 h-4 w-48 bg-surface" />
      </div>
    </div>
  )
}

/**
 * 탭 스켈레톤
 */
function TabsSkeleton() {
  return (
    <div className="border-b border-neutral-200 bg-surface px-4 py-3">
      <div className="mx-auto flex max-w-6xl gap-2">
        <SkeletonBlock className="h-10 w-28" />
        <SkeletonBlock className="h-10 w-28" />
        <SkeletonBlock className="h-10 w-28" />
      </div>
    </div>
  )
}

/**
 * 콘텐츠 스켈레톤
 */
function ContentSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <GalleryGridSkeleton count={4} />
    </div>
  )
}

/**
 * GalleryHeader 플레이스홀더
 * Task 2.1에서 실제 컴포넌트로 교체 예정
 * Requirements 5.1, 5.2, 5.3
 */
function GalleryHeaderPlaceholder() {
  return (
    <div className="border-b border-neutral-200 bg-surface px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-main-text">순례 인증</h1>
        <p className="mt-1 text-sm text-sub-text">오타쿠들의 발자취</p>
        {/* 통계 영역 - Task 2.1에서 실제 데이터로 교체 */}
        <div className="mt-4 flex gap-6">
          <div className="text-sm text-sub-text">
            <span className="font-semibold text-main-text">총 인증</span>{' '}
            <span className="text-neutral-400">--</span>
          </div>
          <div className="text-sm text-sub-text">
            <span className="font-semibold text-main-text">오늘 인증</span>{' '}
            <span className="text-neutral-400">--</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * GalleryTabs 플레이스홀더
 * Task 3.1에서 실제 컴포넌트로 교체 예정
 * Requirements 3.1
 */
function GalleryTabsPlaceholder({
  activeTab,
}: {
  activeTab: 'feed' | 'hall-of-fame' | 'content'
}) {
  const tabs = [
    { id: 'feed', label: '실시간 피드' },
    { id: 'hall-of-fame', label: '명예의 전당' },
    { id: 'content', label: '작품별' },
  ] as const

  return (
    <div className="sticky top-0 z-10 border-b border-neutral-200 bg-surface px-4 py-3">
      <div className="mx-auto flex max-w-6xl gap-2" role="tablist">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={`/gallery?tab=${tab.id}`}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-primary-50 text-secondary hover:bg-surface'
            }`}
            aria-selected={activeTab === tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`tabpanel-${tab.id}`}
          >
            {tab.label}
          </a>
        ))}
      </div>
    </div>
  )
}

/**
 * GalleryContent 플레이스홀더
 * Task 3.2에서 실제 컴포넌트로 교체 예정
 * Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */
function GalleryContentPlaceholder({
  activeTab,
  selectedContent,
}: {
  activeTab: 'feed' | 'hall-of-fame' | 'content'
  selectedContent?: string
}) {
  return (
    <GalleryContent activeTab={activeTab} selectedContent={selectedContent} />
  )
}
