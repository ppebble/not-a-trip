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
    <div
      data-tour="category-filter"
      className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-1 py-1"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* 전체 선택 버튼 */}
      <button
        onClick={handleSelectAll}
        className={`h-9 flex-shrink-0 rounded-full border px-4 text-sm font-bold shadow-sm transition-all ${
          isAllSelected
            ? 'border-primary bg-primary text-white shadow-md'
            : 'line-through/90 border-neutral-300 bg-neutral-200/90 text-neutral-500 dark:text-neutral-500'
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
            className={`flex h-9 flex-shrink-0 items-center gap-1.5 overflow-hidden rounded-full border px-4 text-sm font-bold shadow-sm transition-all ${
              isSelected
                ? 'border-transparent shadow-md'
                : 'line-through/90 border-neutral-300 bg-neutral-200/90 text-neutral-500 dark:text-neutral-500'
            }`}
            style={{
              backgroundColor: isSelected ? config.bgColor : undefined,
              color: isSelected ? config.fgColor : undefined,
            }}
          >
            <div className={isSelected ? '' : 'opacity-40 grayscale'}>
              <CategoryIcon
                category={category}
                size={category === 'animation' ? '2xl' : 'lg'}
              />
            </div>
            <span className={isSelected ? 'drop-shadow-sm' : ''}>
              {config.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
