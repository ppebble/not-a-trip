'use client'

import { useState, useCallback, useRef, useEffect, useId } from 'react'
import { useFilterStore, useSearchQuery } from '@/stores/filterStore'
import { useAutocomplete, AutocompleteItem } from '@/hooks/useAutocomplete'
import AutocompleteDropdown from './AutocompleteDropdown'

interface ContentSearchFilterProps {
  placeholder?: string
  className?: string
}

export default function ContentSearchFilter({
  placeholder = '작품명, 팀명, 아티스트명 검색...',
  className = '',
}: ContentSearchFilterProps) {
  const dropdownId = useId()
  const searchQuery = useSearchQuery()
  const { setSearchQuery, clearSearchQuery } = useFilterStore()
  const [inputValue, setInputValue] = useState(searchQuery)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { suggestions, isLoading } = useAutocomplete(inputValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(searchQuery)
    // 검색어가 있으면 확장 상태 유지
    if (searchQuery) {
      setIsExpanded(true)
    }
  }, [searchQuery])

  // 외부 클릭 시 검색창 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // 검색어가 없으면 접기
        if (!inputValue) {
          setIsExpanded(false)
        }
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [inputValue])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      setSearchQuery(value)
      setIsDropdownOpen(value.length >= 2)
    },
    [setSearchQuery]
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    clearSearchQuery()
    setIsDropdownOpen(false)
    setIsExpanded(false)
  }, [clearSearchQuery])

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      setInputValue(item.name)
      setSearchQuery(item.name)
      setIsDropdownOpen(false)
    },
    [setSearchQuery]
  )

  const handleCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])

  const handleFocus = useCallback(() => {
    if (inputValue.length >= 2) {
      setIsDropdownOpen(true)
    }
  }, [inputValue.length])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        if (inputValue) {
          handleClear()
        } else {
          setIsExpanded(false)
        }
      } else if (e.key === 'Enter') {
        setIsDropdownOpen(false)
      }
    },
    [handleClear, inputValue]
  )

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
    // 확장 시 input에 포커스
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isExpanded])

  // 접힌 상태: 돋보기 버튼만 표시
  if (!isExpanded) {
    return (
      <button
        onClick={handleToggleExpand}
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:bg-white ${className}`}
        aria-label="검색 열기"
      >
        <svg
          className="h-5 w-5 text-navy-600"
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
      </button>
    )
  }

  // 확장된 상태: 검색 입력창 표시
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-gray-400"
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
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-64 rounded-full border border-gray-200 bg-white/95 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 shadow-lg backdrop-blur-sm transition-all focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-500"
        role="combobox"
        aria-label="콘텐츠 검색"
        aria-expanded={isDropdownOpen}
        aria-controls={dropdownId}
        aria-haspopup="listbox"
        aria-autocomplete="list"
      />
      <button
        type="button"
        onClick={handleClear}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
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
      <AutocompleteDropdown
        id={dropdownId}
        items={suggestions}
        isLoading={isLoading}
        onSelect={handleSelect}
        onClose={handleCloseDropdown}
        isOpen={isDropdownOpen}
      />
    </div>
  )
}
