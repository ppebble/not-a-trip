'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useScenesBySpot, useToggleLike } from '@/hooks/useScenes'
import { SpotCategory, SECTION_HEADERS, SECTION_ICONS } from '@/types'
import SceneImageModal from './SceneImageModal'
import { API_ROUTES } from '@/lib/api-routes'
import { SceneCarousel, AddSceneModal, SceneGallerySkeleton } from './scene'
import { useLikeStore, useIsLoadingLikes } from '@/stores/likeStore'

interface SceneGalleryProps {
  spotId: string
  category?: SpotCategory
}

export default function SceneGallery({
  spotId,
  category = 'animation',
}: SceneGalleryProps) {
  useSession()
  const { data: scenes, isLoading, error } = useScenesBySpot(spotId)
  const toggleLike = useToggleLike()
  const [showAddModal, setShowAddModal] = useState(false)
  const [imageModalIndex, setImageModalIndex] = useState<number | null>(null)

  // likeStore 전역 상태 사용
  const isLoadingLikes = useIsLoadingLikes()
  const { setLikedSceneIds, toggleLikedScene, setLoadingLikes } = useLikeStore()

  useEffect(() => {
    const fetchLikeStatuses = async () => {
      if (!scenes || scenes.length === 0) {
        setLikedSceneIds(new Set())
        return
      }

      setLoadingLikes(true)
      try {
        const { getDeviceId } = await import('@/lib/device-id')
        const deviceId = getDeviceId()
        const headers: HeadersInit = {}
        if (deviceId) {
          headers['X-Device-Id'] = deviceId
        }

        const likePromises = scenes.map(async (scene) => {
          const response = await fetch(API_ROUTES.SCENES.LIKE(scene.id), {
            headers,
          })
          if (response.ok) {
            const data = await response.json()
            return { sceneId: scene.id, liked: data.liked }
          }
          return { sceneId: scene.id, liked: false }
        })

        const results = await Promise.all(likePromises)
        const likedIds = new Set(
          results.filter((r) => r.liked).map((r) => r.sceneId)
        )
        setLikedSceneIds(likedIds)
      } catch {
        // 에러 시 빈 상태 유지
      } finally {
        setLoadingLikes(false)
      }
    }

    fetchLikeStatuses()
  }, [scenes, setLikedSceneIds, setLoadingLikes])

  const handleLike = useCallback(
    (sceneId: string) => {
      toggleLike.mutate(sceneId, {
        onSuccess: () => {
          toggleLikedScene(sceneId)
        },
      })
    },
    [toggleLike, toggleLikedScene]
  )

  const handleSceneClick = (index: number) => {
    setImageModalIndex(index)
  }

  const closeImageModal = () => {
    setImageModalIndex(null)
  }

  const headerText = SECTION_HEADERS.scenes[category] || '작품 속 장면'
  const headerIcon =
    category === 'game'
      ? '🎮'
      : category === 'movie_drama'
        ? '🎥'
        : SECTION_ICONS.scenes

  const descriptionText =
    category === 'game'
      ? '이 장소가 등장한 게임 장면들입니다. 마음에 드는 장면에 좋아요를 눌러주세요!'
      : '이 장소가 등장한 작품 속 장면들입니다. 마음에 드는 장면에 좋아요를 눌러주세요!'

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{headerIcon}</span>
            <h2 className="text-2xl font-bold text-gray-900">{headerText}</h2>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 rounded-lg bg-navy-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-navy-700"
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
            장면 추가
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          {descriptionText} (다시 클릭하면 취소됩니다)
        </p>

        {isLoading || isLoadingLikes ? (
          <SceneGallerySkeleton />
        ) : error ? (
          <div className="py-8 text-center text-gray-500">
            장면을 불러오는데 실패했습니다
          </div>
        ) : !scenes || scenes.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-3 text-3xl">{headerIcon}</div>
            <p className="text-gray-600">아직 등록된 장면이 없습니다</p>
            <p className="mt-1 text-sm text-gray-500">
              첫 번째 장면을 추가해보세요!
            </p>
          </div>
        ) : (
          <SceneCarousel
            scenes={scenes}
            onLike={handleLike}
            isLiking={toggleLike.isPending}
            onSceneClick={handleSceneClick}
          />
        )}
      </div>

      {showAddModal && (
        <AddSceneModal spotId={spotId} onClose={() => setShowAddModal(false)} />
      )}

      {imageModalIndex !== null && scenes && scenes.length > 0 && (
        <SceneImageModal
          scenes={scenes}
          initialIndex={imageModalIndex}
          onClose={closeImageModal}
          onLike={handleLike}
        />
      )}
    </div>
  )
}
