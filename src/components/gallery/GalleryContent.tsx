'use client'

import { Suspense, useState } from 'react'
import { CheckIn } from '@/types'
import { CheckInDetailModal } from '@/components/checkin/CheckInDetailModal'
import { FeedTab } from './FeedTab'
import { HallOfFameTab } from './HallOfFameTab'
import { ContentTab } from './ContentTab'

/**
 * GalleryContent 컴포넌트
 * activeTab에 따라 적절한 콘텐츠를 렌더링합니다.
 */

export type GalleryTab = 'feed' | 'hall-of-fame' | 'content'

export interface GalleryContentProps {
  activeTab: GalleryTab
  selectedContent?: string
}

function ContentSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg bg-surface shadow-sm"
          >
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

export function GalleryContent({
  activeTab,
  selectedContent,
}: GalleryContentProps) {
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null)
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(
    null
  )

  const closeDetailModal = () => {
    setSelectedCheckIn(null)
    setSelectedCheckInId(null)
  }

  return (
    <>
      <section
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="min-h-[400px]"
      >
        <Suspense fallback={<ContentSkeleton />}>
          {activeTab === 'feed' && (
            <FeedTab
              onCheckInClick={(checkIn) => setSelectedCheckIn(checkIn)}
            />
          )}
          {activeTab === 'hall-of-fame' && (
            <HallOfFameTab
              onCheckInClick={(checkInId) => setSelectedCheckInId(checkInId)}
            />
          )}
          {activeTab === 'content' && (
            <ContentTab
              selectedContent={selectedContent}
              onCheckInClick={(checkIn) => setSelectedCheckIn(checkIn)}
            />
          )}
        </Suspense>
      </section>

      {(selectedCheckIn || selectedCheckInId) && (
        <CheckInDetailModal
          checkIn={selectedCheckIn ?? undefined}
          checkInId={selectedCheckInId ?? undefined}
          onClose={closeDetailModal}
        />
      )}
    </>
  )
}

export default GalleryContent
