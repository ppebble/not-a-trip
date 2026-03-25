'use client'

import { SpotCategory, CATEGORY_CONFIG } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import {
  useFilterStore,
  useSelectedCategories,
  ALL_CATEGORIES,
} from '@/stores/filterStore'
import { CategoryIcon } from '@/components/common'

/**
 * 카테고리 필터 컴포넌트
 * Requirements 2.2: 카테고리별 스팟 필터링 UI
 * Requirements 3.2: filterStore 전역 상태 사용
 */
export default function CategoryFilter() {
  const selectedCategories = useSelectedCategories()
  const { toggleCategory, selectAllCategories, clearCategories } =
    useFilterStore(
      useShallow((state) => ({
        toggleCategory: state.toggleCategory,
        selectAllCategories: state.selectAllCategories,
        clearCategories: state.clearCategories,
      }))
    )

  const handleCategoryToggle = (category: SpotCategory) => {
    toggleCategory(category)
  }

  const handleSelectAll = () => {
    if (selectedCategories.length === ALL_CATEGORIES.length) {
      clearCategories()
    } else {
      selectAllCategories()
    }
  }

  const isAllSelected = selectedCategories.length === ALL_CATEGORIES.length

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 전체 선택 버튼 */}
      <button
        onClick={handleSelectAll}
        className={`h-9 rounded-full px-4 text-sm font-medium transition-all ${
          isAllSelected
            ? 'bg-primary text-white'
            : 'bg-white/80 text-text-secondary hover:bg-white'
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
            className={`flex h-9 items-center gap-1.5 overflow-hidden rounded-full px-4 text-sm font-medium transition-all ${
              isSelected
                ? 'text-white shadow-md'
                : 'bg-white/80 text-text-secondary hover:bg-white'
            }`}
            style={{
              backgroundColor: isSelected ? config.bgColor : undefined,
            }}
          >
            <CategoryIcon
              category={category}
              size={category === 'animation' ? '2xl' : 'lg'}
            />
            <span>{config.label}</span>
          </button>
        )
      })}
    </div>
  )
}
