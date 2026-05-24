import fs from 'fs'
import path from 'path'
import { ValidationIssue } from './types'

export interface PerformanceAuditResult {
  issues: ValidationIssue[]
  checks: {
    fontDisplaySwapEnabled: boolean
    mapViewsUseDynamicImport: boolean
    imageComponentsAvoidExcessPriority: boolean
  }
}

export function auditPerformanceHeuristics(options?: {
  repoRoot?: string
  layoutPath?: string
  mapPagePath?: string
  routeDetailPath?: string
}): PerformanceAuditResult {
  const repoRoot = options?.repoRoot ?? process.cwd()
  const layoutPath =
    options?.layoutPath ?? path.join(repoRoot, 'src', 'app', 'layout.tsx')
  const mapPagePath =
    options?.mapPagePath ??
    path.join(repoRoot, 'src', 'app', '(main)', 'map', 'page.tsx')
  const routeDetailPath =
    options?.routeDetailPath ??
    path.join(repoRoot, 'src', 'components', 'route', 'RouteDetailContent.tsx')

  const layoutSource = fs.readFileSync(layoutPath, 'utf8')
  const mapPageSource = fs.readFileSync(mapPagePath, 'utf8')
  const routeDetailSource = fs.readFileSync(routeDetailPath, 'utf8')

  const checks = {
    fontDisplaySwapEnabled: layoutSource.includes("display: 'swap'"),
    mapViewsUseDynamicImport:
      mapPageSource.includes('dynamic(() => import(') &&
      routeDetailSource.includes('dynamic(() => import('),
    imageComponentsAvoidExcessPriority:
      (layoutSource.match(/\bpriority\b/g) ?? []).length <= 1,
  }

  const issues: ValidationIssue[] = []

  if (!checks.fontDisplaySwapEnabled) {
    issues.push({
      level: 'warning',
      code: 'perf.font-display-missing',
      message:
        'Primary local font should use font-display: swap to avoid FOIT.',
      file: path.relative(repoRoot, layoutPath).replace(/\\/g, '/'),
    })
  }

  if (!checks.mapViewsUseDynamicImport) {
    issues.push({
      level: 'warning',
      code: 'perf.map-dynamic-import-missing',
      message: 'Map-heavy views should load Leaflet behind dynamic imports.',
      file: 'src/app/(main)/map/page.tsx',
    })
  }

  return { issues, checks }
}
