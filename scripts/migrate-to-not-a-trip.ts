/**
 * DB 통합 및 리브랜딩 마이그레이션 스크립트
 *
 * anime-pilgrimage + anime-pilgrimage-map → not-a-trip
 *
 * 실행: npx tsx scripts/migrate-to-not-a-trip.ts
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// .env.local 파일에서 환경변수 로드
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  } catch {
    console.error('.env.local 파일을 찾을 수 없습니다.')
  }
}

loadEnv()

const MONGODB_URI = process.env.MONGODB_URI!
const BASE_URI = MONGODB_URI.replace(/\/[^/]+$/, '') // DB 이름 제거

// 관리자로 설정할 이메일 목록
const ADMIN_EMAILS = ['admin@test.com']

async function migrateToNotATrip() {
  const client = new MongoClient(BASE_URI)

  try {
    await client.connect()
    console.log('MongoDB 연결 성공\n')

    const sourceDb1 = client.db('anime-pilgrimage')
    const sourceDb2 = client.db('anime-pilgrimage-map')
    const targetDb = client.db('not-a-trip')

    // 1. anime-pilgrimage-map의 모든 컬렉션 복사 (주 데이터)
    console.log('=== anime-pilgrimage-map → not-a-trip 복사 ===')
    const collections2 = [
      'comments',
      'facilities',
      'posts',
      'scenes',
      'spots',
      'user_likes',
      'users',
    ]

    for (const collName of collections2) {
      const sourceCol = sourceDb2.collection(collName)
      const targetCol = targetDb.collection(collName)

      const docs = await sourceCol.find({}).toArray()
      if (docs.length > 0) {
        // 기존 데이터 삭제 후 삽입
        await targetCol.deleteMany({})
        await targetCol.insertMany(docs)
        console.log(`✓ ${collName}: ${docs.length}개 문서 복사`)
      } else {
        console.log(`- ${collName}: 데이터 없음`)
      }
    }

    // 2. anime-pilgrimage의 고유 데이터 병합 (중복 제외)
    console.log('\n=== anime-pilgrimage 고유 데이터 병합 ===')

    // comments 병합
    const comments1 = await sourceDb1.collection('comments').find({}).toArray()
    if (comments1.length > 0) {
      const existingCommentIds = new Set(
        (
          await targetDb
            .collection('comments')
            .find({}, { projection: { _id: 1 } })
            .toArray()
        ).map((d) => d._id.toString())
      )
      const newComments = comments1.filter(
        (c) => !existingCommentIds.has(c._id.toString())
      )
      if (newComments.length > 0) {
        await targetDb.collection('comments').insertMany(newComments)
        console.log(`✓ comments: ${newComments.length}개 추가 병합`)
      } else {
        console.log(`- comments: 추가할 데이터 없음`)
      }
    }

    // posts 병합
    const posts1 = await sourceDb1.collection('posts').find({}).toArray()
    if (posts1.length > 0) {
      const existingPostIds = new Set(
        (
          await targetDb
            .collection('posts')
            .find({}, { projection: { _id: 1 } })
            .toArray()
        ).map((d) => d._id.toString())
      )
      const newPosts = posts1.filter(
        (p) => !existingPostIds.has(p._id.toString())
      )
      if (newPosts.length > 0) {
        await targetDb.collection('posts').insertMany(newPosts)
        console.log(`✓ posts: ${newPosts.length}개 추가 병합`)
      } else {
        console.log(`- posts: 추가할 데이터 없음`)
      }
    }

    // 3. 사용자 role 필드 마이그레이션
    console.log('\n=== 사용자 role 필드 마이그레이션 ===')
    const usersCol = targetDb.collection('users')

    // 기본 role 추가
    const updateResult = await usersCol.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    )
    console.log(`✓ 기본 role 추가: ${updateResult.modifiedCount}명`)

    // 관리자 설정
    for (const email of ADMIN_EMAILS) {
      const adminResult = await usersCol.updateOne(
        { email },
        { $set: { role: 'admin' } }
      )
      if (adminResult.modifiedCount > 0) {
        console.log(`✓ 관리자 설정: ${email}`)
      } else {
        console.log(`- 관리자 설정 실패 (사용자 없음): ${email}`)
      }
    }

    // 4. 결과 요약
    console.log('\n=== 마이그레이션 결과 ===')
    const targetCollections = await targetDb.listCollections().toArray()
    for (const col of targetCollections) {
      const count = await targetDb.collection(col.name).countDocuments()
      console.log(`${col.name}: ${count}개`)
    }

    // 사용자 목록
    console.log('\n=== 사용자 목록 ===')
    const users = await usersCol.find({}).toArray()
    users.forEach((user) => {
      console.log(
        `- ${user.email}: ${user.role} (${user.name || user.nickname || 'N/A'})`
      )
    })

    console.log('\n✅ 마이그레이션 완료!')
    console.log('\n⚠️  .env.local 파일의 MONGODB_URI를 업데이트하세요:')
    console.log('   MONGODB_URI=mongodb://localhost:27017/not-a-trip')
  } catch (error) {
    console.error('마이그레이션 실패:', error)
  } finally {
    await client.close()
  }
}

migrateToNotATrip()
