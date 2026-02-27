/**
 * 성지순례 코스 시스템 인덱스 생성 스크립트
 * Spec: 10-pilgrimage-route
 *
 * 실행: npx tsx scripts/setup-route-indexes.ts
 */

import { connectToDatabase, COLLECTIONS } from '../src/lib/db'

async function setupRouteIndexes() {
  const { db } = await connectToDatabase()

  console.log('🔧 코스 시스템 인덱스 생성 시작...')

  // routes 컬렉션 인덱스
  const routes = db.collection(COLLECTIONS.ROUTES)
  await routes.createIndex({ isPublic: 1, createdAt: -1 })
  await routes.createIndex({ isPublic: 1, bookmarkCount: -1 })
  await routes.createIndex({ isPublic: 1, estimatedDuration: 1 })
  await routes.createIndex({ relatedContentNames: 1 })
  await routes.createIndex({ regionTag: 1 })
  await routes.createIndex({ authorId: 1 })
  await routes.createIndex({ isOfficial: 1 })
  console.log('✅ routes 인덱스 생성 완료')

  // route_bookmarks 컬렉션 인덱스
  const bookmarks = db.collection(COLLECTIONS.ROUTE_BOOKMARKS)
  await bookmarks.createIndex({ userId: 1, routeId: 1 }, { unique: true })
  await bookmarks.createIndex({ routeId: 1 })
  console.log('✅ route_bookmarks 인덱스 생성 완료')

  // route_completions 컬렉션 인덱스
  const completions = db.collection(COLLECTIONS.ROUTE_COMPLETIONS)
  await completions.createIndex({ userId: 1, routeId: 1 })
  await completions.createIndex({ routeId: 1 })
  console.log('✅ route_completions 인덱스 생성 완료')

  console.log('🎉 모든 코스 시스템 인덱스 생성 완료!')
  process.exit(0)
}

setupRouteIndexes().catch((error) => {
  console.error('❌ 인덱스 생성 실패:', error)
  process.exit(1)
})
