import fs from 'fs'
import path from 'path'
import { ValidationIssue } from './types'

const SCANNED_EXTENSIONS = new Set(['.ts', '.tsx'])
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  'coverage',
  'node_modules',
  '__tests__',
])

const CLIENT_SIGNAL_PATTERNS = [
  /\buseState\s*\(/,
  /\buseEffect\s*\(/,
  /\buseLayoutEffect\s*\(/,
  /\buseRef\s*\(/,
  /\buseMemo\s*\(/,
  /\buseCallback\s*\(/,
  /\buseReducer\s*\(/,
  /\bwindow\./,
  /\bdocument\./,
  /\bnavigator\./,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bon[A-Z][A-Za-z]+\s*=/,
  /from ['"]next-themes['"]/,
  /from ['"]zustand['"]/,
]

const CLIENT_ONLY_IMPORT_PATTERNS = [
  /from ['"]leaflet['"]/,
  /from ['"]react-leaflet['"]/,
  /from ['"]leaflet\.markercluster['"]/,
  /from ['"]next-themes['"]/,
  /from ['"]zustand['"]/,
]

export interface SsrCsrBoundaryReport {
  issues: ValidationIssue[]
  clientComponents: string[]
  serverImportViolations: string[]
  simplificationCandidates: string[]
}

function walkFiles(rootDir: string): string[] {
  const files: string[] = []

  function walk(currentDir: string) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue
      }

      const fullPath = path.join(currentDir, entry.name)

      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      if (SCANNED_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(fullPath)
      }
    }
  }

  walk(rootDir)
  return files
}

function isClientComponent(source: string): boolean {
  return source.startsWith("'use client'") || source.startsWith('"use client"')
}

function hasClientSignals(source: string): boolean {
  return CLIENT_SIGNAL_PATTERNS.some((pattern) => pattern.test(source))
}

export function analyzeSsrCsrBoundaries(options?: {
  repoRoot?: string
  sourceRoot?: string
}): SsrCsrBoundaryReport {
  const repoRoot = options?.repoRoot ?? process.cwd()
  const sourceRoot = options?.sourceRoot ?? path.join(repoRoot, 'src')
  const issues: ValidationIssue[] = []
  const clientComponents: string[] = []
  const serverImportViolations: string[] = []
  const simplificationCandidates: string[] = []

  for (const filePath of walkFiles(sourceRoot)) {
    const source = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, '/')

    if (isClientComponent(source)) {
      clientComponents.push(relativePath)

      if (!hasClientSignals(source)) {
        simplificationCandidates.push(relativePath)
        issues.push({
          level: 'warning',
          code: 'boundary.unnecessary-client-component',
          message: `Client component has no obvious browser-only signals and may be convertible to a server component: ${relativePath}`,
          file: relativePath,
          suggestion:
            'Move the client boundary lower if no hooks/browser APIs are needed.',
        })
      }

      continue
    }

    if (CLIENT_ONLY_IMPORT_PATTERNS.some((pattern) => pattern.test(source))) {
      serverImportViolations.push(relativePath)
      issues.push({
        level: 'warning',
        code: 'boundary.server-imports-client-library',
        message: `Server component imports a client-only library directly: ${relativePath}`,
        file: relativePath,
        suggestion:
          'Wrap the dependency in a client component or dynamic import boundary.',
      })
    }
  }

  return {
    issues,
    clientComponents,
    serverImportViolations,
    simplificationCandidates,
  }
}
