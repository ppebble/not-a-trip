'use client'

import { useState } from 'react'
import { RelatedContent, ContentType } from '@/types'
import { RelatedContentItem } from './RelatedContentItem'
import {
  isDuplicateContent,
  reorderContents,
  removeContentAtIndex,
} from '@/lib/content-utils'

interface RelatedContentFormProps {
  value: RelatedContent[]
  onChange: (contents: RelatedContent[]) => void
  maxItems?: number
}

// 콘텐츠 타입 라벨 설정
const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  anime: '애니메이션',
  movie: '영화',
  drama: '드라마',
  sports_team: '스포츠 팀',
  artist: '아티스트',
  game: '게임',
  other: '기타',
}

/**
 * 관련 콘텐츠 폼 컴포넌트
 *
 * Requirements:
 * - 1.1: 콘텐츠 추가 후 즉시 새로운 콘텐츠 추가 버튼 표시
 * - 1.2: 추가된 모든 콘텐츠를 목록으로 표시
 * - 1.3: 특정 항목만 삭제하고 나머지 유지
 * - 1.4: 추가된 콘텐츠 개수 표시
 * - 2.1: 드래그 앤 드롭으로 순서 변경
 * - 2.2: 변경된 순서 즉시 반영
 * - 2.3: 드래그 핸들 표시
 * - 4.1: 중복 경고 메시지 표시
 * - 4.2: 강제 추가 옵션 제공
 * - 4.3: 대소문자 무시, 공백 제거하여 비교
 * - 6.3: 빈 상태 안내 메시지 표시
 */
export function RelatedContentForm({
  value,
  onChange,
  maxItems = 20,
}: RelatedContentFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState<Partial<RelatedContent>>({
    name: '',
    type: 'anime',
    year: undefined,
    additionalInfo: '',
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  // 콘텐츠 추가
  const handleAdd = (forceAdd = false) => {
    if (!newContent.name?.trim()) return

    // 중복 검사
    if (!forceAdd && isDuplicateContent(value, newContent.name)) {
      setDuplicateWarning(
        `"${newContent.name.trim()}"과(와) 유사한 콘텐츠가 이미 추가되어 있습니다.`
      )
      return
    }

    const content: RelatedContent = {
      name: newContent.name.trim(),
      type: newContent.type || 'anime',
      year: newContent.year,
      additionalInfo: newContent.additionalInfo?.trim() || undefined,
    }

    onChange([...value, content])
    resetForm()
  }

  // 폼 초기화
  const resetForm = () => {
    setNewContent({
      name: '',
      type: 'anime',
      year: undefined,
      additionalInfo: '',
    })
    setIsAdding(false)
    setDuplicateWarning(null)
  }

  // 콘텐츠 삭제
  const handleRemove = (index: number) => {
    onChange(removeContentAtIndex(value, index))
  }

  // 드래그 시작
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  // 드래그 오버
  const handleDragOver = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  // 드래그 종료
  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null) {
      onChange(reorderContents(value, draggedIndex, dragOverIndex))
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // 취소
  const handleCancel = () => {
    resetForm()
  }

  // 최대 개수 도달 여부
  const isMaxReached = value.length >= maxItems

  return (
    <div className="space-y-4">
      {/* 콘텐츠 개수 표시 */}
      {value.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-navy-700">
            추가된 콘텐츠{' '}
            <span className="text-navy-500">({value.length}개)</span>
          </span>
          {isMaxReached && (
            <span className="text-xs text-amber-600">
              최대 {maxItems}개까지 추가 가능합니다
            </span>
          )}
        </div>
      )}

      {/* 추가된 콘텐츠 목록 - RelatedContentItem 사용 */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((content, index) => (
            <RelatedContentItem
              key={`${content.name}-${index}`}
              content={content}
              index={index}
              onRemove={() => handleRemove(index)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
            />
          ))}
        </div>
      )}

      {/* 콘텐츠 추가 폼 */}
      {isAdding ? (
        <div className="rounded-lg border border-navy-200 bg-navy-50 p-4">
          <div className="space-y-3">
            {/* 콘텐츠 타입 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                콘텐츠 타입
              </label>
              <select
                value={newContent.type}
                onChange={(e) =>
                  setNewContent({
                    ...newContent,
                    type: e.target.value as ContentType,
                  })
                }
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-800 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              >
                {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map(
                  (type) => (
                    <option key={type} value={type}>
                      {CONTENT_TYPE_LABELS[type]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* 콘텐츠 이름 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newContent.name}
                onChange={(e) => {
                  setNewContent({ ...newContent, name: e.target.value })
                  setDuplicateWarning(null)
                }}
                placeholder="작품명, 팀명, 아티스트명 등"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-800 placeholder-navy-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              />
            </div>

            {/* 연도 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                연도 <span className="text-xs text-navy-400">(선택)</span>
              </label>
              <input
                type="number"
                value={newContent.year || ''}
                onChange={(e) =>
                  setNewContent({
                    ...newContent,
                    year: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="2024"
                min={1900}
                max={2100}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-800 placeholder-navy-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              />
            </div>

            {/* 추가 정보 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                추가 정보 <span className="text-xs text-navy-400">(선택)</span>
              </label>
              <input
                type="text"
                value={newContent.additionalInfo || ''}
                onChange={(e) =>
                  setNewContent({
                    ...newContent,
                    additionalInfo: e.target.value,
                  })
                }
                placeholder="에피소드, 시즌, 앨범명 등"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-800 placeholder-navy-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              />
            </div>
          </div>

          {/* 중복 경고 메시지 */}
          {duplicateWarning && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-700">{duplicateWarning}</p>
              <button
                type="button"
                onClick={() => handleAdd(true)}
                className="mt-2 text-sm font-medium text-amber-700 underline hover:text-amber-800"
              >
                그래도 추가하기
              </button>
            </div>
          )}

          {/* 버튼 */}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-navy-300 px-3 py-1.5 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => handleAdd(false)}
              disabled={!newContent.name?.trim()}
              className="rounded-lg bg-navy-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      ) : (
        !isMaxReached && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 bg-navy-50 px-4 py-3 text-sm font-medium text-navy-600 transition-colors hover:border-navy-300 hover:bg-navy-100"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            관련 콘텐츠 추가
          </button>
        )
      )}

      {/* 빈 상태 안내 메시지 */}
      {value.length === 0 && !isAdding && (
        <p className="text-center text-xs text-navy-400">
          이 스팟과 관련된 작품, 팀, 아티스트 등을 추가할 수 있습니다
        </p>
      )}
    </div>
  )
}
