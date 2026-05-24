import sharp from 'sharp'

import type { DetectedImageFormat } from './validation'

export interface UploadArtifact {
  keySuffix: 'original' | 'pin' | 'card'
  buffer: Buffer
  contentType: string
  extension: string
}

export interface UploadArtifactSet {
  original: UploadArtifact
  pin: UploadArtifact | null
  card: UploadArtifact | null
}

async function createWebpThumbnail(
  buffer: Buffer,
  size: number
): Promise<UploadArtifact> {
  const resized = await sharp(buffer, { animated: true })
    .resize(size, size, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 80 })
    .toBuffer()

  return {
    keySuffix: size === 64 ? 'pin' : 'card',
    buffer: resized,
    contentType: 'image/webp',
    extension: 'webp',
  }
}

export async function prepareUploadArtifacts(
  buffer: Buffer,
  format: DetectedImageFormat
): Promise<UploadArtifactSet> {
  const original =
    format === 'webp'
      ? {
          keySuffix: 'original' as const,
          buffer,
          contentType: 'image/webp',
          extension: 'webp',
        }
      : {
          keySuffix: 'original' as const,
          buffer: await sharp(buffer, { animated: true })
            .webp({ quality: 80 })
            .toBuffer(),
          contentType: 'image/webp',
          extension: 'webp',
        }

  try {
    const [pin, card] = await Promise.all([
      createWebpThumbnail(buffer, 64),
      createWebpThumbnail(buffer, 256),
    ])

    return {
      original,
      pin,
      card,
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Thumbnail generation failed:', error)
    return {
      original,
      pin: null,
      card: null,
    }
  }
}
