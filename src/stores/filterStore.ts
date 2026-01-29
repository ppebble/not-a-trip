import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { SpotCategory } from '@/types'

const ALL_CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

interface FilterStore {
  selectedCategories: SpotCategory[]
  searchQuery: string

  setSelectedCategories: (categories: SpotCategory[]) => void
  toggleCategory: (category: SpotCategory) => void
  selectAllCategories: () => void
  clearCategories: () => void
  resetFilterState: () => void
  setSearchQuery: (query: string) => void
  clearSearchQuery: () => void
}

export const useFilterStore = create<FilterStore>()(
  devtools(
    (set) => ({
      selectedCategories: [...ALL_CATEGORIES],
      searchQuery: '',

      setSelectedCategories: (categories) =>
        set(
          { selectedCategories: categories },
          false,
          'filterStore/setSelectedCategories'
        ),

      toggleCategory: (category) =>
        set(
          (state) => {
            if (state.selectedCategories.includes(category)) {
              return {
                selectedCategories: state.selectedCategories.filter(
                  (c) => c !== category
                ),
              }
            }
            return {
              selectedCategories: [...state.selectedCategories, category],
            }
          },
          false,
          'filterStore/toggleCategory'
        ),

      selectAllCategories: () =>
        set(
          { selectedCategories: [...ALL_CATEGORIES] },
          false,
          'filterStore/selectAllCategories'
        ),

      clearCategories: () =>
        set({ selectedCategories: [] }, false, 'filterStore/clearCategories'),

      resetFilterState: () =>
        set(
          { selectedCategories: [...ALL_CATEGORIES], searchQuery: '' },
          false,
          'filterStore/resetFilterState'
        ),

      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, 'filterStore/setSearchQuery'),

      clearSearchQuery: () =>
        set({ searchQuery: '' }, false, 'filterStore/clearSearchQuery'),
    }),
    {
      name: 'filter-store',
    }
  )
)

// Selectors
export const useSelectedCategories = () =>
  useFilterStore((state) => state.selectedCategories)

export const useSearchQuery = () => useFilterStore((state) => state.searchQuery)

// Constants export
export { ALL_CATEGORIES }
