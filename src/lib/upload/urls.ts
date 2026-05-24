import { buildStoragePublicUrl } from '@/lib/storage/r2'

export function replaceLegacyUploadPathWithCdnUrl(url: string): string {
  if (!url.startsWith('/uploads/')) {
    return url
  }

  const key = url.replace(/^\/+/, '')
  return buildStoragePublicUrl(key)
}
