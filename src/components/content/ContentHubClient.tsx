'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useSpots, SpotDetailData } from '@/hooks/useSpots'
import { SpotPin, ContentType, CONTENT_TYPE_CONFIG } from '@/types'
import { CheckIn } from '@/types/checkin'
import { Route } from '@/types/route'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import { ArrowLeftIcon, MapPinIcon } from '@/components/icons'
import { normalizeContentName } from '@/lib/content-utils'
import { SpotCard } from './ContentSpotsClient'

// ============================================
// Types
// ============================================

interface ContentHubClientProps {
  contentName: string
}

interface ContentCoursesResponse {
  courses: Route[]
  total: number
}

interface CheckInsResponse {
  checkins: CheckIn[]
  total: number
}

// ============================================
// Helper: 대표 스팟 선정 로직
// Requirements: 3.2, 3.3
// ============================================

/**
 * 인증 수(checkInCount) 기준 상위 maxCount개 스팟을 선정한다.
 * 스팟이 maxCount개 미만이면 전체 스팟을 반환한다.
 */
export function selectRepresentativeSpots(
  spots: SpotPin[],
  maxCount: number = 3
): SpotPin[] {
  if (spots.length <= maxCount) return spots
  return [...spots]
    .sort((a, b) => (b.checkInCount || 0) - (a.checkInCount || 0))
    .slice(0, maxCount)
}

// ============================================
// Hooks
// ============================================

/**
 * 첫 번째 스팟의 상세 정보에서 작품 타입/연도 추출
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
 * 작품 이미지 조회
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
 * 관련 코스 조회
 * Requirements: 3.4, 3.5
 */
