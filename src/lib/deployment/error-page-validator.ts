import fs from 'fs'
import path from 'path'
import { ValidationIssue } from './types'

export interface ErrorPageValidationResult {
  issues: ValidationIssue[]
  checks: {
    hasCustomNotFoundPage: boolean
    hasGlobalErrorBoundary: boolean
    hasRetryAction: boolean
    hasGoHomeAction: boolean
    hasOfflineFallbackPage: boolean
    offlinePageShowsNetworkStatus: boolean
    sentryCapturesUrlContext: boolean
  }
}

function safeRead(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
}

export function validateErrorPages(options?: {
  repoRoot?: string
  notFoundPath?: string
  globalErrorPath?: string
  offlinePagePath?: string
}): ErrorPageValidationResult {
  const repoRoot = options?.repoRoot ?? process.cwd()
  const notFoundPath =
    options?.notFoundPath ?? path.join(repoRoot, 'src', 'app', 'not-found.tsx')
  const globalErrorPath =
    options?.globalErrorPath ??
    path.join(repoRoot, 'src', 'app', 'global-error.tsx')
  const offlinePagePath =
    options?.offlinePagePath ??
    path.join(repoRoot, 'src', 'app', 'offline', 'page.tsx')

  const notFoundSource = safeRead(notFoundPath)
  const globalErrorSource = safeRead(globalErrorPath)
  const offlineSource = safeRead(offlinePagePath)

  const checks = {
    hasCustomNotFoundPage: Boolean(notFoundSource),
    hasGlobalErrorBoundary: globalErrorSource.includes(
      'Sentry.captureException'
    ),
    hasRetryAction: globalErrorSource.includes('reset()'),
    hasGoHomeAction:
      globalErrorSource.includes('href="/"') ||
      globalErrorSource.includes("router.push('/')"),
    hasOfflineFallbackPage: Boolean(offlineSource),
    offlinePageShowsNetworkStatus:
      offlineSource.includes('navigator.onLine') &&
      offlineSource.includes("window.addEventListener('online'"),
    sentryCapturesUrlContext:
      globalErrorSource.includes('window.location.href') &&
      globalErrorSource.includes('Sentry.withScope'),
  }

  const issues: ValidationIssue[] = []

  if (!checks.hasCustomNotFoundPage) {
    issues.push({
      level: 'error',
      code: 'error.not-found-missing',
      message: 'Custom 404 page is missing.',
      file: 'src/app/not-found.tsx',
    })
  }

  if (!checks.hasGoHomeAction) {
    issues.push({
      level: 'warning',
      code: 'error.go-home-missing',
      message: 'Error UI should provide a path back to the home page.',
      file: path.relative(repoRoot, globalErrorPath).replace(/\\/g, '/'),
    })
  }

  if (!checks.sentryCapturesUrlContext) {
    issues.push({
      level: 'warning',
      code: 'error.sentry-context-missing',
      message:
        'Global error reporting should include URL context when sending to Sentry.',
      file: path.relative(repoRoot, globalErrorPath).replace(/\\/g, '/'),
    })
  }

  return { issues, checks }
}
