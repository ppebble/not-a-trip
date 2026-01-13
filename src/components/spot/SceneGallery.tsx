'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import {
  useScenesBySpot,
  useLikeScene,
  useCreateScene,
} from '@/hooks/useScenes'
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
      <div className="relative aspect-video">
        <Image
          src={scene.imageUrl}
          alt={`${scene.animeTitle} 장면`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
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

function SceneGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2].map((i) => (
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

interface AddSceneModalProps {
  spotId: string
  onClose: () => void
}

function AddSceneModal({ spotId, onClose }: AddSceneModalProps) {
  const createScene = useCreateScene()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [animeTitle, setAnimeTitle] = useState('')
  const [episodeInfo, setEpisodeInfo] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)')
      return
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다')
      return
    }

    setError('')
    setImageFile(file)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!imageFile) {
      setError('이미지를 선택해주세요')
      return
    }
    if (!animeTitle.trim()) {
      setError('작품명을 입력해주세요')
      return
    }

    try {
      setIsUploading(true)

      // 1. 이미지 업로드
      const formData = new FormData()
      formData.append('file', imageFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.error || '이미지 업로드에 실패했습니다')
      }

      const { imageUrl } = await uploadResponse.json()

      // 2. 장면 생성
      await createScene.mutateAsync({
        spotId,
        imageUrl,
        animeTitle: animeTitle.trim(),
        episodeInfo: episodeInfo.trim() || undefined,
        description: description.trim() || undefined,
      })

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '장면 추가에 실패했습니다')
    } finally {
      setIsUploading(false)
    }
  }

  const isSubmitting = isUploading || createScene.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">작품 속 장면 추가</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
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

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이미지 업로드 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              이미지 <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-navy-400 hover:bg-gray-100">
                  <svg
                    className="mb-2 h-10 w-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    클릭하여 이미지 선택
                  </span>
                  <span className="mt-1 text-xs text-gray-400">
                    JPG, PNG, GIF, WEBP (최대 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              작품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={animeTitle}
              onChange={(e) => setAnimeTitle(e.target.value)}
              placeholder="슬램덩크"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              에피소드 정보
            </label>
            <input
              type="text"
              value={episodeInfo}
              onChange={(e) => setEpisodeInfo(e.target.value)}
              placeholder="1화, OVA 등"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="장면에 대한 간단한 설명"
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700 disabled:opacity-50"
            >
              {isSubmitting ? '업로드 중...' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface SceneGalleryProps {
  spotId: string
}

export default function SceneGallery({ spotId }: SceneGalleryProps) {
  const { data: scenes, isLoading, error } = useScenesBySpot(spotId)
  const likeScene = useLikeScene()
  const [showAddModal, setShowAddModal] = useState(false)

  const handleLike = (sceneId: string) => {
    likeScene.mutate(sceneId)
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <h2 className="text-2xl font-bold text-gray-900">작품 속 장면</h2>
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
          이 장소가 등장한 애니메이션 장면들입니다. 마음에 드는 장면에 좋아요를
          눌러주세요!
        </p>

        {isLoading ? (
          <SceneGallerySkeleton />
        ) : error ? (
          <div className="py-8 text-center text-gray-500">
            장면을 불러오는데 실패했습니다
          </div>
        ) : !scenes || scenes.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-3 text-3xl">🎬</div>
            <p className="text-gray-600">아직 등록된 장면이 없습니다</p>
            <p className="mt-1 text-sm text-gray-500">
              첫 번째 장면을 추가해보세요!
            </p>
          </div>
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

      {showAddModal && (
        <AddSceneModal spotId={spotId} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
