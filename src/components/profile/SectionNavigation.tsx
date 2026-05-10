'use client'

import type { ProfileSection } from '@/types/profile'

interface SectionTab {
  key: ProfileSection
  label: string
}

const SECTION_TABS: SectionTab[] = [
  { key: 'activity', label: '활동' },
  { key: 'contribution', label: '기여' },
  { key: 'community', label: '커뮤니티' },
  { key: 'collection', label: '보관함' },
  { key: 'management', label: '관리' },
]

interface SectionNavigationProps {
  activeSection: ProfileSection
  onSectionChange: (section: ProfileSection) => void
  /** 관리 섹션 표시 여부 — Owner일 때만 true */
  isOwner: boolean
}

/**
 * 프로필 페이지 섹션 네비게이션 컴포넌트
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
export function SectionNavigation({
  activeSection,
  onSectionChange,
  isOwner,
}: SectionNavigationProps) {
  const visibleTabs = isOwner
    ? SECTION_TABS
    : SECTION_TABS.filter((tab) => tab.key !== 'management')

  return (
    <nav
      className="border-b border-neutral-200 bg-surface"
      aria-label="프로필 섹션 네비게이션"
    >
      <div className="overflow-x-auto whitespace-nowrap">
        <div className="flex min-w-max">
          {visibleTabs.map((tab) => {
            const isActive = activeSection === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onSectionChange(tab.key)}
                className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
                {/* 활성 섹션 하단 보더 인디케이터 */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
