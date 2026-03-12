// Service Worker - Not a Trip PWA
// @requirements 2.4, 4.2, 5.2

const CACHE_VERSION = 2
const STATIC_CACHE = `not-a-trip-static-v${CACHE_VERSION}`
const TILE_CACHE = `not-a-trip-tiles-v${CACHE_VERSION}`
const DATA_CACHE = `not-a-trip-data-v${CACHE_VERSION}`
const ROUTE_CACHE = `not-a-trip-route-v${CACHE_VERSION}`

const VALID_CACHES = [STATIC_CACHE, TILE_CACHE, DATA_CACHE, ROUTE_CACHE]

// App Shell 정적 자산
const APP_SHELL_ASSETS = ['/', '/offline.html']

// 지도 타일 도메인 패턴
const TILE_DOMAINS = [
  'tile.openstreetmap.org',
  'tiles.stadiamaps.com',
  'a.tile.openstreetmap.org',
  'b.tile.openstreetmap.org',
  'c.tile.openstreetmap.org',
]

// 타일 캐시 최대 항목 수
const MAX_TILE_CACHE_ITEMS = 500

// 데이터 캐시 최대 항목 수
const MAX_DATA_CACHE_ITEMS = 100

/**
 * 캐시 항목 수 제한 (LRU 방식)
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxItems) {
    await cache.delete(keys[0])
    return trimCache(cacheName, maxItems)
  }
}

/**
 * 지도 타일 요청인지 확인
 */
function isTileRequest(url) {
  return TILE_DOMAINS.some((domain) => url.hostname.includes(domain))
}

/**
 * 스팟 API 요청인지 확인
 */
function isSpotDataRequest(url) {
  return url.pathname.startsWith('/api/spots')
}

/**
 * 코스 API 요청인지 확인
 */
function isRouteDataRequest(url) {
  return url.pathname.startsWith('/api/routes')
}

/**
 * 캐싱 가능한 데이터 API 요청인지 확인 (GET만)
 */
function isCacheableDataRequest(request) {
  const url = new URL(request.url)
  return request.method === 'GET' && isSpotDataRequest(url)
}

/**
 * 코스 캐시에서 응답 가능한 요청인지 확인 (GET만)
 */
function isRouteCacheableRequest(request) {
  const url = new URL(request.url)
  return (
    request.method === 'GET' &&
    (isRouteDataRequest(url) || isSpotDataRequest(url))
  )
}

// install: 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS)
    })
  )
  self.skipWaiting()
})

// activate: 이전 버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !VALID_CACHES.includes(name))
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// fetch: 요청 유형별 캐싱 전략 분기
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // http/https 이외의 스킴(chrome-extension 등)은 캐싱 불가 — 무시
  if (!url.protocol.startsWith('http')) {
    return
  }

  // 지도 타일: Cache First 전략
  if (isTileRequest(url)) {
    event.respondWith(handleTileRequest(event.request))
    return
  }

  // 스팟 데이터 API: Stale While Revalidate 전략
  if (isCacheableDataRequest(event.request)) {
    event.respondWith(handleDataRequest(event.request))
    return
  }

  // 코스/스팟 API: ROUTE_CACHE 폴백 (프리패치된 오프라인 데이터)
  if (isRouteCacheableRequest(event.request)) {
    event.respondWith(handleRouteCacheRequest(event.request))
    return
  }

  // 기타 API 요청: 캐싱하지 않음
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // 정적 자산: Network First + 캐시 폴백
  event.respondWith(handleStaticRequest(event.request))
})

/**
 * 지도 타일 캐싱 전략: Cache First
 * - 캐시에 있으면 즉시 반환 (빠른 로딩)
 * - 없으면 네트워크에서 가져와 캐시에 저장
 */
async function handleTileRequest(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const cache = await caches.open(TILE_CACHE)
      cache.put(request, response.clone())
      trimCache(TILE_CACHE, MAX_TILE_CACHE_ITEMS)
    }
    return response
  } catch {
    return new Response('', { status: 408, statusText: 'Tile unavailable' })
  }
}

/**
 * 스팟 데이터 캐싱 전략: Stale While Revalidate
 * - 캐시에 있으면 즉시 반환 + 백그라운드에서 갱신
 * - 없으면 네트워크에서 가져와 캐시에 저장
 */
async function handleDataRequest(request) {
  const cached = await caches.match(request)

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.status === 200) {
        const cache = await caches.open(DATA_CACHE)
        cache.put(request, response.clone())
        trimCache(DATA_CACHE, MAX_DATA_CACHE_ITEMS)
      }
      return response
    })
    .catch(() => null)

  // 캐시가 있으면 즉시 반환, 백그라운드에서 갱신
  if (cached) {
    fetchPromise // 백그라운드 갱신 (fire and forget)
    return cached
  }

  // 캐시가 없으면 네트워크 응답 대기
  const networkResponse = await fetchPromise
  if (networkResponse) {
    return networkResponse
  }

  return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * 정적 자산 캐싱 전략: Network First
 * - 네트워크 우선, 실패 시 캐시 폴백
 * - navigate 요청 실패 시 오프라인 페이지
 */
async function handleStaticRequest(request) {
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }
    return new Response('Offline', { status: 503 })
  }
}

/**
 * 코스 캐시 요청 처리: Network First + ROUTE_CACHE 폴백
 * - 네트워크 우선, 실패 시 프리패치된 ROUTE_CACHE에서 반환
 */
async function handleRouteCacheRequest(request) {
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const cache = await caches.open(ROUTE_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * 코스 데이터 프리패치
 * - 코스 상세 API, 각 스팟 상세 API, 썸네일 이미지를 ROUTE_CACHE에 저장
 */
async function prefetchRouteData(payload) {
  const { routeId, spots } = payload
  const cache = await caches.open(ROUTE_CACHE)

  const requests = []

  // 코스 상세 API
  requests.push(`/api/routes/${routeId}`)

  // 각 스팟 상세 API + 썸네일
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

// message: 캐시 관리 메시지 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)))
      })
    )
  }

  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    getCacheStats().then((stats) => {
      event.ports[0].postMessage(stats)
    })
  }

  // 코스 프리패치 요청
  if (event.data && event.data.type === 'PREFETCH_ROUTE') {
    event.waitUntil(
      prefetchRouteData(event.data.payload).then((result) => {
        // 클라이언트에 완료 알림
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

/**
 * 캐시 통계 조회
 */
async function getCacheStats() {
  const stats = {}
  for (const cacheName of VALID_CACHES) {
    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      stats[cacheName] = keys.length
    } catch {
      stats[cacheName] = 0
    }
  }
  return stats
}

// ============================================
// 푸시 알림 이벤트 처리
// @requirements 4.3
// ============================================

// push: 푸시 알림 수신 시 알림 표시
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: [],
      vibrate: [200, 100, 200],
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  } catch {
    // JSON 파싱 실패 시 텍스트로 표시
    const text = event.data.text()
    event.waitUntil(
      self.registration.showNotification('Not a Trip', { body: text })
    )
  }
})

// notificationclick: 알림 클릭 시 해당 페이지로 이동
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      // 없으면 새 탭 열기
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
