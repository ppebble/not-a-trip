/**
 * 스팟 데이터 마이그레이션 스크립트
 *
 * 기존 스팟 데이터를 새로운 데이터 모델로 마이그레이션합니다:
 * - relatedMedia → relatedContent 필드 변환
 * - category: 'animation' 기본값 설정
 * - authorName: 'System' 설정 (시스템 등록 스팟)
 * - 난수 ID → SPOT-{숫자} 형식으로 변환
 *
 * 실행 방법:
 * npx tsx scripts/migrate-spots.ts
 *
 * 드라이런 모드 (실제 변경 없이 확인만):
 * npx tsx scripts/migrate-spots.ts --dry-run
 *
 * Requirements: 3.4
 */

import { MongoClient, Document } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'anime-pilgrimage-map'

// 기존 MediaInfo 타입 (마이그레이션 전)
interface OldMediaInfo {
  title: string
  type: 'anime' | 'drama' | 'movie' | 'other'
  year?: number
}

// 새로운 RelatedContent 타입 (마이그레이션 후)
interface NewRelatedContent {
  name: string
  type:
    | 'anime'
    | 'movie'
    | 'drama'
    | 'sports_team'
    | 'artist'
    | 'game'
    | 'other'
  year?: number
  additionalInfo?: string
}

// 기존 스팟 문서 타입
interface OldSpotDocument extends Document {
  id: string
  name: string
  relatedMedia?: OldMediaInfo[]
  relatedContent?: NewRelatedContent[]
  category?: string
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
}

// 마이그레이션 결과 통계
interface MigrationStats {
  total: number
  migrated: number
  skipped: number
  errors: number
}

/**
 * relatedMedia를 relatedContent로 변환
 */
function convertMediaToContent(media: OldMediaInfo): NewRelatedContent {
  return {
    name: media.title,
    type: media.type,
    year: media.year,
  }
}

/**
 * SPOT-{숫자} 형식인지 확인
 */
function isValidSpotId(id: string): boolean {
  return /^SPOT-\d+$/.test(id)
}

/**
 * 다음 스팟 ID 번호 계산
 */
function getNextSpotNumber(existingIds: string[]): number {
  const spotNumbers = existingIds
    .filter(isValidSpotId)
    .map((id) => parseInt(id.replace('SPOT-', ''), 10))

  if (spotNumbers.length === 0) {
    return 1
  }

  return Math.max(...spotNumbers) + 1
}

/**
 * 스팟 마이그레이션 실행
 */
async function migrateSpots(dryRun: boolean = false): Promise<MigrationStats> {
  const client = new MongoClient(MONGODB_URI)
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: 0,
  }

  try {
    console.log('MongoDB에 연결 중...')
    await client.connect()
    console.log('MongoDB 연결 성공!')

    const db = client.db(MONGODB_DB)
    const collection = db.collection<OldSpotDocument>('spots')

    // 모든 스팟 조회
    const spots = await collection.find({}).toArray()
    stats.total = spots.length

    // 기존 SPOT-{숫자} ID들 수집
    const existingIds = spots.map((s) => s.id)
    let nextSpotNumber = getNextSpotNumber(existingIds)

    console.log(`\n총 ${stats.total}개의 스팟을 마이그레이션합니다.`)
    console.log(
      dryRun
        ? '🔍 드라이런 모드 - 실제 변경 없음\n'
        : '🚀 실제 마이그레이션 실행\n'
    )

    for (const spot of spots) {
      try {
        const updates: Record<string, unknown> = {}
        const unsets: Record<string, string> = {}
        let needsUpdate = false
        const oldId = spot.id
        let newId = spot.id

        // 0. ID 형식 변환 (난수 ID → SPOT-{숫자})
        if (!isValidSpotId(spot.id)) {
          newId = `SPOT-${nextSpotNumber.toString().padStart(3, '0')}`
          nextSpotNumber++
          needsUpdate = true
          console.log(`  [${oldId}] ID 변환: ${oldId} → ${newId}`)
        }

        // 1. relatedMedia → relatedContent 변환
        if (
          spot.relatedMedia &&
          spot.relatedMedia.length > 0 &&
          !spot.relatedContent
        ) {
          const convertedContent = spot.relatedMedia.map(convertMediaToContent)
          updates.relatedContent = convertedContent
          unsets.relatedMedia = ''
          needsUpdate = true
          console.log(
            `  [${spot.id}] relatedMedia → relatedContent 변환 (${spot.relatedMedia.length}개 항목)`
          )
        }

        // 2. category 기본값 설정
        if (!spot.category) {
          updates.category = 'animation'
          needsUpdate = true
          console.log(`  [${spot.id}] category: 'animation' 설정`)
        }

        // 3. authorName 기본값 설정 (시스템 등록 스팟)
        if (!spot.authorName && !spot.authorId) {
          updates.authorName = 'System'
          updates.isGuestSpot = false
          needsUpdate = true
          console.log(`  [${spot.id}] authorName: 'System' 설정`)
        }

        // 업데이트 실행
        if (needsUpdate) {
          if (!dryRun) {
            // ID가 변경된 경우 새 문서 생성 후 기존 문서 삭제
            if (oldId !== newId) {
              const { _id, ...spotWithoutId } = spot
              const newDoc = { ...spotWithoutId, id: newId }

              // 추가 업데이트 적용
              if (updates.relatedContent) {
                newDoc.relatedContent =
                  updates.relatedContent as NewRelatedContent[]
                delete newDoc.relatedMedia
              }
              if (updates.category) {
                newDoc.category = updates.category as string
              }
              if (updates.authorName) {
                newDoc.authorName = updates.authorName as string
                newDoc.isGuestSpot = updates.isGuestSpot as boolean
              }

              await collection.insertOne(newDoc)
              await collection.deleteOne({ id: oldId })
            } else {
              const updateQuery: {
                $set?: Record<string, unknown>
                $unset?: Record<string, string>
              } = {}

              if (Object.keys(updates).length > 0) {
                updateQuery.$set = updates
              }
              if (Object.keys(unsets).length > 0) {
                updateQuery.$unset = unsets
              }

              await collection.updateOne({ id: spot.id }, updateQuery)
            }
          }
          stats.migrated++
          console.log(
            `  ✅ [${newId}] ${spot.name} - 마이그레이션 ${dryRun ? '예정' : '완료'}`
          )
        } else {
          stats.skipped++
          console.log(
            `  ⏭️ [${newId}] ${spot.name} - 이미 마이그레이션됨 (스킵)`
          )
        }
      } catch (error) {
        stats.errors++
        console.error(
          `  ❌ [${spot.id}] ${spot.name} - 마이그레이션 실패:`,
          error
        )
      }
    }

    return stats
  } finally {
    await client.close()
    console.log('\nMongoDB 연결 종료')
  }
}

