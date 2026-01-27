import fc from 'fast-check'
import { validatePostInput } from '@/lib/post-validation'
import { CreatePostInput } from '@/types'

/**
 * Property 7: 게시글 유효성 검사
 * Validates: Requirements 5.2
 */

const whitespaceOnlyArbitrary = fc
  .array(fc.constantFrom(' ', '\t', '\n', '\r', '\u00A0'), {
    minLength: 0,
    maxLength: 20,
  })
  .map((chars) => chars.join(''))

const validStringArbitrary = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0)

describe('Post Validation Property Tests', () => {
  test('Property 7: 빈 제목은 거부되어야 함', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.constant(''),
          content: validStringArbitrary,
        }),
        (input: CreatePostInput) => {
          const result = validatePostInput(input)
          return (
            result.valid === false &&
            result.errors.includes('제목은 필수입니다')
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 7: 공백만 있는 제목은 거부되어야 함', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: whitespaceOnlyArbitrary,
          content: validStringArbitrary,
        }),
        (input: CreatePostInput) => {
          const result = validatePostInput(input)
          return (
            result.valid === false &&
            result.errors.includes('제목은 필수입니다')
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 7: 빈 내용은 거부되어야 함', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: validStringArbitrary,
          content: fc.constant(''),
        }),
        (input: CreatePostInput) => {
          const result = validatePostInput(input)
          return (
            result.valid === false &&
            result.errors.includes('내용은 필수입니다')
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 7: 공백만 있는 내용은 거부되어야 함', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: validStringArbitrary,
          content: whitespaceOnlyArbitrary,
        }),
        (input: CreatePostInput) => {
          const result = validatePostInput(input)
          return (
            result.valid === false &&
            result.errors.includes('내용은 필수입니다')
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 7: 제목과 내용 모두 비어있으면 두 에러 모두 반환', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.oneof(fc.constant(''), whitespaceOnlyArbitrary),
          content: fc.oneof(fc.constant(''), whitespaceOnlyArbitrary),
        }),
        (input: CreatePostInput) => {
          const result = validatePostInput(input)
          return (
            result.valid === false &&
            result.errors.includes('제목은 필수입니다') &&
            result.errors.includes('내용은 필수입니다')
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 7: 유효한 제목과 내용은 통과해야 함', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: validStringArbitrary,
          content: validStringArbitrary,
        }),
        (input: CreatePostInput) => {
          const result = validatePostInput(input)
          return result.valid === true
        }
      ),
      { numRuns: 100 }
    )
  })
})
