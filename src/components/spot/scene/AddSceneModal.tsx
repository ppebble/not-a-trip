'use client'

import { useState, FormEvent } from 'react'
import { useCreateScene } from '@/hooks/useScenes'
import { useAuth } from '@/hooks/useAuth'
import { API_ROUTES } from '@/lib/api-routes'

interface AddSceneModalProps {
  spotId: string
  onClose: () => void
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]
const ALLOWED_IMAGE_EXTENSION_PATTERN = /\.(jpe?g|png|gif|webp)$/i
const AUTH_REQUIRED_MESSAGE = 'Log in to upload an image.'

export function AddSceneModal({ spotId, onClose }: AddSceneModalProps) {
  const createScene = useCreateScene()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [episodeInfo, setEpisodeInfo] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const resetFile = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isAuthLoading) {
      setError('Checking login status. Try again shortly.')
      e.target.value = ''
      return
    }

    if (!isAuthenticated) {
      setError(AUTH_REQUIRED_MESSAGE)
      e.target.value = ''
      return
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(file.type) &&
      !ALLOWED_IMAGE_EXTENSION_PATTERN.test(file.name)
    ) {
      setError('지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다')
      return
    }

    setError('')
    setImageFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (isAuthLoading) {
      setError('Checking login status. Try again shortly.')
      return
    }

    if (!isAuthenticated) {
      setError(AUTH_REQUIRED_MESSAGE)
      return
    }

    if (!imageFile) {
      setError('이미지를 선택해주세요')
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('file', imageFile)

      const uploadResponse = await fetch(API_ROUTES.UPLOAD, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.error || '이미지 업로드에 실패했습니다')
      }

      const { imageUrl } = await uploadResponse.json()

      await createScene.mutateAsync({
        spotId,
        imageUrl,
        animeTitle: '',
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
  const isFileSelectionDisabled =
    isAuthLoading || !isAuthenticated || isSubmitting

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative z-[10000] w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">
            작품 속 장면 추가
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add scene dialog"
            className="text-neutral-400 hover:text-neutral-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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

        {isAuthLoading && (
          <div
            className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700"
            role="status"
          >
            Checking login status.
          </div>
        )}

        {!isAuthLoading && !isAuthenticated && (
          <div
            className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700"
            role="status"
          >
            {AUTH_REQUIRED_MESSAGE}
          </div>
        )}

        {error && (
          <div
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              이미지 <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative">
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-neutral-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="미리보기"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={resetFile}
                    aria-label="Remove selected image"
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
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
                <label
                  className={
                    isFileSelectionDisabled
                      ? 'flex cursor-not-allowed flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 p-6 opacity-60'
                      : 'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 transition-colors hover:border-primary-400 hover:bg-neutral-100'
                  }
                >
                  <svg
                    className="mb-2 h-10 w-10 text-neutral-400"
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
                  <span className="text-sm text-neutral-600">
                    클릭하여 이미지 선택
                  </span>
                  <span className="mt-1 text-xs text-neutral-400">
                    JPG, PNG, GIF, WEBP (최대 10MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    disabled={isFileSelectionDisabled}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              에피소드 정보
            </label>
            <input
              type="text"
              value={episodeInfo}
              onChange={(e) => setEpisodeInfo(e.target.value)}
              placeholder="1화, OVA, 극장판 등"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="장면에 대한 간단한 설명"
              rows={2}
              className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isAuthLoading || !isAuthenticated}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '업로드 중...' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
