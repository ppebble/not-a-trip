/**
 * Property-Based Tests: Active 관계 필터링 및 정렬
 * Property 3: Active 관계 필터링 및 displayPriority 정렬
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 3.2, 10.4**
 */

import * as fc from 'fast-check'
import type { SpotContentRelation, RelationStatus } from '@/types/spot'

// ============================================
// Generators
// ============================================

const relationArb = fc.record({
  id: fc.uuid(),
  spotId: fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
  contentId: fc.string({ minLength: 5, maxLength: 50 }),
  contentName: fc.string({ minLength: 1, maxLength: 50 }),
  contentType: fc.constantFrom(
    'anime',
    'movie',
    'drama',
    'sports_team',
    'artist',
    'game',
    'other'
  ),
  relationType: fc.constantFrom(
    'scene_depicted',
    'inspired_by',
    'filming_location',
    'collaboration_event',
    'merchandise_spot',
    'fan_inferred',
    'promotional_reference'
  ),
  confidenceLevel: fc.constantFrom('high', 'medium', 'low'),
  officialness: fc.constantFrom(
    'official',
    'community_verified',
    'user_submitted',
    'unverified'
  ),
  displayPriority: fc.nat({ max: 100 }),
  status: fc.constantFrom(
    'active',
    'expired',
    'scheduled',
    'archived'
  ) as fc.Arbitrary<RelationStatus>,
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<SpotContentRelation>

// ============================================
// Pure logic under test
// ============================================

/**
 * Active relations 필터링 및 displayPriority 정렬
 * RelationSelector와 API에서 사용하는 로직
 */
function filterAndSortActiveRelations(
  relations: SpotContentRelation[]
): SpotContentRelation[] {
  return relations
    .filter((r) => r.status === 'active')
    .sort((a, b) => a.displayPriority - b.displayPriority)
}

// ============================================
// Property Tests
// ============================================

describe('Property 3: Active 관계 필터링 및 displayPriority 정렬', () => {
  it('결과에는 active 상태의 관계만 포함되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 0, maxLength: 20 }),
        (relations) => {
          const result = filterAndSortActiveRelations(relations)

          // 모든 결과가 active 상태
          for (const r of result) {
            expect(r.status).toBe('active')
          }

          // active가 아닌 relation은 포함되지 않음
          const activeCount = relations.filter(
            (r) => r.status === 'active'
          ).length
          expect(result.length).toBe(activeCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('결과는 displayPriority 오름차순으로 정렬되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 0, maxLength: 20 }),
        (relations) => {
          const result = filterAndSortActiveRelations(relations)

          for (let i = 1; i < result.length; i++) {
            expect(result[i].displayPriority).toBeGreaterThanOrEqual(
              result[i - 1].displayPriority
            )
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('expired, scheduled, archived 상태의 관계는 제외되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 1, maxLength: 20 }),
        (relations) => {
          const result = filterAndSortActiveRelations(relations)

          const nonActiveStatuses = ['expired', 'scheduled', 'archived']
          for (const r of result) {
            expect(nonActiveStatuses).not.toContain(r.status)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('원본 데이터의 모든 active relation이 결과에 포함되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 0, maxLength: 20 }),
        (relations) => {
          const result = filterAndSortActiveRelations(relations)
          const activeRelations = relations.filter(
            (r) => r.status === 'active'
          )

          // 모든 active relation의 id가 결과에 존재
          for (const active of activeRelations) {
            expect(result.some((r) => r.id === active.id)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
