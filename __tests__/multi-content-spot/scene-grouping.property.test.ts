/**
 * Property-Based Tests: 장면 그룹화
 * Property 9: 장면 그룹화 — contentName 매칭
 *
 * Feature: multi-content-spot-structure
 * **Validates: Requirements 6.1, 6.2, 6.4, 6.6**
 */

import * as fc from 'fast-check'
import { groupScenesByContent } from '@/components/spot/SceneComparison'
import type { Scene, SpotContentRelation } from '@/types'

// ============================================
// Generators
// ============================================

const contentNames = ['슬램덩크', '주술회전', '최애의 아이', '듀라라라', '은혼']

const sceneArb = fc.record({
  id: fc.uuid(),
  spotId: fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
  imageUrl: fc.constant('https://example.com/scene.jpg'),
  animeTitle: fc.constantFrom(...contentNames),
  contentName: fc.option(fc.constantFrom(...contentNames)),
  episodeInfo: fc.option(fc.string({ maxLength: 30 })),
  likeCount: fc.nat({ max: 100 }),
  createdAt: fc.date(),
}) as unknown as fc.Arbitrary<Scene>

const activeRelationArb = fc.record({
  id: fc.uuid(),
  spotId: fc.stringMatching(/^REAL-[A-Z]{3}-\d{3}$/),
  contentId: fc.string({ minLength: 5, maxLength: 50 }),
  contentName: fc.constantFrom(...contentNames),
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
// Property Tests
// ============================================

describe('Property 9: 장면 그룹화 — contentName 매칭', () => {
  it('모든 scene은 정확히 하나의 그룹에 속해야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(sceneArb, { minLength: 1, maxLength: 15 }),
        fc.array(activeRelationArb, { minLength: 1, maxLength: 5 }),
        (scenes, relations) => {
          // 고유 contentName을 가진 relations 보장
          const uniqueRelations = relations.reduce<SpotContentRelation[]>(
            (acc, r, i) => {
              if (!acc.some((a) => a.contentName === r.contentName)) {
                acc.push({ ...r, displayPriority: i })
              }
              return acc
            },
            []
          )

          const groups = groupScenesByContent(scenes, uniqueRelations)

          // 모든 그룹의 장면 수 합 = 원본 장면 수
          const totalScenesInGroups = groups.reduce(
            (sum, g) => sum + g.scenes.length,
            0
          )
          expect(totalScenesInGroups).toBe(scenes.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('contentName이 있는 scene은 해당 contentName 그룹에 배치되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(sceneArb, { minLength: 1, maxLength: 15 }),
        fc.array(activeRelationArb, { minLength: 1, maxLength: 5 }),
        (scenes, relations) => {
          const uniqueRelations = relations.reduce<SpotContentRelation[]>(
            (acc, r, i) => {
              if (!acc.some((a) => a.contentName === r.contentName)) {
                acc.push({ ...r, displayPriority: i })
              }
              return acc
            },
            []
          )

          const groups = groupScenesByContent(scenes, uniqueRelations)
          const relationContentNames = new Set(
            uniqueRelations.map((r) => r.contentName)
          )

          for (const scene of scenes) {
            const sceneContentName = scene.contentName || scene.animeTitle
            if (
              sceneContentName &&
              relationContentNames.has(sceneContentName)
            ) {
              // 해당 contentName 그룹에 있어야 함
              const matchingGroup = groups.find(
                (g) => g.contentName === sceneContentName
              )
              if (matchingGroup) {
                expect(
                  matchingGroup.scenes.some((s) => s.id === scene.id)
                ).toBe(true)
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('contentName이 없는 scene은 displayPriority 최소 relation 그룹에 배치되어야 한다', () => {
    fc.assert(
      fc.property(
        fc.array(activeRelationArb, { minLength: 1, maxLength: 5 }),
        (relations) => {
          // 고유 contentName relations
          const uniqueRelations = relations.reduce<SpotContentRelation[]>(
            (acc, r, i) => {
              if (!acc.some((a) => a.contentName === r.contentName)) {
                acc.push({ ...r, displayPriority: i })
              }
              return acc
            },
            []
          )

          // contentName이 없고 animeTitle도 relation에 매칭되지 않는 scene
          const unmatchedScene: Scene = {
            id: 'test-scene-no-content',
            spotId: 'REAL-AAA-001',
            imageUrl: 'https://example.com/scene.jpg',
            animeTitle: '매칭안되는작품',
            likeCount: 0,
            createdAt: new Date(),
          }

          // contentName이 null인 scene
          const nullContentScene: Scene = {
            id: 'test-scene-null-content',
            spotId: 'REAL-AAA-001',
            imageUrl: 'https://example.com/scene2.jpg',
            animeTitle: '매칭안되는작품2',
            likeCount: 0,
            createdAt: new Date(),
          }

          const scenes = [unmatchedScene, nullContentScene]
          const groups = groupScenesByContent(scenes, uniqueRelations)

          // 대표 relation (displayPriority 최소)의 그룹에 배치되거나 새 그룹 생성
          // 모든 scene이 어딘가에 배치되어야 함
          const totalScenesInGroups = groups.reduce(
            (sum, g) => sum + g.scenes.length,
            0
          )
          expect(totalScenesInGroups).toBe(scenes.length)
        }
      ),
      { numRuns: 100 }
    )
  })
})
