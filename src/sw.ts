import { defaultCache } from '@serwist/next/worker'
import { Serwist } from 'serwist'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope & typeof globalThis

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 지도 타일 (OpenStreetMap): CacheFirst
    {
      urlPattern: /^https:\/\/(.*\.)?tile\.openstreetmap\.org/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles',
        expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // 지도 타일 (Stadia Maps): CacheFirst
    {
      urlPattern: /^https:\/\/tiles\.stadiamaps\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles',
        expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // 외부 타일 서버 (Carto): CacheFirst (요구사항 3.7)
    {
      urlPattern: /^https:\/\/.*basemaps\.cartocdn\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-tiles',
        expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // 스팟 데이터 API: StaleWhileRevalidate
    {
      urlPattern: /\/api\/spots/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'spot-data',
        expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // 코스 데이터 API: NetworkFirst
    {
      urlPattern: /\/api\/routes/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'route-data',
        networkTimeoutSeconds: 5,
      },
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher: ({ request }: { request: Request }) =>
          request.mode === 'navigate',
      },
    ],
  },
})

serwist.addEventListeners()

// ============================================
// 푸시 알림 이벤트 처리 (기존 sw.js에서 이전)
// ============================================

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options: NotificationOptions = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      vibrate: [200, 100, 200],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  } catch {
    const text = event.data?.text() || ''
    event.waitUntil(
      self.registration.showNotification('Not a Trip', { body: text })
    )
  }
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const url = (event.notification.data as { url?: string })?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})

// 캐시 관리 메시지 처리
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)))
      })
    )
  }

  // 코스 프리패치 요청
  if (event.data && event.data.type === 'PREFETCH_ROUTE') {
    event.waitUntil(
      prefetchRouteData(event.data.payload).then((result) => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'ROUTE_PREFETCH_COMPLETE',
              payload: {
                routeId: event.data.payload.routeId,
                ...result,
              },
            })
          })
        })
      })
    )
  }
})

interface PrefetchPayload {
  routeId: string
  spots: Array<{ spotId: string; thumbnailUrl?: string }>
}

async function prefetchRouteData(payload: PrefetchPayload) {
  const { routeId, spots } = payload
  const cache = await caches.open('route-data')

  const requests: string[] = [`/api/routes/${routeId}`]

  for (const spot of spots) {
    requests.push(`/api/spots/${spot.spotId}`)
    if (spot.thumbnailUrl) {
      requests.push(spot.thumbnailUrl)
    }
  }

  const results = await Promise.allSettled(
    requests.map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(new Request(url), response)
        }
      } catch {
        /* 오프라인이면 무시 */
      }
    })
  )

  return {
    total: requests.length,
    success: results.filter((r) => r.status === 'fulfilled').length,
  }
}
