import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { MongoClient } from 'mongodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const {
  MONGODB_URI = 'mongodb://localhost:27017/not-a-trip',
  MONGODB_DB,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL
) {
  throw new Error(
    'R2 env vars are required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL'
  )
}

const dbName =
  MONGODB_DB || MONGODB_URI.match(/\/([^/?]+)(\?|$)/)?.[1] || 'not-a-trip'

const client = new MongoClient(MONGODB_URI)
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const PUBLIC_URL = R2_PUBLIC_URL.replace(/\/+$/, '')
const uploadsRoot = path.join(process.cwd(), 'public', 'uploads')
const mapping = {}
const failures = []

function detectFormat(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg'
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'png'
  }
  const gifHeader = buffer.subarray(0, 6).toString('ascii')
  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
    return 'gif'
  }
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'webp'
  }
  return null
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return walk(entryPath)
      }
      return [entryPath]
    })
  )
  return files.flat()
}

function buildKey(baseName, variant) {
  const now = Date.now()
  const date = new Date(now)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `uploads/${year}/${month}/${now}-${baseName}${variant}.webp`
}

async function upload(key, body) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )

  return `${PUBLIC_URL}/${key}`
}

function replaceInObject(value) {
  if (typeof value === 'string' && value.startsWith('/uploads/')) {
    return mapping[value] || value
  }

  if (Array.isArray(value)) {
    return value.map(replaceInObject)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        replaceInObject(nested),
      ])
    )
  }

  return value
}

try {
  console.log('Starting migration from public/uploads to R2...')
  const files = await walk(uploadsRoot)
  console.log(`Found ${files.length} files`)

  for (const filePath of files) {
    const relative = `/${path
      .relative(path.join(process.cwd(), 'public'), filePath)
      .replace(/\\/g, '/')}`
    const baseName = path.basename(filePath, path.extname(filePath))

    try {
      const buffer = await fs.readFile(filePath)
      const format = detectFormat(buffer)
      if (!format) {
        throw new Error('unsupported format')
      }

      const original =
        format === 'webp'
          ? buffer
          : await sharp(buffer, { animated: true })
              .webp({ quality: 80 })
              .toBuffer()
      const pin = await sharp(buffer, { animated: true })
        .resize(64, 64, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toBuffer()
      const card = await sharp(buffer, { animated: true })
        .resize(256, 256, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toBuffer()

      const originalUrl = await upload(buildKey(baseName, ''), original)
      await upload(buildKey(baseName, '-pin'), pin)
      await upload(buildKey(baseName, '-card'), card)

      mapping[relative] = originalUrl
      console.log(`Migrated ${relative} -> ${originalUrl}`)
    } catch (error) {
      failures.push({
        file: relative,
        error: error instanceof Error ? error.message : String(error),
      })
      console.error(`Failed to migrate ${relative}:`, error)
    }
  }

  await fs.writeFile(
    path.join(process.cwd(), 'migration-upload-mapping.json'),
    JSON.stringify({ mapping, failures }, null, 2),
    'utf8'
  )

  await client.connect()
  const db = client.db(dbName)
  const spots = db.collection('spots')
  const allSpots = await spots
    .find({ photos: { $exists: true, $ne: [] } })
    .toArray()

  for (const spot of allSpots) {
    const nextPhotos = replaceInObject(spot.photos)
    if (JSON.stringify(nextPhotos) !== JSON.stringify(spot.photos)) {
      await spots.updateOne({ _id: spot._id }, { $set: { photos: nextPhotos } })
    }
  }

  console.log('Migration complete.')
  console.log(`Successes: ${Object.keys(mapping).length}`)
  console.log(`Failures: ${failures.length}`)
} finally {
  await client.close()
}
