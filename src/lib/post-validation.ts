import { CreatePostInput } from '@/types'

/**
 * 게시글 유효성 검사 결과 타입
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] }

/**
 * 게시글 유효성 검사
 * Requirements: 5.2
 *
 * 제목 또는 내용이 비어있거나 공백만 있는 경우 거부합니다.
 */
export function validatePostInput(input: CreatePostInput): ValidationResult {
  const errors: string[] = []

  // 제목 검사: 비어있거나 공백만 있는 경우 거부
  if (!input.title || input.title.trim().length === 0) {
    errors.push('제목은 필수입니다')
  }

  // 내용 검사: 비어있거나 공백만 있는 경우 거부
  if (!input.content || input.content.trim().length === 0) {
    errors.push('내용은 필수입니다')
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return { valid: true }
}
