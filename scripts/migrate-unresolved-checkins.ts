/**
 * unresolved 체크인 → displayPriority 0 relation으로 자동 귀속
 *
 * 다중 relation 스팟의 체크인을 displayPriority가 가장 낮은(=0) relation으로 귀속한다.
 * 멱등성 보장: migrationStatus === 'unresolved'인 체크인만 처리.
 *
 * 실행: node scripts/run-migration.mjs scripts/migrate-unresolved-checkins.ts
 */
import { connectToDatabase, COLLECTIONS } from '../src/lib/db'

interface CheckInDocument {
  id: string
  spotId: string
  migrationStatus?: string | null
  [key: string]: unknown
}

interface RelationDocument {
  id: string
  spotId: string
  contentId: string
  contentName: string
  relationType: string
  displayPriority?: number
  status: string
  [key: string]: unknown
}

async function migrateUnresolvedCheckins() {
  console.log('🚀 unresolved 체크인 귀속 마이그레이션 시작...\n')

  const { db } = await connectToDatabase()
  const checkinsCollection = db.collection<CheckInDocument>(
    COLLECTIONS.CHECKINS
  )
  const relationsCollection = db.collection<RelationDocument>(
    COLLECTIONS.SPOT_CONTENT_RELATIONS
  )

  const stats = { processed: 0, resolved: 0, skipped: 0, failed: 0 }

  // unresolved 체크인만 조회
  const unresolved = await checkinsCollection
    .find({ migrationStatus: 'unresolved' })
    .toArray()

  console.log(`📊 처리 대상: ${unresolved.length}건\n`)

  // spotId별로 relation 캐싱 (중복 DB 조회 방지)
  const relationCache = new Map<string, RelationDocument | null>()

  for (const checkin of unresolved) {
    stats.processed++

    try {
      // 캐시에 없으면 조회
      if (!relationCache.has(checkin.spotId)) {
        const rels = await relationsCollection
          .find({ spotId: checkin.spotId, status: 'active' })
          .sort({ displayPriority: 1 })
          .toArray()

        // priority 0 (첫 번째) relation 선택
        relationCache.set(checkin.spotId, rels[0] ?? null)
      }

      const primaryRelation = relationCache.get(checkin.spotId)

      if (!primaryRelation) {
        console.log(
          `⏭️  relation 없음: checkinId=${checkin.id}, spotId=${checkin.spotId}`
        )
        stats.skipped++
        continue
      }

      await checkinsCollection.updateOne(
        { id: checkin.id },
        {
          $set: {
            relationId: primaryRelation.id,
            contentId: primaryRelation.contentId,
            contentName: primaryRelation.contentName,
            relationType: primaryRelation.relationType,
            migrationStatus: 'resolved',
          },
        }
      )

      console.log(
        `✅ ${checkin.id} → "${primaryRelation.contentName}" (spotId: ${checkin.spotId})`
      )
      stats.resolved++
    } catch (error) {
      stats.failed++
      console.error(
        `❌ 처리 실패: checkinId=${checkin.id}`,
        error instanceof Error ? error.message : error
      )
    }
  }

  console.log('\n' + '='.repeat(40))
  console.log('=== 마이그레이션 결과 ===')
  console.log('='.repeat(40))
  console.log(`처리: ${stats.processed}건`)
  console.log(`Resolved: ${stats.resolved}건`)
  console.log(`건너뛰기: ${stats.skipped}건`)
  console.log(`실패: ${stats.failed}건`)
  console.log('='.repeat(40))
  console.log('\n🎉 완료!')

  process.exit(0)
}

migrateUnresolvedCheckins().catch((error) => {
  console.error('❌ 마이그레이션 실패:', error)
  process.exit(1)
})
