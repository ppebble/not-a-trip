const TEN_MB = 10 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

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

export function validateUploadFile(
  file: File,
  buffer: Buffer
): DetectedImageFormat {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
    throw new UploadValidationError(
      '지원되지 않는 파일 형식입니다. JPEG, PNG, GIF, WebP만 업로드할 수 있습니다.'
    )
  }

  if (file.size > TEN_MB) {
    throw new UploadValidationError('파일 크기는 10MB 이하여야 합니다.')
  }

  const detectedFormat = detectImageFormat(buffer)

  if (!detectedFormat) {
    throw new UploadValidationError('파일의 실제 형식을 확인할 수 없습니다.')
  }

  if (
    !formatMatchesMimeType(file.type as AllowedImageMimeType, detectedFormat)
  ) {
    throw new UploadValidationError(
      '파일 확장자 또는 MIME 타입과 실제 파일 형식이 일치하지 않습니다.'
    )
  }

  return detectedFormat
}
