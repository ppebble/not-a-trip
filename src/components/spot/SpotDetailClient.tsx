'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSpotDetail, useNearbyFacilities } from '@/hooks/useSpotDetail'
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
import SwipeableGallery from '@/components/mobile/SwipeableGallery'
import DirectionsButton from '@/components/common/DirectionsButton'
import { blurPlaceholderProps } from '@/lib/image-utils'
import { RelatedRoutes } from '@/components/route/RelatedRoutes'
import {
  ArrowLeftIcon,
  MapPinIcon,
  AlertTriangleIcon,
} from '@/components/icons'

// 지도 컴포넌트를 동적으로 로드 (SSR 방지)
const SpotDetailMap = dynamic(() => import('@/components/map/SpotDetailMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
      <div className="text-center text-gray-500">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-navy-600 border-t-transparent"></div>
        <p>지도를 불러오는 중...</p>
      </div>
    </div>
  ),
})

export default function SpotDetailClient() {
  const params = useParams()
  const spotId = params.id as string

  const { data: spot, isLoading, error } = useSpotDetail(spotId)
  const { data: facilities = [] } = useNearbyFacilities(spotId)

  if (isLoading) {
    return <SpotDetailSkeleton />
  }

  if (error) {
    return <SpotDetailError error={error} />
  }

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
    <div className="min-h-screen bg-slate-50">
      {/* 페이지 타이틀 */}
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="flex items-center gap-2 text-navy-500 hover:text-navy-700"
              >
                <ArrowLeftIcon size="md" />
                <span>지도로 돌아가기</span>
              </Link>
              <h1 className="mt-2 text-xl font-bold text-navy-800">
                특별한 여행지
              </h1>
            </div>

            {/* 수정/삭제 버튼 - 관리자 또는 본인 스팟인 경우 표시 */}
            {(hasEditPermission || hasDeletePermission) && (
              <div className="flex gap-2">
                {hasEditPermission && (
                  <Link
                    href={`/spots/${spotId}/edit`}
                    className="rounded-lg border border-navy-300 px-4 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
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
  // 카테고리 정보 가져오기
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
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-4 md:p-6">
          {/* 카테고리 배지 */}
          {categoryConfig && (
            <div className="mb-2 md:mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${categoryConfig.color}20`,
                  color: categoryConfig.color,
                }}
              >
                <CategoryIcon
                  category={spot.category as SpotCategory}
                  size="sm"
                />
                <span>{categoryConfig.label}</span>
              </span>
            </div>
          )}
          <h1 className="mb-2 text-2xl font-bold text-gray-900 md:mb-4 md:text-3xl">
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
            <p className="mb-2 text-sm text-navy-500 md:mb-3">
              📍 최초 제보:{' '}
              <Link
                href={`/profile/${spot.firstReporterId}`}
                className="font-medium text-navy-600 hover:underline"
              >
                @{spot.firstReporterName}
              </Link>
            </p>
          )}

          {/* 주소 + 길찾기 버튼 */}
          <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
            <div className="flex min-w-0 items-center text-gray-600">
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

          <p className="text-sm leading-relaxed text-gray-700 md:text-base">
            {spot.description}
          </p>
        </div>

        {/* 데스크탑: 기존 그리드 사진 레이아웃 (카드 내부) */}
        {spot.photos && spot.photos.length > 0 && (
          <div className="hidden border-t border-gray-100 p-6 md:block">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">사진</h2>
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
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            위치 및 근처 편의시설
          </h2>
          <div className="h-96 w-full overflow-hidden rounded-lg">
            <SpotDetailMap spot={spot} facilities={facilities} />
          </div>
          {facilities.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
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
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 md:text-xl">
              정보 보완
            </h2>
            <button
              onClick={handleSupplementClick}
              className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
            >
              {showSupplementForm ? '닫기' : '정보 수정 제안'}
            </button>
          </div>

          {showSupplementForm && (
            <div className="mb-4 rounded-lg border border-navy-100 p-4">
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
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 md:text-xl">
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
              <span className="text-sm text-gray-600">현재 상태:</span>
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
        onConfirm={() => router.push('/auth/login')}
      />

      {/* 관련 순례 코스 */}
      {spot.relatedContent && spot.relatedContent.length > 0 && (
        <RelatedRoutes contentNames={spot.relatedContent.map((c) => c.name)} />
      )}

      {/* Related Content - 맨 아래 */}
      <RelatedContentSection contents={spot.relatedContent || []} />
    </div>
  )
}

function SpotDetailSkeleton() {
  return <SpotDetailSkeletonUI />
}

interface SpotDetailErrorProps {
  error: Error
}

function SpotDetailError({ error }: SpotDetailErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center text-red-500">
            <AlertTriangleIcon size={64} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            오류가 발생했습니다
          </h2>
          <p className="mb-4 text-gray-600">{error.message}</p>
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-navy-600 px-4 py-2 text-white transition-colors hover:bg-navy-700"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

function SpotNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center text-gray-400">
            <MapPinIcon size={64} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            스팟을 찾을 수 없습니다
          </h2>
          <p className="mb-4 text-gray-600">
            요청하신 스팟이 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-navy-600 px-4 py-2 text-white transition-colors hover:bg-navy-700"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
