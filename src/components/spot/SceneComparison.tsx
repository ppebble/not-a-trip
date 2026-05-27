'use client'

/**
 * SceneComparison 컴포넌트
 * 작품별 장면 그룹화 + 탭 네비게이션
 *
 * Requirements 6.1, 6.2, 6.4, 6.7
 */

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Scene, SpotContentRelation, RELATION_TYPE_LABELS } from '@/types'
import { getSafeImageSrc } from '@/lib/safe-image-src'

// ============================================
// Types
// ============================================

export interface SceneGroup {
  contentName: string
  relationType?: string
  scenes: Scene[]
}

export interface SceneComparisonProps {
  spotId: string
  scenes: Scene[]
  relations: SpotContentRelation[]
  /** 현재 선택된 contentName (CheckInModal에서 전달) */
  selectedContentName?: string
}

// ============================================
// groupScenesByContent 함수 (Requirements 6.1, 6.2, 6.4)
// ============================================

/**
 * 장면을 작품별로 그룹화
 *
 * @invariant 모든 scene은 정확히 하나의 그룹에 속함
 * @invariant contentName이 있는 scene은 해당 contentName 그룹에 배치
 * @invariant contentName이 없는 scene은 displayPriority 최소 relation 그룹에 배치
 * @invariant 그룹 순서는 relation의 displayPriority 오름차순
 */
export function groupScenesByContent(
  scenes: Scene[],
  relations: SpotContentRelation[]
): SceneGroup[] {
  if (scenes.length === 0) return []

  // active relations만 사용, displayPriority 오름차순 정렬
  const activeRelations = relations
    .filter((r) => r.status === 'active')
    .sort((a, b) => a.displayPriority - b.displayPriority)

  // relations가 없으면 모든 장면을 단일 그룹으로
  if (activeRelations.length === 0) {
    const fallbackName =
      scenes[0]?.contentName || scenes[0]?.animeTitle || '장면'
    return [
      {
        contentName: fallbackName,
        scenes,
      },
    ]
  }

  // 대표 relation (displayPriority 최소)
  const representativeRelation = activeRelations[0]

  // contentName → SceneGroup 매핑
  const groupMap = new Map<string, SceneGroup>()

  // relation 기반으로 그룹 초기화 (displayPriority 순서 유지)
  for (const relation of activeRelations) {
    if (!groupMap.has(relation.contentName)) {
      groupMap.set(relation.contentName, {
        contentName: relation.contentName,
        relationType: relation.relationType,
        scenes: [],
      })
    }
  }

  // 장면 배치
  for (const scene of scenes) {
    const sceneContentName = scene.contentName || scene.animeTitle

    if (sceneContentName && groupMap.has(sceneContentName)) {
      // contentName이 있고 매칭되는 그룹이 있으면 해당 그룹에 배치
      groupMap.get(sceneContentName)!.scenes.push(scene)
    } else if (sceneContentName) {
      // contentName이 있지만 매칭되는 relation 그룹이 없으면 새 그룹 생성
      if (!groupMap.has(sceneContentName)) {
        groupMap.set(sceneContentName, {
          contentName: sceneContentName,
          scenes: [scene],
        })
      } else {
        groupMap.get(sceneContentName)!.scenes.push(scene)
      }
    } else {
      // contentName이 없으면 대표 relation 그룹에 배치 (Requirements 6.4)
      groupMap.get(representativeRelation.contentName)!.scenes.push(scene)
    }
  }

  // displayPriority 순서로 그룹 반환 (빈 그룹 제외하지 않음 — 탭 표시용)
  const orderedGroups: SceneGroup[] = []
  for (const relation of activeRelations) {
    const group = groupMap.get(relation.contentName)
    if (
      group &&
      !orderedGroups.find((g) => g.contentName === group.contentName)
    ) {
      orderedGroups.push(group)
    }
  }

  // relation에 매칭되지 않는 추가 그룹 (새로 생성된 그룹)
  for (const [, group] of groupMap) {
    if (!orderedGroups.find((g) => g.contentName === group.contentName)) {
      orderedGroups.push(group)
    }
  }

  return orderedGroups
}

