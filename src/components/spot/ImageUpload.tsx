'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import Image from 'next/image'
import { API_ROUTES } from '@/lib/api-routes'

/**
 * 업로드된 이미지 정보
 */
export interface UploadedImage {
  /** 이미지 URL (업로드 완료 시) 또는 로컬 미리보기 URL */
  url: string
  /** 파일명 */
  fileName: string
  /** 업로드 진행률 (0-100) */
  progress: number
  /** 업로드 상태 */
  status: 'pending' | 'uploading' | 'completed' | 'error'
  /** 에러 메시지 */
  errorMessage?: string
  /** 원본 파일 (업로드 전) */
  file?: File
}

/**
 * ImageUpload 컴포넌트 Props
 */
interface ImageUploadProps {
  /** 업로드된 이미지 목록 */
  images: UploadedImage[]
  /** 이미지 목록 변경 핸들러 */
  onChange: (images: UploadedImage[]) => void
  /** 최대 이미지 개수 */
  maxImages?: number
  /** 비활성화 여부 */
  disabled?: boolean
}

/**
 * 허용된 파일 타입
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * 최대 파일 크기 (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * ImageUpload 컴포넌트
 *
 * 드래그 앤 드롭 및 클릭으로 이미지를 업로드할 수 있는 컴포넌트입니다.
 * 최대 5장까지 업로드 가능하며, 미리보기와 업로드 진행률을 표시합니다.
 *
 * Requirements:
 * - 4.3: 선택 필드 (사진 최대 5장)
 */
export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const remainingSlots = maxImages - images.length

  /**
   * 파일 유효성 검사
   */
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)'
    }
    if (file.size > MAX_FILE_SIZE) {
      return '파일 크기는 5MB 이하여야 합니다'
    }
    return null
  }, [])

  /**
   * 파일 업로드 처리
   */
  const uploadFile = useCallback(
    async (image: UploadedImage): Promise<UploadedImage> => {
      if (!image.file) return image

      const formData = new FormData()
      formData.append('file', image.file)

      try {
        const response = await fetch(API_ROUTES.UPLOAD, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          return {
            ...image,
            status: 'error',
            errorMessage: error.error || '업로드에 실패했습니다',
            progress: 0,
          }
        }

        const data = await response.json()
        return {
          ...image,
          url: data.imageUrl,
          fileName: data.fileName,
          status: 'completed',
          progress: 100,
          file: undefined,
        }
      } catch {
        return {
          ...image,
          status: 'error',
          errorMessage: '네트워크 오류가 발생했습니다',
          progress: 0,
        }
      }
    },
    []
  )

  /**
   * 파일 선택 처리
   */
  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (disabled) return

      const fileArray = Array.from(files)
      const filesToProcess = fileArray.slice(0, remainingSlots)

      if (filesToProcess.length === 0) return

      // 새 이미지 목록 생성 (미리보기 URL 포함)
      const newImages: UploadedImage[] = filesToProcess.map((file) => {
        const error = validateFile(file)
        return {
          url: URL.createObjectURL(file),
          fileName: file.name,
          progress: error ? 0 : 0,
          status: error ? 'error' : 'pending',
          errorMessage: error || undefined,
          file: error ? undefined : file,
        } as UploadedImage
      })

      // 즉시 미리보기 표시
      const updatedImages = [...images, ...newImages]
      onChange(updatedImages)

      // 유효한 파일만 업로드
      const validImages = newImages.filter((img) => img.status === 'pending')

      for (const image of validImages) {
        const index = updatedImages.findIndex(
          (img) => img.fileName === image.fileName && img.status === 'pending'
        )
        if (index === -1) continue

        // 업로드 중 상태로 변경
        updatedImages[index] = {
          ...updatedImages[index],
          status: 'uploading',
          progress: 50,
        }
        onChange([...updatedImages])

        // 업로드 실행
        const result = await uploadFile(image)
        updatedImages[index] = result
        onChange([...updatedImages])

        // 이전 미리보기 URL 해제
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url)
        }
      }
    },
    [disabled, remainingSlots, images, onChange, validateFile, uploadFile]
  )

  /**
   * 드래그 이벤트 핸들러
   */
  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && remainingSlots > 0) {
        setIsDragging(true)
      }
    },
    [disabled, remainingSlots]
  )

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || remainingSlots <= 0) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFiles(files)
      }
    },
    [disabled, remainingSlots, handleFiles]
  )

  /**
   * 파일 입력 변경 핸들러
   */
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFiles(files)
      }
      // 같은 파일 재선택 가능하도록 초기화
      e.target.value = ''
    },
    [handleFiles]
  )

  /**
   * 업로드 영역 클릭 핸들러
   */
  const handleClick = useCallback(() => {
    if (!disabled && remainingSlots > 0) {
      fileInputRef.current?.click()
    }
  }, [disabled, remainingSlots])

  /**
   * 이미지 삭제 핸들러
   */
  const handleRemove = useCallback(
    (index: number) => {
      const imageToRemove = images[index]
      // blob URL 해제
      if (imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url)
      }
      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)
    },
    [images, onChange]
  )

  /**
   * 이미지 순서 변경 핸들러
   */
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return
      const newImages = [...images]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      onChange(newImages)
    },
    [images, onChange]
  )

  /**
   * 재업로드 핸들러
   */
  const handleRetry = useCallback(
    async (index: number) => {
      const image = images[index]
      if (!image.file || image.status !== 'error') return

      const updatedImages = [...images]
      updatedImages[index] = {
        ...image,
        status: 'uploading',
        progress: 50,
        errorMessage: undefined,
      }
      onChange(updatedImages)

      const result = await uploadFile(image)
      updatedImages[index] = result
      onChange([...updatedImages])
    },
    [images, onChange, uploadFile]
  )

  return (
    <div className="space-y-4">
      {/* 업로드 영역 */}
      {remainingSlots > 0 && (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary-50' : 'border-border bg-surface hover:border-primary-400'} ${disabled ? 'cursor-not-allowed opacity-50' : ''} `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            multiple
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          <svg
            className="mx-auto mb-2 h-12 w-12 text-muted"
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
          <p className="text-text-secondary text-sm">
            {isDragging ? '여기에 놓으세요' : '클릭하거나 드래그하여 사진 추가'}
          </p>
          <p className="mt-1 text-xs text-muted">
            JPG, PNG, GIF, WEBP (최대 5MB) · 남은 슬롯: {remainingSlots}장
          </p>
        </div>
      )}

      {/* 이미지 미리보기 목록 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {images.map((image, index) => (
            <ImagePreviewItem
              key={`${image.fileName}-${index}`}
              image={image}
              index={index}
              totalCount={images.length}
              onRemove={() => handleRemove(index)}
              onMoveLeft={() => handleReorder(index, index - 1)}
              onMoveRight={() => handleReorder(index, index + 1)}
              onRetry={() => handleRetry(index)}
            />
          ))}
        </div>
      )}

      {/* 최대 개수 도달 안내 */}
      {remainingSlots <= 0 && (
        <p className="text-center text-sm text-muted">
          최대 {maxImages}장까지 업로드할 수 있습니다
        </p>
      )}
    </div>
  )
}

