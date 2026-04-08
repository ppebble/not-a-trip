'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Scene } from '@/types'
import { useLikedSceneIds } from '@/stores/likeStore'

interface SceneCardProps {
  scene: Scene
  onLike: (sceneId: string) => void
  isLiking: boolean
  onClick: () => void
}

/**
 * 개별 장면 카드 컴포넌트 - 이미지 중심 카드
 * 호버 시 중앙에 에피소드 정보 + 설명 표시
 * 클릭 시 전체보기 모달 열기
 */
export function SceneCard({
  scene,
  onLike,
  isLiking,
  onClick,
}: SceneCardProps) {
  // likeStore에서 직접 참조
  const likedSceneIds = useLikedSceneIds()
  const liked = likedSceneIds.has(scene.id)

  // 낙관적 업데이트를 위한 로컬 좋아요 수 관리
  const [localLikeCount, setLocalLikeCount] = useState(scene.likeCount)
  const [prevLiked, setPrevLiked] = useState(liked)

  // liked 상태가 변경되면 localLikeCount 업데이트 (낙관적 업데이트)
  useEffect(() => {
    if (liked !== prevLiked) {
      if (liked) {
        setLocalLikeCount((prev) => prev + 1)
      } else {
        setLocalLikeCount((prev) => Math.max(0, prev - 1))
      }
      setPrevLiked(liked)
    }
  }, [liked, prevLiked])

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiking) return
    onLike(scene.id)
  }

  return (
    <div
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-neutral-200 shadow-sm transition-shadow duration-300 hover:shadow-lg"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${scene.episodeInfo || '장면'} 전체보기`}
    >
      <Image
        src={scene.imageUrl}
        alt={scene.episodeInfo || '장면 이미지'}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 50vw"
      />

      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="px-4 text-center text-white">
          {scene.episodeInfo && (
            <p className="mb-2 text-lg font-semibold">{scene.episodeInfo}</p>
          )}
          {scene.description && (
            <p className="line-clamp-3 text-sm text-white/90">
              {scene.description}
            </p>
          )}
          {!scene.episodeInfo && !scene.description && (
            <p className="text-sm text-white/70">정보 없음</p>
          )}
        </div>
      </div>

      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-md transition-all ${
          liked
            ? 'bg-red-500 text-white'
            : 'bg-surface/90 text-neutral-700 hover:bg-red-500 hover:text-white'
        }`}
        aria-label={liked ? '좋아요 취소' : '좋아요'}
        title={liked ? '좋아요 취소' : '좋아요'}
      >
        <svg
          className="h-5 w-5"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{localLikeCount}</span>
      </button>
    </div>
  )
}
