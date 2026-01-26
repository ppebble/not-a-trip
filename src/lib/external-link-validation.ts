import { ExternalLink } from '@/types'

/**
 * 외부 링크 유효성 검사 상수
 */
export const EXTERNAL_LINK_LIMITS = {
  MAX_LINKS: 10,
  MAX_LABEL_LENGTH: 100,
} as const

/**
 * URL이 유효한 https:// URL인지 검사
 */
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 외부 링크 배열의 유효성 검사 결과
 */
export interface ExternalLinkValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 외부 링크 배열 유효성 검사
 *
 * Requirements:
 * - 3.4: URL 형식 검증 (https:// 필수)
 * - 3.4: 최대 10개 링크 제한
 * - 3.4: 중복 URL 방지
 */
export function validateExternalLinks(
  links: ExternalLink[]
): ExternalLinkValidationResult {
  const errors: string[] = []

  // 최대 개수 검사
  if (links.length > EXTERNAL_LINK_LIMITS.MAX_LINKS) {
    errors.push(
      `외부 링크는 최대 ${EXTERNAL_LINK_LIMITS.MAX_LINKS}개까지 등록할 수 있습니다`
    )
  }

  // 각 링크 검사
  const urls = new Set<string>()
  links.forEach((link, index) => {
    // 라벨 검사
    if (!link.label || !link.label.trim()) {
      errors.push(`외부 링크 ${index + 1}: 링크 이름이 필요합니다`)
    } else if (link.label.length > EXTERNAL_LINK_LIMITS.MAX_LABEL_LENGTH) {
      errors.push(
        `외부 링크 ${index + 1}: 링크 이름은 ${EXTERNAL_LINK_LIMITS.MAX_LABEL_LENGTH}자 이내여야 합니다`
      )
    }

    // URL 검사
    if (!link.url || !link.url.trim()) {
      errors.push(`외부 링크 ${index + 1}: URL이 필요합니다`)
    } else if (!isValidHttpsUrl(link.url)) {
      errors.push(
        `외부 링크 ${index + 1}: 올바른 URL 형식이 아닙니다 (https:// 필수)`
      )
    }

    // 중복 URL 검사
    if (link.url && urls.has(link.url)) {
      errors.push(`외부 링크 ${index + 1}: 중복된 URL입니다`)
    }
    if (link.url) {
      urls.add(link.url)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