/**
 * 마이그레이션 검증
 */
async function verifyMigration(): Promise<boolean> {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(MONGODB_DB)
    const collection = db.collection('spots')

    console.log('\n📋 마이그레이션 검증 중...\n')

    // 1. relatedMedia가 남아있는 스팟 확인
    const spotsWithOldMedia = await collection.countDocuments({
      relatedMedia: { $exists: true, $ne: [] },
      relatedContent: { $exists: false },
    })

    // 2. category가 없는 스팟 확인
    const spotsWithoutCategory = await collection.countDocuments({
      category: { $exists: false },
    })

    // 3. authorName이 없는 스팟 확인 (authorId도 없는 경우)
    const spotsWithoutAuthor = await collection.countDocuments({
      authorName: { $exists: false },
      authorId: { $exists: false },
    })

    // 4. 전체 스팟 수
    const totalSpots = await collection.countDocuments({})

    // 5. 잘못된 ID 형식 스팟 확인
    const allSpots = await collection.find({}).project({ id: 1 }).toArray()
    const invalidIdSpots = allSpots.filter((s) => !/^SPOT-\d+$/.test(s.id))

    // 6. 마이그레이션된 스팟 샘플 출력
    const sampleSpot = await collection.findOne({})

    console.log('검증 결과:')
    console.log(`  - 전체 스팟 수: ${totalSpots}`)
    console.log(`  - relatedMedia만 있는 스팟: ${spotsWithOldMedia}`)
    console.log(`  - category 없는 스팟: ${spotsWithoutCategory}`)
    console.log(`  - authorName 없는 스팟: ${spotsWithoutAuthor}`)
    console.log(`  - 잘못된 ID 형식 스팟: ${invalidIdSpots.length}`)

    if (invalidIdSpots.length > 0) {
      console.log(
        `    → 잘못된 ID들: ${invalidIdSpots.map((s) => s.id).join(', ')}`
      )
    }

    if (sampleSpot) {
      console.log('\n샘플 스팟 데이터:')
      console.log(JSON.stringify(sampleSpot, null, 2))
    }

    const isValid =
      spotsWithOldMedia === 0 &&
      spotsWithoutCategory === 0 &&
      spotsWithoutAuthor === 0 &&
      invalidIdSpots.length === 0

    if (isValid) {
      console.log('\n✅ 마이그레이션 검증 성공!')
    } else {
      console.log(
        '\n⚠️ 마이그레이션 검증 실패 - 일부 스팟이 마이그레이션되지 않았습니다.'
      )
    }

    return isValid
  } finally {
    await client.close()
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const verifyOnly = args.includes('--verify')

  console.log('='.repeat(60))
  console.log('스팟 데이터 마이그레이션 스크립트')
  console.log('='.repeat(60))

  if (verifyOnly) {
    await verifyMigration()
    return
  }

  // 마이그레이션 실행
  const stats = await migrateSpots(dryRun)

  // 결과 출력
  console.log('\n' + '='.repeat(60))
  console.log('마이그레이션 결과')
  console.log('='.repeat(60))
  console.log(`  전체: ${stats.total}개`)
  console.log(`  마이그레이션: ${stats.migrated}개`)
  console.log(`  스킵: ${stats.skipped}개`)
  console.log(`  에러: ${stats.errors}개`)

  if (!dryRun && stats.migrated > 0) {
    // 마이그레이션 후 검증
    await verifyMigration()
  }

  if (dryRun) {
    console.log(
      '\n💡 실제 마이그레이션을 실행하려면 --dry-run 옵션 없이 실행하세요.'
    )
  }
}

main().catch((error) => {
  console.error('마이그레이션 실패:', error)
  process.exit(1)
})
