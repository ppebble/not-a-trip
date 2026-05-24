import fs from 'fs'
import path from 'path'
import { ValidationIssue } from './types'

export interface PwaCacheValidationResult {
  issues: ValidationIssue[]
  checks: {
    hasOfflineFallback: boolean
    hasSkipWaiting: boolean
    hasClientsClaim: boolean
    hasClearCachesMessage: boolean
    hasSpotDataStaleWhileRevalidate: boolean
    hasExpirationPluginForTiles: boolean
    hasPrecacheManifestReference: boolean
    offlinePageShowsNetworkStatus: boolean
    offlinePageHasRetryAction: boolean
  }
}

function includesAll(source: string, patterns: string[]): boolean {
  return patterns.every((pattern) => source.includes(pattern))
}

export function validatePwaCaching(options?: {
  repoRoot?: string
  swPath?: string
  offlinePagePath?: string
}): PwaCacheValidationResult {
  const repoRoot = options?.repoRoot ?? process.cwd()
  const swPath = options?.swPath ?? path.join(repoRoot, 'src', 'sw.ts')
  const offlinePagePath =
    options?.offlinePagePath ??
    path.join(repoRoot, 'src', 'app', 'offline', 'page.tsx')

  const swSource = fs.readFileSync(swPath, 'utf8')
  const offlineSource = fs.readFileSync(offlinePagePath, 'utf8')

  const checks = {
    hasOfflineFallback: includesAll(swSource, [
      "url: '/offline'",
      "mode === 'navigate'",
    ]),
    hasSkipWaiting: swSource.includes('skipWaiting: true'),
    hasClientsClaim: swSource.includes('clientsClaim: true'),
    hasClearCachesMessage: includesAll(swSource, [
      'CLEAR_CACHES',
      'caches.keys()',
      'caches.delete',
    ]),
    hasSpotDataStaleWhileRevalidate: includesAll(swSource, [
      'matcher: /\\/api\\/spots/',
      'new StaleWhileRevalidate',
    ]),
    hasExpirationPluginForTiles: includesAll(swSource, [
      "cacheName: 'map-tiles'",
      'new ExpirationPlugin',
      'maxEntries: 500',
    ]),
    hasPrecacheManifestReference: swSource.includes('__SW_MANIFEST'),
    offlinePageShowsNetworkStatus: includesAll(offlineSource, [
      'navigator.onLine',
      "window.addEventListener('online'",
      "window.addEventListener('offline'",
    ]),
    offlinePageHasRetryAction: includesAll(offlineSource, [
      'window.location.reload()',
      'handleRetry',
    ]),
  }

  const issues: ValidationIssue[] = []

  if (!checks.hasOfflineFallback) {
    issues.push({
      level: 'error',
      code: 'pwa.offline-fallback-missing',
      message: 'Service worker navigation fallback to /offline is missing.',
      file: path.relative(repoRoot, swPath).replace(/\\/g, '/'),
    })
  }

  if (!checks.hasSkipWaiting || !checks.hasClientsClaim) {
    issues.push({
      level: 'error',
      code: 'pwa.activation-missing',
      message:
        'Service worker should enable both skipWaiting and clientsClaim for immediate activation.',
      file: path.relative(repoRoot, swPath).replace(/\\/g, '/'),
    })
  }

  if (!checks.hasSpotDataStaleWhileRevalidate) {
    issues.push({
      level: 'warning',
      code: 'pwa.spot-cache-strategy-missing',
      message: 'Spot API cache is not using a StaleWhileRevalidate strategy.',
      file: path.relative(repoRoot, swPath).replace(/\\/g, '/'),
    })
  }

  if (!checks.hasExpirationPluginForTiles) {
    issues.push({
      level: 'warning',
      code: 'pwa.tile-expiration-missing',
      message:
        'Map tile cache does not appear to enforce expiration/maxEntries limits.',
      file: path.relative(repoRoot, swPath).replace(/\\/g, '/'),
    })
  }

  if (!checks.hasClearCachesMessage) {
    issues.push({
      level: 'warning',
      code: 'pwa.clear-caches-missing',
      message:
        'CLEAR_CACHES message handler is missing from the service worker.',
      file: path.relative(repoRoot, swPath).replace(/\\/g, '/'),
    })
  }

  if (
    !checks.offlinePageShowsNetworkStatus ||
    !checks.offlinePageHasRetryAction
  ) {
    issues.push({
      level: 'warning',
      code: 'pwa.offline-page-ux-missing',
      message: 'Offline page should expose network status and a retry action.',
      file: path.relative(repoRoot, offlinePagePath).replace(/\\/g, '/'),
    })
  }

  return { issues, checks }
}
