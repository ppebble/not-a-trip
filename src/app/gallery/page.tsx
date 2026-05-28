'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { GalleryContent } from '@/components/gallery/GalleryContent'
import { FloatingActionButton } from '@/components/gallery/FloatingActionButton'
import { GalleryHeader } from '@/components/gallery/GalleryHeader'
import { GalleryTabs } from '@/components/gallery/GalleryTabs'
import { Spot, UserBadge } from '@/types'
import {
  GalleryPageSkeleton as GalleryPageSkeletonUI,
  GalleryGridSkeleton,
} from '@/components/common/SkeletonUI'
import { useOnboarding } from '@/hooks/useOnboarding'
import { GALLERY_PAGE_STEPS } from '@/lib/tour-config'
import { useGalleryStats } from '@/hooks/useGalleryQueries'

const SpotSearchModal = dynamic(
  () =>
    import('@/components/gallery/SpotSearchModal').then(
      (mod) => mod.SpotSearchModal
    ),
  { loading: () => null }
)

const CheckInModal = dynamic(
  () =>
    import('@/components/checkin/CheckInModal').then((mod) => mod.CheckInModal),
  { loading: () => null }
)

const BadgeEarnedModal = dynamic(
  () =>
    import('@/components/checkin/BadgeEarnedModal').then(
      (mod) => mod.BadgeEarnedModal
    ),
  { loading: () => null }
)

const OnboardingTour = dynamic(
  () => import('@/components/common/OnboardingTour'),
  { loading: () => null }
)

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
  const { isActive, currentStep, next, skip, dismiss } = useOnboarding(
    GALLERY_PAGE_STEPS,
    'gallery'
  )

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
      <GalleryHeaderWithStats />

      <GalleryTabs activeTab={activeTab} />

      {/* GalleryContent 컴포넌트 영역 (Task 3.2에서 구현) */}
      <Suspense fallback={<ContentSkeleton />}>
        <GalleryContentPlaceholder
          activeTab={activeTab}
          selectedContent={selectedContent}
        />
      </Suspense>

      {/* FloatingActionButton - 순례 인증 시작 */}
      <FloatingActionButton
        onClick={handleFloatingButtonClick}
        data-tour="upload-checkin"
      />

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

      {/* OnboardingTour - 신규 사용자 가이드 */}
      <OnboardingTour
        steps={GALLERY_PAGE_STEPS}
        isActive={isActive}
        currentStep={currentStep}
        onNext={next}
        onSkip={skip}
        onComplete={skip}
        onDismiss={dismiss}
      />
    </main>
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

function GalleryHeaderWithStats() {
  const { data, isLoading, isError } = useGalleryStats()

  return (
    <GalleryHeader
      totalCheckIns={data?.totalCheckIns ?? 0}
      todayCheckIns={data?.todayCheckIns ?? 0}
      isLoading={isLoading}
      isError={isError}
    />
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
