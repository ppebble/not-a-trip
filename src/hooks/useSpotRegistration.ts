'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  SpotCategory,
  Coordinates,
  RelatedContent,
  CreateSpotInput,
} from '@/types'

// 폼 상태 인터페이스
export interface SpotFormData {
  name: string
  description: string
  address: string
  coordinates: Coordinates | null
  category: SpotCategory | ''
  photos: string[]
  relatedContent: RelatedContent[]
}

// 초기 폼 상태
export const initialFormData: SpotFormData = {
  name: '',
  description: '',
  address: '',
  coordinates: null,
  category: '',
  photos: [],
  relatedContent: [],
}

interface UseSpotRegistrationReturn {
  formData: SpotFormData
  setFormData: React.Dispatch<React.SetStateAction<SpotFormData>>
  errors: string[]
  isSubmitting: boolean
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  validateForm: () => string[]
  resetForm: () => void
}

/**
 * 스팟 등록 훅
 *
 * Requirements:
 * - 4.7: 등록 성공 시 스팟 상세 페이지로 이동
 */
export function useSpotRegistration(): UseSpotRegistrationReturn {
  const router = useRouter()
  const [formData, setFormData] = useState<SpotFormData>(initialFormData)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    return validationErrors
  }, [formData])

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      // 유효성 검사
      const validationErrors = validateForm()
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      setErrors([])
      setIsSubmitting(true)

      try {
        const requestBody: CreateSpotInput = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          coordinates: formData.coordinates!,
          category: formData.category as SpotCategory,
          photos: formData.photos,
          relatedContent: formData.relatedContent,
        }

        const response = await fetch('/api/spots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()

        if (!response.ok) {
          if (data.details) {
            setErrors(data.details)
          } else {
            setErrors([data.error || '스팟 등록에 실패했습니다'])
          }
          return
        }

        // 성공 시 스팟 상세 페이지로 이동 (Requirements 4.7)
        router.push(`/spots/${data.id}`)
      } catch {
        setErrors(['스팟 등록에 실패했습니다. 다시 시도해주세요.'])
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm, router]
  )

  // 폼 초기화
  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setErrors([])
  }, [])

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    validateForm,
    resetForm,
  }
}
