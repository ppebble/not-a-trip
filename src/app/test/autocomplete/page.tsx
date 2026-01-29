'use client'

import { useState, useCallback } from 'react'
import AutocompleteDropdown from '@/components/map/AutocompleteDropdown'
import SearchInput from '@/components/map/SearchInput'
import ContentSearchFilter from '@/components/map/ContentSearchFilter'
import { useAutocomplete } from '@/hooks/useAutocomplete'
import { useFilterStore, useSearchQuery } from '@/stores/filterStore'
import type { AutocompleteItem } from '@/hooks/useAutocomplete'

/**
 * 검색 컴포넌트 테스트 페이지
 */
export default function AutocompleteTestPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchQuery = useSearchQuery()
  const { setSearchQuery } = useFilterStore()

  const { suggestions, isLoading } = useAutocomplete(searchQuery)

  const handleInputFocus = useCallback(() => {
    if (searchQuery.length >= 2) {
      setIsDropdownOpen(true)
    }
  }, [searchQuery])

  const handleInputChange = useCallback(() => {
    if (searchQuery.length >= 2) {
      setIsDropdownOpen(true)
    } else {
      setIsDropdownOpen(false)
    }
  }, [searchQuery])

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      setSearchQuery(item.name)
      setIsDropdownOpen(false)
    },
    [setSearchQuery]
  )

  const handleClose = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">
          검색 컴포넌트 테스트
        </h1>

        {/* ContentSearchFilter 통합 컴포넌트 테스트 */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            ContentSearchFilter (통합 컴포넌트)
          </h2>
          <ContentSearchFilter className="w-full" />
          <p className="mt-2 text-sm text-gray-500">
            SearchInput + AutocompleteDropdown 결합된 완성형 컴포넌트
          </p>
        </div>

        {/* 개별 컴포넌트 테스트 영역 */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            개별 컴포넌트 (SearchInput + AutocompleteDropdown)
          </h2>

          <div className="relative">
            <div onFocus={handleInputFocus} onChange={handleInputChange}>
              <SearchInput
                placeholder="작품명, 팀명, 아티스트명, 스팟명 검색..."
                className="w-full"
              />
            </div>
            <AutocompleteDropdown
              items={suggestions}
              isLoading={isLoading}
              onSelect={handleSelect}
              onClose={handleClose}
              isOpen={isDropdownOpen && searchQuery.length >= 2}
            />
          </div>

          {/* 현재 상태 표시 */}
          <div className="mt-6 rounded bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              현재 상태
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <span className="font-medium">검색어:</span>{' '}
                {searchQuery || '(없음)'}
              </li>
              <li>
                <span className="font-medium">드롭다운:</span>{' '}
                {isDropdownOpen ? '열림' : '닫힘'}
              </li>
              <li>
                <span className="font-medium">로딩:</span>{' '}
                {isLoading ? '예' : '아니오'}
              </li>
              <li>
                <span className="font-medium">결과:</span> {suggestions.length}
                개
              </li>
            </ul>
          </div>

          {/* 제안 항목 목록 */}
          {suggestions.length > 0 && (
            <div className="mt-4 rounded bg-gray-50 p-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">
                API 응답
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                {suggestions.map((item, index) => (
                  <li key={index}>
                    {item.name} ({item.category}) - {item.count}개
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
