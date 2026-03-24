'use client'

import { FacilityType } from '@/types'

interface FacilityFilterConfig {
  label: string
  icon: string
  color: string
}

interface FacilityFilterProps {
  /** 시설이 존재하는 카테고리만 (순서 유지) */
  availableTypes: FacilityType[]
  /** 현재 선택된 카테고리 Set */
  selectedTypes: Set<FacilityType>
  /** 카테고리 토글 콜백 */
  onToggle: (type: FacilityType) => void
  /** 전체 선택/해제 콜백 */
  onSelectAll: () => void
  /** 카테고리별 설정 (아이콘, 라벨, 색상) */
  config: Record<FacilityType, FacilityFilterConfig>
}

export default function FacilityFilter({
  availableTypes,
  selectedTypes,
  onToggle,
  onSelectAll,
  config,
}: FacilityFilterProps) {
  const isAllSelected = selectedTypes.size === 0

  return (
    <div
      className="mb-4 flex flex-wrap gap-2"
      role="group"
      aria-label="편의시설 카테고리 필터"
    >
      {/* 전체 칩 */}
      <button
        onClick={onSelectAll}
        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
          isAllSelected
            ? 'border-primary-300 bg-primary-100 text-primary-800'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        }`}
        aria-pressed={isAllSelected}
      >
        전체
      </button>

      {/* 카테고리별 칩 */}
      {availableTypes.map((type) => {
        const { icon, label, color } = config[type]
        const isSelected = selectedTypes.has(type)

        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? color
                : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
            }`}
            aria-pressed={isSelected}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
