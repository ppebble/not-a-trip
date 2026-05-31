import type { ContentType } from '@/types'

export interface ContentListItem {
  contentName: string
  contentType: ContentType
  spotCount: number
  imageUrl: string | null
}

export const DISCOVERABLE_CONTENT_TYPES = [
  'anime',
  'game',
  'artist',
] as const satisfies readonly ContentType[]

export const EXCLUDED_CONTENT_NAMES = [
  '일본 애니메이션 역사',
  '일본 애니메이션·만화 문화',
] as const

export type DiscoverableContentType =
  (typeof DISCOVERABLE_CONTENT_TYPES)[number]

export const DISCOVERABLE_CONTENT_TYPE_LABELS: Record<
  DiscoverableContentType,
  string
> = {
  anime: '애니메이션',
  game: '게임',
  artist: '아티스트',
}

export function isDiscoverableContentType(
  contentType: ContentType
): contentType is DiscoverableContentType {
  return DISCOVERABLE_CONTENT_TYPES.includes(
    contentType as DiscoverableContentType
  )
}
