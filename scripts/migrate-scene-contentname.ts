/**
 * Scene contentName 마이그레이션 스크립트
 * Spec: multi-content-spot-structure (H1 수정사항)
 *
 * Scene 문서에 contentName 필드가 없는 경우 animeTitle 값을 복사한다.
 * 멱등성 보장: 이미 contentName이 있는 문서는 건너뛴다.
 *
 * 실행: npx tsx scripts/migrate-scene-contentname.ts
 */

import { connectToDatabase, COLLECTIONS } from '../src/lib/db'

interface SceneDocument {
  id: string
  spotId: string
  animeTitle: string
  contentName?: string
  [key: string]: unknown
}

async function migrateSceneContentName() {
  console.log('🚀 Scene contentName 마이그레이션 시작...\n')

  const { db } = await connectToDatabase()
  const scenesCollection = db.collection<SceneDocument>(COLLECTIONS.SCENES)

  // 통계 카운터
  const stats = {
    processed: 0,
    updated: 0,
    skippedNoTitle: 0,
    failed: 0,
  }

  // contentName이 없는 Scene 문서만 조회 (멱등성 보장)
  const cursor = scenesCollection.find({
    contentName: { $exists: false },
  })

  const totalCount = await scenesCollection.countDocuments({
    contentName: { $exists: false },
  })
  console.log(`📊 마이그레이션 대상 Scene: ${totalCount}건\n`)

  for await (const scene of cursor) {
    stats.processed++

    try {
      if (scene.animeTitle) {
        // animeTitle → contentName 복사
        await scenesCollection.updateOne(
          { id: scene.id },
          { $set: { contentName: scene.animeTitle } }
        )
        stats.updated++
      } else {
        // animeTitle이 없는 경우 건너뛰기
        console.log(
          `⏭️  animeTitle 없음: sceneId=${scene.id}, spotId=${scene.spotId}`
        )
        stats.skippedNoTitle++
      }
    } catch (error) {
      stats.failed++
      console.error(
        `❌ 처리 실패: sceneId=${scene.id}`,
        error instanceof Error ? error.message : error
      )
    }
  }

  // 결과 요약 출력
  console.log('\n' + '='.repeat(40))
  console.log('=== Scene contentName 마이그레이션 결과 ===')
  console.log('='.repeat(40))
  console.log(`처리: ${stats.processed}건`)
  console.log(`업데이트: ${stats.updated}건`)
  console.log(`건너뛰기 (animeTitle 없음): ${stats.skippedNoTitle}건`)
  console.log(`실패: ${stats.failed}건`)
  console.log('='.repeat(40))
  console.log('\n🎉 Scene contentName 마이그레이션 완료!')

  process.exit(0)
}

migrateSceneContentName().catch((error) => {
  console.error('❌ 마이그레이션 실패:', error)
  process.exit(1)
})
