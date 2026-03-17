'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useQueryClient } from '@tanstack/react-query'
import { spotKeys } from '@/hooks/useSpots'

interface UseSpotDetailViewModelProps {
  spotId: string
  authorId?: string | null
}

interface UseSpotDetailViewModelReturn {
  // 권한
  hasEditPermission: boolean
  hasDeletePermission: boolean

  // 삭제
  isDeleting: boolean
  handleDelete: () => Promise<void>

  // 정보 보완 폼
  showSupplementForm: boolean
  handleSupplementClick: () => void
  handleSupplementSuccess: () => void
  closeSupplementForm: () => void
  supplementKey: number

  // 상태 신고 폼
  showStatusReportForm: boolean
  handleStatusReportClick: () => void
  closeStatusReportForm: () => void

  // 로그인 모달
  showLoginModal: boolean
  loginModalContext: 'supplement' | 'status'
}

export function useSpotDetailViewModel({
  spotId,
  authorId,
}: UseSpotDetailViewModelProps): UseSpotDetailViewModelReturn {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()

  // 권한 확인: 관리자이거나 본인 스팟인 경우
  const isAdmin = user?.role === 'admin'
  const isOwner = !!(authorId && user?.id && authorId === user.id)
  const hasEditPermission = isAdmin || isOwner
  const hasDeletePermission = isAdmin || isOwner

  // 삭제 상태
  const [isDeleting, setIsDeleting] = useState(false)

  // 정보 보완 폼 상태
  const [showSupplementForm, setShowSupplementForm] = useState(false)
  const [supplementKey, setSupplementKey] = useState(0)

  // 상태 신고 폼 상태
  const [showStatusReportForm, setShowStatusReportForm] = useState(false)

  // 로그인 모달 상태
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalContext, setLoginModalContext] = useState<
    'supplement' | 'status'
  >('supplement')

  // 스팟 삭제 핸들러
  const handleDelete = useCallback(async () => {
    if (
      !confirm(
        '정말로 이 스팟을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/spots/${spotId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || '스팟 삭제에 실패했습니다')
        return
      }

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: spotKeys.all })

      // 메인 페이지로 이동
      router.push('/')
    } catch {
      alert('스팟 삭제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsDeleting(false)
    }
  }, [spotId, queryClient, router])

  // 정보 보완 클릭 핸들러
  const handleSupplementClick = useCallback(() => {
    if (!isAuthenticated) {
      setLoginModalContext('supplement')
      setShowLoginModal(true)
      return
    }
    setShowSupplementForm((prev) => !prev)
  }, [isAuthenticated])

  // 정보 보완 성공 핸들러
  const handleSupplementSuccess = useCallback(() => {
    setShowSupplementForm(false)
    setSupplementKey((prev) => prev + 1)
  }, [])

  // 정보 보완 폼 닫기
  const closeSupplementForm = useCallback(() => {
    setShowSupplementForm(false)
  }, [])

  // 상태 신고 폼 닫기
  const closeStatusReportForm = useCallback(() => {
    setShowStatusReportForm(false)
  }, [])

  // 상태 신고 클릭 핸들러
  const handleStatusReportClick = useCallback(() => {
    if (!isAuthenticated) {
      setLoginModalContext('status')
      setShowLoginModal(true)
      return
    }
    setShowStatusReportForm((prev) => !prev)
  }, [isAuthenticated])

  return {
    hasEditPermission,
    hasDeletePermission,
    isDeleting,
    handleDelete,
    showSupplementForm,
    handleSupplementClick,
    handleSupplementSuccess,
    closeSupplementForm,
    supplementKey,
    showStatusReportForm,
    handleStatusReportClick,
    closeStatusReportForm,
    showLoginModal,
    loginModalContext,
  }
}
