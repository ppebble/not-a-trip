# Spec 43 Ops Runbook

## Scope
- alert webhook foundation
- admin ops dashboard metrics
- MongoDB backup / restore
- migration runner with history and dry-run

## Backup
### Create backup
```bash
npm run backup:db
```

- Uses `mongodump --archive --gzip`
- Output directory defaults to `backups/`
- Keeps the most recent 7 days of archives
- Fails if the archive is missing or empty

## Restore
### Restore into a target database
```bash
npm run restore:db -- backups/mongodb-backup-2026-05-25T00-00-00-000Z.archive.gz not-a-trip-restore
```

- Requires an archive path and target database name
- Uses `mongorestore --archive --gzip`

## Migration runner
### Run a migration
```bash
node scripts/run-migration.mjs scripts/migrate-user-roles.ts
```

### Dry-run a migration
```bash
node scripts/run-migration.mjs scripts/migrate-user-roles.ts --dry-run --collection users
```

### Behavior
- derives database name from `.env.local`
- skips already successful migrations unless dry-run is used
- stores history in MongoDB `migrations` collection
- records:
  - script name
  - target collection
  - dry-run flag
  - start/end timestamps
  - success/failure
  - before/after document counts when `--collection` is supplied

## Alert webhook foundation
- `src/lib/ops/alerting.ts` supports:
  - Slack webhook delivery
  - Discord webhook delivery
  - 3 retry attempts
  - escalation when the same fingerprint is delivered 10+ times within 1 hour
- Sentry can POST into:
  - `POST /api/ops/sentry-alert`
- optional secret validation:
  - set `SENTRY_WEBHOOK_SECRET`
  - send the same value in `x-sentry-webhook-secret`
- required env for delivery:
  - `SLACK_WEBHOOK_URL`
  - `DISCORD_WEBHOOK_URL`

## Dashboard metrics
- admin summary route now includes:
  - pending review counts
  - today DAU
  - today check-ins
  - tracked 24h 5xx rate
  - today new users
  - today new spots
  - 7-day DAU trend
  - 7-day check-in trend

## Notes
- tracked 24h 5xx rate is based on request metrics ingested by middleware and explicit 5xx metric writes from key write endpoints.
- if webhook env values are unset, alert delivery is skipped but dashboard/backup tooling still works.
