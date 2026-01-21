'use client'

import { SpotCategory, CATEGORY_CONFIG } from '@/types'

interface CategoryFilterProps {
  selectedCategories: SpotCategory[]
  onChange: (categories: SpotCategory[]) => void
}

const ALL_CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

/**
 * 카테고리 필터 컴포넌트
 * Requirements 2.2: 카테고리별 스팟 필터링 UI
 */
export default function CategoryFilter({
  selectedCategories,
  onChange,
}: CategoryFilterProps) {
  const handleCategoryToggle = (category: SpotCategory) => {
    if (selectedCategories.includes(category)) {
      // 카테고리 제거
      onChange(selectedCategories.filter((c) => c !== category))
    } else {
      // 카테고리 추가
      onChange([...selectedCategories, category])
    }
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === ALL_CATEGORIES.length) {
      // 모두 선택된 상태면 전체 해제
      onChange([])
    } else {
      // 전체 선택
      onChange([...ALL_CATEGORIES])
    }
  }

  const isAllSelected = selectedCategories.length === ALL_CATEGORIES.length

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 전체 선택 버튼 */}
      <button
        onClick={handleSelectAll}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
          isAllSelected
            ? 'bg-navy-600 text-white'
            : 'bg-white/80 text-navy-700 hover:bg-white'
        }`}
      >
        전체
      </button>

      {/* 카테고리 버튼들 */}
      {ALL_CATEGORIES.map((category) => {
        const config = CATEGORY_CONFIG[category]
        const isSelected = selectedCategories.includes(category)

        return (
          <button
            key={category}
            onClick={() => handleCategoryToggle(category)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              isSelected
                ? 'text-white shadow-md'
                : 'bg-white/80 text-navy-700 hover:bg-white'
            }`}
            style={{
              backgroundColor: isSelected ? config.color : undefined,
            }}
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
