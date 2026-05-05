/**
 * Property-Based Tests: 마이그레이션
 * Property 10: 마이그레이션 분기 정확성
 * Property 11: 마이그레이션 멱등성
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 7.2, 7.3, 7.5**
 */

import * as fc from 'fast-check'

// ============================================
// Types
// ============================================

interface CheckInDoc {
  id: string
  spotId: string
  relationId?: string
  contentId?: string
  contentName?: string
  relationType?: string
  migrationStatus?: 'resolved' | 'unresolved' | null
}

interface RelationDoc {
  id: string
  spotId: string
  contentId: string
  contentName: string
  relationType: string
  status: string
}

interface MigrationResult {
  updatedCheckin: CheckInDoc
  action: 'resolved' | 'unresolved' | 'skipped'
}

// ============================================
// Generators
// ============================================

const spotIdArb = fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/)

const relationDocArb = fc.record({
  id: fc.uuid(),
  spotId: spotIdArb,
  contentId: fc.string({ minLength: 5, maxLength: 50 }),
  contentName: fc.string({ minLength: 1, maxLength: 50 }),
  relationType: fc.constantFrom(
    'scene_depicted',
    'inspired_by',
    'filming_location',
    'collaboration_event',
    'merchandise_spot',
    'fan_inferred',
    'promotional_reference'
  ),
  status: fc.constant('active'),
})

const legacyCheckInArb = fc.record({
  id: fc.uuid(),
  spotId: spotIdArb,
  // Legacy: no relationId
})

// ============================================
// Pure logic under test (extracted from migration script)
// ============================================

/**
 * 마이그레이션 분기 로직 — 순수 함수 버전
 */
function migrateCheckIn(
  checkin: CheckInDoc,
  activeRelations: RelationDoc[]
): MigrationResult {
  // 멱등성: 이미 relationId가 있으면 건너뛰기
  if (checkin.relationId) {
    return { updatedCheckin: checkin, action: 'skipped' }
  }

  if (activeRelations.length === 0) {
    return { updatedCheckin: checkin, action: 'skipped' }
  }

  if (activeRelations.length === 1) {
    const relation = activeRelations[0]
    return {
      updatedCheckin: {
        ...checkin,
        relationId: relation.id,
        contentId: relation.contentId,
        contentName: relation.contentName,
        relationType: relation.relationType,
        migrationStatus: 'resolved',
      },
      action: 'resolved',
    }
  }

  // 2개 이상
  return {
    updatedCheckin: {
      ...checkin,
      migrationStatus: 'unresolved',
    },
    action: 'unresolved',
  }
}

// ============================================
// Property Tests
// ============================================

describe('Property 10: 마이그레이션 분기 정확성', () => {
  it('active relation 1개: relation 정보 추가 + resolved', () => {
    fc.assert(
      fc.property(
        legacyCheckInArb,
        relationDocArb,
        (checkinBase, relation) => {
          const checkin: CheckInDoc = {
            id: checkinBase.id,
            spotId: checkinBase.spotId,
          }
          const sameSpotRelation = { ...relation, spotId: checkin.spotId }

          const result = migrateCheckIn(checkin, [sameSpotRelation])

          expect(result.action).toBe('resolved')
          expect(result.updatedCheckin.relationId).toBe(sameSpotRelation.id)
          expect(result.updatedCheckin.contentId).toBe(
            sameSpotRelation.contentId
          )
          expect(result.updatedCheckin.contentName).toBe(
            sameSpotRelation.contentName
          )
          expect(result.updatedCheckin.relationType).toBe(
            sameSpotRelation.relationType
          )
          expect(result.updatedCheckin.migrationStatus).toBe('resolved')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('active relation 2개+: relation 정보 미추가 + unresolved', () => {
    fc.assert(
      fc.property(
        legacyCheckInArb,
        fc.array(relationDocArb, { minLength: 2, maxLength: 10 }),
        (checkinBase, relations) => {
          const checkin: CheckInDoc = {
            id: checkinBase.id,
            spotId: checkinBase.spotId,
          }
          const sameSpotRelations = relations.map((r) => ({
            ...r,
            spotId: checkin.spotId,
          }))

          const result = migrateCheckIn(checkin, sameSpotRelations)

          expect(result.action).toBe('unresolved')
          expect(result.updatedCheckin.relationId).toBeUndefined()
          expect(result.updatedCheckin.contentId).toBeUndefined()
          expect(result.updatedCheckin.contentName).toBeUndefined()
          expect(result.updatedCheckin.relationType).toBeUndefined()
          expect(result.updatedCheckin.migrationStatus).toBe('unresolved')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('active relation 0개: 건너뛰기', () => {
    fc.assert(
      fc.property(legacyCheckInArb, (checkinBase) => {
        const checkin: CheckInDoc = {
          id: checkinBase.id,
          spotId: checkinBase.spotId,
        }

        const result = migrateCheckIn(checkin, [])

        expect(result.action).toBe('skipped')
        expect(result.updatedCheckin.relationId).toBeUndefined()
        expect(result.updatedCheckin.migrationStatus).toBeUndefined()
      }),
      { numRuns: 100 }
    )
  })
})

describe('Property 11: 마이그레이션 멱등성', () => {
  it('이미 relationId가 있는 체크인은 수정되지 않아야 한다', () => {
    fc.assert(
      fc.property(
        legacyCheckInArb,
        relationDocArb,
        fc.array(relationDocArb, { minLength: 1, maxLength: 5 }),
        (checkinBase, existingRelation, newRelations) => {
          // 이미 마이그레이션된 체크인
          const alreadyMigrated: CheckInDoc = {
            id: checkinBase.id,
            spotId: checkinBase.spotId,
            relationId: existingRelation.id,
            contentId: existingRelation.contentId,
            contentName: existingRelation.contentName,
            relationType: existingRelation.relationType,
            migrationStatus: 'resolved',
          }

          const result = migrateCheckIn(alreadyMigrated, newRelations)

          expect(result.action).toBe('skipped')
          // 원본과 동일해야 함
          expect(result.updatedCheckin).toEqual(alreadyMigrated)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('마이그레이션을 두 번 실행해도 결과가 동일해야 한다', () => {
    fc.assert(
      fc.property(
        legacyCheckInArb,
        relationDocArb,
        (checkinBase, relation) => {
          const checkin: CheckInDoc = {
            id: checkinBase.id,
            spotId: checkinBase.spotId,
          }
          const sameSpotRelation = { ...relation, spotId: checkin.spotId }

          // 첫 번째 마이그레이션
          const firstResult = migrateCheckIn(checkin, [sameSpotRelation])
          // 두 번째 마이그레이션 (이미 relationId가 있음)
          const secondResult = migrateCheckIn(firstResult.updatedCheckin, [
            sameSpotRelation,
          ])

          expect(secondResult.action).toBe('skipped')
          expect(secondResult.updatedCheckin).toEqual(
            firstResult.updatedCheckin
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
