/**
 * 사용자 role 필드 마이그레이션 스크립트
 * - 기존 사용자에게 기본 role 'user' 추가
 * - 특정 이메일을 관리자로 설정
 *
 * 실행: npx tsx scripts/migrate-user-roles.ts
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

if (!MONGODB_URI) {
  console.error('MONGODB_URI 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

// 관리자로 설정할 이메일 목록
const ADMIN_EMAILS = ['admin@test.com']

async function migrateUserRoles() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('MongoDB 연결 성공')

    // URI에서 DB 이름 추출 또는 기본값 사용
    const dbName =
      MONGODB_URI.split('/').pop()?.split('?')[0] || 'anime-pilgrimage'
    console.log(`데이터베이스: ${dbName}`)

    const db = client.db(dbName)
    const usersCollection = db.collection('users')

    // 현재 사용자 수 확인
    const userCount = await usersCollection.countDocuments()
    console.log(`현재 사용자 수: ${userCount}명`)

    // 1. role 필드가 없는 모든 사용자에게 기본 role 'user' 추가
    const updateResult = await usersCollection.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    )
    console.log(`기본 role 추가: ${updateResult.modifiedCount}명`)

    // 2. 관리자 이메일 목록에 있는 사용자를 admin으로 설정
    for (const email of ADMIN_EMAILS) {
      const adminResult = await usersCollection.updateOne(
        { email },
        { $set: { role: 'admin' } }
      )
      if (adminResult.modifiedCount > 0) {
        console.log(`관리자 설정 완료: ${email}`)
      } else {
        console.log(`관리자 설정 실패 (사용자 없음): ${email}`)
      }
    }

    // 3. 결과 확인
    const users = await usersCollection.find({}).toArray()
    console.log('\n=== 사용자 목록 ===')
    users.forEach((user) => {
      console.log(`- ${user.email}: ${user.role}`)
    })

    console.log('\n마이그레이션 완료!')
  } catch (error) {
    console.error('마이그레이션 실패:', error)
  } finally {
    await client.close()
  }
}

migrateUserRoles()