/**
 * 이미지 미리보기 아이템 Props
 */
interface ImagePreviewItemProps {
  image: UploadedImage
  index: number
  totalCount: number
  onRemove: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onRetry: () => void
}

/**
 * 이미지 미리보기 아이템 컴포넌트
 */
function ImagePreviewItem({
  image,
  index,
  totalCount,
  onRemove,
  onMoveLeft,
  onMoveRight,
  onRetry,
}: ImagePreviewItemProps) {
  const isFirst = index === 0
  const isLast = index === totalCount - 1
  const isUploading = image.status === 'uploading'
  const isError = image.status === 'error'
  const isCompleted = image.status === 'completed'

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface">
      {/* 이미지 */}
      <Image
        src={image.url}
        alt={image.fileName}
        fill
        className={`object-cover transition-opacity ${isUploading || isError ? 'opacity-50' : ''}`}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
      />

      {/* 업로드 진행률 오버레이 */}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="flex flex-col items-center">
            <svg
              className="h-8 w-8 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="mt-1 text-xs text-white">{image.progress}%</span>
          </div>
        </div>
      )}

      {/* 에러 오버레이 */}
      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/80 p-2">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-1 line-clamp-2 text-center text-xs text-white">
            {image.errorMessage || '업로드 실패'}
          </p>
          {image.file && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRetry()
              }}
              className="mt-2 rounded bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
            >
              재시도
            </button>
          )}
        </div>
      )}

      {/* 완료 표시 */}
      {isCompleted && (
        <div className="absolute bottom-1 left-1">
          <div className="rounded-full bg-green-500 p-0.5">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}

      {/* 순서 표시 */}
      <div className="absolute left-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
        {index + 1}
      </div>

      {/* 호버 시 컨트롤 버튼 */}
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
        {/* 왼쪽 이동 */}
        {!isFirst && !isUploading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveLeft()
            }}
            className="text-text-secondary rounded-full bg-surface/90 p-1.5 shadow hover:bg-surface dark:bg-neutral-700/90"
            title="왼쪽으로 이동"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* 삭제 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="rounded-full bg-red-500 p-1.5 text-white shadow hover:bg-red-600"
          title="삭제"
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

        {/* 오른쪽 이동 */}
        {!isLast && !isUploading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveRight()
            }}
            className="text-text-secondary rounded-full bg-surface/90 p-1.5 shadow hover:bg-surface dark:bg-neutral-700/90"
            title="오른쪽으로 이동"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
