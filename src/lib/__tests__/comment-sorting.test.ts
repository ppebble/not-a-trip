import fc from 'fast-check'
import { Comment } from '@/types'

// Feature: anime-pilgrimage-map, Property 8: 댓글 시간순 정렬
// Validates: Requirements 5.4

/**
 * 댓글 목록이 시간순으로 정렬되어 있는지 확인하는 함수
 * @param comments 댓글 목록
 * @returns 오름차순 정렬 여부
 */
export function isChronologicallySorted(comments: Comment[]): boolean {
  if (comments.length <= 1) return true

  for (let i = 1; i < comments.length; i++) {
    const prevTime = new Date(comments[i - 1].createdAt).getTime()
    const currTime = new Date(comments[i].createdAt).getTime()
    if (prevTime > currTime) {
      return false
    }
  }
  return true
}

/**
 * 댓글 목록을 시간순으로 정렬하는 함수
 * @param comments 댓글 목록
 * @returns 오름차순 정렬된 댓글 목록
 */
export function sortCommentsChronologically(comments: Comment[]): Comment[] {
  return [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

/**
 * Generators for property-based testing
 */

// 유효한 Comment 객체 생성기
const commentArbitrary = fc
  .record({
    id: fc.uuid(),
    postId: fc.uuid(),
    content: fc.string({ minLength: 1, maxLength: 500 }),
    author: fc.string({ minLength: 1, maxLength: 50 }),
    createdAt: fc.date({
      min: new Date('2020-01-01'),
      max: new Date('2030-12-31'),
    }),
  })
  .map((c) => c as Comment)

// 댓글 목록 생성기
const commentListArbitrary = fc.array(commentArbitrary, {
  minLength: 0,
  maxLength: 50,
})

describe('Comment Sorting Property Tests', () => {
  // Property 8: 댓글 시간순 정렬
  // For any 댓글 목록에 대해, 표시되는 댓글들은 생성 시간 기준으로 오름차순 정렬되어야 함

  test('Property 8: 정렬 함수 적용 후 댓글은 시간순으로 정렬되어야 함', () => {
    fc.assert(
      fc.property(commentListArbitrary, (comments: Comment[]) => {
        const sorted = sortCommentsChronologically(comments)
        return isChronologicallySorted(sorted)
      }),
      { numRuns: 100 }
    )
  })

  test('Property 8: 정렬된 목록의 길이는 원본과 동일해야 함', () => {
    fc.assert(
      fc.property(commentListArbitrary, (comments: Comment[]) => {
        const sorted = sortCommentsChronologically(comments)
        return sorted.length === comments.length
      }),
      { numRuns: 100 }
    )
  })

  test('Property 8: 정렬된 목록은 원본의 모든 댓글을 포함해야 함', () => {
    fc.assert(
      fc.property(commentListArbitrary, (comments: Comment[]) => {
        const sorted = sortCommentsChronologically(comments)
        const originalIds = new Set(comments.map((c) => c.id))
        const sortedIds = new Set(sorted.map((c) => c.id))

        // 모든 원본 ID가 정렬된 목록에 존재하는지 확인
        for (const id of originalIds) {
          if (!sortedIds.has(id)) return false
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 8: 이미 정렬된 목록에 정렬 적용 시 동일한 순서 유지 (멱등성)', () => {
    fc.assert(
      fc.property(commentListArbitrary, (comments: Comment[]) => {
        const sorted = sortCommentsChronologically(comments)
        const sortedAgain = sortCommentsChronologically(sorted)

        // 두 번 정렬해도 순서가 동일해야 함
        for (let i = 0; i < sorted.length; i++) {
          if (sorted[i].id !== sortedAgain[i].id) return false
        }
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 8: 빈 목록은 정렬 후에도 빈 목록이어야 함', () => {
    const emptyList: Comment[] = []
    const sorted = sortCommentsChronologically(emptyList)
    expect(sorted).toEqual([])
    expect(isChronologicallySorted(sorted)).toBe(true)
  })

  test('Property 8: 단일 댓글 목록은 항상 정렬된 상태', () => {
    fc.assert(
      fc.property(commentArbitrary, (comment: Comment) => {
        const singleList = [comment]
        return isChronologicallySorted(singleList)
      }),
      { numRuns: 100 }
    )
  })
})
