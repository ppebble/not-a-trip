/**
 * DB 스키마 확인 스크립트
 *
 * 실행: npx tsx scripts/check-db-schema.ts
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

async function checkDbSchema() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('MongoDB 연결 성공')
    console.log(`DB: ${MONGODB_URI}\n`)

    const db = client.db()

    // 1. users 컬렉션 확인
    console.log('=== USERS ===')
    const users = await db.collection('users').find({}).toArray()
    users.forEach((user, i) => {
      console.log(`\n[User ${i + 1}]`)
      console.log(`  _id: ${user._id}`)
      console.log(`  email: ${user.email}`)
      console.log(`  name: ${user.name}`)
      console.log(`  role: ${user.role}`)
      console.log(`  provider: ${user.provider}`)
    })

    // 2. posts 컬렉션 확인
    console.log('\n\n=== POSTS (샘플 3개) ===')
    const posts = await db.collection('posts').find({}).limit(10).toArray()
    posts.forEach((post, i) => {
      console.log(`\n[Post ${i + 1}]`)
      console.log(`  _id: ${post._id}`)
      console.log(`  id: ${post.id}`)
      console.log(`  title: ${post.title}`)
      console.log(`  author: ${post.author}`)
      console.log(`  isGuest: ${post.isGuest}`)
      console.log(`  createdAt: ${post.createdAt}`)
      console.log(`  viewCount: ${post.viewCount}`)
      console.log(`  commentCount: ${post.commentCount}`)
    })

    // 3. 필드 분석
    console.log('\n\n=== POSTS 필드 분석 ===')
    const allPosts = await db.collection('posts').find({}).toArray()
    const fieldCounts: Record<string, number> = {}

    allPosts.forEach((post) => {
      Object.keys(post).forEach((key) => {
        fieldCounts[key] = (fieldCounts[key] || 0) + 1
      })
    })

    console.log(`총 게시글: ${allPosts.length}개`)
    Object.entries(fieldCounts).forEach(([field, count]) => {
      console.log(
        `  ${field}: ${count}개 (${Math.round((count / allPosts.length) * 100)}%)`
      )
    })

    // 4. isGuest 필드 분석
    console.log('\n=== isGuest 필드 분석 ===')
    const withIsGuest = allPosts.filter((p) => p.isGuest !== undefined).length
    const withoutIsGuest = allPosts.filter(
      (p) => p.isGuest === undefined
    ).length
    console.log(`isGuest 있음: ${withIsGuest}개`)
    console.log(`isGuest 없음: ${withoutIsGuest}개`)

    // isGuest 없는 게시글 샘플
    const postsWithoutIsGuest = allPosts.filter((p) => p.isGuest === undefined)
    if (postsWithoutIsGuest.length > 0) {
      console.log('\n[isGuest 없는 게시글 샘플]')
      postsWithoutIsGuest.slice(0, 3).forEach((post, i) => {
        console.log(`  ${i + 1}. ${post.title} (id: ${post.id || post._id})`)
      })
    }
  } catch (error) {
    console.error('오류:', error)
  } finally {
    await client.close()
  }
}

checkDbSchema()