function useContentCourses(contentName: string) {
  return useQuery({
    queryKey: ['content-courses', contentName],
    queryFn: async (): Promise<Route[]> => {
      const response = await fetch(
        `/api/contents/${encodeURIComponent(contentName)}/courses`
      )
      if (!response.ok) return []
      const data: ContentCoursesResponse = await response.json()
      return data.courses
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 최근 인증 조회
 * Requirements: 3.6, 3.7
 */
function useRecentCheckIns(contentName: string) {
  return useQuery({
    queryKey: ['content-recent-checkins', contentName],
    queryFn: async (): Promise<CheckIn[]> => {
      const url = buildUrl(API_ROUTES.CHECKINS.BASE, {
        contentName,
        limit: 6,
        sortBy: 'latest',
      })
      const response = await fetch(url)
      if (!response.ok) return []
      const data: CheckInsResponse = await response.json()
      return data.checkins
    },
    staleTime: 2 * 60 * 1000,
  })
}

// ============================================
// Content Type Labels
// ============================================

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  anime: '애니메이션',
  movie: '영화',
  drama: '드라마',
  sports_team: '스포츠 팀',
  artist: '아티스트',
  game: '게임',
  other: '기타',
}

// ============================================
// Main Component
// ============================================

/**
 * 작품 허브 페이지 클라이언트 컴포넌트
 * 기존 ContentSpotsClient를 확장하여 허브 구조로 재구성
 * 섹션 순서: 개요 → 대표 스팟 → 관련 코스 → 최근 인증 → 전체 스팟 보기
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9
 */
export function ContentHubClient({ contentName }: ContentHubClientProps) {
  const router = useRouter()
  const { data: spots, isLoading: spotsLoading, isError: spotsError } = useSpots(undefined, contentName)
  const firstSpotId = spots?.[0]?.id
  const { data: contentInfo } = useContentInfo(contentName, firstSpotId)
  const { data: imageUrl } = useContentImage(contentName)
  const { data: courses, isError: coursesError } = useContentCourses(contentName)
  const { data: recentCheckIns, isError: checkInsError } = useRecentCheckIns(contentName)
  const [bannerImageError, setBannerImageError] = useState(false)

  const typeLabel = contentInfo?.type
    ? CONTENT_TYPE_LABELS[contentInfo.type] || CONTENT_TYPE_LABELS.other
    : null

  const totalCheckIns =
    spots?.reduce((sum, spot) => sum + (spot.checkInCount || 0), 0) ?? 0

  const representativeSpots = spots ? selectRepresentativeSpots(spots) : []

  // 뒤로가기 핸들러 (Requirements: 6.2, 6.3)
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/contents')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* 헤더 - 뒤로가기 (Requirements: 6.1, 6.4) */}
      <div className="border-b border-border bg-surface px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-primary hover:text-primary-600"
          >
            <ArrowLeftIcon size="md" />
            <span>작품 목록으로</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* ===== 섹션 1: 개요 (Requirements: 3.1) ===== */}
        <OverviewSection
          contentName={contentName}
          typeLabel={typeLabel}
          year={contentInfo?.year}
          imageUrl={imageUrl}
          bannerImageError={bannerImageError}
          setBannerImageError={setBannerImageError}
          spotCount={spots?.length ?? 0}
          totalCheckIns={totalCheckIns}
          contentType={contentInfo?.type}
        />

        {/* ===== 섹션 2: 대표 스팟 (Requirements: 3.2, 3.3) ===== */}
        <RepresentativeSpotsSection
          spots={representativeSpots}
          isLoading={spotsLoading}
          isError={spotsError}
          totalSpotCount={spots?.length ?? 0}
        />

        {/* ===== 섹션 3: 관련 코스 (Requirements: 3.4, 3.5) ===== */}
        {!coursesError && courses && courses.length > 0 && (
          <RelatedCoursesSection courses={courses} />
        )}

        {/* ===== 섹션 4: 최근 인증 (Requirements: 3.6, 3.7) ===== */}
        <RecentCheckInsSection
          checkIns={recentCheckIns ?? []}
          isError={checkInsError}
        />

        {/* ===== 섹션 5: 전체 스팟 보기 링크 (Requirements: 3.8) ===== */}
        {spots && spots.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href={`/?search=${encodeURIComponent(contentName)}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-600"
            >
              <MapPinIcon size={20} />
              <span>전체 스팟 지도에서 보기</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

// ============================================
// Section Components
// ============================================

/**
 * 개요 섹션
 * Requirements: 3.1
 */
function OverviewSection({
  contentName,
  typeLabel,
  year,
  imageUrl,
  bannerImageError,
  setBannerImageError,
  spotCount,
  totalCheckIns,
  contentType,
}: {
  contentName: string
  typeLabel: string | null
  year?: number
  imageUrl: string | null | undefined
  bannerImageError: boolean
  setBannerImageError: (v: boolean) => void
  spotCount: number
  totalCheckIns: number
  contentType?: ContentType
}) {
  const typeConfig = contentType ? CONTENT_TYPE_CONFIG[contentType] : null

  return (
    <section className="mb-8">
      {/* 배너 이미지 */}
      {imageUrl && !bannerImageError ? (
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
          <div className="relative flex items-center gap-4 p-5">
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-md shadow-lg">
              <Image
                src={imageUrl}
                alt={contentName}
                fill
                className="object-cover"
                onError={() => setBannerImageError(true)}
                sizes="56px"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">{contentName}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
                {typeLabel && <span>{typeLabel}</span>}
                {typeLabel && year && <span>·</span>}
                {year && <span>{year}년</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-main-text">{contentName}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-sub-text">
            {typeConfig && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: typeConfig.bgColor,
                  color: typeConfig.fgColor,
                }}
              >
                {typeConfig.label}
              </span>
            )}
            {year && <span>{year}년</span>}
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4">
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
                {spotCount}
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
    </section>
  )
}

/**
 * 대표 스팟 섹션
 * Requirements: 3.2, 3.3
 */
function RepresentativeSpotsSection({
  spots,
  isLoading,
  isError,
  totalSpotCount,
}: {
  spots: SpotPin[]
  isLoading: boolean
  isError: boolean
  totalSpotCount: number
}) {
  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-main-text">🏆 대표 스팟</h2>
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
      </section>
    )
  }

  if (isError) {
    return (
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-main-text">🏆 대표 스팟</h2>
        <div className="rounded-lg bg-surface p-6 text-center text-sub-text">
          <p>스팟 정보를 불러오지 못했습니다</p>
        </div>
      </section>
    )
  }

  if (spots.length === 0) {
    return null
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-main-text">🏆 대표 스팟</h2>
        {totalSpotCount > 3 && (
          <span className="text-sm text-sub-text">
            인증 수 기준 상위 {spots.length}개
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </section>
  )
}

/**
 * 관련 코스 섹션
 * Requirements: 3.4, 3.5
 */
function RelatedCoursesSection({ courses }: { courses: Route[] }) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-bold text-main-text">🗺️ 관련 코스</h2>
      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/routes/${course.id}`}
            className="block rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-main-text">{course.name}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-sub-text">
                  {course.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-sub-text">
                  <span>📍 스팟 {course.spots.length}개</span>
                  <span>⏱️ 약 {Math.round(course.estimatedDuration / 60)}시간</span>
                  <span>
                    {course.difficulty === 'easy'
                      ? '🟢 쉬움'
                      : course.difficulty === 'moderate'
                        ? '🟡 보통'
                        : '🔴 어려움'}
                  </span>
                </div>
              </div>
              <svg
                className="h-5 w-5 flex-shrink-0 text-sub-text"
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
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/**
 * 최근 인증 섹션
 * Requirements: 3.6, 3.7
 */
function RecentCheckInsSection({
  checkIns,
  isError,
}: {
  checkIns: CheckIn[]
  isError: boolean
}) {
  if (isError) {
    return (
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-main-text">📸 최근 인증</h2>
        <div className="rounded-lg bg-surface p-6 text-center text-sub-text">
          <p>인증 정보를 불러오지 못했습니다</p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-bold text-main-text">📸 최근 인증</h2>
      {checkIns.length === 0 ? (
        <div className="rounded-lg bg-surface p-8 text-center">
          <div className="mb-2 text-3xl">🚶</div>
          <p className="text-sub-text">아직 인증이 없습니다</p>
          <p className="mt-1 text-sm text-sub-text">
            첫 번째 인증의 주인공이 되어보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {checkIns.map((checkIn) => (
            <CheckInCard key={checkIn.id} checkIn={checkIn} />
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * 인증 카드 컴포넌트
 */
function CheckInCard({ checkIn }: { checkIn: CheckIn }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {checkIn.photoUrl && !imageError ? (
          <Image
            src={checkIn.photoUrl}
            alt={`${checkIn.userName}의 인증`}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            📷
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-xs font-medium text-main-text">
          {checkIn.userName}
        </p>
        {checkIn.comment && (
          <p className="mt-0.5 line-clamp-1 text-xs text-sub-text">
            {checkIn.comment}
          </p>
        )}
      </div>
    </div>
  )
}
