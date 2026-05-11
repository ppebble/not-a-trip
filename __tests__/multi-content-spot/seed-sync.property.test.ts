/**
 * Property-Based Tests: Seed 동기화
 * Property 12: Seed 동기화 일관성
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 1.8, 11.4**
 */

import * as fc from 'fast-check'
import {
  createRelationsFromSpot,
  getRelationTypeForContent,
  normalizeContentName,
} from '../../scripts/seed-real-spots'

// ============================================
// Types (from seed script)
// ============================================

interface RelatedContent {
  name: string
  type: string
  year?: number
}

interface SeedSpot {
  id: string
  name: string
  relatedContent: RelatedContent[]
  // minimal fields needed for createRelationsFromSpot
  [key: string]: unknown
}

// ============================================
// Generators
// ============================================

const relatedContentArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom(
    'anime',
    'movie',
    'drama',
    'sports_team',
    'artist',
    'game',
    'other'
  ),
  year: fc.option(fc.integer({ min: 1990, max: 2025 })),
})

const seedSpotArb = fc.record({
  id: fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  relatedContent: fc.array(relatedContentArb, { minLength: 1, maxLength: 8 }),
})

// ============================================
// Property Tests
// ============================================

describe('Property 12: Seed 동기화 일관성', () => {
  it('생성된 relation 수는 relatedContent 배열 길이와 동일해야 한다', () => {
    fc.assert(
      fc.property(seedSpotArb, (spot) => {
        const relations = createRelationsFromSpot(
          spot as unknown as Parameters<typeof createRelationsFromSpot>[0]
        )

        expect(relations.length).toBe(spot.relatedContent.length)
      }),
      { numRuns: 100 }
    )
  })

  it('각 relation의 contentName은 원본 relatedContent[i].name과 일치해야 한다', () => {
    fc.assert(
      fc.property(seedSpotArb, (spot) => {
        const relations = createRelationsFromSpot(
          spot as unknown as Parameters<typeof createRelationsFromSpot>[0]
        )

        for (let i = 0; i < relations.length; i++) {
          expect(relations[i].contentName).toBe(spot.relatedContent[i].name)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('각 relation의 spotId는 원본 스팟의 id와 일치해야 한다', () => {
    fc.assert(
      fc.property(seedSpotArb, (spot) => {
        const relations = createRelationsFromSpot(
          spot as unknown as Parameters<typeof createRelationsFromSpot>[0]
        )

        for (const relation of relations) {
          expect(relation.spotId).toBe(spot.id)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('각 relation의 contentType은 원본 relatedContent[i].type과 일치해야 한다', () => {
    fc.assert(
      fc.property(seedSpotArb, (spot) => {
        const relations = createRelationsFromSpot(
          spot as unknown as Parameters<typeof createRelationsFromSpot>[0]
        )

        for (let i = 0; i < relations.length; i++) {
          expect(relations[i].contentType).toBe(spot.relatedContent[i].type)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('각 relation의 relationType은 contentType에 따라 올바르게 결정되어야 한다', () => {
    fc.assert(
      fc.property(seedSpotArb, (spot) => {
        const relations = createRelationsFromSpot(
          spot as unknown as Parameters<typeof createRelationsFromSpot>[0]
        )

        for (let i = 0; i < relations.length; i++) {
          const expectedRelationType = getRelationTypeForContent(
            spot.relatedContent[i].type
          )
          expect(relations[i].relationType).toBe(expectedRelationType)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('각 relation의 displayPriority는 배열 인덱스와 동일해야 한다', () => {
    fc.assert(
      fc.property(seedSpotArb, (spot) => {
        const relations = createRelationsFromSpot(
          spot as unknown as Parameters<typeof createRelationsFromSpot>[0]
        )

        for (let i = 0; i < relations.length; i++) {
          expect(relations[i].displayPriority).toBe(i)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('모든 생성된 relation의 status는 active여야 한다', () => {
    fc.assert(
      fc.property(seedSpotArb, (spot) => {
        const relations = createRelationsFromSpot(
          spot as unknown as Parameters<typeof createRelationsFromSpot>[0]
        )

        for (const relation of relations) {
          expect(relation.status).toBe('active')
        }
      }),
      { numRuns: 100 }
    )
  })

  it('normalizeContentName은 일관된 contentId를 생성해야 한다', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 50 }), (name) => {
        const result1 = normalizeContentName(name)
        const result2 = normalizeContentName(name)
        expect(result1).toBe(result2)
      }),
      { numRuns: 100 }
    )
  })
})
