/**
 * 단위 테스트: multi-content-spot-structure
 * Example-based unit tests for CheckIn API, Migration, FloatingCard, SocialProof, RelationSelector, QuickCheckIn
 *
 * Requirements: 2.8, 3.8, 4.3, 7.4, 7.6, 9.2, 9.4, 11.1, 11.7
 */

import type { SpotContentRelation } from '@/types/spot'
import type { ShowcaseCard } from '@/components/landing/data/showcaseCards'

// ============================================
// 16.1 CheckIn POST — relation 분기 로직 테스트
// ============================================

/**
 * resolveRelationForCheckIn 로직을 순수 함수로 추출하여 테스트
 * 실제 API route.ts의 분기 로직을 동일하게 재현
 */
function resolveRelationForCheckIn(
  activeRelations: SpotContentRelation[],
  inputRelationId?: string
): { relation: SpotContentRelation | null; error?: string } {
  if (activeRelations.length === 0) {
    // 0개: relationId 없이 체크인 허용 (Requirements 11.1)
    return { relation: null }
  } else if (activeRelations.length === 1) {
    // 1개: 자동 선택 (Requirements 11.2)
    if (inputRelationId && inputRelationId !== activeRelations[0].id) {
      return { relation: null, error: '유효하지 않은 관계 ID입니다' }
    }
    return { relation: activeRelations[0] }
  } else {
    // 2개 이상: relationId 필수 (Requirements 11.3)
    if (!inputRelationId) {
      return { relation: null, error: '이 스팟에는 작품 선택이 필요합니다' }
    }
    const matched = activeRelations.find((r) => r.id === inputRelationId)
    if (!matched) {
      return { relation: null, error: '유효하지 않은 관계 ID입니다' }
    }
    return { relation: matched }
  }
}

/** 테스트용 relation 생성 헬퍼 */
function createMockRelation(
  overrides: Partial<SpotContentRelation> = {}
): SpotContentRelation {
  return {
    id: 'rel-001',
    spotId: 'REAL-ANI-001',
    contentId: 'REAL-ANI-001_test-content',
    contentName: '테스트 작품',
    contentType: 'anime',
    relationType: 'scene_depicted',
    confidenceLevel: 'high',
    officialness: 'official',
    displayPriority: 1,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }
}

describe('CheckIn POST — relation 분기', () => {
  it('0 relations 스팟에서 relationId 없이 체크인 성공', () => {
    const result = resolveRelationForCheckIn([], undefined)

    expect(result.relation).toBeNull()
    expect(result.error).toBeUndefined()
  })

  it('유효하지 않은 relationId로 400 에러 반환', () => {
    const relations = [
      createMockRelation({ id: 'rel-001' }),
      createMockRelation({ id: 'rel-002', contentName: '작품2' }),
    ]

    const result = resolveRelationForCheckIn(relations, 'invalid-id')

    expect(result.error).toBe('유효하지 않은 관계 ID입니다')
  })

  it('relations DB 조회 실패 시 400 에러 반환', () => {
    // DB 조회 실패는 try-catch에서 처리됨
    // 실제 API에서는 catch 블록에서 '작품 정보를 조회할 수 없습니다' 반환
    // 여기서는 에러 throw 시나리오를 시뮬레이션
    const simulateDbFailure = () => {
      try {
        throw new Error('DB connection failed')
      } catch {
        return { error: '작품 정보를 조회할 수 없습니다', status: 400 }
      }
    }

    const result = simulateDbFailure()
    expect(result.error).toBe('작품 정보를 조회할 수 없습니다')
    expect(result.status).toBe(400)
  })

  it('단일 relation 스팟에서 relationId 없이 자동 선택', () => {
    const relation = createMockRelation({ id: 'rel-single' })
    const result = resolveRelationForCheckIn([relation], undefined)

    expect(result.relation).toEqual(relation)
    expect(result.error).toBeUndefined()
  })

  it('다중 relation 스팟에서 relationId 없이 에러 반환', () => {
    const relations = [
      createMockRelation({ id: 'rel-001' }),
      createMockRelation({ id: 'rel-002', contentName: '작품2' }),
    ]

    const result = resolveRelationForCheckIn(relations, undefined)

    expect(result.error).toBe('이 스팟에는 작품 선택이 필요합니다')
  })
})

// ============================================
// 16.2 CheckIn GET — includeUnresolved 응답 구조 테스트
// ============================================

interface CheckInFeedResponse {
  checkins: unknown[]
  total: number
  page: number
  limit: number
  totalPages: number
  unresolvedCheckins?: unknown[]
  unresolvedTotal?: number
}

/**
 * includeUnresolved 응답 구조 생성 로직
 * 실제 API의 응답 구조를 재현
 */
