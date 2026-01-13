'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PostList from '@/components/community/PostList'
import {
  useSpotCommunitySummary,
  useMediaCommunitySummary,
  MediaCommunitySummary,
} from '@/hooks/useSpots'

/**
 * 커뮤니티 카테고리 타입
 */
type CommunityCategory = 'all' | 'spot' | 'media' | 'general'

interface CategoryTab {
  id: CommunityCategory
  label: string
  icon: React.ReactNode
  description: string
}

/**
 * 카테고리 탭 정의
 */
const categoryTabs: CategoryTab[] = [
  {
    id: 'all',
    label: '전체',
    icon: (
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
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
    description: '모든 게시글',
  },
  {
    id: 'spot',
    label: '스팟별',
    icon: (
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
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    description: '성지순례 스팟별 게시글',
  },
  {
    id: 'media',
    label: '작품별',
    icon: (
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
          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
        />
      </svg>
    ),
    description: '애니메이션/드라마별 게시글',
  },
  {
    id: 'general',
    label: '자유게시판',
    icon: (
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
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
    description: '자유로운 이야기',
  },
]

/**
 * 카테고리 탭 컴포넌트
 */
function CategoryTabButton({
  tab,
  isActive,
  onClick,
}: {
  tab: CategoryTab
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-navy-600 text-white shadow-md'
          : 'bg-white text-navy-600 hover:bg-navy-50'
      }`}
      aria-selected={isActive}
      role="tab"
    >
      {tab.icon}
      <span>{tab.label}</span>
    </button>
  )
}

/**
 * 커뮤니티 게시판 페이지
 * Requirements 5.1: 게시글 목록 표시
 * Requirements 5.6: 글쓰기 버튼 클릭 시 작성 페이지로 이동
 */
export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<CommunityCategory>('all')

  // 현재 카테고리에 맞는 글쓰기 링크 생성
  const getWriteLink = () => {
    const params = new URLSearchParams()
    if (activeCategory === 'general') {
      params.set('type', 'general')
    }
    const queryString = params.toString()
    return `/community/write${queryString ? `?${queryString}` : ''}`
  }

  return (
    <main className="min-h-screen bg-navy-50">
      {/* 헤더 */}
      <header className="border-b border-navy-700 bg-gradient-to-r from-navy-800 via-navy-700 to-navy-800 px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-600 text-xl"
              >
                🗾
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">커뮤니티</h1>
                <p className="text-xs text-navy-300">
                  성지순례 경험을 공유하세요
                </p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-sm text-navy-300 hover:text-white">
                지도
              </Link>
              <Link
                href="/community"
                className="text-sm font-medium text-white"
              >
                커뮤니티
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 카테고리 탭 네비게이션 */}
        <div className="mb-6">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="커뮤니티 카테고리"
          >
            {categoryTabs.map((tab) => (
              <CategoryTabButton
                key={tab.id}
                tab={tab}
                isActive={activeCategory === tab.id}
                onClick={() => setActiveCategory(tab.id)}
              />
            ))}
          </div>
          {/* 현재 카테고리 설명 */}
          <p className="mt-3 text-sm text-navy-500">
            {categoryTabs.find((tab) => tab.id === activeCategory)?.description}
          </p>
        </div>

        {/* 글쓰기 버튼 */}
        <div className="mb-4 flex justify-end">
          <Link
            href={getWriteLink()}
            className="flex items-center gap-2 rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            글쓰기
          </Link>
        </div>

        {/* 카테고리별 콘텐츠 */}
        <div
          role="tabpanel"
          aria-label={`${categoryTabs.find((tab) => tab.id === activeCategory)?.label} 게시글`}
        >
          {activeCategory === 'all' && <PostList />}
          {activeCategory === 'spot' && <SpotCategorySection />}
          {activeCategory === 'media' && <MediaCategorySection />}
          {activeCategory === 'general' && <PostList filterType="general" />}
        </div>
      </div>
    </main>
  )
}

/**
 * 스팟별 카테고리 섹션
 * 스팟 목록을 카드 형태로 표시하고 각 스팟의 커뮤니티로 이동 가능
 * Requirements: 5.1, 3.1
 */
function SpotCategorySection() {
  const { data: spots, isLoading, error } = useSpotCommunitySummary()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-navy-800">
            스팟별 커뮤니티
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-navy-100 bg-navy-50 p-4"
            >
              <div className="mb-3 h-32 rounded-lg bg-navy-200" />
              <div className="mb-2 h-4 w-3/4 rounded bg-navy-200" />
              <div className="h-3 w-1/2 rounded bg-navy-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="mb-2 text-navy-700">스팟 정보를 불러오지 못했습니다</p>
          <p className="text-sm text-navy-500">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }

  if (!spots || spots.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-navy-800">
            스팟별 커뮤니티
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 text-4xl">🗺️</div>
          <p className="mb-2 text-navy-700">등록된 스팟이 없습니다</p>
          <p className="text-sm text-navy-500">
            새로운 성지순례 스팟을 등록해주세요.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-lg bg-navy-100 px-4 py-2 text-sm text-navy-600 transition-colors hover:bg-navy-200"
          >
            지도에서 스팟 둘러보기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-navy-800">스팟별 커뮤니티</h2>
      </div>
      <p className="mb-6 text-sm text-navy-500">
        성지순례 스팟을 선택하여 해당 장소에 대한 게시글을 확인하세요.
      </p>

      {/* 스팟 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  )
}

/**
 * 스팟 카드 컴포넌트
 * 스팟 이미지, 이름, 게시글 수를 표시
 */
function SpotCard({
  spot,
}: {
  spot: { id: string; name: string; thumbnailUrl: string; postCount: number }
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/spots/${spot.id}#community`}
      className="group block overflow-hidden rounded-lg border border-navy-100 bg-white transition-all hover:border-navy-300 hover:shadow-md"
    >
      {/* 스팟 이미지 */}
      <div className="relative h-32 w-full overflow-hidden bg-navy-100">
        {spot.thumbnailUrl && !imageError ? (
          <Image
            src={spot.thumbnailUrl}
            alt={spot.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-12 w-12 text-navy-300"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 스팟 정보 */}
      <div className="p-4">
        <h3 className="mb-1 truncate font-medium text-navy-800 group-hover:text-navy-600">
          {spot.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-navy-500">
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
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span>게시글 {spot.postCount}개</span>
        </div>
      </div>
    </Link>
  )
}

/**
 * 작품별 카테고리 섹션
 * 작품 목록을 카드 형태로 표시하고 각 작품의 커뮤니티로 이동 가능
 * Requirements: 5.1
 */
function MediaCategorySection() {
  const { data: mediaList, isLoading, error } = useMediaCommunitySummary()

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
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
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-navy-800">
            작품별 커뮤니티
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-navy-100 bg-navy-50 p-4"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy-200" />
              <div className="mb-2 h-4 w-3/4 rounded bg-navy-200" />
              <div className="h-3 w-1/2 rounded bg-navy-200" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <p className="mb-2 text-navy-700">작품 정보를 불러오지 못했습니다</p>
          <p className="text-sm text-navy-500">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
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
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-navy-800">
            작품별 커뮤니티
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 text-4xl">🎬</div>
          <p className="mb-2 text-navy-700">등록된 작품이 없습니다</p>
          <p className="text-sm text-navy-500">
            스팟에 연결된 작품 정보가 표시됩니다.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-lg bg-navy-100 px-4 py-2 text-sm text-navy-600 transition-colors hover:bg-navy-200"
          >
            지도에서 스팟 둘러보기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
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
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-navy-800">작품별 커뮤니티</h2>
      </div>
      <p className="mb-6 text-sm text-navy-500">
        애니메이션, 드라마, 영화 등 작품을 선택하여 관련 게시글을 확인하세요.
      </p>

      {/* 작품 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mediaList.map((media) => (
          <MediaCard key={media.title} media={media} />
        ))}
      </div>
    </div>
  )
}

/**
 * 작품 타입에 따른 아이콘 반환
 */
function getMediaTypeIcon(type: MediaCommunitySummary['type']) {
  switch (type) {
    case 'anime':
      return '🎌'
    case 'drama':
      return '📺'
    case 'movie':
      return '🎬'
    default:
      return '🎭'
  }
}

/**
 * 작품 타입에 따른 라벨 반환
 */
function getMediaTypeLabel(type: MediaCommunitySummary['type']) {
  switch (type) {
    case 'anime':
      return '애니메이션'
    case 'drama':
      return '드라마'
    case 'movie':
      return '영화'
    default:
      return '기타'
  }
}

/**
 * 작품 카드 컴포넌트
 * 작품명, 타입, 게시글 수를 표시
 * Requirements: 5.1
 */
function MediaCard({ media }: { media: MediaCommunitySummary }) {
  return (
    <Link
      href={`/community/media/${encodeURIComponent(media.title)}`}
      className="group block overflow-hidden rounded-lg border border-navy-100 bg-white p-4 transition-all hover:border-navy-300 hover:shadow-md"
    >
      {/* 작품 아이콘 및 타입 */}
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-2xl transition-colors group-hover:bg-navy-200">
          {getMediaTypeIcon(media.type)}
        </div>
        <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs text-navy-600">
          {getMediaTypeLabel(media.type)}
        </span>
      </div>

      {/* 작품 정보 */}
      <h3 className="mb-2 truncate font-medium text-navy-800 group-hover:text-navy-600">
        {media.title}
      </h3>
      <div className="flex items-center gap-1 text-sm text-navy-500">
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
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <span>게시글 {media.postCount}개</span>
      </div>
    </Link>
  )
}
