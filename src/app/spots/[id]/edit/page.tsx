'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useSpotEdit } from '@/hooks/useSpotEdit'
import { useSpotDetail } from '@/hooks/useSpotDetail'
import { SpotForm, SpotFormSkeleton } from '@/components/spot/SpotForm'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import { UploadedImage } from '@/components/spot/ImageUpload'

/**
 * 권한 없음 컴포넌트
 */
function NoPermission() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-surface p-8 shadow-md">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            수정 권한이 없습니다
          </h2>
          <p className="mb-4 text-gray-600">
            본인이 등록한 스팟만 수정할 수 있습니다.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary-700"
          >
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}

/**
 * 스팟 수정 페이지
 *
 * Requirements:
 * - 6.1: 스팟 수정 페이지에서 기존 데이터 로드 및 수정
 * - 6.2: 인증된 사용자만 본인 스팟 수정 가능
 */
export default function SpotEditPage() {
  const params = useParams()
  const router = useRouter()
  const spotId = params.id as string
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: spot, isLoading: spotLoading } = useSpotDetail(spotId)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const {
    formData,
    setFormData,
    errors,
    isLoading,
    isSubmitting,
    isDeleting,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useSpotEdit(spotId)

  // 기존 사진을 UploadedImage 형식으로 변환
  useEffect(() => {
    if (
      formData.photos &&
      formData.photos.length > 0 &&
      uploadedImages.length === 0
    ) {
      const existingImages: UploadedImage[] = formData.photos.map(
        (url, index) => ({
          url,
          fileName: `existing-${index}`,
          progress: 100,
          status: 'completed' as const,
        })
      )
      setUploadedImages(existingImages)
    }
  }, [formData.photos, uploadedImages.length])

  // 비로그인 시 로그인 모달 표시
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, authLoading])

  // 로그인 페이지로 이동
  const handleLoginConfirm = () => {
    router.push(`/auth/signin?callbackUrl=/spots/${spotId}/edit`)
  }

  // 취소 핸들러
  const handleCancel = () => {
    if (confirm('수정 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
      router.push(`/spots/${spotId}`)
    }
  }

  // 로딩 중
  if (authLoading || spotLoading || isLoading) {
    return (
      <main className="min-h-screen bg-primary-50">
        <div className="border-b border-neutral-200 bg-surface px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <Link
              href={`/spots/${spotId}`}
              className="hover:text-text-primary flex items-center gap-2 text-secondary"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>스팟으로 돌아가기</span>
            </Link>
            <h1 className="mt-2 text-xl font-bold text-primary">스팟 수정</h1>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <SpotFormSkeleton />
        </div>
        <LoginRequiredModal
          isOpen={showLoginModal}
          title="로그인이 필요한 서비스입니다"
          description="스팟을 수정하려면 로그인이 필요합니다."
          onConfirm={handleLoginConfirm}
        />
      </main>
    )
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-primary-50">
        <div className="border-b border-neutral-200 bg-surface px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-xl font-bold text-primary">스팟 수정</h1>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <SpotFormSkeleton />
        </div>
        <LoginRequiredModal
          isOpen={true}
          title="로그인이 필요한 서비스입니다"
          description="스팟을 수정하려면 로그인이 필요합니다."
          onConfirm={handleLoginConfirm}
        />
      </main>
    )
  }

  // 권한 확인: 본인 스팟만 수정 가능 (Requirements 6.2)
  if (spot && spot.authorId && spot.authorId !== user?.id) {
    return <NoPermission />
  }

  return (
    <main className="min-h-screen bg-primary-50">
      <div className="border-b border-neutral-200 bg-surface px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/spots/${spotId}`}
            className="hover:text-text-primary flex items-center gap-2 text-secondary"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>스팟으로 돌아가기</span>
          </Link>
          <h1 className="mt-2 text-xl font-bold text-primary">스팟 수정</h1>
          <p className="text-sm text-secondary">스팟 정보를 수정하세요</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <SpotForm
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onDelete={handleDelete}
          handleChange={handleChange}
          uploadedImages={uploadedImages}
          onImagesChange={setUploadedImages}
        />
      </div>
    </main>
  )
}
