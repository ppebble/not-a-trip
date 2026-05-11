'use client'

interface SubTab {
  key: string
  label: string
}

interface SubTabNavigationProps {
  tabs: SubTab[]
  activeTab: string
  onTabChange: (tab: string) => void
}

/**
 * 프로필 섹션 내 하위 탭 전환 컴포넌트 (범용)
 * Requirements: 2.2
 */
export function SubTabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: SubTabNavigationProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto whitespace-nowrap py-1"
      role="tablist"
      aria-label="하위 탭 네비게이션"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
