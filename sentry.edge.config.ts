// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

import { getSentryConfig, isSentryEnabled } from '@/lib/sentry'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
const env = process.env.NODE_ENV ?? 'development'
const config = getSentryConfig(env)

if (isSentryEnabled(dsn)) {
  Sentry.init({
    dsn,
    environment: env,
    tracesSampleRate: config.tracesSampleRate,
    enableLogs: true,
  })
}
