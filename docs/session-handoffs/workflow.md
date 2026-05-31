# Session Workflow

## Default process

1. Inspect repository state.
   ```bash
   git status -sb
   git log --oneline -8
   ```
2. Read the latest relevant handoff in `docs/session-handoffs/`.
3. Confirm the applicable requirements/spec/design documents.
4. Update or create `tasks.md` before implementation when task scope is not already locked.
5. Implement the smallest safe slice.
6. Run targeted tests for the changed behavior.
7. Run `npm run type-check` for code changes.
8. Run `npm run build` when the change can affect runtime integration, routing, Next.js config, assets, or data loading.
9. Finish Git/PR flow using repository conventions.

## Reference documents

### Git / PR / commit references

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Branch and PR flow: `docs/git-workflow.md`
- Commit type rules: `docs/commit-convention.md`
- Commitlint config: `commitlint.config.mjs`
- Commit hook: `.husky/commit-msg`
- If a Git template file is added under `.git` or configured through Git settings, read it before writing Git text.

### Spec / task authoring references

- Full requirements/design/tasks example:
  - `.kiro/specs/39-landing-social-proof-real-data/requirements.md`
  - `.kiro/specs/39-landing-social-proof-real-data/design.md`
  - `.kiro/specs/39-landing-social-proof-real-data/tasks.md`
- Recent requirements/tasks examples:
  - `.kiro/specs/42-security-abuse-prevention/requirements.md`
  - `.kiro/specs/42-security-abuse-prevention/tasks.md`
  - `.kiro/specs/43-observability-ops-tools/requirements.md`
  - `.kiro/specs/43-observability-ops-tools/tasks.md`
  - `.kiro/specs/44-deployment-readiness/requirements.md`
  - `.kiro/specs/44-deployment-readiness/tasks.md`

### Session continuation references

- Older long-session handoff: `docs/agent-session-handoff.md`
- Specs 41-44 planning history: `docs/2026-05-24-specs-41-44-task-plan.md`
- Spec 43 operations runbook: `docs/2026-05-25-spec43-ops-runbook.md`
- Spec audit memo: `docs/2026-05-26-kiro-spec-audit.md`

## Git flow

1. Create or confirm the issue.
2. Create an issue-numbered branch, for example `enhancement/{issue}--{slug}`.
3. Implement and verify.
4. Commit with a repository-valid conventional type.
5. Open a PR using the repository template.
6. Merge after checks/review requirements are satisfied.
7. Sync `develop`.
8. Delete merged local/remote feature branches when appropriate.

## Commit guidance

- Follow `docs/commit-convention.md`.
- Keep the first line concise and conventional, for example `docs: update session handoff`.
- Include Lore-style trailers when they add useful decision context.
- Expect commit hooks and commitlint to re-check the final message.

## Verification preference

1. Targeted tests for changed behavior.
2. `npm run type-check` for code changes.
3. `npm run build` for integration-sensitive changes.
4. Documentation-only changes may use Prettier plus manual review when runtime behavior is untouched.

## Session hygiene

- If the session creates continuation risk, update a dated handoff before ending.
- Keep dated handoffs factual and concise.
- Do not copy full logs or full instruction files into handoffs.
- The next session should start by reading this directory and checking Git state.
