'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

/**
 * GalleryTabs 컴포넌트
 * 순례 갤러리의 탭 네비게이션을 담당합니다.
 *
 * Requirements:
 * - 3.1: "실시간 피드", "명예의 전당", "작품별" 세 개 탭 제공
 *
 * URL 쿼리 파라미터로 탭 상태 관리:
 * - ?tab=feed (기본값)
 * - ?tab=hall-of-fame
 * - ?tab=content
 */

export type GalleryTab = 'feed' | 'hall-of-fame' | 'content'

export interface GalleryTabsProps {
  activeTab: GalleryTab
  onTabChange?: (tab: GalleryTab) => void
}

const TABS: { id: GalleryTab; label: string; icon: string }[] = [
  { id: 'feed', label: '실시간 피드', icon: '📸' },
  { id: 'hall-of-fame', label: '명예의 전당', icon: '🏆' },
  { id: 'content', label: '작품별', icon: '🎬' },
]

export function GalleryTabs({ activeTab, onTabChange }: GalleryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = useCallback(
    (tab: GalleryTab) => {
      // URL 쿼리 파라미터 업데이트
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)

      // 작품별 탭이 아닌 경우 content 파라미터 제거
      if (tab !== 'content') {
        params.delete('content')
      }

      router.push(`/gallery?${params.toString()}`)

      // 외부 콜백 호출
      onTabChange?.(tab)
    },
    [router, searchParams, onTabChange]
  )

  return (
    <nav
      className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3"
      role="tablist"
      aria-label="갤러리 탭 네비게이션"
    >
      <div className="mx-auto flex max-w-6xl gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-neutral-100 text-sub-text hover:bg-neutral-200'
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              <span className="hidden sm:inline">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default GalleryTabs
