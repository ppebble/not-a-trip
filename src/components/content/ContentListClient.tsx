'use client'

import { useState, useMemo } from 'react'
import { ContentType } from '@/types'
import { ContentCard } from './ContentCard'

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

/** 타입 필터 옵션 (전체 + 각 ContentType) */
const TYPE_FILTER_OPTIONS: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'anime', label: '애니메이션' },
  { value: 'movie', label: '영화' },
  { value: 'drama', label: '드라마' },
  { value: 'sports_team', label: '스포츠 팀' },
  { value: 'artist', label: '아티스트' },
  { value: 'game', label: '게임' },
  { value: 'other', label: '기타' },
]

/**
 * 작품 목록 필터링 로직 (순수 함수로 분리하여 테스트 가능)
 */
export function filterContents(
  contents: ContentListItem[],
  typeFilter: ContentType | 'all',
  searchQuery: string
): ContentListItem[] {
  return contents.filter((item) => {
    const matchesType = typeFilter === 'all' || item.contentType === typeFilter
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.contentName.toLowerCase().includes(searchQuery.trim().toLowerCase())
    return matchesType && matchesSearch
  })
}

/**
 * 작품 목록 클라이언트 컴포넌트
 * Requirements: 2.2, 2.5, 2.6, 2.7
 */
export function ContentListClient({ initialContents }: ContentListClientProps) {
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all')
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
        <h1 className="text-2xl font-bold text-main-text">작품 탐색</h1>
        <p className="mt-1 text-sm text-sub-text">
          등록된 작품을 탐색하고 성지순례 스팟을 찾아보세요
        </p>

        {/* 검색 입력 */}
        <div className="mt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="작품명으로 검색..."
            aria-label="작품명 검색"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-main-text placeholder:text-sub-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 타입 필터 바 */}
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-label="작품 타입 필터"
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

        {/* 빈 상태: 등록된 작품 없음 */}
        {hasNoContents && (
          <div className="mt-12 text-center text-sub-text">
            <p>등록된 작품이 없습니다</p>
          </div>
        )}

        {/* 빈 상태: 필터/검색 결과 없음 */}
        {hasNoResults && (
          <div className="mt-12 text-center text-sub-text">
            <p>조건에 맞는 작품이 없습니다</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              필터 초기화
            </button>
          </div>
        )}

        {/* 작품 그리드 */}
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
