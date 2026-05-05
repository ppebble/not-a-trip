/**
 * 체크인 relation 마이그레이션 스크립트
 * Spec: multi-content-spot-structure
 *
 * 기존 체크인 데이터에 relationId/contentId/contentName/relationType을 추가한다.
 * - 단일 relation 스팟: 자동 귀속 (resolved)
 * - 다중 relation 스팟: 미분류 (unresolved)
 * - 멱등성 보장: 이미 relationId가 있는 체크인은 건너뛴다.
 *
 * 실행: npx tsx scripts/migrate-checkin-relations.ts
 */

import { connectToDatabase, COLLECTIONS } from '../src/lib/db'

interface CheckInDocument {
  id: string
  spotId: string
  relationId?: string
  contentId?: string
  contentName?: string
  relationType?: string
  migrationStatus?: string | null
  [key: string]: unknown
}

interface RelationDocument {
  id: string
  spotId: string
  contentId: string
  contentName: string
  relationType: string
  status: string
  [key: string]: unknown
}

async function migrateCheckinRelations() {
  console.log('🚀 체크인 relation 마이그레이션 시작...\n')

  const { db } = await connectToDatabase()
  const checkinsCollection = db.collection<CheckInDocument>(
    COLLECTIONS.CHECKINS
  )
  const relationsCollection = db.collection<RelationDocument>(
    COLLECTIONS.SPOT_CONTENT_RELATIONS
  )

  // 스크립트 시작 시 인덱스 생성 (L2 수정사항, Requirements 2.9~2.11)
  console.log('📑 인덱스 생성 중...')

  await checkinsCollection.createIndex(
    { contentName: 1, createdAt: -1 },
    { name: 'idx_contentName_createdAt' }
  )
  console.log('  ✅ idx_contentName_createdAt 생성 완료')

  await checkinsCollection.createIndex(
    { relationId: 1 },
    { name: 'idx_relationId' }
  )
  console.log('  ✅ idx_relationId 생성 완료')

  await checkinsCollection.createIndex(
    { spotId: 1, userId: 1, contentName: 1 },
    { name: 'idx_spotId_userId_contentName' }
  )
  console.log('  ✅ idx_spotId_userId_contentName 생성 완료')
  console.log('')

  // 통계 카운터
  const stats = {
    processed: 0,
    resolved: 0,
    unresolved: 0,
    skipped: 0,
    failed: 0,
  }

  // 멱등성 보장: relationId가 없는 체크인만 조회 (Requirements 7.5)
  const cursor = checkinsCollection.find({
    relationId: { $exists: false },
  })

  const totalCount = await checkinsCollection.countDocuments({
    relationId: { $exists: false },
  })
  console.log(`📊 마이그레이션 대상 체크인: ${totalCount}건\n`)

  for await (const checkin of cursor) {
    stats.processed++

    try {
      // 해당 스팟의 active relations 조회 (Requirements 7.1)
      const activeRelations = await relationsCollection
        .find({ spotId: checkin.spotId, status: 'active' })
        .toArray()

      if (activeRelations.length === 0) {
        // 0개: 건너뛰기 + 로그 (Requirements 7.4)
        console.log(
          `⏭️  스팟에 active relation 없음: spotId=${checkin.spotId}, checkinId=${checkin.id}`
        )
        stats.skipped++
        continue
      }

      if (activeRelations.length === 1) {
        // 1개: relation 정보 추가 + resolved (Requirements 7.2)
        const relation = activeRelations[0]
        await checkinsCollection.updateOne(
          { id: checkin.id },
          {
            $set: {
              relationId: relation.id,
              contentId: relation.contentId,
              contentName: relation.contentName,
              relationType: relation.relationType,
              migrationStatus: 'resolved',
            },
          }
        )
        stats.resolved++
      } else {
        // 2개+: migrationStatus = unresolved (Requirements 7.3)
        await checkinsCollection.updateOne(
          { id: checkin.id },
          {
            $set: {
              migrationStatus: 'unresolved',
            },
          }
        )
        console.log(
          `⚠️  운영자/사용자 보정 대상: checkinId=${checkin.id}, spotId=${checkin.spotId}, relations=${activeRelations.length}개`
        )
        stats.unresolved++
      }
    } catch (error) {
      stats.failed++
      console.error(
        `❌ 처리 실패: checkinId=${checkin.id}`,
        error instanceof Error ? error.message : error
      )
    }
  }

  // 실행 결과 요약 출력 (Requirements 7.6)
  console.log('\n' + '='.repeat(40))
  console.log('=== 마이그레이션 결과 ===')
  console.log('='.repeat(40))
  console.log(`처리: ${stats.processed}건`)
  console.log(`Resolved: ${stats.resolved}건`)
  console.log(`Unresolved: ${stats.unresolved}건`)
  console.log(`건너뛰기: ${stats.skipped}건`)
  console.log(`실패: ${stats.failed}건`)
  console.log('='.repeat(40))
  console.log('\n🎉 마이그레이션 완료!')

  process.exit(0)
}

migrateCheckinRelations().catch((error) => {
  console.error('❌ 마이그레이션 실패:', error)
  process.exit(1)
})