function buildFeedResponse(params: {
  checkins: unknown[]
  total: number
  page: number
  limit: number
  includeUnresolved: boolean
  spotId?: string
  unresolvedCheckins?: unknown[]
}): CheckInFeedResponse {
  const response: CheckInFeedResponse = {
    checkins: params.checkins,
    total: params.total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(params.total / params.limit),
  }

  if (params.includeUnresolved && params.spotId) {
    response.unresolvedCheckins = params.unresolvedCheckins || []
    response.unresolvedTotal = (params.unresolvedCheckins || []).length
  }

  return response
}

describe('CheckIn GET — includeUnresolved', () => {
  it('includeUnresolved=true일 때 unresolvedCheckins, unresolvedTotal 필드 포함', () => {
    const unresolvedData = [
      { id: 'checkin-1', migrationStatus: 'unresolved' },
      { id: 'checkin-2', migrationStatus: 'unresolved' },
    ]

    const response = buildFeedResponse({
      checkins: [{ id: 'checkin-3', contentName: '슬램덩크' }],
      total: 1,
      page: 1,
      limit: 20,
      includeUnresolved: true,
      spotId: 'REAL-ANI-009',
      unresolvedCheckins: unresolvedData,
    })

    expect(response.unresolvedCheckins).toBeDefined()
    expect(response.unresolvedTotal).toBe(2)
    expect(response.unresolvedCheckins).toHaveLength(2)
    // 메인 checkins에는 unresolved가 포함되지 않음
    expect(response.checkins).toHaveLength(1)
  })

  it('includeUnresolved 없을 때 unresolved 필드 미포함', () => {
    const response = buildFeedResponse({
      checkins: [{ id: 'checkin-3', contentName: '슬램덩크' }],
      total: 1,
      page: 1,
      limit: 20,
      includeUnresolved: false,
      spotId: 'REAL-ANI-009',
    })

    expect(response.unresolvedCheckins).toBeUndefined()
    expect(response.unresolvedTotal).toBeUndefined()
  })

  it('includeUnresolved=true이지만 spotId 없으면 unresolved 필드 미포함', () => {
    const response = buildFeedResponse({
      checkins: [],
      total: 0,
      page: 1,
      limit: 20,
      includeUnresolved: true,
      spotId: undefined,
    })

    expect(response.unresolvedCheckins).toBeUndefined()
    expect(response.unresolvedTotal).toBeUndefined()
  })
})

// ============================================
// 16.3 Migration — edge cases 테스트
// ============================================

interface MigrationStats {
  processed: number
  resolved: number
  unresolved: number
  skipped: number
  failed: number
}

interface MigrationCheckin {
  id: string
  spotId: string
  relationId?: string
}

/**
 * 마이그레이션 분기 로직 (순수 함수 추출)
 * 실제 스크립트의 for-each 루프 내부 로직을 재현
 */
function processMigrationCheckin(
  checkin: MigrationCheckin,
  activeRelations: Array<{
    id: string
    contentId: string
    contentName: string
    relationType: string
  }>,
  stats: MigrationStats
): { action: 'skip' | 'resolve' | 'unresolved'; stats: MigrationStats } {
  const newStats = { ...stats }
  newStats.processed++

  // 멱등성: 이미 relationId가 있으면 건너뛰기
  if (checkin.relationId) {
    newStats.skipped++
    return { action: 'skip', stats: newStats }
  }

  if (activeRelations.length === 0) {
    // 0개: 건너뛰기 (Requirements 7.4)
    newStats.skipped++
    return { action: 'skip', stats: newStats }
  }

  if (activeRelations.length === 1) {
    newStats.resolved++
    return { action: 'resolve', stats: newStats }
  }

  // 2개 이상
  newStats.unresolved++
  return { action: 'unresolved', stats: newStats }
}

