'use client'

import { useState, useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFilterStore, useSearchQuery } from '@/stores/filterStore'

/**
 * SearchInput 컴포넌트 Props
 */
interface SearchInputProps {
  placeholder?: string
  className?: string
}

/**
 * 검색 입력 컴포넌트
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 * - 1.1: 지도 상단 필터 영역에 카테고리 필터와 함께 표시
 * - 1.2: 포커스 시 플레이스홀더 텍스트 표시
 * - 1.3: 검색어 입력 시 실시간 반영
 * - 1.4: 검색어 초기화 버튼(X) 제공
 * - 1.5: 초기화 버튼 클릭 시 검색어 비우고 필터 해제
 */
export default function SearchInput({
  placeholder = '작품명, 팀명, 아티스트명 검색...',
  className = '',
}: SearchInputProps) {
  const searchQuery = useSearchQuery()
  const { setSearchQuery, clearSearchQuery } = useFilterStore(
    useShallow((state) => ({
      setSearchQuery: state.setSearchQuery,
      clearSearchQuery: state.clearSearchQuery,
    }))
  )

  // 로컬 입력 상태 (실시간 반영용)
  const [inputValue, setInputValue] = useState(searchQuery)

  // filterStore의 searchQuery가 외부에서 변경될 때 동기화
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  // 입력값 변경 핸들러 (Requirements 1.3: 실시간 반영)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      setSearchQuery(value)
    },
    [setSearchQuery]
  )

  // 초기화 버튼 클릭 핸들러 (Requirements 1.5)
  const handleClear = useCallback(() => {
    setInputValue('')
    clearSearchQuery()
  }, [clearSearchQuery])

  // 키보드 이벤트 핸들러 (Escape로 초기화)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear()
      }
    },
    [handleClear]
  )

  return (
    <div className={`relative ${className}`}>
      {/* 검색 아이콘 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* 검색 입력 필드 (Requirements 1.2, 1.3) */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-full border border-neutral-200 bg-white/90 py-2 pl-10 pr-10 text-sm text-neutral-900 placeholder-neutral-500 shadow-sm transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-white dark:placeholder-neutral-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
        aria-label="콘텐츠 검색"
      />

      {/* 초기화 버튼 (Requirements 1.4, 1.5) */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          aria-label="검색어 초기화"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
