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
 * 작품별 스팟 모아보기 클라이언트 컴포넌트
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.8, 4.9
 */
export function ContentSpotsClient({ contentName }: ContentSpotsClientProps) {
  const router = useRouter()
  const { data: spots, isLoading, isError } = useSpots(undefined, contentName)
  const firstSpotId = spots?.[0]?.id
  const { data: contentInfo } = useContentInfo(contentName, firstSpotId)

  const handleSpotSelect = (spotId: string) => {
    router.push(`/spots/${spotId}`)
  }

  const typeLabel = contentInfo?.type
    ? CONTENT_TYPE_LABELS[contentInfo.type] || CONTENT_TYPE_LABELS.other
    : null

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
              <SpotCard key={spot.id} spot={spot} />
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
function SpotCard({ spot }: { spot: SpotPin }) {
  const [imageError, setImageError] = useState(false)
  const categoryConfig = spot.category ? CATEGORY_CONFIG[spot.category] : null

  return (
    <Link
      href={`/spots/${spot.id}`}
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