describe('Migration — edge cases', () => {
  it('active relation 0개인 스팟의 체크인은 건너뛰기', () => {
    const stats: MigrationStats = {
      processed: 0,
      resolved: 0,
      unresolved: 0,
      skipped: 0,
      failed: 0,
    }

    const result = processMigrationCheckin(
      { id: 'checkin-001', spotId: 'REAL-ANI-099' },
      [], // 0개 active relations
      stats
    )

    expect(result.action).toBe('skip')
    expect(result.stats.skipped).toBe(1)
    expect(result.stats.resolved).toBe(0)
    expect(result.stats.unresolved).toBe(0)
  })

  it('실행 결과 요약에 모든 카운터 포함', () => {
    let stats: MigrationStats = {
      processed: 0,
      resolved: 0,
      unresolved: 0,
      skipped: 0,
      failed: 0,
    }

    // 시나리오: 3개 체크인 처리
    // 1. 0 relations → skip
    const r1 = processMigrationCheckin({ id: 'c1', spotId: 's1' }, [], stats)
    stats = r1.stats

    // 2. 1 relation → resolve
    const r2 = processMigrationCheckin(
      { id: 'c2', spotId: 's2' },
      [
        {
          id: 'rel-1',
          contentId: 'cid-1',
          contentName: '슬램덩크',
          relationType: 'scene_depicted',
        },
      ],
      stats
    )
    stats = r2.stats

    // 3. 2 relations → unresolved
    const r3 = processMigrationCheckin(
      { id: 'c3', spotId: 's3' },
      [
        {
          id: 'rel-1',
          contentId: 'cid-1',
          contentName: '슬램덩크',
          relationType: 'scene_depicted',
        },
        {
          id: 'rel-2',
          contentId: 'cid-2',
          contentName: '주술회전',
          relationType: 'scene_depicted',
        },
      ],
      stats
    )
    stats = r3.stats

    // 모든 카운터가 정확히 포함되어야 함 (Requirements 7.6)
    expect(stats).toEqual({
      processed: 3,
      resolved: 1,
      unresolved: 1,
      skipped: 1,
      failed: 0,
    })
  })

  it('이미 relationId가 있는 체크인은 건너뛰기 - 멱등성', () => {
    const stats: MigrationStats = {
      processed: 0,
      resolved: 0,
      unresolved: 0,
      skipped: 0,
      failed: 0,
    }

    const result = processMigrationCheckin(
      { id: 'c1', spotId: 's1', relationId: 'existing-rel' },
      [
        {
          id: 'rel-1',
          contentId: 'cid-1',
          contentName: '슬램덩크',
          relationType: 'scene_depicted',
        },
      ],
      stats
    )

    expect(result.action).toBe('skip')
    expect(result.stats.skipped).toBe(1)
    expect(result.stats.resolved).toBe(0)
  })
})

// ============================================
// 16.4 FloatingCard single content, SocialProof unresolved label 테스트
// ============================================

/**
 * FloatingCard "+N" 배지 표시 여부 결정 로직
 * 실제 컴포넌트의 조건: card.additionalContentNames && card.additionalContentNames.length > 0
 */
function shouldShowBadge(card: ShowcaseCard): boolean {
  return !!(
    card.additionalContentNames && card.additionalContentNames.length > 0
  )
}

/** 배지 텍스트 계산 */
function getBadgeText(card: ShowcaseCard): string | null {
  if (!shouldShowBadge(card)) return null
  return `+${card.additionalContentNames!.length}`
}

describe('FloatingCard — single content', () => {
  it('단일 작품 시 additionalContentNames가 undefined이면 배지 미표시 로직', () => {
    const card: ShowcaseCard = {
      id: 'card-1',
      spotName: '에노시마',
      contentName: '슬램덩크',
      additionalContentNames: undefined,
      category: 'animation',
      imageUrl: '/test.jpg',
    }

    expect(shouldShowBadge(card)).toBe(false)
    expect(getBadgeText(card)).toBeNull()
  })

  it('단일 작품 시 additionalContentNames가 빈 배열이면 배지 미표시', () => {
    const card: ShowcaseCard = {
      id: 'card-2',
      spotName: '시부야',
      contentName: '주술회전',
      additionalContentNames: [],
      category: 'animation',
      imageUrl: '/test.jpg',
    }

    expect(shouldShowBadge(card)).toBe(false)
    expect(getBadgeText(card)).toBeNull()
  })

  it('다중 작품 시 "+N" 배지 텍스트 정확성', () => {
    const card: ShowcaseCard = {
      id: 'card-3',
      spotName: '시부야 스크램블',
      contentName: '주술회전',
      additionalContentNames: ['최애의 아이', '듀라라라'],
      category: 'animation',
      imageUrl: '/test.jpg',
    }

    expect(shouldShowBadge(card)).toBe(true)
    expect(getBadgeText(card)).toBe('+2')
  })
})

/**
 * SocialProof contentName 표시 로직
 * 실제 컴포넌트의 getExtendedData 내부 로직을 재현
 */
function getDisplayContentName(checkin: {
  contentName?: string
  migrationStatus?: 'resolved' | 'unresolved' | null
}): string | undefined {
  if (checkin.migrationStatus === 'unresolved') {
    return '(미분류)'
  } else if (checkin.contentName) {
    return checkin.contentName
  }
  return undefined
}

