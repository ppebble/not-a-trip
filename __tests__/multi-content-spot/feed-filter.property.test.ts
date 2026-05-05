/**
 * Property-Based Tests: 피드 필터링
 * Property 4: 작품별 피드 필터링 정확성
 * Property 5: Unresolved 체크인 제외 일관성
 * Property 6: contentName + spotId AND 결합
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 4.1, 4.2, 4.4, 5.3, 8.1, 8.2, 8.4**
 */

import * as fc from 'fast-check'

// ============================================
// Types
// ============================================

interface CheckInDoc {
  id: string
  spotId: string
  userId: string
  contentName?: string | null
  migrationStatus?: 'resolved' | 'unresolved' | null
  createdAt: Date
}

// ============================================
// Generators
// ============================================

const checkInArb = fc.record({
  id: fc.uuid(),
  spotId: fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
  userId: fc.uuid(),
  contentName: fc.option(fc.constantFrom('슬램덩크', '주술회전', '최애의 아이', '듀라라라')),
  migrationStatus: fc.option(fc.constantFrom('resolved', 'unresolved')),
  createdAt: fc.date(),
}) as fc.Arbitrary<CheckInDoc>

// ============================================
// Pure logic under test (extracted from GET handler)
// ============================================

/**
 * contentName 기반 피드 필터링 로직
 * migrationStatus: { $ne: 'unresolved' } 조건 적용
 */
function filterByContentName(
  checkins: CheckInDoc[],
  contentName: string
): CheckInDoc[] {
  return checkins.filter(
    (c) => c.contentName === contentName && c.migrationStatus !== 'unresolved'
  )
}

/**
 * contentName + spotId AND 결합 필터
 */
function filterByContentNameAndSpotId(
  checkins: CheckInDoc[],
  contentName: string,
  spotId: string
): CheckInDoc[] {
  return checkins.filter(
    (c) =>
      c.contentName === contentName &&
      c.spotId === spotId &&
      c.migrationStatus !== 'unresolved'
  )
}

// ============================================
// Property Tests
// ============================================

describe('Property 4: 작품별 피드 필터링 정확성', () => {
  it('반환된 모든 체크인의 contentName은 요청된 값과 일치해야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkInArb, { minLength: 0, maxLength: 50 }),
        fc.constantFrom('슬램덩크', '주술회전', '최애의 아이', '듀라라라'),
        (checkins, targetContent) => {
          const result = filterByContentName(checkins, targetContent)

          for (const checkin of result) {
            expect(checkin.contentName).toBe(targetContent)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('migrationStatus가 unresolved인 체크인은 포함되지 않아야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkInArb, { minLength: 0, maxLength: 50 }),
        fc.constantFrom('슬램덩크', '주술회전', '최애의 아이', '듀라라라'),
        (checkins, targetContent) => {
          const result = filterByContentName(checkins, targetContent)

          for (const checkin of result) {
            expect(checkin.migrationStatus).not.toBe('unresolved')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('migrationStatus가 null인 체크인은 포함되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkInArb, { minLength: 1, maxLength: 50 }),
        fc.constantFrom('슬램덩크', '주술회전', '최애의 아이', '듀라라라'),
        (checkins, targetContent) => {
          // null migrationStatus + 일치하는 contentName을 가진 체크인이 있으면 결과에 포함
          const nullStatusMatching = checkins.filter(
            (c) => c.contentName === targetContent && c.migrationStatus === null
          )
          const result = filterByContentName(checkins, targetContent)

          for (const expected of nullStatusMatching) {
            expect(result.some((r) => r.id === expected.id)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('migrationStatus가 resolved인 체크인은 포함되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkInArb, { minLength: 1, maxLength: 50 }),
        fc.constantFrom('슬램덩크', '주술회전', '최애의 아이', '듀라라라'),
        (checkins, targetContent) => {
          const resolvedMatching = checkins.filter(
            (c) =>
              c.contentName === targetContent &&
              c.migrationStatus === 'resolved'
          )
          const result = filterByContentName(checkins, targetContent)

          for (const expected of resolvedMatching) {
            expect(result.some((r) => r.id === expected.id)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 5: Unresolved 체크인 제외 일관성', () => {
  it('unresolved 체크인은 어떤 작품의 피드에도 포함되지 않아야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkInArb, { minLength: 0, maxLength: 50 }),
        (checkins) => {
          const contentNames = ['슬램덩크', '주술회전', '최애의 아이', '듀라라라']

          for (const contentName of contentNames) {
            const result = filterByContentName(checkins, contentName)
            for (const checkin of result) {
              expect(checkin.migrationStatus).not.toBe('unresolved')
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 6: contentName + spotId AND 필터 결합', () => {
  it('반환된 모든 체크인은 contentName과 spotId 두 조건을 모두 만족해야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkInArb, { minLength: 0, maxLength: 50 }),
        fc.constantFrom('슬램덩크', '주술회전', '최애의 아이', '듀라라라'),
        fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
        (checkins, targetContent, targetSpotId) => {
          const result = filterByContentNameAndSpotId(
            checkins,
            targetContent,
            targetSpotId
          )

          for (const checkin of result) {
            expect(checkin.contentName).toBe(targetContent)
            expect(checkin.spotId).toBe(targetSpotId)
            expect(checkin.migrationStatus).not.toBe('unresolved')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('AND 결합 결과는 개별 필터 결과의 교집합이어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkInArb, { minLength: 0, maxLength: 50 }),
        fc.constantFrom('슬램덩크', '주술회전', '최애의 아이', '듀라라라'),
        fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
        (checkins, targetContent, targetSpotId) => {
          const andResult = filterByContentNameAndSpotId(
            checkins,
            targetContent,
            targetSpotId
          )
          const contentOnly = filterByContentName(checkins, targetContent)
          const spotOnly = checkins.filter((c) => c.spotId === targetSpotId)

          // AND 결과의 모든 항목은 contentOnly에도 spotOnly에도 존재
          for (const checkin of andResult) {
            expect(contentOnly.some((c) => c.id === checkin.id)).toBe(true)
            expect(spotOnly.some((c) => c.id === checkin.id)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
