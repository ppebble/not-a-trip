'use client'

import { useParams } from 'next/navigation'
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
const QualityReportForm = dynamic(
  () =>
    import('@/components/report/QualityReportForm').then(
      (mod) => mod.QualityReportForm
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
import { useSearchParams } from 'next/navigation'

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
    showQualityReportForm,
    handleQualityReportClick,
    closeQualityReportForm,
    showLoginModal,
    loginModalContext,
    supplementKey,
  } = useSpotDetailViewModel({ spotId, authorId: spot.authorId })

  const searchParams = useSearchParams()
  // ?content=작품명 으로 진입 컨텍스트 전달 (작품 허브 → 스팟 상세 이동 시)
  const contentContext = searchParams.get('content') || undefined

  return (
    <div className="min-h-screen bg-background">
      {/* 페이지 타이틀 */}
      <div className="border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/map"
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
          contentContext={contentContext}
          showSupplementForm={showSupplementForm}
          handleSupplementClick={handleSupplementClick}
          handleSupplementSuccess={handleSupplementSuccess}
          closeSupplementForm={closeSupplementForm}
          showStatusReportForm={showStatusReportForm}
          handleStatusReportClick={handleStatusReportClick}
          closeStatusReportForm={closeStatusReportForm}
          showQualityReportForm={showQualityReportForm}
          handleQualityReportClick={handleQualityReportClick}
          closeQualityReportForm={closeQualityReportForm}
          showLoginModal={showLoginModal}
          loginModalContext={loginModalContext}
          supplementKey={supplementKey}
        />
      </main>
    </div>
  )
}

interface SpotDetailContentProps {
  spot: SpotDetailData
  facilities: NearbyFacility[]
  /** 진입 컨텍스트 작품명 (?content= 쿼리 파라미터) */
  contentContext?: string
  showSupplementForm: boolean
  handleSupplementClick: () => void
  handleSupplementSuccess: () => void
  closeSupplementForm: () => void
  showStatusReportForm: boolean
  handleStatusReportClick: () => void
  closeStatusReportForm: () => void
  showQualityReportForm: boolean
  handleQualityReportClick: () => void
  closeQualityReportForm: () => void
  showLoginModal: boolean
  loginModalContext: 'supplement' | 'status' | 'quality'
  supplementKey: number
}

