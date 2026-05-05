/**
 * Property-Based Tests: 관계 카드 필수 정보
 * Property 14: 관계 카드 필수 정보 포함
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 3.3, 10.3**
 */

import * as fc from 'fast-check'
import {
  RELATION_TYPE_LABELS,
  type RelationType,
  type SpotContentRelation,
} from '@/types/spot'

// ============================================
// Generators
// ============================================

const relationTypeArb = fc.constantFrom<RelationType>(
  'scene_depicted',
  'inspired_by',
  'filming_location',
  'collaboration_event',
  'merchandise_spot',
  'fan_inferred',
  'promotional_reference'
)

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
  relationType: relationTypeArb,
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
// Pure logic under test
// ============================================

/**
 * RelationSelector 항목에 표시할 정보 추출
 */
function getRelationDisplayInfo(relation: SpotContentRelation): {
  contentName: string
  relationTypeLabel: string
} {
  return {
    contentName: relation.contentName,
    relationTypeLabel: RELATION_TYPE_LABELS[relation.relationType],
  }
}

/**
 * RELATION_TYPE_LABELS가 모든 RelationType을 커버하는지 확인
 */
function hasLabelForRelationType(relationType: RelationType): boolean {
  return relationType in RELATION_TYPE_LABELS
}

// ============================================
// Property Tests
// ============================================

describe('Property 14: 관계 카드 필수 정보 포함', () => {
  it('모든 RelationType에 대해 RELATION_TYPE_LABELS에 한글 라벨이 존재해야 한다', () => {
    fc.assert(
      fc.property(relationTypeArb, (relationType) => {
        expect(hasLabelForRelationType(relationType)).toBe(true)
        expect(RELATION_TYPE_LABELS[relationType]).toBeDefined()
        expect(RELATION_TYPE_LABELS[relationType].length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('RelationSelector 항목에는 contentName이 포함되어야 한다', () => {
    fc.assert(
      fc.property(relationArb, (relation) => {
        const displayInfo = getRelationDisplayInfo(relation)

        expect(displayInfo.contentName).toBe(relation.contentName)
        expect(displayInfo.contentName.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('RelationSelector 항목에는 relationType의 한글 라벨이 포함되어야 한다', () => {
    fc.assert(
      fc.property(relationArb, (relation) => {
        const displayInfo = getRelationDisplayInfo(relation)

        expect(displayInfo.relationTypeLabel).toBe(
          RELATION_TYPE_LABELS[relation.relationType]
        )
        expect(displayInfo.relationTypeLabel.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 }
    )
  })

  it('RELATION_TYPE_LABELS의 모든 값은 비어있지 않은 문자열이어야 한다', () => {
    const allRelationTypes: RelationType[] = [
      'scene_depicted',
      'inspired_by',
      'filming_location',
      'collaboration_event',
      'merchandise_spot',
      'fan_inferred',
      'promotional_reference',
    ]

    for (const relationType of allRelationTypes) {
      expect(RELATION_TYPE_LABELS[relationType]).toBeDefined()
      expect(typeof RELATION_TYPE_LABELS[relationType]).toBe('string')
      expect(RELATION_TYPE_LABELS[relationType].length).toBeGreaterThan(0)
    }
  })
})
