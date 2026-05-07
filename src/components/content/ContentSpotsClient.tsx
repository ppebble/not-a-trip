'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import { useSpots, SpotDetailData } from '@/hooks/useSpots'
import { SpotPin, CATEGORY_CONFIG, SpotCategory, ContentType } from '@/types'
import { API_ROUTES } from '@/lib/api-routes'
import { ArrowLeftIcon, MapPinIcon } from '@/components/icons'
import { CategoryIcon } from '@/components/common'
import { normalizeContentName } from '@/lib/content-utils'

const PilgrimageMap = dynamic(() => import('@/components/map/PilgrimageMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-lg bg-neutral-100">
      <div className="text-center text-neutral-500">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p>지도를 불러오는 중...</p>
      </div>
    </div>
  ),
})

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  anime: '애니메이션',
  movie: '영화',
  drama: '드라마',
  sports_team: '스포츠 팀',
  artist: '아티스트',
  game: '게임',
  other: '기타',
}

interface ContentSpotsClientProps {
  contentName: string
}

/**
 * 첫 번째 스팟의 상세 정보에서 작품 타입/연도 추출용 훅
 */
function useContentInfo(contentName: string, firstSpotId?: string) {
  return useQuery({
    queryKey: ['content-info', contentName, firstSpotId],
    queryFn: async () => {
      if (!firstSpotId) return null
      const response = await fetch(API_ROUTES.SPOTS.DETAIL(firstSpotId))
      if (!response.ok) return null
      const spot: SpotDetailData = await response.json()
      const matched = spot.relatedContent?.find(
        (c) => c.name.toLowerCase() === contentName.toLowerCase()
      )
      return matched || null
    },
    enabled: !!firstSpotId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 작품 이미지 조회 훅
 */
function useContentImage(contentName: string) {
  return useQuery({
    queryKey: ['content-image', contentName],
    queryFn: async (): Promise<string | null> => {
      const response = await fetch(
        `/api/content-images?names=${encodeURIComponent(contentName)}`
      )
      if (!response.ok) return null
      const data = await response.json()
      const normalized = normalizeContentName(contentName)
      return data.images?.[normalized] || null
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 작품별 스팟 모아보기 클라이언트 컴포넌트
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.8, 4.9
 */
export function ContentSpotsClient({ contentName }: ContentSpotsClientProps) {
  const router = useRouter()
  const { data: spots, isLoading, isError } = useSpots(undefined, contentName)
  const firstSpotId = spots?.[0]?.id
  const { data: contentInfo } = useContentInfo(contentName, firstSpotId)
  const { data: imageUrl } = useContentImage(contentName)
  const [bannerImageError, setBannerImageError] = useState(false)

  const handleSpotSelect = (spotId: string) => {
    router.push(`/spots/${spotId}`)
  }

  const typeLabel = contentInfo?.type
    ? CONTENT_TYPE_LABELS[contentInfo.type] || CONTENT_TYPE_LABELS.other
    : null

  // 총 인증 수 계산
  const totalCheckIns =
    spots?.reduce((sum, spot) => sum + (spot.checkInCount || 0), 0) ?? 0

  // 지도 중심 계산
  const mapCenter: [number, number] | undefined =
    spots && spots.length > 0
      ? [spots[0].coordinates[0], spots[0].coordinates[1]]
      : undefined

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:text-primary-600"
          >
            <ArrowLeftIcon size="md" />
            <span>지도로 돌아가기</span>
          </Link>
          <h1 className="mt-2 text-xl font-bold text-main-text">
            {contentName}
          </h1>
          {/* 작품 타입, 연도 정보 (Requirements 4.2) */}
          <div className="mt-1 flex items-center gap-2 text-sm text-sub-text">
            {typeLabel && <span>{typeLabel}</span>}
            {typeLabel && contentInfo?.year && <span>·</span>}
            {contentInfo?.year && <span>{contentInfo.year}년</span>}
            {spots && spots.length > 0 && (
              <>
                <span>·</span>
                <span>스팟 {spots.length}개</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 작품 배너 이미지 */}
        {imageUrl && !bannerImageError && (
          <div className="relative mb-6 overflow-hidden rounded-lg bg-gradient-to-r from-primary-800 to-primary-600 shadow-md">
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={contentName}
                fill
                className="object-cover opacity-30"
                onError={() => setBannerImageError(true)}
                sizes="(max-width: 896px) 100vw, 896px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-800/80 to-primary-600/60" />
            </div>
            <div className="relative flex items-center gap-3 p-4 text-white">
              <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md shadow-lg">
                <Image
                  src={imageUrl}
                  alt={contentName}
                  fill
                  className="object-cover"
                  onError={() => setBannerImageError(true)}
                  sizes="48px"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">{contentName}</h2>
                <p className="text-sm text-white/70">
                  성지순례 스팟을 확인하고 인증해보세요
                </p>
              </div>
              {spots && spots.length > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{totalCheckIns}</div>
                  <div className="text-sm text-white/70">총 인증</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 통계 카드 */}
        {spots && spots.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-surface">
                  <svg
                    className="h-5 w-5 text-primary"
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
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-main-text">
                    {spots.length}
                  </div>
                  <div className="text-sm text-sub-text">등록된 성지</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <svg
                    className="h-5 w-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-main-text">
                    {totalCheckIns}
                  </div>
                  <div className="text-sm text-sub-text">총 인증 수</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 지도 (Requirements 4.5) */}
        {spots && spots.length > 0 && (
          <div className="mb-6 h-64 overflow-hidden rounded-lg border border-border md:h-80">
            <PilgrimageMap
              initialCenter={mapCenter}
              initialZoom={10}
              spots={spots}
              onSpotSelect={handleSpotSelect}
            />
          </div>
        )}

        {/* 스팟 카드 목록 */}
        {isLoading ? (
          <SpotCardsSkeleton />
        ) : isError ? (
          <SpotCardsError />
        ) : !spots || spots.length === 0 ? (
          <SpotCardsEmpty contentName={contentName} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} contentName={contentName} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

/**
 * 스팟 카드 컴포넌트
 * Requirements: 4.3, 4.4
 */
export function SpotCard({
  spot,
  contentName,
}: {
  spot: SpotPin
  contentName?: string
}) {
  const [imageError, setImageError] = useState(false)
  const categoryConfig = spot.category ? CATEGORY_CONFIG[spot.category] : null
  const href = contentName
    ? `/spots/${spot.id}?content=${encodeURIComponent(contentName)}`
    : `/spots/${spot.id}`

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      {/* 대표 사진 */}
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        {spot.thumbnailUrl && !imageError ? (
          <Image
            src={spot.thumbnailUrl}
            alt={spot.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPinIcon size={32} />
          </div>
        )}
      </div>

      {/* 카드 정보 */}
      <div className="p-3">
        <h3 className="truncate font-medium text-main-text">{spot.name}</h3>
        <div className="mt-1.5 flex items-center gap-2">
          {categoryConfig && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: categoryConfig.bgColor,
                color: categoryConfig.fgColor,
              }}
            >
              <CategoryIcon
                category={spot.category as SpotCategory}
                size="lg"
              />
              {categoryConfig.label}
            </span>
          )}
          {spot.checkInCount !== undefined && spot.checkInCount > 0 && (
            <span className="text-xs text-sub-text">
              인증 {spot.checkInCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

/** 빈 상태 (Requirements 4.9) */
function SpotCardsEmpty({ contentName }: { contentName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 text-4xl">🗺️</div>
      <p className="mb-2 text-main-text">등록된 스팟이 없습니다</p>
      <p className="mb-4 text-sm text-sub-text">
        &apos;{contentName}&apos; 관련 스팟을 등록해주세요!
      </p>
      <Link
        href="/spots/register"
        className="rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-600"
      >
        스팟 등록하기
      </Link>
    </div>
  )
}

function SpotCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-border"
        >
          <div className="aspect-video bg-neutral-200" />
          <div className="p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-neutral-200" />
            <div className="h-3 w-1/3 rounded bg-neutral-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SpotCardsError() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 text-4xl">😢</div>
      <p className="mb-2 text-main-text">스팟 목록을 불러오지 못했습니다</p>
      <p className="text-sm text-sub-text">잠시 후 다시 시도해주세요.</p>
    </div>
  )
}
