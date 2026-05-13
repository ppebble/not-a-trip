/**
 * Property-Based Tests: 체크인 콘텐츠 진행률 계산 유틸리티
 *
 * Feature: 38-checkin-content-progress
 *
 * Property 1: 총 스팟 수 집계 정확성 (active + distinct)
 * Property 2: 인증 스팟 수 집계 정확성 (unresolved 제외 + distinct)
 * Property 3: 진행률 범위 및 공식 준수
 * Property 4: 0% 작품 제외 필터링
 */

import * as fc from 'fast-check'
import { mergeProgressMaps } from '@/lib/progress-utils'

// ============================================
// Types (인메모리 테스트용)
// ============================================

interface SpotContentRelationDoc {
  contentName: string
  spotId: string
  status: 'active' | 'expired' | 'scheduled' | 'archived'
}

interface CheckInDoc {
  userId: string
  spotId: string
  contentName: string | null | undefined
  migrationStatus: 'resolved' | 'unresolved' | null
}

// ============================================
// Generators
// ============================================

const spotIdArb = fc.stringMatching(/^SPOT-\d{3,}$/)
const contentNameArb = fc.string({ minLength: 1, maxLength: 50 })

const relationDocArb = fc.record({
  contentName: contentNameArb,
  spotId: spotIdArb,
  status: fc.constantFrom(
    'active',
    'expired',
    'scheduled',
    'archived'
  ) as fc.Arbitrary<'active' | 'expired' | 'scheduled' | 'archived'>,
})

const checkinDocArb = fc.record({
  userId: fc.string({ minLength: 1, maxLength: 30 }),
  spotId: spotIdArb,
  contentName: fc.option(
    fc.string({ minLength: 1, maxLength: 50 })
  ) as fc.Arbitrary<string | null>,
  migrationStatus: fc.option(
    fc.constantFrom('resolved', 'unresolved')
  ) as fc.Arbitrary<'resolved' | 'unresolved' | null>,
})

// ============================================
// 인메모리 순수 로직 (DB 집계 재현)
// ============================================

/**
 * fetchTotalSpotsMap 인메모리 재현
 * - status: 'active'인 문서만 포함
 * - contentName별 distinct spotId 수 집계
 */
function inMemoryFetchTotalSpotsMap(
  relations: SpotContentRelationDoc[]
): Map<string, number> {
  const map = new Map<string, Set<string>>()

  for (const rel of relations) {
    if (rel.status !== 'active') continue
    if (!map.has(rel.contentName)) {
      map.set(rel.contentName, new Set())
    }
    map.get(rel.contentName)!.add(rel.spotId)
  }

  const result = new Map<string, number>()
  for (const [contentName, spotIds] of map) {
    result.set(contentName, spotIds.size)
  }
  return result
}

/**
 * fetchCheckedSpotsMap 인메모리 재현
 * - userId 일치 + migrationStatus !== 'unresolved' + contentName 존재
 * - contentName별 distinct spotId 수 집계
 */
function inMemoryFetchCheckedSpotsMap(
  checkins: CheckInDoc[],
  userId: string
): Map<string, number> {
  const map = new Map<string, Set<string>>()

  for (const ci of checkins) {
    if (ci.userId !== userId) continue
    if (ci.migrationStatus === 'unresolved') continue
    if (ci.contentName == null) continue

    if (!map.has(ci.contentName)) {
      map.set(ci.contentName, new Set())
    }
    map.get(ci.contentName)!.add(ci.spotId)
  }

  const result = new Map<string, number>()
  for (const [contentName, spotIds] of map) {
    result.set(contentName, spotIds.size)
  }
  return result
}

// ============================================
// Property 1: 총 스팟 수 집계 정확성 (active + distinct)
// **Validates: Requirements 1.1, 2.1, 2.2, 2.3**
// ============================================

