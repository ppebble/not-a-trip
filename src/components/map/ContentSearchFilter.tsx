'use client'

import { useState, useCallback, useRef, useEffect, useId } from 'react'
import { useShallow } from 'zustand/react/shallow'
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
  const { setSearchQuery, clearSearchQuery } = useFilterStore(
    useShallow((state) => ({
      setSearchQuery: state.setSearchQuery,
      clearSearchQuery: state.clearSearchQuery,
    }))
  )
  const [inputValue, setInputValue] = useState(searchQuery)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { suggestions, isLoading } = useAutocomplete(inputValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)
      // 입력 시에는 자동완성만 열고, 실제 검색은 하지 않음
      setIsDropdownOpen(value.length >= 2)
    },
    []
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    clearSearchQuery()
    setIsDropdownOpen(false)
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
          setInputValue('')
          setIsDropdownOpen(false)
        } else {
          handleClear()
        }
      } else if (e.key === 'Enter') {
        // Enter 키 입력 시에만 검색 적용
        if (inputValue.trim()) {
          setSearchQuery(inputValue.trim())
        }
        setIsDropdownOpen(false)
      }
    },
    [handleClear, inputValue, setSearchQuery]
  )

  return (
    <div ref={containerRef} className={`relative w-48 md:w-56 ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-4 w-4 text-neutral-400 dark:text-neutral-500"
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
        className="w-full rounded-full bg-transparent py-2 pl-10 pr-10 text-sm text-neutral-900 placeholder-neutral-500 transition-all focus:outline-none dark:text-white dark:placeholder-neutral-400"
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
