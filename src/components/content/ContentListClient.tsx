'use client'

import { ContentType } from '@/types'

/**
 * 작품 목록 아이템 인터페이스
 */
export interface ContentListItem {
  contentName: string
  contentType: ContentType
  spotCount: number
  imageUrl: string | null
}

interface ContentListClientProps {
  initialContents: ContentListItem[]
}

/**
 * 작품 목록 클라이언트 컴포넌트
 * Task 3.2에서 필터/검색 기능과 함께 본격 구현 예정
 * Requirements: 2.2, 2.5, 2.6, 2.7
 */
export function ContentListClient({ initialContents }: ContentListClientProps) {
  return (
    <main className="min-h-screen bg-surface pt-14">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-main-text">작품 탐색</h1>
        <p className="mt-1 text-sm text-sub-text">
          등록된 작품을 탐색하고 성지순례 스팟을 찾아보세요
        </p>

        {initialContents.length === 0 ? (
          <div className="mt-12 text-center text-sub-text">
            <p>등록된 작품이 없습니다</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {initialContents.map((content) => (
              <div
                key={`${content.contentName}-${content.contentType}`}
                className="rounded-lg border border-neutral-200 bg-surface p-4"
              >
                <p className="font-medium text-main-text">
                  {content.contentName}
                </p>
                <p className="text-xs text-sub-text">{content.contentType}</p>
                <p className="text-xs text-sub-text">
                  스팟 {content.spotCount}개
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
