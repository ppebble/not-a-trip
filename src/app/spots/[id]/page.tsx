'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSpotDetail, useNearbyFacilities } from '@/hooks/useSpotDetail'
import { SpotDetailData } from '@/hooks/useSpots'
import { NearbyFacility, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { spotKeys } from '@/hooks/useSpots'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import NearbyFacilities from '@/components/spot/NearbyFacilities'
import { SpotContentSection } from '@/components/spot/SpotContentSection'
import { RelatedContentSection } from '@/components/spot/RelatedContentSection'
import { SpotCheckInSection } from '@/components/spot/SpotCheckInSection'
import { SupplementForm } from '@/components/report/SupplementForm'
import { ContributorList } from '@/components/report/ContributorList'
import { StatusReportForm } from '@/components/report/StatusReportForm'
import { SpotStatusIndicator } from '@/components/report/SpotStatusIndicator'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import { CategoryIcon } from '@/components/common'
import { SpotDetailSkeleton as SpotDetailSkeletonUI } from '@/components/common/SkeletonUI'
import SwipeableGallery from '@/components/mobile/SwipeableGallery'
import DirectionsButton from '@/components/common/DirectionsButton'
import { blurPlaceholderProps } from '@/lib/image-utils'
import { RelatedRoutes } from '@/components/route/RelatedRoutes'

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

export default function SpotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const spotId = params.id as string
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: spot, isLoading, error } = useSpotDetail(spotId)
  const { data: facilities = [] } = useNearbyFacilities(spotId)

  // 수정/삭제 권한 확인: 관리자이거나 본인 스팟인 경우
  const isAdmin = user?.role === 'admin'
  const isOwner = spot?.authorId && user?.id && spot.authorId === user.id
  const hasEditPermission = isAdmin || isOwner
  const hasDeletePermission = isAdmin || isOwner

  // 스팟 삭제 핸들러
  const handleDelete = async () => {
    if (
      !confirm(
        '정말로 이 스팟을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/spots/${spotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || '스팟 삭제에 실패했습니다')
        return
      }

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: spotKeys.all })

      // 메인 페이지로 이동 (Requirements 6.5)
      router.push('/')
    } catch {
      alert('스팟 삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <SpotDetailSkeleton />
  }

  if (error) {
    return <SpotDetailError error={error} />
  }

  if (!spot) {
    return <SpotNotFound />
  }

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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
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
        <SpotDetailContent spot={spot} facilities={facilities} />
      </main>
    </div>
  )
}

interface SpotDetailContentProps {
  spot: SpotDetailData
  facilities: NearbyFacility[]
}

function SpotDetailContent({ spot, facilities }: SpotDetailContentProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [showSupplementForm, setShowSupplementForm] = useState(false)
  const [showStatusReportForm, setShowStatusReportForm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalContext, setLoginModalContext] = useState<
    'supplement' | 'status'
  >('supplement')
  const [supplementKey, setSupplementKey] = useState(0)

  // 카테고리 정보 가져오기 (Requirements 2.3)
  const categoryConfig = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]
    : null

  const handleSupplementClick = () => {
    if (!isAuthenticated) {
      setLoginModalContext('supplement')
      setShowLoginModal(true)
      return
    }
    setShowSupplementForm((prev) => !prev)
  }

  const handleStatusReportClick = () => {
    if (!isAuthenticated) {
      setLoginModalContext('status')
      setShowLoginModal(true)
      return
    }
    setShowStatusReportForm((prev) => !prev)
  }

  const handleSupplementSuccess = () => {
    setShowSupplementForm(false)
    // ContributorList 리프레시를 위해 key 변경
    setSupplementKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-8">
      {/* 모바일: SwipeableGallery (edge-to-edge, 패딩 없음) - Requirements 2.1, 2.2 */}
      {spot.photos && spot.photos.length > 0 && (
        <div className="-mx-4 -mt-8 sm:-mx-6 md:hidden">
          <SwipeableGallery images={spot.photos} />
        </div>
      )}

      {/* Spot Header - 모바일 최적화 (Requirements 2.1) */}
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

          {/* 스팟 상태 표시 - Requirements 4.4 */}
          {spot.spotStatus && spot.spotStatus !== 'normal' && (
            <div className="mb-2 md:mb-3">
              <SpotStatusIndicator status={spot.spotStatus} size="md" />
            </div>
          )}

          {/* 최초 제보자 표시 - Requirements 2.1 */}
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

          {/* 주소 + 길찾기 버튼 (Requirements 2.3) */}
          <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
            <div className="flex min-w-0 items-center text-gray-600">
              <svg
                className="mr-1.5 h-4 w-4 flex-shrink-0 md:mr-2 md:h-5 md:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
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
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    {...blurPlaceholderProps}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category-specific Content Section - 카테고리별 콘텐츠 (Requirements 1.1, 1.2) */}
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
        {/* Nearby Facilities */}
        <NearbyFacilities
          facilities={facilities}
          spotId={spot.id}
          spotCoordinates={
            spot.coordinates
              ? { lat: spot.coordinates[0], lng: spot.coordinates[1] }
              : undefined
          }
        />

        {/* Check-in Section (기존 Community Section 대체) */}
        <SpotCheckInSection
          spotId={spot.id}
          spotName={spot.name}
          sceneImageUrl={spot.photos?.[0]}
        />
      </div>

      {/* 정보 보완 섹션 - Requirements 3.1, 3.3 */}
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
                onCancel={() => setShowSupplementForm(false)}
              />
            </div>
          )}

          <ContributorList key={supplementKey} spotId={spot.id} />
        </div>
      </div>

      {/* 스팟 상태 신고 섹션 - Requirements 4.1, 4.4 */}
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

          {/* 현재 상태 표시 */}
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
                onSuccess={() => setShowStatusReportForm(false)}
                onCancel={() => setShowStatusReportForm(false)}
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

      {/* 관련 순례 코스 - Requirements 4.3 */}
      {spot.relatedContent && spot.relatedContent.length > 0 && (
        <RelatedRoutes contentNames={spot.relatedContent.map((c) => c.name)} />
      )}

      {/* Related Content - 맨 아래 (Requirements 3.1, 3.4) */}
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
          <svg
            className="mx-auto mb-4 h-16 w-16 text-red-500"
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
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
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
