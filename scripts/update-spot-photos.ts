/**
 * spots.photos를 실제 장소 사진 URL로 보강하는 스크립트
 *
 * 기본 동작:
 * - 현재 photos가 비어 있거나 picsum/icons 같은 플레이스홀더일 때만 업데이트
 * - 이미 실사진이 들어간 스팟은 건드리지 않음
 *
 * 옵션:
 * - --dry-run: 실제 반영 없이 대상만 출력
 * - --force: 현재 값과 무관하게 대상 스팟을 모두 덮어씀
 *
 * 실행:
 * - npx tsx scripts/update-spot-photos.ts
 * - npx tsx scripts/update-spot-photos.ts --dry-run
 * - npx tsx scripts/update-spot-photos.ts --force
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { MongoClient } from 'mongodb'
import { REAL_SPOT_PHOTO_FALLBACKS } from '../src/components/landing/data/realSpotPhotoFallbacks'

interface SpotDocument {
  id: string
  name?: string
  photos?: string[]
  updatedAt?: Date
}

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const envContent = readFileSync(envPath, 'utf-8')

    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      const [key, ...valueParts] = trimmed.split('=')
      if (!key || valueParts.length === 0) return

      process.env[key.trim()] = valueParts.join('=').trim()
    })
  } catch {
    // eslint-disable-next-line no-console
    console.error(
      '.env.local 파일을 읽지 못했습니다. 기존 환경변수를 사용합니다.'
    )
  }
}

function isPlaceholderPhoto(url?: string | null): boolean {
  if (!url) return true
  return url.includes('picsum.photos/seed/') || url.startsWith('/icons/')
}

loadEnv()

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.error('MONGODB_URI 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const MONGODB_URI: string = mongoUri

async function updateSpotPhotos() {
  const client = new MongoClient(MONGODB_URI)
  const isDryRun = process.argv.includes('--dry-run')
  const isForce = process.argv.includes('--force')

  try {
    await client.connect()
    const db = client.db()
    const collection = db.collection<SpotDocument>('spots')

    const spotIds = Object.keys(REAL_SPOT_PHOTO_FALLBACKS)
    const spots = await collection.find({ id: { $in: spotIds } }).toArray()
    const spotsById = new Map(spots.map((spot) => [spot.id, spot]))

    const updates = spotIds.flatMap((spotId) => {
      const fallback = REAL_SPOT_PHOTO_FALLBACKS[spotId]
      const spot = spotsById.get(spotId)

      if (!spot || !fallback) return []

      const currentPhoto = spot.photos?.[0] ?? null
      const shouldUpdate = isForce || isPlaceholderPhoto(currentPhoto)

      if (!shouldUpdate) return []

      return [
        {
          updateOne: {
            filter: { id: spotId },
            update: {
              $set: {
                photos: [fallback.imageUrl],
                updatedAt: new Date(),
              },
            },
          },
        },
      ]
    })

    const missingIds = spotIds.filter((spotId) => !spotsById.has(spotId))

    // eslint-disable-next-line no-console
    console.log(`대상 fallback 스팟: ${spotIds.length}개`)
    // eslint-disable-next-line no-console
    console.log(`DB에서 찾은 스팟: ${spots.length}개`)
    // eslint-disable-next-line no-console
    console.log(`업데이트 예정: ${updates.length}개`)

    if (missingIds.length > 0) {
      // eslint-disable-next-line no-console
      console.log('\nDB에 없는 스팟 ID:')
      missingIds.forEach((spotId) => {
        // eslint-disable-next-line no-console
        console.log(`- ${spotId}`)
      })
    }

    if (updates.length === 0) {
      // eslint-disable-next-line no-console
      console.log('\n업데이트할 스팟이 없습니다.')
      return
    }

    // eslint-disable-next-line no-console
    console.log('\n업데이트 대상:')
    updates.forEach((op) => {
      const spotId = op.updateOne.filter.id
      const spot = spotsById.get(spotId)
      const nextPhoto = REAL_SPOT_PHOTO_FALLBACKS[spotId]?.imageUrl
      // eslint-disable-next-line no-console
      console.log(`- ${spotId} | ${spot?.name ?? 'unknown'} -> ${nextPhoto}`)
    })

    if (isDryRun) {
      // eslint-disable-next-line no-console
      console.log('\n--dry-run 모드라서 실제 업데이트는 수행하지 않았습니다.')
      return
    }

    const result = await collection.bulkWrite(updates, { ordered: false })

    // eslint-disable-next-line no-console
    console.log('\n업데이트 완료')
    // eslint-disable-next-line no-console
    console.log(`- matched: ${result.matchedCount}`)
    // eslint-disable-next-line no-console
    console.log(`- modified: ${result.modifiedCount}`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('spots.photos 업데이트 중 오류가 발생했습니다:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

updateSpotPhotos()