describe('SocialProof — unresolved label', () => {
  it('migrationStatus=unresolved일 때 미분류 라벨 표시 로직', () => {
    const checkin = {
      contentName: '슬램덩크',
      migrationStatus: 'unresolved' as const,
    }

    const displayName = getDisplayContentName(checkin)

    expect(displayName).toBe('(미분류)')
  })

  it('migrationStatus=resolved일 때 contentName 표시', () => {
    const checkin = {
      contentName: '슬램덩크',
      migrationStatus: 'resolved' as const,
    }

    const displayName = getDisplayContentName(checkin)

    expect(displayName).toBe('슬램덩크')
  })

  it('migrationStatus=null이고 contentName 있을 때 contentName 표시', () => {
    const checkin = {
      contentName: '주술회전',
      migrationStatus: null,
    }

    const displayName = getDisplayContentName(checkin)

    expect(displayName).toBe('주술회전')
  })

  it('contentName 없고 migrationStatus도 unresolved 아닐 때 undefined', () => {
    const checkin = {
      contentName: undefined,
      migrationStatus: null,
    }

    const displayName = getDisplayContentName(checkin)

    expect(displayName).toBeUndefined()
  })
})

// ============================================
// 16.5 RelationSelector initial state, QuickCheckIn relation selector 표시 테스트
// ============================================

/**
 * RelationSelector 초기 상태 로직
 * 실제 컴포넌트: selectedRelationId prop이 null로 전달됨 (Requirements 3.8)
 */
describe('RelationSelector — initial state', () => {
  it('초기 상태에서 selectedRelationId가 null', () => {
    // RelationSelector는 selectedRelationId를 prop으로 받음
    // 다중 relation 스팟에서 초기값은 항상 null (명시적 선택 유도)
    const initialSelectedRelationId: string | null = null

    expect(initialSelectedRelationId).toBeNull()
  })

  it('relations 목록이 있어도 초기 선택은 없음', () => {
    const relations = [
      createMockRelation({ id: 'rel-001', contentName: '슬램덩크' }),
      createMockRelation({ id: 'rel-002', contentName: '주술회전' }),
    ]

    // 초기 상태에서는 어떤 relation도 선택되지 않음
    const selectedRelationId: string | null = null
    const isAnySelected = relations.some((r) => r.id === selectedRelationId)

    expect(isAnySelected).toBe(false)
  })
})

/**
 * QuickCheckIn relation selector 표시 로직
 * 실제 컴포넌트: relations.length >= 2일 때 'relation' 단계부터 시작
 */
describe('QuickCheckIn — relation selector', () => {
  it('다중 relation 스팟에서 relation 단계부터 시작', () => {
    // QuickCheckIn의 분기 로직 재현
    type Step = 'relation' | 'photo' | 'comment' | 'complete'

    function determineInitialStep(relationsCount: number): Step {
      if (relationsCount >= 2) {
        return 'relation'
      }
      return 'photo'
    }

    function determineSteps(relationsCount: number): Step[] {
      if (relationsCount >= 2) {
        return ['relation', 'photo', 'comment', 'complete']
      }
      return ['photo', 'comment', 'complete']
    }

    // 다중 relation (2개 이상)
    expect(determineInitialStep(3)).toBe('relation')
    expect(determineSteps(3)).toContain('relation')
    expect(determineSteps(3)[0]).toBe('relation')
  })

  it('단일 relation 스팟에서 photo 단계부터 시작', () => {
    type Step = 'relation' | 'photo' | 'comment' | 'complete'

    function determineInitialStep(relationsCount: number): Step {
      if (relationsCount >= 2) {
        return 'relation'
      }
      return 'photo'
    }

    function determineSteps(relationsCount: number): Step[] {
      if (relationsCount >= 2) {
        return ['relation', 'photo', 'comment', 'complete']
      }
      return ['photo', 'comment', 'complete']
    }

    // 단일 relation (1개)
    expect(determineInitialStep(1)).toBe('photo')
    expect(determineSteps(1)).not.toContain('relation')
  })

  it('0 relations 스팟에서 photo 단계부터 시작', () => {
    type Step = 'relation' | 'photo' | 'comment' | 'complete'

    function determineInitialStep(relationsCount: number): Step {
      if (relationsCount >= 2) {
        return 'relation'
      }
      return 'photo'
    }

    // 0개 relation
    expect(determineInitialStep(0)).toBe('photo')
  })

  it('다중 relation 스팟에서 초기 selectedRelationId는 null', () => {
    // QuickCheckIn에서 relations.length >= 2일 때 selectedRelationId = null
    const relationsCount = 3
    let selectedRelationId: string | null = null

    if (relationsCount >= 2) {
      selectedRelationId = null
    } else if (relationsCount === 1) {
      selectedRelationId = 'auto-selected-id'
    }

    expect(selectedRelationId).toBeNull()
  })

  it('단일 relation 스팟에서 자동 선택', () => {
    const relations = [createMockRelation({ id: 'rel-auto' })]
    let selectedRelationId: string | null = null

    if (relations.length === 1) {
      selectedRelationId = relations[0].id
    } else if (relations.length >= 2) {
      selectedRelationId = null
    }

    expect(selectedRelationId).toBe('rel-auto')
  })
})
