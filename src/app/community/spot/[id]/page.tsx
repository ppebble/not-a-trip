'use client'

import { use } from 'react'
import Link from 'next/link'
import PostList from '@/components/community/PostList'
import { useSpotDetail } from '@/hooks/useSpotDetail'

interface SpotCommunityPageProps {
  params: Promise<{ id: string }>
}

/**
 * 스팟별 커뮤니티 페이지
 * 특정 스팟에 대한 게시글 목록을 표시
 * Requirements: 5.1, 3.1
 */
export default function SpotCommunityPage({ params }: SpotCommunityPageProps) {
  const { id } = use(params)
  const { data: spot, isLoading, error } = useSpotDetail(id)

  return (
    <main className="min-h-screen bg-navy-50">
      {/* 페이지 타이틀 */}
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <Link
              href="/community"
              className="text-navy-500 hover:text-navy-700"
            >
              ← 커뮤니티
            </Link>
          </div>
          <h1 className="mt-2 text-xl font-bold text-navy-800">
            {isLoading ? '로딩 중...' : spot?.name || '스팟 커뮤니티'}
          </h1>
          <p className="text-sm text-navy-500">스팟 관련 게시글</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 스팟 정보 카드 */}
        {!isLoading && !error && spot && (
          <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-navy-100">
                <svg
                  className="h-8 w-8 text-navy-400"
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
              </div>
              <div className="flex-1">
                <h2 className="mb-1 text-lg font-semibold text-navy-800">
                  {spot.name}
                </h2>
                <p className="mb-2 text-sm text-navy-500">{spot.address}</p>
                {spot.relatedMedia && spot.relatedMedia.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {spot.relatedMedia.map((media, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-navy-100 px-2 py-0.5 text-xs text-navy-600"
                      >
                        {media.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/spots/${id}`}
                className="rounded-lg bg-navy-100 px-3 py-1.5 text-sm text-navy-600 transition-colors hover:bg-navy-200"
              >
                상세보기
              </Link>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-center">
            <p className="text-red-600">스팟 정보를 불러오지 못했습니다.</p>
          </div>
        )}

        {/* 글쓰기 버튼 */}
        <div className="mb-4 flex justify-end">
          <Link
            href={`/community/write?spotId=${id}`}
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

        {/* 게시글 목록 */}
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
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <h2 className="text-lg font-semibold text-navy-800">게시글</h2>
          </div>
          <PostList spotId={id} />
        </div>
      </div>
    </main>
  )
}