function SpotDetailContent({
  spot,
  facilities,
  contentContext,
  showSupplementForm,
  handleSupplementClick,
  handleSupplementSuccess,
  closeSupplementForm,
  showStatusReportForm,
  handleStatusReportClick,
  closeStatusReportForm,
  showQualityReportForm,
  handleQualityReportClick,
  closeQualityReportForm,
  showLoginModal,
  loginModalContext,
  supplementKey,
}: SpotDetailContentProps) {
  const categoryConfig = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]
    : null

  // 진입 컨텍스트에 맞는 relation summary 조회
  const contextRelation = contentContext
    ? spot.relations?.find(
        (r) =>
          r.contentName.toLowerCase() === contentContext.toLowerCase() &&
          r.summary
      )
    : undefined

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

          {(spot.closureSuspected ||
            spot.lifecycleStatus === 'closed' ||
            (spot.pendingSupplementCount ?? 0) > 0 ||
            spot.urgentReviewRequired) && (
            <div className="mb-3 space-y-2">
              {spot.lifecycleStatus === 'closed' && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  이 스팟은 폐업/폐쇄가 확인된 상태입니다.
                </div>
              )}
              {spot.closureSuspected && spot.lifecycleStatus !== 'closed' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  폐업 여부 확인 중입니다. 방문 전 최신 정보를 꼭 확인해 주세요.
                </div>
              )}
              {(spot.pendingSupplementCount ?? 0) > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  보완 요청 {spot.pendingSupplementCount}건이 진행 중입니다.
                </div>
              )}
              {spot.urgentReviewRequired && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-700">
                  동일 유형 신고가 누적되어 관리자 긴급 검토가 필요합니다.
                </div>
              )}
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

          {/* 진입 컨텍스트 작품별 설명 (relation summary) */}
          {contextRelation && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="mb-1 text-xs font-medium text-primary">
                「{contextRelation.contentName}」 관련 설명
              </p>
              <p className="text-sm leading-relaxed text-main-text">
                {contextRelation.summary}
              </p>
            </div>
          )}
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

      <SpotReportHub
        spot={spot}
        showSupplementForm={showSupplementForm}
        showStatusReportForm={showStatusReportForm}
        showQualityReportForm={showQualityReportForm}
        handleSupplementClick={handleSupplementClick}
        handleSupplementSuccess={handleSupplementSuccess}
        closeSupplementForm={closeSupplementForm}
        handleStatusReportClick={handleStatusReportClick}
        closeStatusReportForm={closeStatusReportForm}
        handleQualityReportClick={handleQualityReportClick}
        closeQualityReportForm={closeQualityReportForm}
        supplementKey={supplementKey}
      />

      {/* 로그인 필요 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        title="로그인이 필요합니다"
        description={
          loginModalContext === 'status'
            ? '상태 신고를 하려면 로그인이 필요합니다.'
            : loginModalContext === 'quality'
              ? '품질 신고를 하려면 로그인이 필요합니다.'
              : '정보 보완 제보를 하려면 로그인이 필요합니다.'
        }
      />

      {/* 같은 작품의 다른 스팟 (Requirements 6.1, 6.2, 6.3) */}
      {((spot.relations && spot.relations.length > 0) ||
        (spot.relatedContent && spot.relatedContent.length > 0)) && (
        <SameContentSpots
          currentSpotId={spot.id}
          relations={spot.relations || []}
          relatedContent={spot.relatedContent}
          contextContentName={contentContext}
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

interface SpotReportHubProps {
  spot: SpotDetailData
  showSupplementForm: boolean
  showStatusReportForm: boolean
  showQualityReportForm: boolean
  handleSupplementClick: () => void
  handleSupplementSuccess: () => void
  closeSupplementForm: () => void
  handleStatusReportClick: () => void
  closeStatusReportForm: () => void
  handleQualityReportClick: () => void
  closeQualityReportForm: () => void
  supplementKey: number
}

function SpotReportHub({
  spot,
  showSupplementForm,
  showStatusReportForm,
  showQualityReportForm,
  handleSupplementClick,
  handleSupplementSuccess,
  closeSupplementForm,
  handleStatusReportClick,
  closeStatusReportForm,
  handleQualityReportClick,
  closeQualityReportForm,
  supplementKey,
}: SpotReportHubProps) {
  const activeLabel = showSupplementForm
    ? '정보 수정 제안'
    : showStatusReportForm
      ? '상태 신고'
      : showQualityReportForm
        ? '품질 신고'
        : null

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <h2 className="text-text-primary text-lg font-bold md:text-xl">
            정보 제보 및 수정
          </h2>
          <p className="mt-1 text-sm text-muted">
            잘못된 정보, 폐업/접근 불가, 중복·부적절한 내용을 한 곳에서 제보할
            수 있습니다.
          </p>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <ReportHubAction
            title="정보 수정 제안"
            description="주소, 설명, 사진처럼 보완할 정보가 있을 때"
            tone="primary"
            isActive={showSupplementForm}
            onClick={() => {
              if (showSupplementForm) {
                closeSupplementForm()
                return
              }
              closeStatusReportForm()
              closeQualityReportForm()
              handleSupplementClick()
            }}
          />
          <ReportHubAction
            title="상태 신고"
            description="폐업, 임시 휴무, 접근 제한 등 방문 상태가 바뀌었을 때"
            tone="warning"
            isActive={showStatusReportForm}
            onClick={() => {
              if (showStatusReportForm) {
                closeStatusReportForm()
                return
              }
              closeSupplementForm()
              closeQualityReportForm()
              handleStatusReportClick()
            }}
          />
          <ReportHubAction
            title="품질 신고"
            description="중복 스팟, 부적절 정보, 명백한 오류가 있을 때"
            tone="danger"
            isActive={showQualityReportForm}
            onClick={() => {
              if (showQualityReportForm) {
                closeQualityReportForm()
                return
              }
              closeSupplementForm()
              closeStatusReportForm()
              handleQualityReportClick()
            }}
          />
        </div>

        {spot.spotStatus && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-accent-surface px-3 py-2">
            <span className="text-text-secondary text-sm">현재 상태:</span>
            <SpotStatusIndicator status={spot.spotStatus} />
          </div>
        )}

        {activeLabel && (
          <div className="mb-4 rounded-lg border border-border p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-main-text">
                {activeLabel}
              </p>
              <button
                type="button"
                onClick={() => {
                  closeSupplementForm()
                  closeStatusReportForm()
                  closeQualityReportForm()
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-sub-text transition hover:bg-accent-surface"
              >
                닫기
              </button>
            </div>

            {showSupplementForm && (
              <SupplementForm
                spotId={spot.id}
                onSuccess={handleSupplementSuccess}
                onCancel={closeSupplementForm}
              />
            )}
            {showStatusReportForm && (
              <StatusReportForm
                spotId={spot.id}
                onSuccess={closeStatusReportForm}
                onCancel={closeStatusReportForm}
              />
            )}
            {showQualityReportForm && (
              <QualityReportForm
                spotId={spot.id}
                onSuccess={closeQualityReportForm}
                onCancel={closeQualityReportForm}
              />
            )}
          </div>
        )}

        <ContributorList key={supplementKey} spotId={spot.id} />
      </div>
    </section>
  )
}

function ReportHubAction({
  title,
  description,
  tone,
  isActive,
  onClick,
}: {
  title: string
  description: string
  tone: 'primary' | 'warning' | 'danger'
  isActive: boolean
  onClick: () => void
}) {
  const toneClass =
    tone === 'primary'
      ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15'
      : tone === 'warning'
        ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
        : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${toneClass} ${
        isActive ? 'ring-2 ring-primary/40' : ''
      }`}
      aria-pressed={isActive}
    >
      <span className="block font-semibold">{isActive ? '닫기' : title}</span>
      <span className="mt-1 block text-xs leading-relaxed opacity-80">
        {description}
      </span>
    </button>
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
              href="/map"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-primary transition-colors hover:bg-primary-50"
            >
              지도로 돌아가기
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
            href="/map"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-600"
          >
            지도로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
