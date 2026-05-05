'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  useSpotDetailSuspense,
  useNearbyFacilities,
} from '@/hooks/useSpotDetail'
import { SpotDetailData } from '@/hooks/useSpots'
import { NearbyFacility, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { useSpotDetailViewModel } from '@/hooks/useSpotDetailViewModel'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import NearbyFacilities from '@/components/spot/NearbyFacilities'
import { SpotContentSection } from '@/components/spot/SpotContentSection'
import { RelatedContentSection } from '@/components/spot/RelatedContentSection'
import { SpotCheckInSection } from '@/components/spot/SpotCheckInSection'
import { ContributorList } from '@/components/report/ContributorList'

const SupplementForm = dynamic(
  () =>
    import('@/components/report/SupplementForm').then(
      (mod) => mod.SupplementForm
    ),
  { loading: () => null }
)

const StatusReportForm = dynamic(
  () =>
    import('@/components/report/StatusReportForm').then(
      (mod) => mod.StatusReportForm
    ),
  { loading: () => null }
)
import { SpotStatusIndicator } from '@/components/report/SpotStatusIndicator'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import { CategoryIcon } from '@/components/common'
import { SpotDetailSkeleton as SpotDetailSkeletonUI } from '@/components/common/SkeletonUI'
import { AsyncBoundary } from '@/components/common/AsyncBoundary'
import SwipeableGallery from '@/components/mobile/SwipeableGallery'
import DirectionsButton from '@/components/common/DirectionsButton'
import { AppIcon } from '@/components/common/AppIcon'
import { blurPlaceholderProps } from '@/lib/image-utils'
import { RelatedRoutes } from '@/components/route/RelatedRoutes'
import { SameContentSpots } from '@/components/spot/SameContentSpots'
import {
  ArrowLeftIcon,
  MapPinIcon,
  AlertTriangleIcon,
} from '@/components/icons'
import ShareButton from '@/components/common/ShareButton'
import { formatSpotShareText } from '@/lib/share-utils'
import {
  getContentNamesFromRelations,
  getPrimaryContentName,
} from '@/lib/relation-utils'

// 지도 컴포넌트를 동적으로 로드 (SSR 방지)
const SpotDetailMap = dynamic(() => import('@/components/map/SpotDetailMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-100">
      <div className="text-center text-neutral-500">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <p>지도를 불러오는 중...</p>
      </div>
    </div>
  ),
})

/**
 * SpotDetailClient: AsyncBoundary로 감싸는 최상위 래퍼
 * pendingFallback으로 스켈레톤, rejectedFallback으로 에러 UI 표시
 * Requirements: 2.3, 2.5, 2.6
 */

