/**
 * relatedContent[] → spot_content_relations 마이그레이션 스크립트
 * Spec: 30-spot-content-relation
 *
 * 기존 spots 컬렉션의 relatedContent 배열을 독립 spot_content_relations 컬렉션으로 이관한다.
 * 멱등성 보장: 중복 (spotId, contentName) 조합은 건너뛰므로 안전하게 재실행 가능.
 *
 * 실행: npx tsx scripts/migrate-relations.ts
 */

import { connectToDatabase, COLLECTIONS } from '../src/lib/db'
import { convertRelatedContentToRelation } from '../src/lib/relation-utils'
import type { RelatedContent } from '../src/types/spot'

interface SpotDocument {
  id: string
  relatedContent?: RelatedContent[]
  [key: string]: unknown
}

async function migrateRelations() {
  console.log(
    '🚀 relatedContent → spot_content_relations 마이그레이션 시작...\n'
  )

  const { db } = await connectToDatabase()
  const spotsCollection = db.collection<SpotDocument>(COLLECTIONS.SPOTS)
  const relationsCollection = db.collection(COLLECTIONS.SPOT_CONTENT_RELATIONS)

  // 통계 카운터
  let processedSpots = 0
  let createdRelations = 0
  let skippedDuplicates = 0
  let failedItems = 0

  // 모든 스팟 조회
  const spots = await spotsCollection.find({}).toArray()
  console.log(`📊 총 ${spots.length}개 스팟 발견\n`)

  for (const spot of spots) {
    // relatedContent가 없거나 빈 배열이면 건너뛰기
    if (!spot.relatedContent || spot.relatedContent.length === 0) {
      continue
    }

    processedSpots++

    for (let index = 0; index < spot.relatedContent.length; index++) {
      const content = spot.relatedContent[index]

      try {
        // 중복 체크: (spotId, contentName) 조합이 이미 존재하는지 확인
        const existing = await relationsCollection.findOne({
          spotId: spot.id,
          contentName: content.name,
        })

        if (existing) {
          skippedDuplicates++
          console.log(
            `⏭️  중복 건너뛰기: spotId=${spot.id}, contentName="${content.name}"`
          )
          continue
        }

        // RelatedContent → SpotContentRelation 변환
        const relation = convertRelatedContentToRelation(
          spot.id,
          content,
          index
        )

        // spot_content_relations 컬렉션에 삽입
        await relationsCollection.insertOne(relation as unknown as Document)
        createdRelations++
      } catch (error) {
        // 개별 항목 실패 시 건너뛰고 계속 처리
        failedItems++
        console.error(
          `❌ 변환 실패: spotId=${spot.id}, contentName="${content.name}"`,
          error instanceof Error ? error.message : error
        )
      }
    }
  }

  // 결과 요약 출력
  console.log('\n' + '='.repeat(50))
  console.log('📋 마이그레이션 결과 요약')
  console.log('='.repeat(50))
  console.log(`✅ 처리된 스팟 수: ${processedSpots}`)
  console.log(`✅ 생성된 관계 수: ${createdRelations}`)
  console.log(`⏭️  건너뛴 중복 수: ${skippedDuplicates}`)
  if (failedItems > 0) {
    console.log(`❌ 실패한 항목 수: ${failedItems}`)
  }
  console.log('='.repeat(50))
  console.log('\n🎉 마이그레이션 완료!')

  process.exit(0)
}

migrateRelations().catch((error) => {
  console.error('❌ 마이그레이션 실패:', error)
  process.exit(1)
})