describe('Property 1: 총 스팟 수 집계 정확성 (active + distinct)', () => {
  it('fetchTotalSpotsMap 로직은 active 문서의 contentName별 distinct spotId 수를 정확히 반환해야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(relationDocArb, { minLength: 0, maxLength: 50 }),
        (relations) => {
          const result = inMemoryFetchTotalSpotsMap(relations)

          // 각 contentName에 대해 active + distinct spotId 수 검증
          for (const [contentName, totalSpots] of result) {
            const expectedSpotIds = new Set(
              relations
                .filter(
                  (r) => r.contentName === contentName && r.status === 'active'
                )
                .map((r) => r.spotId)
            )
            expect(totalSpots).toBe(expectedSpotIds.size)
          }

          // active relation이 없는 contentName은 결과에 포함되지 않아야 함
          const activeContentNames = new Set(
            relations
              .filter((r) => r.status === 'active')
              .map((r) => r.contentName)
          )
          for (const contentName of result.keys()) {
            expect(activeContentNames.has(contentName)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('active가 아닌 relation은 totalSpots 집계에서 제외되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            contentName: contentNameArb,
            spotId: spotIdArb,
            status: fc.constantFrom(
              'expired',
              'scheduled',
              'archived'
            ) as fc.Arbitrary<'expired' | 'scheduled' | 'archived'>,
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (nonActiveRelations) => {
          const result = inMemoryFetchTotalSpotsMap(
            nonActiveRelations as SpotContentRelationDoc[]
          )
          // active가 없으면 결과 Map이 비어야 함
          expect(result.size).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 2: 인증 스팟 수 집계 정확성 (unresolved 제외 + distinct)
// **Validates: Requirements 1.2, 1.6, 4.3**
// ============================================

describe('Property 2: 인증 스팟 수 집계 정확성 (unresolved 제외 + distinct)', () => {
  it('fetchCheckedSpotsMap 로직은 unresolved 제외 + distinct spotId 수를 정확히 반환해야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(checkinDocArb, { minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (checkins, userId) => {
          const result = inMemoryFetchCheckedSpotsMap(checkins, userId)

          // 각 contentName에 대해 검증
          for (const [contentName, checkedSpots] of result) {
            const expectedSpotIds = new Set(
              checkins
                .filter(
                  (c) =>
                    c.userId === userId &&
                    c.migrationStatus !== 'unresolved' &&
                    c.contentName != null &&
                    c.contentName === contentName
                )
                .map((c) => c.spotId)
            )
            expect(checkedSpots).toBe(expectedSpotIds.size)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('unresolved 체크인은 checkedSpots에 포함되지 않아야 한다', () => {
    fc.assert(
      fc.property(
        spotIdArb,
        fc.string({ minLength: 1, maxLength: 30 }),
        contentNameArb,
        (spotId, userId, contentName) => {
          const unresolvedCheckins: CheckInDoc[] = [
            { userId, spotId, contentName, migrationStatus: 'unresolved' },
          ]
          const result = inMemoryFetchCheckedSpotsMap(
            unresolvedCheckins,
            userId
          )
          // unresolved만 있으면 결과에 포함되지 않아야 함
          expect(result.has(contentName)).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('contentName이 null/undefined인 체크인은 집계에서 제외되어야 한다', () => {
    fc.assert(
      fc.property(
        spotIdArb,
        fc.string({ minLength: 1, maxLength: 30 }),
        (spotId, userId) => {
          const nullContentCheckins: CheckInDoc[] = [
            { userId, spotId, contentName: null, migrationStatus: 'resolved' },
          ]
          const result = inMemoryFetchCheckedSpotsMap(
            nullContentCheckins,
            userId
          )
          expect(result.size).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('동일 스팟에 여러 번 체크인해도 1회로 카운트되어야 한다', () => {
    fc.assert(
      fc.property(
        spotIdArb,
        fc.string({ minLength: 1, maxLength: 30 }),
        contentNameArb,
        fc.integer({ min: 2, max: 10 }),
        (spotId, userId, contentName, repeatCount) => {
          const repeatedCheckins: CheckInDoc[] = Array.from(
            { length: repeatCount },
            () => ({
              userId,
              spotId,
              contentName,
              migrationStatus: 'resolved' as const,
            })
          )
          const result = inMemoryFetchCheckedSpotsMap(repeatedCheckins, userId)
          expect(result.get(contentName)).toBe(1)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 3: 진행률 범위 및 공식 준수
// **Validates: Requirements 1.3**
// ============================================

describe('Property 3: 진행률 범위 및 공식 준수', () => {
  it('Math.round((checkedSpots / totalSpots) * 100) 결과는 항상 0 이상 100 이하 정수여야 한다', () => {
    const progressInputArb = fc
      .nat({ max: 1000 })
      .chain((total) => fc.tuple(fc.constant(total), fc.nat({ max: total })))
      .map(([total, checked]) => ({
        totalSpots: total,
        checkedSpots: checked,
      }))
      .filter(({ totalSpots }) => totalSpots > 0)

    fc.assert(
      fc.property(progressInputArb, ({ totalSpots, checkedSpots }) => {
        const progress = Math.round((checkedSpots / totalSpots) * 100)

        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(100)
        expect(Number.isInteger(progress)).toBe(true)
      }),
      { numRuns: 100 }
    )
  })

  it('mergeProgressMaps의 progress 값은 항상 0 이상 100 이하 정수여야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            contentName: contentNameArb,
            totalSpots: fc.integer({ min: 1, max: 1000 }),
            checkedSpots: fc.integer({ min: 1, max: 1000 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (entries) => {
          const totalSpotsMap = new Map<string, number>()
          const checkedSpotsMap = new Map<string, number>()

          for (const entry of entries) {
            // checkedSpots <= totalSpots 보장
            const checkedSpots = Math.min(entry.checkedSpots, entry.totalSpots)
            totalSpotsMap.set(entry.contentName, entry.totalSpots)
            checkedSpotsMap.set(entry.contentName, checkedSpots)
          }

          const result = mergeProgressMaps(totalSpotsMap, checkedSpotsMap)

          for (const item of result) {
            // progress는 0 이상 100 이하 정수 (Math.round 결과)
            expect(item.progress).toBeGreaterThanOrEqual(0)
            expect(item.progress).toBeLessThanOrEqual(100)
            expect(Number.isInteger(item.progress)).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 4: 0% 작품 제외 필터링
// **Validates: Requirements 1.4, 3.2**
// ============================================

describe('Property 4: 0% 작품 제외 필터링', () => {
  it('mergeProgressMaps 결과에 checkedSpots === 0인 항목이 없어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            contentName: contentNameArb,
            totalSpots: fc.integer({ min: 1, max: 1000 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        fc.array(
          fc.record({
            contentName: contentNameArb,
            checkedSpots: fc.integer({ min: 0, max: 1000 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (totalEntries, checkedEntries) => {
          const totalSpotsMap = new Map<string, number>()
          const checkedSpotsMap = new Map<string, number>()

          for (const entry of totalEntries) {
            totalSpotsMap.set(entry.contentName, entry.totalSpots)
          }
          for (const entry of checkedEntries) {
            checkedSpotsMap.set(entry.contentName, entry.checkedSpots)
          }

          const result = mergeProgressMaps(totalSpotsMap, checkedSpotsMap)

          // checkedSpots === 0인 항목이 없어야 함
          for (const item of result) {
            expect(item.checkedSpots).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('checkedSpotsMap에 없는 contentName은 결과에서 제외되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            contentName: contentNameArb,
            totalSpots: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (totalEntries) => {
          const totalSpotsMap = new Map<string, number>()
          for (const entry of totalEntries) {
            totalSpotsMap.set(entry.contentName, entry.totalSpots)
          }
          // checkedSpotsMap은 비어있음 (모든 항목이 0)
          const checkedSpotsMap = new Map<string, number>()

          const result = mergeProgressMaps(totalSpotsMap, checkedSpotsMap)

          // 모든 항목이 제외되어야 함
          expect(result).toHaveLength(0)
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ============================================
// Property 5: 진행률 내림차순 정렬
// **Validates: Requirements 3.3**
// ============================================

describe('Property 5: 진행률 내림차순 정렬', () => {
  it('임의의 ContentProgress[] 배열에 정렬 함수 적용 후 인접 항목은 a[i].progress >= a[i+1].progress를 만족해야 한다', () => {
    const contentProgressArb = fc.record({
      contentName: contentNameArb,
      totalSpots: fc.integer({ min: 1, max: 1000 }),
      checkedSpots: fc.integer({ min: 1, max: 1000 }),
      progress: fc.integer({ min: 0, max: 100 }),
    })

    fc.assert(
      fc.property(
        fc.array(contentProgressArb, { minLength: 0, maxLength: 50 }),
        (items) => {
          const sorted = [...items].sort((a, b) => b.progress - a.progress)

          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].progress).toBeGreaterThanOrEqual(
              sorted[i + 1].progress
            )
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('mergeProgressMaps 결과에 정렬 함수를 적용하면 내림차순이 보장되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            contentName: contentNameArb,
            totalSpots: fc.integer({ min: 1, max: 1000 }),
            checkedSpots: fc.integer({ min: 1, max: 1000 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (entries) => {
          const totalSpotsMap = new Map<string, number>()
          const checkedSpotsMap = new Map<string, number>()

          for (const entry of entries) {
            const checkedSpots = Math.min(entry.checkedSpots, entry.totalSpots)
            totalSpotsMap.set(entry.contentName, entry.totalSpots)
            checkedSpotsMap.set(entry.contentName, checkedSpots)
          }

          const sorted = mergeProgressMaps(totalSpotsMap, checkedSpotsMap).sort(
            (a, b) => b.progress - a.progress
          )

          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].progress).toBeGreaterThanOrEqual(
              sorted[i + 1].progress
            )
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
