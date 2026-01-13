'use client'

import { useState } from 'react'
import Link from 'next/link'
import PostList from '@/components/community/PostList'

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
 */
function SpotCategorySection() {
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

      {/* 스팟 목록 - Task 13.2에서 구현 예정 */}
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 text-4xl">🗺️</div>
        <p className="mb-2 text-navy-700">스팟별 커뮤니티 준비 중</p>
        <p className="text-sm text-navy-500">
          곧 스팟별로 게시글을 모아볼 수 있습니다.
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

/**
 * 작품별 카테고리 섹션
 * 작품 목록을 카드 형태로 표시하고 각 작품의 커뮤니티로 이동 가능
 */
function MediaCategorySection() {
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

      {/* 작품 목록 - Task 13.3에서 구현 예정 */}
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 text-4xl">🎬</div>
        <p className="mb-2 text-navy-700">작품별 커뮤니티 준비 중</p>
        <p className="text-sm text-navy-500">
          곧 작품별로 게시글을 모아볼 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-4 rounded-lg bg-navy-100 px-4 py-2 text-sm text-navy-600 transition-colors hover:bg-navy-200"
        >
          지도에서 작품 둘러보기
        </Link>
      </div>
    </div>
  )
}
