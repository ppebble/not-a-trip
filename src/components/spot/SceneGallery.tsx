'use client'

import { useState, FormEvent, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import {
  useScenesBySpot,
  useToggleLike,
  useCreateScene,
} from '@/hooks/useScenes'
import { Scene, SpotCategory, SECTION_HEADERS, SECTION_ICONS } from '@/types'
import SceneImageModal from './SceneImageModal'

interface SceneCardProps {
  scene: Scene
  onLike: (sceneId: string) => void
  isLiking: boolean
  onClick: () => void
  initialLiked?: boolean
}

/**
 * 개별 장면 카드 컴포넌트 - 이미지 중심 카드
 * 호버 시 중앙에 에피소드 정보 + 설명 표시
 * 클릭 시 전체보기 모달 열기
 */
function SceneCard({
  scene,
  onLike,
  isLiking,
  onClick,
  initialLiked = false,
}: SceneCardProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [localLikeCount, setLocalLikeCount] = useState(scene.likeCount)

  // initialLiked가 변경되면 상태 업데이트
  useEffect(() => {
    setLiked(initialLiked)
  }, [initialLiked])

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isLiking) return

    // 로그인/비로그인 모두 토글 방식으로 동작
    if (liked) {
      setLiked(false)
      setLocalLikeCount((prev) => Math.max(0, prev - 1))
    } else {
      setLiked(true)
      setLocalLikeCount((prev) => prev + 1)
    }
    onLike(scene.id)
  }

  return (
    <div
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-shadow duration-300 hover:shadow-lg"
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
      {/* 이미지 */}
      <Image
        src={scene.imageUrl}
        alt={scene.episodeInfo || '장면 이미지'}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 50vw"
      />

      {/* 호버 시 어두운 오버레이 + 중앙 정보 */}
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

      {/* 좋아요 버튼 - 항상 표시 */}
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-md transition-all ${
          liked
            ? 'bg-red-500 text-white'
            : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
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

function SceneGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-gray-200"
        >
          <div className="aspect-[4/3] bg-gray-200" />
          <div className="px-3 py-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface CarouselProps {
  scenes: Scene[]
  onLike: (sceneId: string) => void
  isLiking: boolean
  onSceneClick: (index: number) => void
  likedSceneIds: Set<string>
}

/**
 * 캐러셀 컴포넌트 - 2개씩 큰 카드 표시
 */
function SceneCarousel({
  scenes,
  onLike,
  isLiking,
  onSceneClick,
  likedSceneIds,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)

  // 반응형 아이템 개수 설정 (2개씩 큰 카드)
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 640) {
        setItemsPerView(2)
      } else {
        setItemsPerView(1)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const totalSlides = Math.ceil(scenes.length / itemsPerView)
  const maxIndex = Math.max(0, totalSlides - 1)

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
  }, [maxIndex])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
  }, [maxIndex])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // 현재 인덱스가 범위를 벗어나면 조정
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  // 현재 보여줄 장면들
  const startIdx = currentIndex * itemsPerView
  const visibleScenes = scenes.slice(startIdx, startIdx + itemsPerView)

  if (scenes.length === 0) return null

  return (
    <div className="relative px-2">
      {/* 캐러셀 컨테이너 */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {visibleScenes.map((scene, idx) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onLike={onLike}
              isLiking={isLiking}
              onClick={() => onSceneClick(startIdx + idx)}
              initialLiked={likedSceneIds.has(scene.id)}
            />
          ))}
        </div>
      </div>

      {/* 좌우 화살표 버튼 */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            aria-label="이전 장면"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
            aria-label="다음 장면"
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* 인디케이터 도트 */}
      {totalSlides > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-navy-600'
                  : 'w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`${index + 1}번째 슬라이드로 이동`}
            />
          ))}
        </div>
      )}
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

      // 2. 장면 생성 (작품명은 스팟에서 자동 관리되므로 빈 문자열 전송)
      await createScene.mutateAsync({
        spotId,
        imageUrl,
        animeTitle: '', // 스팟별로 관리되므로 작품명 불필요
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative z-[10000] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
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
              에피소드 정보
            </label>
            <input
              type="text"
              value={episodeInfo}
              onChange={(e) => setEpisodeInfo(e.target.value)}
              placeholder="1화, OVA, 극장판 등"
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
  /** 스팟 카테고리 (아이콘/헤더 텍스트 결정용) */
  category?: SpotCategory
}

export default function SceneGallery({
  spotId,
  category = 'animation',
}: SceneGalleryProps) {
  useSession() // 세션 상태 유지 (향후 확장용)
  const { data: scenes, isLoading, error } = useScenesBySpot(spotId)
  const toggleLike = useToggleLike()
  const [showAddModal, setShowAddModal] = useState(false)
  const [imageModalIndex, setImageModalIndex] = useState<number | null>(null)
  const [likedSceneIds, setLikedSceneIds] = useState<Set<string>>(new Set())
  const [isLoadingLikes, setIsLoadingLikes] = useState(false)

  // 모든 사용자의 좋아요 상태 일괄 조회 (로그인/비로그인 모두)
  useEffect(() => {
    const fetchLikeStatuses = async () => {
      if (!scenes || scenes.length === 0) {
        setLikedSceneIds(new Set())
        return
      }

      setIsLoadingLikes(true)
      try {
        // deviceId 헤더 포함하여 요청
        const { getDeviceId } = await import('@/lib/device-id')
        const deviceId = getDeviceId()
        const headers: HeadersInit = {}
        if (deviceId) {
          headers['X-Device-Id'] = deviceId
        }

        const likePromises = scenes.map(async (scene) => {
          const response = await fetch(`/api/scenes/${scene.id}/like`, {
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
        setIsLoadingLikes(false)
      }
    }

    fetchLikeStatuses()
  }, [scenes])

  const handleLike = useCallback(
    (sceneId: string) => {
      toggleLike.mutate(sceneId, {
        onSuccess: (data) => {
          // 좋아요 상태 업데이트
          setLikedSceneIds((prev) => {
            const newSet = new Set(prev)
            if (data.liked) {
              newSet.add(sceneId)
            } else {
              newSet.delete(sceneId)
            }
            return newSet
          })
        },
      })
    },
    [toggleLike]
  )

  const handleSceneClick = (index: number) => {
    setImageModalIndex(index)
  }

  const closeImageModal = () => {
    setImageModalIndex(null)
  }

  // 카테고리별 헤더 텍스트와 아이콘 (Requirements 5.3)
  const headerText = SECTION_HEADERS.scenes[category] || '작품 속 장면'
  const headerIcon =
    category === 'game'
      ? '🎮'
      : category === 'movie_drama'
        ? '🎥'
        : SECTION_ICONS.scenes

  // 카테고리별 설명 텍스트
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
            likedSceneIds={likedSceneIds}
          />
        )}
      </div>

      {showAddModal && (
        <AddSceneModal spotId={spotId} onClose={() => setShowAddModal(false)} />
      )}

      {/* 이미지 전체보기 모달 */}
      {imageModalIndex !== null && scenes && scenes.length > 0 && (
        <SceneImageModal
          scenes={scenes}
          initialIndex={imageModalIndex}
          onClose={closeImageModal}
          onLike={handleLike}
          likedSceneIds={likedSceneIds}
        />
      )}
    </div>
  )
}
