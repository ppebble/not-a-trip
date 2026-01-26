'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  SpotCategory,
  RelatedContent,
  ExternalLink,
  UpdateSpotInput,
} from '@/types'
import { SpotFormData } from './useSpotRegistration'
import { spotKeys } from './useSpots'
import { validateExternalLinks } from '@/lib/external-link-validation'

// 스팟 상세 데이터 인터페이스 (수정용)
interface SpotEditData {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: [number, number]
  category?: SpotCategory
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[]
  authorId?: string
  authorName?: string
}

interface UseSpotEditReturn {
  formData: SpotFormData
  setFormData: React.Dispatch<React.SetStateAction<SpotFormData>>
  errors: string[]
  isLoading: boolean
  isSubmitting: boolean
  isDeleting: boolean
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleDelete: () => Promise<void>
  validateForm: () => string[]
}

/**
 * 스팟 수정 훅
 *
 * Requirements:
 * - 6.1: 스팟 수정 페이지에서 기존 데이터 로드 및 수정
 * - 6.2: 인증된 사용자만 본인 스팟 수정 가능
 */
export function useSpotEdit(spotId: string): UseSpotEditReturn {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<SpotFormData>({
    name: '',
    description: '',
    address: '',
    coordinates: null,
    category: '',
    photos: [],
    relatedContent: [],
    externalLinks: [],
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 스팟 데이터 조회
  const { data: spot, isLoading } = useQuery({
    queryKey: spotKeys.detail(spotId),
    queryFn: async (): Promise<SpotEditData> => {
      const response = await fetch(`/api/spots/${spotId}`)
      if (!response.ok) {
        throw new Error('스팟을 불러올 수 없습니다')
      }
      return response.json()
    },
    enabled: !!spotId,
  })

  // 스팟 데이터가 로드되면 폼에 설정
  useEffect(() => {
    if (spot) {
      setFormData({
        name: spot.name,
        description: spot.description,
        address: spot.address,
        coordinates: spot.coordinates
          ? { lat: spot.coordinates[0], lng: spot.coordinates[1] }
          : null,
        category: spot.category || '',
        photos: spot.photos || [],
        relatedContent: spot.relatedContent || [],
        externalLinks: spot.externalLinks || [],
      })
    }
  }, [spot])

  // 필드 변경 핸들러
  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    },
    []
  )

  // 유효성 검사
  const validateForm = useCallback((): string[] => {
    const validationErrors: string[] = []

    if (!formData.name.trim()) {
      validationErrors.push('스팟 이름은 필수입니다')
    } else if (formData.name.trim().length < 2) {
      validationErrors.push('스팟 이름은 2자 이상이어야 합니다')
    }

    if (!formData.category) {
      validationErrors.push('카테고리를 선택해주세요')
    }

    if (!formData.description.trim()) {
      validationErrors.push('설명은 필수입니다')
    } else if (formData.description.trim().length < 10) {
      validationErrors.push('설명은 10자 이상이어야 합니다')
    }

    if (!formData.address.trim()) {
      validationErrors.push('주소는 필수입니다')
    }

    if (!formData.coordinates) {
      validationErrors.push('지도에서 위치를 선택해주세요')
    }

    // 외부 링크 유효성 검사 (스포츠/음악/게임 카테고리에서만)
    if (
      formData.category &&
      ['sports', 'music', 'game'].includes(formData.category) &&
      formData.externalLinks.length > 0
    ) {
      const linkValidation = validateExternalLinks(formData.externalLinks)
      if (!linkValidation.isValid) {
        validationErrors.push(...linkValidation.errors)
      }
    }

    return validationErrors
  }, [formData])

  // 스팟 수정 제출 핸들러
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      setErrors([])
      setIsSubmitting(true)

      try {
        const requestBody: UpdateSpotInput = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          coordinates: formData.coordinates!,
          category: formData.category as SpotCategory,
          photos: formData.photos,
          relatedContent: formData.relatedContent,
          externalLinks: formData.externalLinks,
        }

        const response = await fetch(`/api/spots/${spotId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.details) {
            setErrors(data.details)
          } else {
            setErrors([data.error || '스팟 수정에 실패했습니다'])
          }
          return
        }

        // 캐시 무효화
        queryClient.invalidateQueries({ queryKey: spotKeys.detail(spotId) })
        queryClient.invalidateQueries({ queryKey: spotKeys.all })

        // 성공 시 스팟 상세 페이지로 이동
        router.push(`/spots/${spotId}`)
      } catch {
        setErrors(['스팟 수정에 실패했습니다. 다시 시도해주세요.'])
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm, spotId, router, queryClient]
  )

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
        setErrors([data.error || '스팟 삭제에 실패했습니다'])
        return
      }

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: spotKeys.all })

      // 성공 시 메인 페이지로 이동 (Requirements 6.5)
      router.push('/')
    } catch {
      setErrors(['스팟 삭제에 실패했습니다. 다시 시도해주세요.'])
    } finally {
      setIsDeleting(false)
    }
  }, [spotId, router, queryClient])

  return {
    formData,
    setFormData,
    errors,
    isLoading,
    isSubmitting,
    isDeleting,
    handleChange,
    handleSubmit,
    handleDelete,
    validateForm,
  }
}
