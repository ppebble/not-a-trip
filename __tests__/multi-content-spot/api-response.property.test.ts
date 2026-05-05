/**
 * Property-Based Tests: 응답 메타데이터
 * Property 15: 응답에 relation 메타데이터 포함
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 4.6, 8.5**
 */

import * as fc from 'fast-check'
import type { RelationType } from '@/types/spot'

// ============================================
// Types
// ============================================

interface CheckInDocument {
  id: string
  spotId: string
  userId: string
  userName: string
  photoUrl: string
  visitedAt: Date
  likeCount: number
  relationId?: string
  contentId?: string
  contentName?: string
  relationType?: RelationType
  migrationStatus?: 'resolved' | 'unresolved' | null
  createdAt: Date
  updatedAt?: Date
}

interface CheckInResponse {
  id: string
  spotId: string
  userId: string
  userName: string
  photoUrl: string
  visitedAt: Date
  likeCount: number
  relationId?: string
  contentId?: string
  contentName?: string
  relationType?: RelationType
  migrationStatus?: 'resolved' | 'unresolved' | null
  createdAt: Date
  updatedAt?: Date
}

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

const checkInDocArb = fc.record({
  id: fc.uuid(),
  spotId: fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
  userId: fc.uuid(),
  userName: fc.string({ minLength: 1, maxLength: 20 }),
  photoUrl: fc.constant('https://example.com/photo.jpg'),
  visitedAt: fc.date(),
  likeCount: fc.nat({ max: 1000 }),
  relationId: fc.option(fc.uuid()),
  contentId: fc.option(fc.string({ minLength: 5, maxLength: 50 })),
  contentName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  relationType: fc.option(relationTypeArb),
  migrationStatus: fc.option(fc.constantFrom('resolved', 'unresolved')),
  createdAt: fc.date(),
  updatedAt: fc.option(fc.date()),
}) as fc.Arbitrary<CheckInDocument>

// ============================================
// Pure logic under test (extracted from GET handler response mapping)
// ============================================

/**
 * CheckIn 문서를 API 응답으로 변환하는 로직
 * relation 메타데이터 필드가 존재하면 응답에 포함
 */
function mapDocToResponse(doc: CheckInDocument): CheckInResponse {
  return {
    id: doc.id,
    spotId: doc.spotId,
    userId: doc.userId,
    userName: doc.userName,
    photoUrl: doc.photoUrl,
    visitedAt: doc.visitedAt,
    likeCount: doc.likeCount,
    // relation 메타데이터 포함 (Requirements 4.6, 8.5)
    ...(doc.relationId && { relationId: doc.relationId }),
    ...(doc.contentId && { contentId: doc.contentId }),
    ...(doc.contentName && { contentName: doc.contentName }),
    ...(doc.relationType && { relationType: doc.relationType }),
    ...(doc.migrationStatus !== undefined && {
      migrationStatus: doc.migrationStatus,
    }),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

// ============================================
// Property Tests
// ============================================

describe('Property 15: 응답에 relation 메타데이터 포함', () => {
  it('contentName이 존재하는 체크인은 응답에 contentName이 포함되어야 한다', () => {
    fc.assert(
      fc.property(checkInDocArb, (doc) => {
        const response = mapDocToResponse(doc)

        if (doc.contentName) {
          expect(response.contentName).toBe(doc.contentName)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('relationType이 존재하는 체크인은 응답에 relationType이 포함되어야 한다', () => {
    fc.assert(
      fc.property(checkInDocArb, (doc) => {
        const response = mapDocToResponse(doc)

        if (doc.relationType) {
          expect(response.relationType).toBe(doc.relationType)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('migrationStatus가 존재하는 체크인은 응답에 migrationStatus가 포함되어야 한다', () => {
    fc.assert(
      fc.property(checkInDocArb, (doc) => {
        const response = mapDocToResponse(doc)

        if (doc.migrationStatus !== undefined) {
          expect(response.migrationStatus).toBe(doc.migrationStatus)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('relationId가 존재하는 체크인은 응답에 relationId가 포함되어야 한다', () => {
    fc.assert(
      fc.property(checkInDocArb, (doc) => {
        const response = mapDocToResponse(doc)

        if (doc.relationId) {
          expect(response.relationId).toBe(doc.relationId)
        }
      }),
      { numRuns: 100 }
    )
  })

  it('relation 필드가 없는 체크인은 응답에 해당 필드가 포함되지 않아야 한다', () => {
    fc.assert(
      fc.property(checkInDocArb, (doc) => {
        const docWithoutRelation: CheckInDocument = {
          ...doc,
          relationId: undefined,
          contentId: undefined,
          contentName: undefined,
          relationType: undefined,
          migrationStatus: undefined,
        }

        const response = mapDocToResponse(docWithoutRelation)

        expect(response.relationId).toBeUndefined()
        expect(response.contentId).toBeUndefined()
        expect(response.contentName).toBeUndefined()
        expect(response.relationType).toBeUndefined()
        // migrationStatus undefined는 포함되지 않음
      }),
      { numRuns: 100 }
    )
  })

  it('모든 기본 필드는 항상 응답에 포함되어야 한다', () => {
    fc.assert(
      fc.property(checkInDocArb, (doc) => {
        const response = mapDocToResponse(doc)

        expect(response.id).toBe(doc.id)
        expect(response.spotId).toBe(doc.spotId)
        expect(response.userId).toBe(doc.userId)
        expect(response.userName).toBe(doc.userName)
        expect(response.photoUrl).toBe(doc.photoUrl)
        expect(response.visitedAt).toEqual(doc.visitedAt)
        expect(response.likeCount).toBe(doc.likeCount)
        expect(response.createdAt).toEqual(doc.createdAt)
      }),
      { numRuns: 100 }
    )
  })
})
