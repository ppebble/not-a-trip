# Spec 54 Evidence - Launch Content and Runtime Logging Hygiene

## Launch-facing content naming

- Renamed `PROOF_DUMMY_DATA` to `LANDING_PROOF_CARDS` in:
  - `src/components/landing/data/proofData.ts`
  - `src/components/landing/SocialProofSection.tsx`
  - `src/components/landing/__tests__/SocialProofSection.test.ts`
- Displayed content is intentionally unchanged; only the production-facing symbol name changed.

## Fixture naming scan

Command used:

```bash
rg -n "PROOF_DUMMY_DATA|dummy|Dummy|placeholder" src/components/landing src/lib scripts -S
```

Classification:

- Public-facing changed proof data: fixed; no `PROOF_DUMMY_DATA` references remain.
- Internal-only landing fetch guard: `url.includes('dummy')` remains as validation logic for rejecting placeholder URLs.
- Test-only/script-only dummy terms remain isolated to tests, seed scripts, validation scripts, and migration diagnostics.

## Runtime logger strategy

Added `src/lib/runtime-logger.ts`:

- supports `debug`, `info`, `warn`, and `error`
- uses `RUNTIME_LOG_LEVEL` when configured
- defaults to `warn` in production and `info` outside production
- writes structured payloads with normalized `Error` metadata

Initial migration scope:

- `src/lib/db.ts`
- `src/lib/ops/alerting.ts`
- `src/lib/security/security-log.ts`
- `src/lib/spot-quality/lifecycle-manager.ts`
- `src/components/landing/data/fetchShowcaseSpots.ts`

## no-console classification

The lint release warning baseline was regenerated after this migration. Production console warnings decreased from the Spec 53 baseline. Remaining runtime console usage is still tracked by `npm run lint:release` and must not regress.

Logging hygiene status: `partially-fixed` because the logger exists and high-signal migration has started, but API route-wide migration remains deliberate follow-up work.
