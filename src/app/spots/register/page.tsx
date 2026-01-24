'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSpotRegistration } from '@/hooks/useSpotRegistration'
import { SpotForm, SpotFormSkeleton } from '@/components/spot/SpotForm'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import { UploadedImage } from '@/components/spot/ImageUpload'

/**
 * 스팟 등록 페이지
 *
 * Requirements:
 * - 4.1: 스팟 등록 버튼 클릭 시 등록 페이지로 이동
 * - 4.2: 필수 필드 (이름, 설명, 주소, 카테고리)
 * - 4.3: 선택 필드 (사진, 관련 콘텐츠)
 * - 4.6: 필수 필드 누락 시 유효성 검사 에러
 * - 4.7: 등록 성공 시 스팟 상세 페이지로 이동
 * - 4.8: 회원만 스팟 등록 가능 (비로그인 시 로그인 페이지로 리다이렉트)
 */
export default function SpotRegisterPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useSpotRegistration()

  // 비로그인 시 로그인 모달 표시
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, isLoading])

  // 로그인 페이지로 이동
  const handleLoginConfirm = () => {
    router.push('/auth/signin?callbackUrl=/spots/register')
  }

  // 취소 핸들러
  const handleCancel = () => {
    if (
      formData.name ||
      formData.description ||
      formData.address ||
      formData.category
    ) {
      if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  // 로딩 중 또는 비로그인 상태
  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-navy-50">
        <div className="border-b border-navy-200 bg-white px-4 py-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-xl font-bold text-navy-800">스팟 등록</h1>
            <p className="text-sm text-navy-500">특별한 여행지를 공유하세요</p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <SpotFormSkeleton />
        </div>
        <LoginRequiredModal
          isOpen={showLoginModal}
          title="로그인이 필요한 서비스입니다"
          description="스팟을 등록하려면 로그인이 필요합니다."
          onConfirm={handleLoginConfirm}
        />
      </main>
    )
  }

  // 회원 정보
  const userInfo = {
    name: user?.name || user?.email || '회원',
    email: user?.email || undefined,
  }

  return (
    <main className="min-h-screen bg-navy-50">
      <div className="border-b border-navy-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-bold text-navy-800">스팟 등록</h1>
          <p className="text-sm text-navy-500">특별한 여행지를 공유하세요</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <SpotForm
          mode="create"
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          handleChange={handleChange}
          userInfo={userInfo}
          uploadedImages={uploadedImages}
          onImagesChange={setUploadedImages}
        />
      </div>
    </main>
  )
}
