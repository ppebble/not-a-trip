import { buildUploadBaseKey, putStorageObject } from '@/lib/storage/r2'
import type { UploadedImageSet } from '@/types/upload'

import type { UploadArtifactSet } from './image-processing'

function buildVariantKey(
  baseKey: string,
  variant: 'original' | 'pin' | 'card',
  extension: string
): string {
  if (variant === 'original') {
    return `${baseKey}.${extension}`
  }

  return `${baseKey}-${variant}.${extension}`
}

export async function uploadImageVariantsToStorage(
  artifacts: UploadArtifactSet,
  timestamp: number,
  randomId: string
): Promise<UploadedImageSet> {
  const baseKey = buildUploadBaseKey(timestamp, randomId)

  const original = await putStorageObject(
    buildVariantKey(baseKey, 'original', artifacts.original.extension),
    artifacts.original.buffer,
    artifacts.original.contentType
  )

  const pin = artifacts.pin
    ? await putStorageObject(
        buildVariantKey(baseKey, 'pin', artifacts.pin.extension),
        artifacts.pin.buffer,
        artifacts.pin.contentType
      )
    : null

  const card = artifacts.card
    ? await putStorageObject(
        buildVariantKey(baseKey, 'card', artifacts.card.extension),
        artifacts.card.buffer,
        artifacts.card.contentType
      )
    : null

  return {
    original,
    pin,
    card,
  }
}
