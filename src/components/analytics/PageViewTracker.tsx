'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { API_ROUTES } from '@/lib/api-routes'
import { normalizeTrackablePagePath } from '@/lib/analytics/page-views'

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)

  useEffect(() => {
    const trackablePath = normalizeTrackablePagePath(pathname)
    if (!trackablePath || lastTrackedPath.current === trackablePath) {
      return
    }

    lastTrackedPath.current = trackablePath
    void fetch(API_ROUTES.INTERNAL.PAGE_VIEW, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: trackablePath }),
      keepalive: true,
    }).catch(() => undefined)
  }, [pathname])

  return null
}
