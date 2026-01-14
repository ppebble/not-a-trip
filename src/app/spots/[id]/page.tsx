'use client'

import { useParams } from 'next/navigation'
import { useSpotDetail, useNearbyFacilities } from '@/hooks/useSpotDetail'
import { SpotDetailData } from '@/hooks/useSpots'
import { NearbyFacility } from '@/types'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import NearbyFacilities from '@/components/spot/NearbyFacilities'
import SpotCommunitySection from '@/components/spot/SpotCommunitySection'
import SceneGallery from '@/components/spot/SceneGallery'

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-navy-900 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 transition-colors hover:text-navy-200"
            >
              <svg
                className="h-6 w-6"
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
              <span className="font-medium">지도로 돌아가기</span>
            </Link>
            <h1 className="text-xl font-bold">성지순례 스팟</h1>
          </div>
        </div>
      </header>

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
  return (
    <div className="space-y-8">
      {/* Spot Header */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">{spot.name}</h1>
          <div className="mb-4 flex items-center text-gray-600">
            <svg
              className="mr-2 h-5 w-5"
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
            <span>{spot.address}</span>
          </div>
          <p className="leading-relaxed text-gray-700">{spot.description}</p>
        </div>
      </div>

      {/* Photos */}
      {spot.photos && spot.photos.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">사진</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scene Gallery - 전체 너비로 더 큰 이미지 표시 */}
      <SceneGallery spotId={spot.id} />

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

      {/* Nearby Facilities and Community - 2 column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Nearby Facilities */}
        <NearbyFacilities facilities={facilities} />

        {/* Community Section */}
        <SpotCommunitySection spotId={spot.id} spotName={spot.name} />
      </div>

      {/* Related Media - 맨 아래 */}
      {spot.relatedMedia && spot.relatedMedia.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">관련 작품</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {spot.relatedMedia.map((media, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {media.title}
                    </h3>
                    <span className="text-sm capitalize text-gray-500">
                      {getMediaTypeLabel(media.type)}
                    </span>
                  </div>
                  {media.year && (
                    <p className="mt-1 text-sm text-gray-600">{media.year}년</p>
                  )}
                  <Link
                    href={`/community/media/${encodeURIComponent(media.title)}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-navy-600 transition-colors hover:text-navy-800"
                  >
                    <span>커뮤니티 보기</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SpotDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy-900 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 animate-pulse rounded bg-navy-700"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-navy-700"></div>
            </div>
            <div className="h-6 w-24 animate-pulse rounded bg-navy-700"></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 h-8 w-64 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-4 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>

          {/* Photos Skeleton */}
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 h-6 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video animate-pulse rounded-lg bg-gray-200"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
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

function getMediaTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    anime: '애니메이션',
    drama: '드라마',
    movie: '영화',
    other: '기타',
  }
  return labels[type] || type
}
