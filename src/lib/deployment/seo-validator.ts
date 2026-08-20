import fs from 'fs'
import path from 'path'
import { ValidationIssue } from './types'

export interface SeoValidationResult {
  issues: ValidationIssue[]
  checks: {
    hasRobots: boolean
    hasSitemap: boolean
    hasRootMetadataTitle: boolean
    hasRootMetadataDescription: boolean
    hasRootOpenGraph: boolean
    hasRootTwitter: boolean
    hasCanonical: boolean
    hasAbsoluteOgImages: boolean
  }
}

function fileContains(filePath: string, fragments: string[]): boolean {
  const source = fs.readFileSync(filePath, 'utf8')
  return fragments.every((fragment) => source.includes(fragment))
}

export function validateSeoMetadata(options?: {
  repoRoot?: string
  layoutPath?: string
  robotsPath?: string
  sitemapPath?: string
  metadataUtilPath?: string
}): SeoValidationResult {
  const repoRoot = options?.repoRoot ?? process.cwd()
  const layoutPath =
    options?.layoutPath ?? path.join(repoRoot, 'src', 'app', 'layout.tsx')
  const robotsPath =
    options?.robotsPath ?? path.join(repoRoot, 'src', 'app', 'robots.ts')
  const sitemapPath =
    options?.sitemapPath ?? path.join(repoRoot, 'src', 'app', 'sitemap.ts')
  const metadataUtilPath =
    options?.metadataUtilPath ??
    path.join(repoRoot, 'src', 'lib', 'seo', 'metadata.ts')

  const layoutSource = fs.readFileSync(layoutPath, 'utf8')
  const metadataUtilSource = fs.readFileSync(metadataUtilPath, 'utf8')

  const checks = {
    hasRobots:
      fs.existsSync(robotsPath) &&
      fileContains(robotsPath, ['sitemap', 'disallow']),
    hasSitemap:
      fs.existsSync(sitemapPath) &&
      fileContains(sitemapPath, [
        'getStaticPages',
        '/spots/',
        '/routes/',
        '/community/',
      ]),
    hasRootMetadataTitle: layoutSource.includes('title:'),
    hasRootMetadataDescription: layoutSource.includes('description:'),
    hasRootOpenGraph: layoutSource.includes('openGraph:'),
    hasRootTwitter: layoutSource.includes('twitter:'),
    hasCanonical:
      layoutSource.includes('alternates:') ||
      metadataUtilSource.includes('alternates:'),
    hasAbsoluteOgImages:
      (layoutSource.includes('getDefaultOgImage') ||
        layoutSource.includes('`${baseUrl}/api/og?type=default`')) &&
      metadataUtilSource.includes(
        '`${baseUrl}/api/og?type=spot&id=${spot.id}`'
      ) &&
      metadataUtilSource.includes('PRODUCTION_BASE_URL') &&
      metadataUtilSource.includes('isLocalUrl'),
  }

  const issues: ValidationIssue[] = []

  if (!checks.hasCanonical) {
    issues.push({
      level: 'warning',
      code: 'seo.canonical-missing',
      message:
        'Canonical metadata is missing from the root layout or shared metadata helpers.',
      file: path.relative(repoRoot, layoutPath).replace(/\\/g, '/'),
      suggestion:
        'Add alternates.canonical so pages emit stable canonical URLs.',
    })
  }

  if (!checks.hasAbsoluteOgImages) {
    issues.push({
      level: 'warning',
      code: 'seo.absolute-og-image-missing',
      message:
        'Open Graph images do not appear to use absolute URLs everywhere.',
      file: path.relative(repoRoot, metadataUtilPath).replace(/\\/g, '/'),
      suggestion: 'Use baseUrl-derived absolute OG image URLs.',
    })
  }

  if (!checks.hasRobots || !checks.hasSitemap) {
    issues.push({
      level: 'error',
      code: 'seo.core-files-missing',
      message:
        'robots.ts and sitemap.ts must both exist and include production rules/routes.',
      file: 'src/app',
    })
  }

  return { issues, checks }
}
