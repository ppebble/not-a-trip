'use client'

/**
 * RelationSelector — 체크인 모달 내 작품 선택 UI 컴포넌트
 * Spec: multi-content-spot-structure
 * Requirements: 3.2, 3.3, 3.4, 3.8
 */

import { SpotContentRelation, RELATION_TYPE_LABELS } from '@/types'

interface RelationSelectorProps {
  /** 해당 스팟의 active relations (displayPriority 정렬됨) */
  relations: SpotContentRelation[]
  /** 선택된 relationId */
  selectedRelationId: string | null
  /** 선택 변경 콜백 */
  onSelect: (relationId: string) => void
}

export default function RelationSelector({
  relations,
  selectedRelationId,
  onSelect,
}: RelationSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        어떤 작품에 대한 인증인가요?
      </label>
      <div className="grid gap-2">
        {relations.map((relation) => {
          const isSelected = selectedRelationId === relation.id
          const typeLabel = RELATION_TYPE_LABELS[relation.relationType]

          return (
            <button
              key={relation.id}
              type="button"
              onClick={() => onSelect(relation.id)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                isSelected
                  ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
              aria-pressed={isSelected}
            >
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    isSelected
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {relation.contentName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {typeLabel}
                </p>
              </div>
              {isSelected && (
                <svg
                  className="h-5 w-5 flex-shrink-0 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
