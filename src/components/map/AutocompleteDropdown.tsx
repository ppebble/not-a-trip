'use client'

import { useEffect, useRef, useCallback } from 'react'
import { SpotCategory } from '@/types'
import { CategoryIcon } from '@/components/common'
import type { AutocompleteItem } from '@/hooks/useAutocomplete'

/**
 * AutocompleteDropdown 컴포넌트 Props
 */
interface AutocompleteDropdownProps {
  id?: string
  items: AutocompleteItem[]
  isLoading: boolean
  onSelect: (item: AutocompleteItem) => void
  onClose: () => void
  isOpen: boolean
}

/**
 * 카테고리 라벨 가져오기
 */
function getCategoryLabel(category: SpotCategory): string {
  const labels: Record<SpotCategory, string> = {
    animation: '애니메이션',
    sports: '스포츠',
    movie_drama: '영화/드라마',
    music: '음악/콘서트',
    game: '게임',
    other: '기타',
  }
  return labels[category] || '기타'
}

/**
 * AutocompleteDropdown 컴포넌트
 * Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 * - 2.2: 최대 10개의 제안 항목 표시
 * - 2.3: 제안 항목 클릭 시 SearchInput에 해당 Content_Name으로 채워짐
 * - 2.4: 제안 항목 클릭 시 Search_Filter 즉시 적용
 * - 2.5: 매칭 결과 없으면 "검색 결과 없음" 메시지 표시
 * - 2.6: 각 제안 항목에 해당 카테고리 아이콘 표시
 * - 2.7: SearchInput 외부 클릭 시 닫힘
 */
export default function AutocompleteDropdown({
  id,
  items,
  isLoading,
  onSelect,
  onClose,
  isOpen,
}: AutocompleteDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지 (Requirements 2.7)
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    },
    [onClose]
  )

  // 외부 클릭 이벤트 리스너 등록
  useEffect(() => {
    if (isOpen) {
      // 약간의 지연을 두어 클릭 이벤트가 즉시 발생하지 않도록 함
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, handleClickOutside])

  // 드롭다운이 닫혀있으면 렌더링하지 않음
  if (!isOpen) {
    return null
  }

  // 항목 클릭 핸들러 (Requirements 2.3, 2.4)
  const handleItemClick = (item: AutocompleteItem) => {
    onSelect(item)
    onClose()
  }

  // 키보드 이벤트 핸들러
  const handleKeyDown = (
    event: React.KeyboardEvent,
    item: AutocompleteItem
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleItemClick(item)
    }
  }

  return (
    <div
      id={id}
      ref={dropdownRef}
      className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-surface shadow-lg dark:bg-neutral-800"
      role="listbox"
      aria-label="자동완성 제안 목록"
    >
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center px-4 py-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary dark:border-neutral-600" />
          <span className="ml-2 text-sm text-neutral-500 dark:text-neutral-400">
            검색 중...
          </span>
        </div>
      )}

      {/* 검색 결과 없음 (Requirements 2.5) */}
      {!isLoading && items.length === 0 && (
        <div className="px-4 py-3 text-center text-sm text-neutral-500 dark:text-neutral-400">
          검색 결과 없음
        </div>
      )}

      {/* 제안 항목 목록 (Requirements 2.2, 2.6) */}
      {!isLoading && items.length > 0 && (
        <ul className="max-h-60 overflow-y-auto">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${item.category}-${index}`}
              role="option"
              tabIndex={0}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              className="flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none dark:focus:bg-neutral-700"
              aria-selected="false"
            >
              <div className="flex items-center gap-2">
                {/* 카테고리 아이콘 (Requirements 2.6) */}
                <CategoryIcon
                  category={item.category}
                  size="md"
                  className="flex-shrink-0"
                />
                {/* 콘텐츠명 */}
                <span className="text-sm font-medium text-neutral-900">
                  {item.name}
                </span>
              </div>
              {/* 스팟 개수 */}
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {item.count}개 스팟
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
