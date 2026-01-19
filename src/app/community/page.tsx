'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import PostList from '@/components/community/PostList'
import {
  useSpotCommunitySummary,
  useMediaCommunitySummary,
  MediaCommunitySummary,
} from '@/hooks/useSpots'
import { usePosts } from '@/hooks/usePosts'

/**
 * 커뮤니티 카테고리 타입 (전체 카테고리 제거)
 */
type CommunityCategory = 'media' | 'spot' | 'general'

interface CategoryTab {
  id: CommunityCategory
  label: string
  icon: React.ReactNode
  description: string
}

/**
 * 카테고리 탭 정의 (작품별을 첫 번째로)
 */
const categoryTabs: CategoryTab[] = [
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
  return (
    <Suspense fallback={<CommunityPageSkeleton />}>
      <CommunityPageContent />
    </Suspense>
  )
}

/**
 * 로딩 스켈레톤
 */
function CommunityPageSkeleton() {
  return (
    <main className="min-h-screen bg-navy-50">
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="h-6 w-24 animate-pulse rounded bg-navy-200" />
          <div className="mt-1 h-4 w-48 animate-pulse rounded bg-navy-100" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="animate-pulse">
          <div className="mb-6 flex gap-2">
            <div className="h-10 w-24 rounded-lg bg-navy-200" />
            <div className="h-10 w-24 rounded-lg bg-navy-200" />
            <div className="h-10 w-24 rounded-lg bg-navy-200" />
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * 커뮤니티 페이지 실제 콘텐츠
 */
function CommunityPageContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  // URL 쿼리 파라미터로 초기 탭 설정 (삭제 후 돌아올 때 사용)
  const getInitialTab = (): CommunityCategory => {
    if (tabParam === 'general' || tabParam === 'spot' || tabParam === 'media') {
      return tabParam
    }
    return 'media' // 기본값
  }

  const [activeCategory, setActiveCategory] =
    useState<CommunityCategory>(getInitialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  // 검색어 디바운싱 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setIsSearchMode(searchQuery.trim().length > 0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // URL 파라미터 변경 시 탭 업데이트
  useEffect(() => {
    const newTab = getInitialTab()
    setActiveCategory(newTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam])

  // 검색 초기화
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearch('')
    setIsSearchMode(false)
  }, [])

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
      {/* 페이지 타이틀 */}
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-bold text-navy-800">커뮤니티</h1>
          <p className="text-sm text-navy-500">성지순례 경험을 공유하세요</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 검색 입력 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="게시글 제목 또는 내용 검색..."
              className="w-full rounded-lg border border-navy-200 bg-white px-4 py-3 pl-10 pr-10 text-navy-800 placeholder-navy-400 transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-600"
                aria-label="검색어 지우기"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          {isSearchMode && (
            <p className="mt-2 text-sm text-navy-500">
              &quot;{debouncedSearch}&quot; 검색 결과
            </p>
          )}
        </div>

        {/* 검색 모드가 아닐 때만 카테고리 탭 표시 */}
        {!isSearchMode && (
          <>
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
                {
                  categoryTabs.find((tab) => tab.id === activeCategory)
                    ?.description
                }
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
          </>
        )}

        {/* 카테고리별 콘텐츠 또는 검색 결과 */}
        <div
          role="tabpanel"
          aria-label={
            isSearchMode
              ? '검색 결과'
              : `${categoryTabs.find((tab) => tab.id === activeCategory)?.label} 게시글`
          }
        >
          {isSearchMode ? (
            <SearchResultsSection searchQuery={debouncedSearch} />
          ) : (
            <>
              {activeCategory === 'media' && <MediaCategorySection />}
              {activeCategory === 'spot' && <SpotCategorySection />}
              {activeCategory === 'general' && (
                <PostList filterType="general" />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

/**
 * 검색 결과 섹션
 * 전체 게시글에서 검색어와 일치하는 게시글 표시
 */
function SearchResultsSection({ searchQuery }: { searchQuery: string }) {
  const { data: posts, isLoading, error } = usePosts({ search: searchQuery })

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 border-b border-navy-100 pb-4">
              <div className="mb-2 h-5 w-3/4 rounded bg-navy-200" />
              <div className="flex gap-4">
                <div className="h-4 w-20 rounded bg-navy-100" />
                <div className="h-4 w-24 rounded bg-navy-100" />
              </div>
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
          <p className="mb-2 text-navy-700">검색 중 오류가 발생했습니다</p>
          <p className="text-sm text-navy-500">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 text-4xl">🔍</div>
          <p className="mb-2 text-navy-700">
            &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다
          </p>
          <p className="text-sm text-navy-500">다른 검색어로 시도해보세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="border-b border-navy-100 px-4 py-3">
        <p className="text-sm text-navy-600">
          총 <span className="font-semibold">{posts.length}</span>개의 검색 결과
        </p>
      </div>
      <PostList searchQuery={searchQuery} />
    </div>
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
 * 클릭 시 스팟 커뮤니티 페이지로 이동 (디테일 페이지가 아님)
 */
function SpotCard({
  spot,
}: {
  spot: { id: string; name: string; thumbnailUrl: string; postCount: number }
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link
      href={`/community/spot/${spot.id}`}
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
