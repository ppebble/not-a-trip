/**
 * Property-Based Tests: 체크인 생성
 * Property 1: Relation 스냅샷 정확성
 * Property 2: Relation 개수별 분기 정확성
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 2.7, 3.5, 3.7, 11.1, 11.2, 11.3**
 */

import * as fc from 'fast-check'
import type { SpotContentRelation } from '@/types/spot'

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
  status: fc.constant('active' as const),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<SpotContentRelation>

// ============================================
// Pure logic under test (extracted from API route)
// ============================================

/**
 * resolveRelationForCheckIn — 체크인 생성 시 relation 결정 로직
 * API route에서 추출한 순수 로직
 */
function resolveRelationForCheckIn(
  activeRelations: SpotContentRelation[],
  inputRelationId?: string
): { relation: SpotContentRelation | null; error?: string } {
  if (activeRelations.length === 0) {
    return { relation: null }
  }

  if (activeRelations.length === 1) {
    if (inputRelationId && inputRelationId !== activeRelations[0].id) {
      return { relation: null, error: '유효하지 않은 관계 ID입니다' }
    }
    return { relation: activeRelations[0] }
  }

  // 2개 이상
  if (!inputRelationId) {
    return { relation: null, error: '이 스팟에는 작품 선택이 필요합니다' }
  }

  const matched = activeRelations.find((r) => r.id === inputRelationId)
  if (!matched) {
    return { relation: null, error: '유효하지 않은 관계 ID입니다' }
  }

  return { relation: matched }
}

/**
 * 체크인 문서에 스냅샷 필드를 적용하는 로직
 */
function applyRelationSnapshot(
  relation: SpotContentRelation | null
): {
  relationId?: string
  contentId?: string
  contentName?: string
  relationType?: string
} {
  if (!relation) return {}
  return {
    relationId: relation.id,
    contentId: relation.contentId,
    contentName: relation.contentName,
    relationType: relation.relationType,
  }
}

// ============================================
// Property Tests
// ============================================

describe('Property 1: Relation 스냅샷 정확성', () => {
  it('유효한 relationId로 생성된 체크인의 스냅샷 필드는 원본 relation과 일치해야 한다', () => {
    fc.assert(
      fc.property(relationArb, (relation) => {
        const result = resolveRelationForCheckIn([relation], relation.id)
        expect(result.error).toBeUndefined()
        expect(result.relation).not.toBeNull()

        const snapshot = applyRelationSnapshot(result.relation)
        expect(snapshot.relationId).toBe(relation.id)
        expect(snapshot.contentId).toBe(relation.contentId)
        expect(snapshot.contentName).toBe(relation.contentName)
        expect(snapshot.relationType).toBe(relation.relationType)
      }),
      { numRuns: 100 }
    )
  })

  it('다중 relation에서 선택된 relation의 스냅샷이 정확해야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 2, maxLength: 10 }),
        fc.nat(),
        (relations, indexSeed) => {
          // 고유 ID 보장
          const uniqueRelations = relations.map((r, i) => ({
            ...r,
            id: `${r.id}-${i}`,
          }))
          const selectedIndex = indexSeed % uniqueRelations.length
          const selectedRelation = uniqueRelations[selectedIndex]

          const result = resolveRelationForCheckIn(
            uniqueRelations,
            selectedRelation.id
          )
          expect(result.error).toBeUndefined()

          const snapshot = applyRelationSnapshot(result.relation)
          expect(snapshot.contentId).toBe(selectedRelation.contentId)
          expect(snapshot.contentName).toBe(selectedRelation.contentName)
          expect(snapshot.relationType).toBe(selectedRelation.relationType)
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Property 2: Relation 개수별 분기 정확성', () => {
  it('active relation 0개: relationId 없이 체크인 성공', () => {
    fc.assert(
      fc.property(fc.constant([]), (emptyRelations) => {
        const result = resolveRelationForCheckIn(
          emptyRelations as SpotContentRelation[]
        )
        expect(result.error).toBeUndefined()
        expect(result.relation).toBeNull()
      }),
      { numRuns: 100 }
    )
  })

  it('active relation 1개: relationId 미제공 시 자동 선택', () => {
    fc.assert(
      fc.property(relationArb, (relation) => {
        const result = resolveRelationForCheckIn([relation])
        expect(result.error).toBeUndefined()
        expect(result.relation).toEqual(relation)
      }),
      { numRuns: 100 }
    )
  })

  it('active relation 1개: 올바른 relationId 제공 시 성공', () => {
    fc.assert(
      fc.property(relationArb, (relation) => {
        const result = resolveRelationForCheckIn([relation], relation.id)
        expect(result.error).toBeUndefined()
        expect(result.relation).toEqual(relation)
      }),
      { numRuns: 100 }
    )
  })

  it('active relation 1개: 잘못된 relationId 제공 시 에러', () => {
    fc.assert(
      fc.property(relationArb, fc.uuid(), (relation, wrongId) => {
        fc.pre(wrongId !== relation.id)
        const result = resolveRelationForCheckIn([relation], wrongId)
        expect(result.error).toBe('유효하지 않은 관계 ID입니다')
      }),
      { numRuns: 100 }
    )
  })

  it('active relation 2개+: relationId 미제공 시 400 에러', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 2, maxLength: 10 }),
        (relations) => {
          const result = resolveRelationForCheckIn(relations)
          expect(result.error).toBe('이 스팟에는 작품 선택이 필요합니다')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('active relation 2개+: 유효한 relationId 제공 시 성공', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 2, maxLength: 10 }),
        fc.nat(),
        (relations, indexSeed) => {
          const uniqueRelations = relations.map((r, i) => ({
            ...r,
            id: `${r.id}-${i}`,
          }))
          const selectedIndex = indexSeed % uniqueRelations.length
          const result = resolveRelationForCheckIn(
            uniqueRelations,
            uniqueRelations[selectedIndex].id
          )
          expect(result.error).toBeUndefined()
          expect(result.relation).toEqual(uniqueRelations[selectedIndex])
        }
      ),
      { numRuns: 100 }
    )
  })

  it('active relation 2개+: 유효하지 않은 relationId 시 에러', () => {
    fc.assert(
      fc.property(
        fc.array(relationArb, { minLength: 2, maxLength: 10 }),
        fc.uuid(),
        (relations, wrongId) => {
          const uniqueRelations = relations.map((r, i) => ({
            ...r,
            id: `${r.id}-${i}`,
          }))
          fc.pre(!uniqueRelations.some((r) => r.id === wrongId))
          const result = resolveRelationForCheckIn(uniqueRelations, wrongId)
          expect(result.error).toBe('유효하지 않은 관계 ID입니다')
        }
      ),
      { numRuns: 100 }
    )
  })
})
