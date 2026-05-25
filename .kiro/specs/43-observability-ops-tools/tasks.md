# Implementation Plan: Observability and Ops Tools

## Overview

Spec 43 covers six operations-facing areas:

1. Sentry alert forwarding into Slack/Discord
2. Admin audit logging and audit log query API
3. Expanded ops dashboard metrics
4. MongoDB backup and restore scripts
5. Migration runner with history and dry-run support
6. Public health endpoint for app and MongoDB status

This task document is written from the current implementation state. Items that are already implemented in code are marked complete, and remaining hardening/testing work is tracked as pending follow-up.

## Tasks

- [x] 1. Sentry alert forwarding foundation
  - [x] 1.1 Add alert delivery module
    - `src/lib/ops/alerting.ts`
    - Slack webhook delivery
    - Discord webhook delivery
    - 3 retry attempts
    - repeated fingerprint escalation after 10+ delivered alerts in 1 hour
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 1.2 Add Sentry webhook ingestion route
    - `src/app/api/ops/sentry-alert/route.ts`
    - optional `SENTRY_WEBHOOK_SECRET` validation
    - forwards title, fingerprint, Sentry URL into alerting module
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 1.3 Harden webhook payload parsing and failure logging
    - include affected-user count when present in webhook payload
    - log webhook delivery failures after retry exhaustion
    - _Requirements: 1.2, 1.5_
  - [x] 1.4 Add alert route tests
    - secret validation
    - payload parsing
    - delivered/escalated response shape
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 2. Admin audit log foundation
  - [x] 2.1 Add audit log record builder and logger
    - `src/lib/audit-log.ts`
    - captures admin id/name, action type, resource type/id, changes, IP, timestamp
    - _Requirements: 2.1, 2.2, 2.6_
  - [x] 2.2 Add admin audit log query API
    - `src/app/api/admin/audit-logs/route.ts`
    - admin-only access
    - pagination
    - action/admin/date-range filters
    - _Requirements: 2.3, 2.4_
  - [x] 2.3 Enforce 90-day retention at storage level
    - add TTL index on `expiresAt` for `audit_logs`
    - _Requirements: 2.5_
  - [x] 2.4 Add retention/index test coverage
    - verify audit logger requests TTL index creation
    - _Requirements: 2.5_

- [x] 3. Ops dashboard expansion
  - [x] 3.1 Add dashboard aggregation module
    - `src/lib/ops/dashboard.ts`
    - pending review counts
    - today DAU
    - today total check-ins
    - today new users
    - today new spots
    - 7-day DAU trend
    - 7-day check-in trend
    - tracked 24h API 5xx rate
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  - [x] 3.2 Add admin dashboard summary route
    - `src/app/api/admin/dashboard/summary/route.ts`
    - admin-only access
    - _Requirements: 3.1, 3.5_
  - [x] 3.3 Add focused dashboard aggregation tests
    - verify response shape for summary/trend fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. MongoDB backup and restore scripts
  - [x] 4.1 Add backup script
    - `scripts/backup-mongodb.mjs`
    - `mongodump --archive --gzip`
    - timestamped filename
    - archive integrity check
    - retain last 7 days
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7_
  - [x] 4.2 Add restore script
    - `scripts/restore-mongodb.mjs`
    - accepts archive path and target database
    - `mongorestore --archive --gzip`
    - _Requirements: 4.4, 4.5, 4.7_

- [x] 5. Migration runner and runbook
  - [x] 5.1 Add migration runner
    - `scripts/run-migration.mjs`
    - versioned script tracking
    - dry-run support
    - before/after counts for targeted collection
    - duplicate execution prevention for successful migrations
    - history persisted to `migrations`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [x] 5.2 Add ops runbook document
    - `docs/2026-05-25-spec43-ops-runbook.md`
    - backup/restore usage
    - migration runner usage
    - alerting notes
    - dashboard notes
    - _Requirements: 5.1, 5.6_

- [x] 6. Health endpoint
  - [x] 6.1 Add health status builder
    - `src/lib/health.ts`
    - overall status
    - MongoDB status
    - response time
    - server time
    - app version
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7_
  - [x] 6.2 Add public health route
    - `src/app/api/health/route.ts`
    - unauthenticated access
    - HTTP 200/503 based on DB reachability
    - _Requirements: 6.1, 6.3, 6.4, 6.5_
  - [x] 6.3 Add health route tests
    - `src/app/api/health/__tests__/route.test.ts`
    - _Requirements: 6.1, 6.3, 6.4_

- [x] 7. Verification checkpoint
  - run targeted observability/ops tests
  - run `npm run type-check`
  - update this task file based on verified completion

## Notes

- This spec already had a substantial partial implementation before this task document was written.
- The remaining work is mostly hardening and test-completion, not greenfield implementation.
- Spec 41 appears effectively implemented from code inspection.
- Spec 42 still has unclosed gaps (notably advanced auth-session anomaly detection and some abuse-prevention coverage), so it should not yet be treated as fully complete.
