'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getSafeImageSrc } from '@/lib/safe-image-src'
import { CONTENT_TYPE_CONFIG } from '@/types'
import type { ContentListItem } from './ContentListClient'
import {
  DISCOVERABLE_CONTENT_TYPE_LABELS,
  isDiscoverableContentType,
} from '@/lib/content-discovery'

interface ContentCardProps {
  content: ContentListItem
}

function shouldBypassOptimizer(src: string): boolean {
  return ['/uploads/', '/icons/', '/images/'].some((prefix) =>
    src.startsWith(prefix)
  )
}

export function ContentCard({ content }: ContentCardProps) {
  const [imageError, setImageError] = useState(false)
  const typeConfig = CONTENT_TYPE_CONFIG[content.contentType]
  const typeLabel = isDiscoverableContentType(content.contentType)
    ? DISCOVERABLE_CONTENT_TYPE_LABELS[content.contentType]
    : '콘텐츠'
  const safeImageSrc = content.imageUrl
    ? getSafeImageSrc(content.imageUrl)
    : undefined

  return (
    <Link
      href={`/contents/${encodeURIComponent(content.contentName)}`}
      className="group block overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full bg-border/30">
        {safeImageSrc && !imageError ? (
          <Image
            src={safeImageSrc}
            alt={`${content.contentName} 대표 썸네일`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
            unoptimized={shouldBypassOptimizer(safeImageSrc)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image
              src={typeConfig.icon}
              alt={typeLabel}
              width={48}
              height={48}
              className="opacity-40"
              unoptimized
            />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-medium text-main-text group-hover:text-primary">
          {content.contentName}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: typeConfig.bgColor,
              color: typeConfig.fgColor,
            }}
          >
            {typeLabel}
          </span>
          <span className="text-xs text-sub-text">
            스팟 {content.spotCount}개
          </span>
        </div>
      </div>
    </Link>
  )
}
