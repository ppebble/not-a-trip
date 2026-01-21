'use client'

import { useState } from 'react'
import { RelatedContent, ContentType } from '@/types'

interface RelatedContentFormProps {
  value: RelatedContent[]
  onChange: (contents: RelatedContent[]) => void
}

// 콘텐츠 타입 설정
const CONTENT_TYPE_CONFIG: Record<
  ContentType,
  { label: string; icon: string }
> = {
  anime: { label: '애니메이션', icon: '🎬' },
  movie: { label: '영화', icon: '🎥' },
  drama: { label: '드라마', icon: '📺' },
  sports_team: { label: '스포츠 팀', icon: '⚽' },
  artist: { label: '아티스트', icon: '🎵' },
  game: { label: '게임', icon: '🎮' },
  other: { label: '기타', icon: '📍' },
}

/**
 * 관련 콘텐츠 폼 컴포넌트
 *
 * Requirements:
 * - 4.3: 선택 필드 (관련 콘텐츠)
 */
export function RelatedContentForm({
  value,
  onChange,
}: RelatedContentFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState<Partial<RelatedContent>>({
    name: '',
    type: 'anime',
    year: undefined,
    additionalInfo: '',
  })

  // 콘텐츠 추가
  const handleAdd = () => {
    if (!newContent.name?.trim()) return

    const content: RelatedContent = {
      name: newContent.name.trim(),
      type: newContent.type || 'anime',
      year: newContent.year,
      additionalInfo: newContent.additionalInfo?.trim() || undefined,
    }

    onChange([...value, content])
    setNewContent({
      name: '',
      type: 'anime',
      year: undefined,
      additionalInfo: '',
    })
    setIsAdding(false)
  }

  // 콘텐츠 삭제
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  // 취소
  const handleCancel = () => {
    setNewContent({
      name: '',
      type: 'anime',
      year: undefined,
      additionalInfo: '',
    })
    setIsAdding(false)
  }

  return (
    <div className="space-y-4">
      {/* 추가된 콘텐츠 목록 */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((content, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-navy-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {CONTENT_TYPE_CONFIG[content.type]?.icon || '📍'}
                </span>
                <div>
                  <p className="font-medium text-navy-800">{content.name}</p>
                  <p className="text-xs text-navy-500">
                    {CONTENT_TYPE_CONFIG[content.type]?.label || '기타'}
                    {content.year && ` · ${content.year}년`}
                    {content.additionalInfo && ` · ${content.additionalInfo}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="rounded p-1 text-navy-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="삭제"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
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
                {(Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]).map(
                  (type) => (
                    <option key={type} value={type}>
                      {CONTENT_TYPE_CONFIG[type].icon}{' '}
                      {CONTENT_TYPE_CONFIG[type].label}
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
                onChange={(e) =>
                  setNewContent({ ...newContent, name: e.target.value })
                }
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
              onClick={handleAdd}
              disabled={!newContent.name?.trim()}
              className="rounded-lg bg-navy-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      ) : (
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
      )}

      {/* 안내 메시지 */}
      {value.length === 0 && !isAdding && (
        <p className="text-center text-xs text-navy-400">
          이 스팟과 관련된 작품, 팀, 아티스트 등을 추가할 수 있습니다
        </p>
      )}
    </div>
  )
}
