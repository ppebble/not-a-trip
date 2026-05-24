import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { ValidationIssue } from './types'

interface RouteBundleReport {
  route: string
  files: string[]
  gzipBytes: number
}

export interface BuildAnalysisResult {
  routes: RouteBundleReport[]
  issues: ValidationIssue[]
  sharedChunks: string[]
  dynamicImportCount: number
}

const PAGE_BUNDLE_WARNING_BYTES = 200 * 1024

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function gzipSize(filePath: string): number {
  const content = fs.readFileSync(filePath)
  return zlib.gzipSync(content).byteLength
}

function countDynamicImports(sourceRoot: string): number {
  const stack = [sourceRoot]
  let count = 0

  while (stack.length > 0) {
    const currentDir = stack.pop()!

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (entry.name === '.next' || entry.name === 'node_modules') {
        continue
      }

      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }

      if (!['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(entry.name))) {
        continue
      }

      const source = fs.readFileSync(fullPath, 'utf8')
      count += (source.match(/\b(dynamic\s*\(|import\s*\()/g) ?? []).length
    }
  }

  return count
}

export function analyzeNextBuild(options?: {
  repoRoot?: string
  buildDir?: string
  sourceRoot?: string
  pageBudgetBytes?: number
}): BuildAnalysisResult {
  const repoRoot = options?.repoRoot ?? process.cwd()
  const buildDir = options?.buildDir ?? path.join(repoRoot, '.next')
  const sourceRoot = options?.sourceRoot ?? path.join(repoRoot, 'src')
  const pageBudgetBytes = options?.pageBudgetBytes ?? PAGE_BUNDLE_WARNING_BYTES
  const buildManifestPath = path.join(buildDir, 'build-manifest.json')

  if (!fs.existsSync(buildManifestPath)) {
    return {
      routes: [],
      sharedChunks: [],
      dynamicImportCount: countDynamicImports(sourceRoot),
      issues: [
        {
          level: 'warning',
          code: 'build.missing-manifest',
          message:
            'Next.js build manifest is missing. Run `next build` before analyzing production bundles.',
          file: '.next/build-manifest.json',
        },
      ],
    }
  }

  const manifest = readJson<{
    pages: Record<string, string[]>
    lowPriorityFiles?: string[]
  }>(buildManifestPath)

  const routes: RouteBundleReport[] = []
  const issues: ValidationIssue[] = []
  const chunkUsage = new Map<string, number>()

  for (const [route, files] of Object.entries(manifest.pages)) {
    const jsFiles = files.filter((file) => file.endsWith('.js'))

    let gzipBytes = 0

    for (const file of jsFiles) {
      chunkUsage.set(file, (chunkUsage.get(file) ?? 0) + 1)
      const fullPath = path.join(buildDir, file)

      if (fs.existsSync(fullPath)) {
        gzipBytes += gzipSize(fullPath)
      }
    }

    routes.push({ route, files: jsFiles, gzipBytes })

    if (gzipBytes > pageBudgetBytes) {
      issues.push({
        level: 'warning',
        code: 'build.route-over-budget',
        message: `Route bundle exceeds ${pageBudgetBytes} byte gzip budget: ${route} (${gzipBytes} bytes)`,
        suggestion:
          'Push more code behind dynamic imports or reduce shared client dependencies.',
      })
    }
  }

  const sharedChunks = [...chunkUsage.entries()]
    .filter(([, count]) => count > 1)
    .map(([chunk]) => chunk)
    .sort()

  return {
    routes: routes.sort((a, b) => b.gzipBytes - a.gzipBytes),
    issues,
    sharedChunks,
    dynamicImportCount: countDynamicImports(sourceRoot),
  }
}