/** SpotDetail 에러 fallback — 컴포넌트 외부 정의로 참조 안정성 확보 */
const SpotDetailErrorFallback = ({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) => <SpotDetailError error={error} onRetry={reset} />

export default function SpotDetailClient() {
  const params = useParams()
  const spotId = params.id as string

  return (
    <AsyncBoundary
      pendingFallback={<SpotDetailSkeletonUI />}
      rejectedFallback={SpotDetailErrorFallback}
    >
      <SpotDetailInner spotId={spotId} />
    </AsyncBoundary>
  )
}

/**
 * SpotDetailInner: useSuspenseQuery로 데이터를 가져오는 내부 컴포넌트
 * AsyncBoundary 내부에서만 사용 — 로딩/에러 상태는 경계로 위임
 */
function SpotDetailInner({ spotId }: { spotId: string }) {
  const { data: spot } = useSpotDetailSuspense(spotId)
  const { data: facilities = [] } = useNearbyFacilities(spotId)

  if (!spot) {
    return <SpotNotFound />
  }

  return <SpotDetailPage spot={spot} spotId={spotId} facilities={facilities} />
}

interface SpotDetailPageProps {
  spot: SpotDetailData
  spotId: string
  facilities: NearbyFacility[]
}

/**
 * SpotDetailPage: spot 데이터가 확정된 후 ViewModel을 사용하는 래퍼
 * useSpotDetailViewModel은 authorId가 필요하므로 spot 로드 후 호출
 */
function SpotDetailPage({ spot, spotId, facilities }: SpotDetailPageProps) {
  const {
    hasEditPermission,
    hasDeletePermission,
    isDeleting,
    handleDelete,
    showSupplementForm,
    handleSupplementClick,
    handleSupplementSuccess,
    closeSupplementForm,
    showStatusReportForm,
    handleStatusReportClick,
    closeStatusReportForm,
    showLoginModal,
    loginModalContext,
    supplementKey,
  } = useSpotDetailViewModel({ spotId, authorId: spot.authorId })

  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* 페이지 타이틀 */}
      <div className="border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="flex items-center gap-2 text-primary hover:text-primary-600"
              >
                <ArrowLeftIcon size="md" />
                <span>지도로 돌아가기</span>
              </Link>
              <h1 className="text-text-primary mt-2 text-xl font-bold">
                특별한 여행지
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* 공유 버튼 */}
              <ShareButton
                title={spot.name}
                text={formatSpotShareText(
                  spot.name,
                  getPrimaryContentName(spot.relations, spot.relatedContent)
                )}
                variant="icon"
              />

              {/* 수정/삭제 버튼 - 관리자 또는 본인 스팟인 경우 표시 */}
              {(hasEditPermission || hasDeletePermission) && (
                <div className="flex gap-2">
                  {hasEditPermission && (
                    <Link
                      href={`/spots/${spotId}/edit`}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-50"
                    >
                      수정
                    </Link>
                  )}
                  {hasDeletePermission && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? '삭제 중...' : '삭제'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SpotDetailContent
          spot={spot}
          facilities={facilities}
          showSupplementForm={showSupplementForm}
          handleSupplementClick={handleSupplementClick}
          handleSupplementSuccess={handleSupplementSuccess}
          closeSupplementForm={closeSupplementForm}
          showStatusReportForm={showStatusReportForm}
          handleStatusReportClick={handleStatusReportClick}
          closeStatusReportForm={closeStatusReportForm}
          showLoginModal={showLoginModal}
          loginModalContext={loginModalContext}
          supplementKey={supplementKey}
          router={router}
        />
      </main>
    </div>
  )
}

interface SpotDetailContentProps {
  spot: SpotDetailData
  facilities: NearbyFacility[]
  showSupplementForm: boolean
  handleSupplementClick: () => void
  handleSupplementSuccess: () => void
  closeSupplementForm: () => void
  showStatusReportForm: boolean
  handleStatusReportClick: () => void
  closeStatusReportForm: () => void
  showLoginModal: boolean
  loginModalContext: 'supplement' | 'status'
  supplementKey: number
  router: ReturnType<typeof useRouter>
}

function SpotDetailContent({
  spot,
  facilities,
  showSupplementForm,
  handleSupplementClick,
  handleSupplementSuccess,
  closeSupplementForm,
  showStatusReportForm,
  handleStatusReportClick,
  closeStatusReportForm,
  showLoginModal,
  loginModalContext,
  supplementKey,
  router,
}: SpotDetailContentProps) {
  const categoryConfig = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]
    : null

  return (
    <div className="space-y-8">
      {/* 모바일: SwipeableGallery (edge-to-edge, 패딩 없음) */}
      {spot.photos && spot.photos.length > 0 && (
        <div className="-mx-4 -mt-8 sm:-mx-6 md:hidden">
          <SwipeableGallery images={spot.photos} />
        </div>
      )}

      {/* Spot Header - 모바일 최적화 */}
      <div className="overflow-hidden rounded-lg bg-surface shadow-md">
        <div className="p-4 md:p-6">
          {/* 카테고리 배지 */}
          {categoryConfig && (
            <div className="mb-2 md:mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: categoryConfig.bgColor,
                  color: categoryConfig.fgColor,
                }}
              >
                <CategoryIcon
                  category={spot.category as SpotCategory}
                  size="2xl"
                />
                <span>{categoryConfig.label}</span>
              </span>
            </div>
          )}
          <h1 className="mb-2 text-2xl font-bold text-main-text md:mb-4 md:text-3xl">
            {spot.name}
          </h1>

          {/* 스팟 상태 표시 */}
          {spot.spotStatus && spot.spotStatus !== 'normal' && (
            <div className="mb-2 md:mb-3">
              <SpotStatusIndicator status={spot.spotStatus} size="md" />
            </div>
          )}

          {/* 최초 제보자 표시 */}
          {spot.firstReporterId && spot.firstReporterName && (
            <p className="mb-2 flex items-center gap-1 text-sm text-sub-text md:mb-3">
              <AppIcon name="location" size={16} />
              최초 제보:{' '}
              <Link
                href={`/profile/${spot.firstReporterId}`}
                className="font-medium text-primary hover:underline"
              >
                @{spot.firstReporterName}
              </Link>
            </p>
          )}

          {/* 주소 + 길찾기 버튼 */}
          <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
            <div className="flex min-w-0 items-center text-sub-text">
              <span className="mr-1.5 flex-shrink-0 md:mr-2">
                <MapPinIcon size="md" />
              </span>
              <span className="truncate text-sm md:text-base">
                {spot.address}
              </span>
            </div>
            {spot.coordinates && (
              <DirectionsButton
                lat={spot.coordinates[0]}
                lng={spot.coordinates[1]}
                destinationName={spot.name}
                className="flex-shrink-0"
              />
            )}
          </div>

          <p className="text-sm leading-relaxed text-sub-text md:text-base">
            {spot.description}
          </p>
        </div>

        {/* 데스크탑: 기존 그리드 사진 레이아웃 (카드 내부) */}
        {spot.photos && spot.photos.length > 0 && (
          <div className="hidden border-t border-border p-6 md:block">
            <h2 className="mb-4 text-2xl font-bold text-main-text">사진</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {spot.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <Image
                    src={photo}
                    alt={`${spot.name} 사진 ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    priority={index === 0}
                    unoptimized={photo.startsWith('http')}
                    {...(index === 0 ? {} : blurPlaceholderProps)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category-specific Content Section */}
      <SpotContentSection
        spotId={spot.id}
        category={(spot.category as SpotCategory) || 'other'}
        externalLinks={spot.externalLinks}
      />

      {/* Location Map */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
        <div className="p-6">
          <h2 className="text-text-primary mb-4 text-2xl font-bold">
            위치 및 근처 편의시설
          </h2>
          <div className="h-96 w-full overflow-hidden rounded-lg border border-border">
            <SpotDetailMap spot={spot} facilities={facilities} />
          </div>
          {facilities.length > 0 && (
            <div className="mt-4">
              <p className="text-text-secondary text-sm">
                근처 편의시설 {facilities.length}개가 표시됩니다. 마커를
                클릭하면 상세 정보를 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Facilities and Check-in Section - 2 column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <NearbyFacilities
          facilities={facilities}
          spotId={spot.id}
          spotCoordinates={
            spot.coordinates
              ? { lat: spot.coordinates[0], lng: spot.coordinates[1] }
              : undefined
          }
        />
        <SpotCheckInSection
          spotId={spot.id}
          spotName={spot.name}
          sceneImageUrl={spot.photos?.[0]}
        />
      </div>

      {/* 정보 보완 섹션 */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-text-primary text-lg font-bold md:text-xl">
              정보 보완
            </h2>
            <button
              onClick={handleSupplementClick}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              {showSupplementForm ? '닫기' : '정보 수정 제안'}
            </button>
          </div>

          {showSupplementForm && (
            <div className="mb-4 rounded-lg border border-primary-100 p-4">
              <SupplementForm
                spotId={spot.id}
                onSuccess={handleSupplementSuccess}
                onCancel={closeSupplementForm}
              />
            </div>
          )}

          <ContributorList key={supplementKey} spotId={spot.id} />
        </div>
      </div>

      {/* 스팟 상태 신고 섹션 */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-text-primary text-lg font-bold md:text-xl">
              현재 상태 신고
            </h2>
            <button
              onClick={handleStatusReportClick}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              {showStatusReportForm ? '닫기' : '상태 신고'}
            </button>
          </div>

          {spot.spotStatus && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-text-secondary text-sm">현재 상태:</span>
              <SpotStatusIndicator status={spot.spotStatus} />
            </div>
          )}

          {showStatusReportForm && (
            <div className="rounded-lg border border-amber-100 p-4">
              <StatusReportForm
                spotId={spot.id}
                onSuccess={closeStatusReportForm}
                onCancel={closeStatusReportForm}
              />
            </div>
          )}
        </div>
      </div>

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        title="로그인이 필요합니다"
        description={
          loginModalContext === 'status'
            ? '상태 신고를 하려면 로그인이 필요합니다.'
            : '정보 보완 제보를 하려면 로그인이 필요합니다.'
        }
        onConfirm={() => router.push('/auth/signin')}
      />

      {/* 같은 작품의 다른 스팟 (Requirements 6.1, 6.2, 6.3) */}
      {((spot.relations && spot.relations.length > 0) ||
        (spot.relatedContent && spot.relatedContent.length > 0)) && (
        <SameContentSpots
          currentSpotId={spot.id}
          relations={spot.relations || []}
          relatedContent={spot.relatedContent}
        />
      )}

      {/* 관련 순례 코스 */}
      {((spot.relations && spot.relations.length > 0) ||
        (spot.relatedContent && spot.relatedContent.length > 0)) && (
        <RelatedRoutes
          contentNames={getContentNamesFromRelations(
            spot.relations,
            spot.relatedContent
          )}
        />
      )}

      {/* Related Content - 맨 아래 */}
      <RelatedContentSection
        relations={spot.relations || []}
        contents={spot.relatedContent || []}
      />
    </div>
  )
}

interface SpotDetailErrorProps {
  error: Error
  onRetry?: () => void
}

function SpotDetailError({ error, onRetry }: SpotDetailErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-4 w-full max-w-md rounded-lg bg-surface p-8 shadow-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center text-red-500">
            <AlertTriangleIcon size={64} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-primary">
            오류가 발생했습니다
          </h2>
          <p className="mb-4 text-secondary dark:text-secondary-400">
            {error.message}
          </p>
          <div className="flex justify-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-600"
              >
                다시 시도
              </button>
            )}
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-primary transition-colors hover:bg-primary-50"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpotNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-4 w-full max-w-md rounded-lg bg-surface p-8 shadow-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center text-neutral-400">
            <MapPinIcon size={64} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-primary">
            스팟을 찾을 수 없습니다
          </h2>
          <p className="mb-4 text-secondary dark:text-secondary-400">
            요청하신 스팟이 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-600"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
