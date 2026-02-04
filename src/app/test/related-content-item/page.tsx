'use client'

import { useState } from 'react'
import { RelatedContentItem } from '@/components/spot/RelatedContentItem'
import { RelatedContent } from '@/types'
import { reorderContents, removeContentAtIndex } from '@/lib/content-utils'

// 테스트용 샘플 데이터
const SAMPLE_CONTENTS: RelatedContent[] = [
  { name: '도쿄구울', type: 'anime', year: 2014, additionalInfo: '시즌 1' },
  { name: '원피스', type: 'anime', year: 1999 },
  { name: '너의 이름은', type: 'movie', year: 2016 },
  { name: 'FC 도쿄', type: 'sports_team', additionalInfo: 'J리그' },
  { name: 'YOASOBI', type: 'artist', year: 2019 },
  { name: '페르소나 5', type: 'game', year: 2016 },
]

export default function RelatedContentItemTestPage() {
  const [contents, setContents] = useState<RelatedContent[]>(SAMPLE_CONTENTS)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

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
      setContents(reorderContents(contents, draggedIndex, dragOverIndex))
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // 삭제
  const handleRemove = (index: number) => {
    setContents(removeContentAtIndex(contents, index))
  }

  // 초기화
  const handleReset = () => {
    setContents(SAMPLE_CONTENTS)
  }

  return (
    <div className="min-h-screen bg-navy-50 p-8 pt-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold text-navy-800">
          🧪 RelatedContentItem 테스트
        </h1>
        <p className="mb-6 text-sm text-navy-500">
          드래그 앤 드롭으로 순서 변경, 삭제 버튼 클릭으로 항목 삭제
        </p>

        {/* 상태 패널 */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <h2 className="mb-2 font-medium text-navy-700">현재 상태</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-navy-600">
              총 항목: <strong>{contents.length}개</strong>
            </span>
            <span className="text-navy-600">
              드래그 중:{' '}
              <strong>
                {draggedIndex !== null ? `#${draggedIndex}` : '-'}
              </strong>
            </span>
            <span className="text-navy-600">
              드롭 위치:{' '}
              <strong>
                {dragOverIndex !== null ? `#${dragOverIndex}` : '-'}
              </strong>
            </span>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 rounded bg-navy-600 px-3 py-1 text-sm text-white hover:bg-navy-700"
          >
            초기화
          </button>
        </div>

        {/* 콘텐츠 목록 */}
        <div className="space-y-2">
          {contents.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-navy-200 p-8 text-center text-navy-400">
              모든 항목이 삭제되었습니다. 초기화 버튼을 눌러주세요.
            </div>
          ) : (
            contents.map((content, index) => (
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
            ))
          )}
        </div>

        {/* 현재 순서 표시 */}
        <div className="mt-6 rounded-lg bg-navy-100 p-4">
          <h3 className="mb-2 text-sm font-medium text-navy-700">현재 순서</h3>
          <ol className="list-inside list-decimal text-sm text-navy-600">
            {contents.map((content, index) => (
              <li key={index}>{content.name}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
