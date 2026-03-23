// This file configures the initialization of Sentry on the client.
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
    sampleRate: config.sampleRate,
    tracesSampleRate: config.tracesSampleRate,
    replaysSessionSampleRate: config.replaysSessionSampleRate,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
    integrations: [Sentry.replayIntegration()],
    enableLogs: true,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
