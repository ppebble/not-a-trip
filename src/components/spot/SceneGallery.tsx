'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useScenesBySpot, useLikeScene } from '@/hooks/useScenes'
import { Scene } from '@/types'

interface SceneCardProps {
  scene: Scene
  onLike: (sceneId: string) => void
  isLiking: boolean
}

/**
 * 개별 장면 카드 컴포넌트
 */
function SceneCard({ scene, onLike, isLiking }: SceneCardProps) {
  const [liked, setLiked] = useState(false)
  const [localLikeCount, setLocalLikeCount] = useState(scene.likeCount)

  const handleLike = () => {
    if (liked || isLiking) return

    setLiked(true)
    setLocalLikeCount((prev) => prev + 1)
    onLike(scene.id)
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* 이미지 */}
      <div className="relative aspect-video">
        <Image
          src={scene.imageUrl}
          alt={`${scene.animeTitle} 장면`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {/* 오버레이 - 호버 시 표시 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-medium text-gray-900">
              {scene.animeTitle}
            </h4>
            {scene.episodeInfo && (
              <p className="text-xs text-gray-500">{scene.episodeInfo}</p>
            )}
          </div>

          {/* 좋아요 버튼 */}
          <button
            onClick={handleLike}
            disabled={liked || isLiking}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all ${
              liked
                ? 'bg-red-50 text-red-500'
                : 'bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500'
            }`}
            aria-label={liked ? '좋아요 완료' : '좋아요'}
          >
            <svg
              className="h-4 w-4"
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

        {scene.description && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-600">
            {scene.description}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * 로딩 스켈레톤
 */
function SceneGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-gray-200"
        >
          <div className="aspect-video bg-gray-200" />
          <div className="p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 빈 상태 표시
 */
function SceneGalleryEmpty() {
  return (
    <div className="py-8 text-center">
      <div className="mb-3 text-3xl">🎬</div>
      <p className="text-gray-600">아직 등록된 장면이 없습니다</p>
      <p className="mt-1 text-sm text-gray-500">
        곧 작품 속 장면이 추가될 예정입니다
      </p>
    </div>
  )
}

interface SceneGalleryProps {
  spotId: string
}

/**
 * 작품 속 장면 갤러리 컴포넌트
 */
export default function SceneGallery({ spotId }: SceneGalleryProps) {
  const { data: scenes, isLoading, error } = useScenesBySpot(spotId)
  const likeScene = useLikeScene()

  const handleLike = (sceneId: string) => {
    likeScene.mutate(sceneId)
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          <h2 className="text-2xl font-bold text-gray-900">작품 속 장면</h2>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          이 장소가 등장한 애니메이션 장면들입니다. 마음에 드는 장면에 좋아요를
          눌러주세요!
        </p>

        {/* 콘텐츠 */}
        {isLoading ? (
          <SceneGallerySkeleton />
        ) : error ? (
          <div className="py-8 text-center text-gray-500">
            장면을 불러오는데 실패했습니다
          </div>
        ) : !scenes || scenes.length === 0 ? (
          <SceneGalleryEmpty />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                onLike={handleLike}
                isLiking={likeScene.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
