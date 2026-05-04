/**
 * spot_content_relations 컬렉션 인덱스 초기화 스크립트
 * Spec: 30-spot-content-relation
 *
 * 실행: npx tsx scripts/init-relation-indexes.ts
 */

import { connectToDatabase, COLLECTIONS } from '../src/lib/db'

async function initRelationIndexes() {
  const { db } = await connectToDatabase()
  const collection = db.collection(COLLECTIONS.SPOT_CONTENT_RELATIONS)

  console.log('🔧 spot_content_relations 인덱스 생성 시작...')

  // 1. spotId 단일 인덱스 — 스팟별 관계 조회
  const spotIdResult = await collection.createIndex({ spotId: 1 })
  console.log(`✅ spotId 인덱스 생성 완료: ${spotIdResult}`)

  // 2. contentName 단일 인덱스 — 작품별 스팟 조회
  const contentNameResult = await collection.createIndex({ contentName: 1 })
  console.log(`✅ contentName 인덱스 생성 완료: ${contentNameResult}`)

  // 3. { spotId, contentName } 복합 유니크 인덱스 — 중복 방지
  const compoundResult = await collection.createIndex(
    { spotId: 1, contentName: 1 },
    { unique: true }
  )
  console.log(
    `✅ { spotId, contentName } 복합 유니크 인덱스 생성 완료: ${compoundResult}`
  )

  // 4. status 단일 인덱스 — 상태별 필터링
  const statusResult = await collection.createIndex({ status: 1 })
  console.log(`✅ status 인덱스 생성 완료: ${statusResult}`)

  console.log('🎉 모든 spot_content_relations 인덱스 생성 완료!')
  process.exit(0)
}

initRelationIndexes().catch((error) => {
  console.error('❌ 인덱스 생성 실패:', error)
  process.exit(1)
})
