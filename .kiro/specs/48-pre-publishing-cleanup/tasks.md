# Spec 48 Tasks - Pre-Publishing Cleanup

## Requirements trace

- Requirement 1: publishing scope and release-blocker classification
- Requirement 2: readable release documents and handoff hygiene
- Requirement 3: placeholder, dummy, and test-only public content cleanup
- Requirement 4: production environment and secret readiness
- Requirement 5: build, type, lint, and test gate
- Requirement 6: public critical path smoke validation
- Requirement 7: data and media integrity gate
- Requirement 8: operational readiness and rollback evidence
- Requirement 9: final launch gate report

## Task checklist

- [x] 1. Lock publishing cleanup scope
  - [x] 1.1 Define public release surface and non-goals
  - [x] 1.2 Classify findings as `blocker`, `must-fix-before-publish`, `defer-with-owner`, or `no-action`
  - [x] 1.3 Prevent unrelated feature expansion during cleanup

- [x] 2. Audit release-critical documentation
  - [x] 2.1 Scan release-critical docs for mojibake or stale instructions
  - [x] 2.2 Reconcile `docs/session-handoffs/*` rolling docs with current Git history
  - [x] 2.3 Preserve dated handoffs unless correcting factual errors

- [x] 3. Audit public placeholder and test-only content
  - [x] 3.1 Scan source, public assets, scripts, and seed data for placeholder/test-only content
  - [x] 3.2 Confirm public navigation does not expose debug or test-only pages
  - [x] 3.3 Classify remaining non-production content by launch risk

- [x] 4. Audit environment and secret readiness
  - [x] 4.1 Compare env usage against `.env.example`
  - [x] 4.2 Confirm no real secrets are committed
  - [x] 4.3 Confirm production URL requirements and local-only values are documented

- [x] 5. Run verification gates
  - [x] 5.1 Run targeted docs/static validation for changed files
  - [x] 5.2 Run `npm run type-check`
  - [x] 5.3 Run `npm run build`
  - [x] 5.4 Run `npm run lint` or record framework/tooling failure and fallback checks

- [x] 6. Validate public critical path readiness
  - [x] 6.1 Identify public critical paths from app routes and navigation
  - [x] 6.2 Confirm build/static generation covers those paths without fatal errors
  - [x] 6.3 Record routes that require live runtime/database smoke testing

- [x] 7. Validate data and media readiness
  - [x] 7.1 Run existing route/media validators where available
  - [x] 7.2 Confirm Next image configuration covers production image hosts
  - [x] 7.3 Record any remaining data/media risks and owners

- [x] 8. Validate operational readiness and rollback path
  - [x] 8.1 Confirm monitoring/deployment validation docs or scripts exist
  - [x] 8.2 Record rollback path for protected-branch PR workflow and hosting deployment
  - [x] 8.3 Classify known warning noise and operational gaps

- [x] 9. Produce launch gate report
  - [x] 9.1 Write `launch-gate-report.md` with status, evidence, deferrals, and next action
  - [x] 9.2 Update this task checklist to reflect completed work
  - [x] 9.3 Format changed docs and verify final Git status
