'use client'

import { useMemo, useState } from 'react'
import { ContentCard } from './ContentCard'
import {
  DISCOVERABLE_CONTENT_TYPES,
  DISCOVERABLE_CONTENT_TYPE_LABELS,
  EXCLUDED_CONTENT_NAMES,
  isDiscoverableContentType,
  type ContentListItem,
  type DiscoverableContentType,
} from '@/lib/content-discovery'

export type { ContentListItem } from '@/lib/content-discovery'

interface ContentListClientProps {
  initialContents: ContentListItem[]
}

const TYPE_FILTER_OPTIONS: {
  value: DiscoverableContentType | 'all'
  label: string
}[] = [
  { value: 'all', label: '전체' },
  ...DISCOVERABLE_CONTENT_TYPES.map((type) => ({
    value: type,
    label: DISCOVERABLE_CONTENT_TYPE_LABELS[type],
  })),
]

export function filterContents(
  contents: ContentListItem[],
  typeFilter: DiscoverableContentType | 'all',
  searchQuery: string
): ContentListItem[] {
  const normalizedSearch = searchQuery.trim().toLowerCase()

  return contents.filter((item) => {
    if (!isDiscoverableContentType(item.contentType)) return false
    if (EXCLUDED_CONTENT_NAMES.includes(item.contentName as never)) return false

    const matchesType = typeFilter === 'all' || item.contentType === typeFilter
    const matchesSearch =
      normalizedSearch === '' ||
      item.contentName.toLowerCase().includes(normalizedSearch)

    return matchesType && matchesSearch
  })
}

export function ContentListClient({ initialContents }: ContentListClientProps) {
  const [typeFilter, setTypeFilter] = useState<DiscoverableContentType | 'all'>(
    'all'
  )
  const [searchQuery, setSearchQuery] = useState('')

  const filteredContents = useMemo(
    () => filterContents(initialContents, typeFilter, searchQuery),
    [initialContents, typeFilter, searchQuery]
  )

  const handleResetFilters = () => {
    setTypeFilter('all')
    setSearchQuery('')
  }

  const hasNoContents = initialContents.length === 0
  const hasNoResults = !hasNoContents && filteredContents.length === 0

  return (
    <main className="min-h-screen bg-surface pt-14">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-bold text-main-text">콘텐츠 탐색</h1>
        <p className="mt-1 text-sm text-sub-text">
          애니메이션, 게임, 아티스트 콘텐츠를 중심으로 실제 스팟을 찾아보세요.
        </p>

        <div className="mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="콘텐츠명으로 검색..."
            aria-label="콘텐츠명 검색"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-main-text placeholder:text-sub-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-label="콘텐츠 타입 필터"
        >
          {TYPE_FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTypeFilter(option.value)}
              aria-pressed={typeFilter === option.value}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-background text-sub-text hover:bg-border hover:text-main-text'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {hasNoContents && (
          <div className="mt-12 text-center text-sub-text">
            <p>등록된 콘텐츠가 없습니다</p>
          </div>
        )}

        {hasNoResults && (
          <div className="mt-12 text-center text-sub-text">
            <p>조건에 맞는 콘텐츠가 없습니다</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              필터 초기화
            </button>
          </div>
        )}

        {filteredContents.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredContents.map((content) => (
              <ContentCard
                key={`${content.contentName}-${content.contentType}`}
                content={content}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
