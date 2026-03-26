'use client'

import { Suspense } from 'react'
import { FeedTab } from './FeedTab'
import { HallOfFameTab } from './HallOfFameTab'
import { ContentTab } from './ContentTab'

/**
 * GalleryContent 컴포넌트
 * activeTab에 따라 적절한 콘텐츠를 렌더링합니다.
 *
 * Requirements:
 * - 3.1: 탭에 따른 콘텐츠 영역 분기 처리
 * - 3.5: 작품별 탭에서 작품 선택 시 해당 작품 체크인만 필터링
 *
 * 각 탭별 컴포넌트:
 * - feed: FeedTab (Task 6.1에서 구현 완료)
 * - hall-of-fame: HallOfFameTab (Task 7.3에서 구현 완료)
 * - content: ContentTab (Task 8.2, 8.3에서 구현)
 */

export type GalleryTab = 'feed' | 'hall-of-fame' | 'content'

export interface GalleryContentProps {
  activeTab: GalleryTab
  selectedContent?: string
}

/**
 * 콘텐츠 로딩 스켈레톤
 */
function ContentSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white shadow-sm">
            <div className="h-48 rounded-t-lg bg-border" />
            <div className="p-3">
              <div className="mb-2 h-4 w-3/4 rounded bg-border" />
              <div className="h-3 w-1/2 rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * GalleryContent 메인 컴포넌트
 * activeTab에 따라 적절한 탭 콘텐츠를 렌더링합니다.
 */
export function GalleryContent({
  activeTab,
  selectedContent,
}: GalleryContentProps) {
  return (
    <section
      role="tabpanel"
      id={`tabpanel-${activeTab}`}
      aria-labelledby={`tab-${activeTab}`}
      className="min-h-[400px]"
    >
      <Suspense fallback={<ContentSkeleton />}>
        {activeTab === 'feed' && <FeedTab />}
        {activeTab === 'hall-of-fame' && <HallOfFameTab />}
        {activeTab === 'content' && (
          <ContentTab selectedContent={selectedContent} />
        )}
      </Suspense>
    </section>
  )
}

export default GalleryContent