// ============================================
// 대표 장면 이미지 가져오기 (Requirements 6.5)
// ============================================

/**
 * 선택된 작품의 대표 장면 이미지 URL을 반환
 * CheckInModal에서 선택된 작품의 첫 번째 장면을 sceneImageUrl로 사용
 */
export function getSceneImageForContent(
  scenes: Scene[],
  relations: SpotContentRelation[],
  selectedContentName?: string
): string | undefined {
  if (scenes.length === 0) return undefined

  const groups = groupScenesByContent(scenes, relations)

  if (selectedContentName) {
    // 선택된 작품의 그룹에서 첫 번째 장면
    const selectedGroup = groups.find(
      (g) => g.contentName === selectedContentName
    )
    if (selectedGroup && selectedGroup.scenes.length > 0) {
      return selectedGroup.scenes[0].imageUrl
    }
  }

  // 선택되지 않았거나 매칭 실패 시 대표 그룹의 첫 번째 장면
  if (groups.length > 0 && groups[0].scenes.length > 0) {
    return groups[0].scenes[0].imageUrl
  }

  return undefined
}

// ============================================
// SceneComparison 컴포넌트 (Requirements 6.7)
// ============================================

export function SceneComparison({
  scenes,
  relations,
  selectedContentName,
}: SceneComparisonProps) {
  const groups = useMemo(
    () => groupScenesByContent(scenes, relations),
    [scenes, relations]
  )

  // 초기 탭: selectedContentName이 있으면 해당 탭, 없으면 첫 번째
  const initialTabIndex = useMemo(() => {
    if (selectedContentName) {
      const idx = groups.findIndex((g) => g.contentName === selectedContentName)
      return idx >= 0 ? idx : 0
    }
    return 0
  }, [groups, selectedContentName])

  const [activeTab, setActiveTab] = useState(initialTabIndex)

  if (groups.length === 0) {
    return null
  }

  const activeGroup = groups[activeTab] || groups[0]

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
      <div className="p-4 md:p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <h2 className="text-lg font-bold text-main-text md:text-xl">
            작품별 장면 비교
          </h2>
        </div>

        {/* 탭 네비게이션 (Requirements 6.7) — 2개 이상 그룹일 때만 표시 */}
        {groups.length > 1 && (
          <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {groups.map((group, index) => (
              <button
                key={group.contentName}
                onClick={() => setActiveTab(index)}
                className={`flex-shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === index
                    ? 'bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-primary-400'
                    : 'text-sub-text hover:text-main-text'
                }`}
              >
                {group.contentName}
                {group.scenes.length > 0 && (
                  <span className="ml-1 text-xs text-sub-text">
                    ({group.scenes.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 관계 유형 라벨 */}
        {activeGroup.relationType && (
          <p className="mb-3 text-sm text-sub-text">
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary-900/30 dark:text-primary-400">
              {RELATION_TYPE_LABELS[
                activeGroup.relationType as keyof typeof RELATION_TYPE_LABELS
              ] || activeGroup.relationType}
            </span>
          </p>
        )}

        {/* 장면 목록 */}
        {activeGroup.scenes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sub-text">이 작품의 등록된 장면이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeGroup.scenes.map((scene) => (
              <div
                key={scene.id}
                className="overflow-hidden rounded-lg border border-border"
              >
                <div className="relative aspect-video">
                  <Image
                    src={getSafeImageSrc(scene.imageUrl)}
                    alt={scene.description || `${scene.animeTitle} 장면`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized={getSafeImageSrc(scene.imageUrl).startsWith(
                      'http'
                    )}
                  />
                </div>
                <div className="p-3">
                  {scene.episodeInfo && (
                    <p className="text-xs font-medium text-primary">
                      {scene.episodeInfo}
                    </p>
                  )}
                  {scene.description && (
                    <p className="mt-1 text-sm text-sub-text">
                      {scene.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SceneComparison
