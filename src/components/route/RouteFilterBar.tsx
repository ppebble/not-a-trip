'use client'

import { useCallback } from 'react'

/** 정렬 기준 */
export type RouteSortType = 'popular' | 'newest' | 'duration'

/** 소요시간 필터 프리셋 */
interface DurationPreset {
  label: string
  min?: number
  max?: number
}

const DURATION_PRESETS: DurationPreset[] = [
  { label: '전체' },
  { label: '1시간 이내', max: 60 },
  { label: '1~3시간', min: 60, max: 180 },
  { label: '3~6시간', min: 180, max: 360 },
  { label: '6시간 이상', min: 360 },
]

const SORT_OPTIONS: { value: RouteSortType; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'newest', label: '최신순' },
  { value: 'duration', label: '소요시간순' },
]

export interface RouteFilters {
  sort: RouteSortType
  contentName: string
  regionTag: string
  minDuration?: number
  maxDuration?: number
}

interface RouteFilterBarProps {
  filters: RouteFilters
  onFiltersChange: (filters: RouteFilters) => void
}

/**
 * RouteFilterBar - 코스 필터/정렬 UI
 * 작품별, 지역별, 소요시간별 필터 + 정렬 옵션
 * Requirements: 2.1, 2.2
 */
export function RouteFilterBar({
  filters,
  onFiltersChange,
}: RouteFilterBarProps) {
  const updateFilter = useCallback(
    (partial: Partial<RouteFilters>) => {
      onFiltersChange({ ...filters, ...partial })
    },
    [filters, onFiltersChange]
  )

  const handleDurationPreset = useCallback(
    (preset: DurationPreset) => {
      updateFilter({ minDuration: preset.min, maxDuration: preset.max })
    },
    [updateFilter]
  )

  /** 현재 선택된 소요시간 프리셋 인덱스 */
  const activeDurationIdx = DURATION_PRESETS.findIndex((p) => {
    if (!filters.minDuration && !filters.maxDuration) return !p.min && !p.max
    return p.min === filters.minDuration && p.max === filters.maxDuration
  })

  return (
    <div className="space-y-3">
      {/* 정렬 + 텍스트 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 정렬 */}
        <div className="flex rounded-lg border border-border bg-white">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter({ sort: opt.value })}
              className={`px-3 py-1.5 text-sm transition-colors ${
                filters.sort === opt.value
                  ? 'bg-primary text-white'
                  : 'text-primary hover:bg-primary-50'
              } ${opt.value === 'popular' ? 'rounded-l-lg' : ''} ${opt.value === 'duration' ? 'rounded-r-lg' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 작품명 필터 */}
        <input
          type="text"
          placeholder="작품명 검색"
          value={filters.contentName}
          onChange={(e) => updateFilter({ contentName: e.target.value })}
          className="text-text-primary rounded-lg border border-border bg-white px-3 py-1.5 text-sm placeholder-muted outline-none focus:border-primary-400"
        />

        {/* 지역 필터 */}
        <input
          type="text"
          placeholder="지역 검색"
          value={filters.regionTag}
          onChange={(e) => updateFilter({ regionTag: e.target.value })}
          className="text-text-primary rounded-lg border border-border bg-white px-3 py-1.5 text-sm placeholder-muted outline-none focus:border-primary-400"
        />
      </div>

      {/* 소요시간 프리셋 */}
      <div className="flex flex-wrap gap-1.5">
        {DURATION_PRESETS.map((preset, idx) => (
          <button
            key={preset.label}
            onClick={() => handleDurationPreset(preset)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              activeDurationIdx === idx
                ? 'bg-primary text-white'
                : 'bg-primary-50 text-primary hover:bg-primary-100'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
