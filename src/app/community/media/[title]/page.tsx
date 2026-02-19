'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import { SpotCategory, CATEGORY_CONFIG } from '@/types'

interface SpotWithCheckIn {
  id: string
  name: string
  thumbnailUrl: string
  address: string
  category?: SpotCategory
  checkInCount: number
}

interface MediaSpotsResponse {
  spots: SpotWithCheckIn[]
  total: number
  totalCheckIns: number
}

/**
 * 작품별 스팟 및 인증 현황 조회 훅
 */
function useMediaSpots(mediaTitle: string) {
  return useQuery({
    queryKey: ['media', 'spots', mediaTitle],
    queryFn: async (): Promise<MediaSpotsResponse> => {
      const url = buildUrl(API_ROUTES.SPOTS.BASE, {
        search: mediaTitle,
      })
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch spots')
      }

      const data = await response.json()

      // 인증 수 합계 계산
      const totalCheckIns = data.spots.reduce(
        (sum: number, spot: SpotWithCheckIn) => sum + (spot.checkInCount || 0),
        0
      )

      return {
        spots: data.spots.map((spot: SpotWithCheckIn) => ({
          id: spot.id,
          name: spot.name,
          thumbnailUrl: spot.thumbnailUrl || '',
          address: '',
          category: spot.category,
          checkInCount: spot.checkInCount || 0,
        })),
        total: data.total,
        totalCheckIns,
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

interface PageProps {
  params: Promise<{ title: string }>
}

/**
 * 작품별 성지순례 페이지
 * Requirements 6.3: 성지 목록 및 인증 현황 중심으로 변경
 */
export default function MediaPilgrimagePage({ params }: PageProps) {
  const { title } = use(params)
  const mediaTitle = decodeURIComponent(title)
  const { data, isLoading, error } = useMediaSpots(mediaTitle)

  return (
    <main className="min-h-screen bg-navy-50">
      {/* 페이지 타이틀 */}
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Link
              href="/community?tab=media"
              className="text-navy-500 hover:text-navy-700"
            >
              ← 작품별
            </Link>
          </div>
          <h1 className="mt-2 text-xl font-bold text-navy-800">{mediaTitle}</h1>
          <p className="text-sm text-navy-500">성지순례 현황</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 작품 정보 배너 */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-navy-700 to-navy-600 p-4 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎬</span>
              <div>
                <h2 className="text-lg font-bold">{mediaTitle}</h2>
                <p className="text-sm text-navy-200">
                  성지순례 스팟을 확인하고 인증해보세요
                </p>
              </div>
            </div>
            {data && (
              <div className="text-right">
                <div className="text-2xl font-bold">{data.totalCheckIns}</div>
                <div className="text-sm text-navy-200">총 인증</div>
              </div>
            )}
          </div>
        </div>

        {/* 통계 카드 */}
        {data && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-100">
                  <svg
                    className="h-5 w-5 text-navy-600"
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
                  <div className="text-2xl font-bold text-navy-800">
                    {data.total}
                  </div>
                  <div className="text-sm text-navy-500">등록된 성지</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <svg
                    className="h-5 w-5 text-amber-600"
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
                  <div className="text-2xl font-bold text-navy-800">
                    {data.totalCheckIns}
                  </div>
                  <div className="text-sm text-navy-500">총 인증 수</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 성지 목록 */}
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-navy-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-navy-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h3 className="font-semibold text-navy-800">성지 목록</h3>
            </div>
          </div>

          {isLoading ? (
            <SpotListSkeleton />
          ) : error ? (
            <SpotListError />
          ) : !data || data.spots.length === 0 ? (
            <SpotListEmpty mediaTitle={mediaTitle} />
          ) : (
            <div className="divide-y divide-navy-100">
              {data.spots.map((spot) => (
                <SpotItem key={spot.id} spot={spot} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function SpotItem({ spot }: { spot: SpotWithCheckIn }) {
  const [imageError, setImageError] = useState(false)
  const categoryConfig = spot.category ? CATEGORY_CONFIG[spot.category] : null

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="flex items-center gap-4 p-4 transition-colors hover:bg-navy-50"
    >
      {/* 스팟 이미지 */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-navy-100">
        {spot.thumbnailUrl && !imageError ? (
          <Image
            src={spot.thumbnailUrl}
            alt={spot.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-6 w-6 text-navy-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 스팟 정보 */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-navy-800">{spot.name}</h4>
        {categoryConfig && (
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs"
            style={{
              backgroundColor: `${categoryConfig.color}20`,
              color: categoryConfig.color,
            }}
          >
            {categoryConfig.label}
          </span>
        )}
      </div>

      {/* 인증 수 */}
      <div className="flex flex-shrink-0 items-center gap-1 text-sm">
        {spot.checkInCount > 0 ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
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
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
            {spot.checkInCount}
          </span>
        ) : (
          <span className="text-navy-400">미인증</span>
        )}
        <svg
          className="h-4 w-4 text-navy-400"
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
  )
}

function SpotListSkeleton() {
  return (
    <div className="divide-y divide-navy-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 p-4">
          <div className="h-16 w-16 rounded-lg bg-navy-200" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-3/4 rounded bg-navy-200" />
            <div className="h-3 w-1/4 rounded bg-navy-100" />
          </div>
          <div className="h-6 w-12 rounded-full bg-navy-100" />
        </div>
      ))}
    </div>
  )
}

function SpotListError() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 text-4xl">😢</div>
      <p className="mb-2 text-navy-700">성지 목록을 불러오지 못했습니다</p>
      <p className="text-sm text-navy-500">잠시 후 다시 시도해주세요.</p>
    </div>
  )
}

function SpotListEmpty({ mediaTitle }: { mediaTitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-4 text-4xl">🗺️</div>
      <p className="mb-2 text-navy-700">
        &apos;{mediaTitle}&apos; 관련 성지가 없습니다
      </p>
      <p className="mb-4 text-sm text-navy-500">새로운 성지를 등록해주세요!</p>
      <Link
        href="/spots/register"
        className="rounded-lg bg-navy-600 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-700"
      >
        성지 등록하기
      </Link>
    </div>
  )
}
