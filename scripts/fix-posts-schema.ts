/**
 * 게시글 스키마 수정 스크립트
 * - isGuest 필드가 없는 게시글에 기본값 추가
 *
 * 실행: npx tsx scripts/fix-posts-schema.ts
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve } from 'path'

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

async function fixPostsSchema() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('MongoDB 연결 성공\n')

    const db = client.db()
    const postsCol = db.collection('posts')
    const commentsCol = db.collection('comments')

    // 1. isGuest 필드가 없는 게시글에 기본값 추가
    console.log('=== 게시글 isGuest 필드 수정 ===')
    const postsResult = await postsCol.updateMany(
      { isGuest: { $exists: false } },
      { $set: { isGuest: true } } // 기존 데이터는 비회원으로 간주
    )
    console.log(`✓ 게시글 isGuest 추가: ${postsResult.modifiedCount}개`)

    // 2. isGuest 필드가 없는 댓글에 기본값 추가
    console.log('\n=== 댓글 isGuest 필드 수정 ===')
    const commentsResult = await commentsCol.updateMany(
      { isGuest: { $exists: false } },
      { $set: { isGuest: true } } // 기존 데이터는 비회원으로 간주
    )
    console.log(`✓ 댓글 isGuest 추가: ${commentsResult.modifiedCount}개`)

    // 3. 결과 확인
    console.log('\n=== 수정 결과 ===')
    const totalPosts = await postsCol.countDocuments()
    const postsWithIsGuest = await postsCol.countDocuments({
      isGuest: { $exists: true },
    })
    console.log(
      `게시글: ${postsWithIsGuest}/${totalPosts}개에 isGuest 필드 있음`
    )

    const totalComments = await commentsCol.countDocuments()
    const commentsWithIsGuest = await commentsCol.countDocuments({
      isGuest: { $exists: true },
    })
    console.log(
      `댓글: ${commentsWithIsGuest}/${totalComments}개에 isGuest 필드 있음`
    )

    console.log('\n✅ 스키마 수정 완료!')
  } catch (error) {
    console.error('오류:', error)
  } finally {
    await client.close()
  }
}

fixPostsSchema()
