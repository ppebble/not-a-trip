import fs from 'fs'
import path from 'path'
import { ValidationIssue } from './types'

const URL_HOST_PATTERN = /https?:\/\/([^/\s'"`]+)/g
const REMOTE_HOST_PATTERN = /hostname:\s*['"]([^'"]+)['"]/g

const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  'coverage',
  'node_modules',
  'public',
])

const PLACEHOLDER_HOSTS = new Set(['picsum.photos', 'via.placeholder.com'])

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mjs',
  '.cjs',
])

export interface ImageConfigValidationResult {
  configuredHosts: string[]
  referencedHosts: string[]
  issues: ValidationIssue[]
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

      if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(fullPath)
      }
    }
  }

  walk(rootDir)
  return files
}

function toRepoRelative(repoRoot: string, targetPath: string): string {
  return path.relative(repoRoot, targetPath).replace(/\\/g, '/')
}

function extractConfiguredHosts(configSource: string): string[] {
  const hosts = new Set<string>()

  for (const match of configSource.matchAll(REMOTE_HOST_PATTERN)) {
    hosts.add(match[1])
  }

  return [...hosts].sort()
}

function extractReferencedHosts(fileContent: string): string[] {
  const hosts = new Set<string>()

  for (const match of fileContent.matchAll(URL_HOST_PATTERN)) {
    hosts.add(match[1])
  }

  return [...hosts]
}

export function validateImageRemotePatterns(options?: {
  repoRoot?: string
  nextConfigPath?: string
}): ImageConfigValidationResult {
  const repoRoot = options?.repoRoot ?? process.cwd()
  const nextConfigPath =
    options?.nextConfigPath ?? path.join(repoRoot, 'next.config.ts')
  const nextConfigSource = fs.readFileSync(nextConfigPath, 'utf8')

  const configuredHosts = extractConfiguredHosts(nextConfigSource)
  const referencedHosts = new Set<string>()
  const referencedByHost = new Map<string, Set<string>>()

  for (const filePath of walkFiles(repoRoot)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const hosts = extractReferencedHosts(content)

    for (const host of hosts) {
      referencedHosts.add(host)

      if (!referencedByHost.has(host)) {
        referencedByHost.set(host, new Set<string>())
      }

      referencedByHost.get(host)!.add(toRepoRelative(repoRoot, filePath))
    }
  }

  const issues: ValidationIssue[] = []

  for (const host of configuredHosts) {
    if (PLACEHOLDER_HOSTS.has(host)) {
      issues.push({
        level: 'warning',
        code: 'image.placeholder-host',
        message: `Placeholder/test image host is still configured: ${host}`,
        file: toRepoRelative(repoRoot, nextConfigPath),
        suggestion:
          'Remove it from production remotePatterns once seed/test data no longer depends on it.',
      })
    }

    if (host === 'localhost') {
      issues.push({
        level: 'warning',
        code: 'image.localhost-host',
        message: 'Localhost image host remains in production image config.',
        file: toRepoRelative(repoRoot, nextConfigPath),
        suggestion: 'Prefer CDN or storage public domains for uploaded assets.',
      })
    }

    if (!referencedHosts.has(host)) {
      issues.push({
        level: 'warning',
        code: 'image.unused-host',
        message: `Configured image host is not referenced anywhere in the repository: ${host}`,
        file: toRepoRelative(repoRoot, nextConfigPath),
        suggestion: 'Remove unused hosts to narrow the image allowlist.',
      })
    }
  }

  for (const host of referencedHosts) {
    if (!configuredHosts.includes(host) && !host.endsWith('.r2.dev')) {
      issues.push({
        level: 'warning',
        code: 'image.unconfigured-host',
        message: `Referenced image host is not explicitly configured in next.config.ts: ${host}`,
        file: [...(referencedByHost.get(host) ?? [])][0],
        suggestion:
          'Add the host to remotePatterns or replace it with an approved domain.',
      })
    }
  }

  return {
    configuredHosts,
    referencedHosts: [...referencedHosts].sort(),
    issues,
  }
}
