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
import SpotCommunitySection from '@/components/spot/SpotCommunitySection'
import { SpotContentSection } from '@/components/spot/SpotContentSection'

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
  // 카테고리 정보 가져오기 (Requirements 2.3)
  const categoryConfig = spot.category
    ? CATEGORY_CONFIG[spot.category as SpotCategory]
    : null

  return (
    <div className="space-y-8">
      {/* Spot Header */}
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-6">
          {/* 카테고리 배지 (Requirements 2.3) */}
          {categoryConfig && (
            <div className="mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${categoryConfig.color}20`,
                  color: categoryConfig.color,
                }}
              >
                <span>{categoryConfig.icon}</span>
                <span>{categoryConfig.label}</span>
              </span>
            </div>
          )}
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

      {/* Nearby Facilities and Community - 2 column layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Nearby Facilities */}
        <NearbyFacilities facilities={facilities} />

        {/* Community Section */}
        <SpotCommunitySection spotId={spot.id} spotName={spot.name} />
      </div>

      {/* Related Content - 맨 아래 (Requirements 3.3) */}
      {/* relatedContent 우선, 없으면 relatedMedia 표시 (하위 호환성) */}
      {((spot.relatedContent && spot.relatedContent.length > 0) ||
        (spot.relatedMedia && spot.relatedMedia.length > 0)) && (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="p-6">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              관련 콘텐츠
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* relatedContent 표시 (새로운 형식) */}
              {spot.relatedContent && spot.relatedContent.length > 0
                ? spot.relatedContent.map((content, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getContentTypeIcon(content.type)}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {content.name}
                          </h3>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {getContentTypeLabel(content.type)}
                        </span>
                      </div>
                      {(content.year || content.additionalInfo) && (
                        <p className="mt-1 text-sm text-gray-600">
                          {content.year && `${content.year}년`}
                          {content.year && content.additionalInfo && ' · '}
                          {content.additionalInfo}
                        </p>
                      )}
                      <Link
                        href={`/community/media/${encodeURIComponent(content.name)}`}
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
                  ))
                : /* relatedMedia 표시 (기존 형식 - 하위 호환성) */
                  spot.relatedMedia?.map((media, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getContentTypeIcon(media.type)}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {media.title}
                          </h3>
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {getMediaTypeLabel(media.type)}
                        </span>
                      </div>
                      {media.year && (
                        <p className="mt-1 text-sm text-gray-600">
                          {media.year}년
                        </p>
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
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200"></div>
          <div className="mt-2 h-6 w-40 animate-pulse rounded bg-slate-200"></div>
        </div>
      </div>

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

// 콘텐츠 타입별 아이콘 (Requirements 3.3)
function getContentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    anime: '🎬',
    movie: '🎥',
    drama: '📺',
    sports_team: '⚽',
    artist: '🎵',
    game: '🎮',
    other: '📍',
  }
  return icons[type] || '📍'
}

// 콘텐츠 타입별 라벨 (Requirements 3.3)
function getContentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    anime: '애니메이션',
    movie: '영화',
    drama: '드라마',
    sports_team: '스포츠 팀',
    artist: '아티스트',
    game: '게임',
    other: '기타',
  }
  return labels[type] || type
}
