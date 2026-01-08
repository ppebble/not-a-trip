'use client'

import Link from 'next/link'
import PostList from '@/components/community/PostList'

/**
 * 커뮤니티 게시판 페이지
 * Requirements 5.1: 게시글 목록 표시
 * Requirements 5.6: 글쓰기 버튼 클릭 시 작성 페이지로 이동
 */
export default function CommunityPage() {
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
        {/* 글쓰기 버튼 */}
        <div className="mb-4 flex justify-end">
          <Link
            href="/community/write"
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

        <PostList />
      </div>
    </main>
  )
}
