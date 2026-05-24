import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from '@aws-sdk/client-s3'

export interface R2StorageConfig {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl: string
}

export class StorageConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageConfigError'
  }
}

let cachedClient: S3Client | null = null

export function getR2StorageConfig(): R2StorageConfig {
  const accountId = process.env.R2_ACCOUNT_ID?.trim()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim()
  const bucketName = process.env.R2_BUCKET_NAME?.trim()
  const publicUrl = process.env.R2_PUBLIC_URL?.trim()

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicUrl
  ) {
    throw new StorageConfigError(
      'R2 스토리지 환경 변수가 설정되지 않았습니다. R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL을 확인해주세요.'
    )
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl: publicUrl.replace(/\/+$/, ''),
  }
}

export function getR2StorageClient(): S3Client {
  if (cachedClient) {
    return cachedClient
  }

  const config = getR2StorageConfig()

  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  return cachedClient
}

export function buildUploadBaseKey(
  timestamp: number,
  randomId: string,
  date: Date = new Date(timestamp)
): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `uploads/${year}/${month}/${timestamp}-${randomId}`
}

export function buildStoragePublicUrl(key: string): string {
  const { publicUrl } = getR2StorageConfig()
  return `${publicUrl}/${key}`
}

export async function putStorageObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const config = getR2StorageConfig()
  const client = getR2StorageClient()

  const input: PutObjectCommandInput = {
    Bucket: config.bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }

  await client.send(new PutObjectCommand(input))

  return buildStoragePublicUrl(key)
}
