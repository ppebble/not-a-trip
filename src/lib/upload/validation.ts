const TEN_MB = 10 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

const UNRELIABLE_BROWSER_MIME_TYPES = new Set([
  '',
  'application/octet-stream',
  'binary/octet-stream',
])

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]
export type DetectedImageFormat = 'jpeg' | 'png' | 'gif' | 'webp'

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadValidationError'
  }
}

export function detectImageFormat(buffer: Buffer): DetectedImageFormat | null {
  if (buffer.length >= 3) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'jpeg'
    }
  }

  if (buffer.length >= 8) {
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a

    if (isPng) return 'png'
  }

  if (buffer.length >= 6) {
    const header = buffer.subarray(0, 6).toString('ascii')
    if (header === 'GIF87a' || header === 'GIF89a') {
      return 'gif'
    }
  }

  if (buffer.length >= 12) {
    const riff = buffer.subarray(0, 4).toString('ascii')
    const webp = buffer.subarray(8, 12).toString('ascii')
    if (riff === 'RIFF' && webp === 'WEBP') {
      return 'webp'
    }
  }

  return null
}

function formatMatchesMimeType(
  mimeType: AllowedImageMimeType,
  detectedFormat: DetectedImageFormat
): boolean {
  switch (mimeType) {
    case 'image/jpeg':
      return detectedFormat === 'jpeg'
    case 'image/png':
      return detectedFormat === 'png'
    case 'image/gif':
      return detectedFormat === 'gif'
    case 'image/webp':
      return detectedFormat === 'webp'
    default:
      return false
  }
}

function getFileExtension(fileName: string): string | null {
  const extension = fileName
    .trim()
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/)?.[1]
  return extension ?? null
}

function formatMatchesExtension(
  extension: string | null,
  detectedFormat: DetectedImageFormat
): boolean {
  if (!extension) return false

  switch (detectedFormat) {
    case 'jpeg':
      return extension === 'jpg' || extension === 'jpeg'
    case 'png':
      return extension === 'png'
    case 'gif':
      return extension === 'gif'
    case 'webp':
      return extension === 'webp'
    default:
      return false
  }
}

export function validateUploadFile(
  file: File,
  buffer: Buffer
): DetectedImageFormat {
  if (file.size > TEN_MB) {
    throw new UploadValidationError(
      '\ud30c\uc77c \ud06c\uae30\ub294 10MB \uc774\ud558\uc5ec\uc57c \ud569\ub2c8\ub2e4.'
    )
  }

  const mimeType = file.type || ''
  const normalizedMimeType = mimeType.toLowerCase()
  const isAllowedMime = ALLOWED_IMAGE_MIME_TYPES.includes(
    normalizedMimeType as AllowedImageMimeType
  )
  const isUnreliableMime = UNRELIABLE_BROWSER_MIME_TYPES.has(normalizedMimeType)

  if (!isAllowedMime && !isUnreliableMime) {
    throw new UploadValidationError(
      '\uc9c0\uc6d0\ub418\uc9c0 \uc54a\ub294 \ud30c\uc77c \ud615\uc2dd\uc785\ub2c8\ub2e4. JPEG, PNG, GIF, WebP\ub9cc \uc5c5\ub85c\ub4dc\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.'
    )
  }

  const detectedFormat = detectImageFormat(buffer)

  if (!detectedFormat) {
    throw new UploadValidationError(
      '\ud30c\uc77c\uc758 \uc2e4\uc81c \ud615\uc2dd\uc744 \ud655\uc778\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.'
    )
  }

  const mimeMatches =
    isAllowedMime &&
    formatMatchesMimeType(
      normalizedMimeType as AllowedImageMimeType,
      detectedFormat
    )
  const extensionMatches = formatMatchesExtension(
    getFileExtension(file.name),
    detectedFormat
  )

  if (!mimeMatches && !extensionMatches) {
    throw new UploadValidationError(
      '\ud30c\uc77c \ud655\uc7a5\uc790 \ub610\ub294 MIME \ud0c0\uc785\uacfc \uc2e4\uc81c \ud30c\uc77c \ud615\uc2dd\uc774 \uc77c\uce58\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.'
    )
  }

  return detectedFormat
}
