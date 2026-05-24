# Agent Session Handoff

## Purpose
- This file exists so future Codex/Kiro-style sessions can recover the working agreement and continue without relying on transient chat memory.

## Current planning source of truth
- Requirements source:
  - `.kiro/specs/41-upload-storage-migration/requirements.md`
  - `.kiro/specs/42-security-abuse-prevention/requirements.md`
  - `.kiro/specs/43-observability-ops-tools/requirements.md`
  - `.kiro/specs/44-deployment-readiness/requirements.md`
- Execution task plan:
  - `docs/2026-05-24-specs-41-44-task-plan.md`

## Expected delivery flow
1. Review the relevant requirements docs.
2. Update the task plan before implementation when scope changes.
3. Implement the next checked-in slice from the task plan.
4. Verify with targeted tests first, then broader repo checks when practical.
5. Follow repository Git/PR conventions before branch, commit, PR, and merge work.

## Git / PR workflow to remember
- Base branch for normal work: `develop`
- Production branch: `main`
- Branch naming pattern:
  - `feat/{issue}--{slug}`
  - `fix/{issue}--{slug}`
  - `ui/{issue}--{slug}`
  - `enhancement/{issue}--{slug}`
  - `chore/{issue}--{slug}`
  - `refactor/{issue}--{slug}`
  - `hotfix/{issue}--{slug}`
- Required Git/PR references before writing Git text:
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `docs/commit-convention.md`
  - `docs/git-workflow.md`
- PR target for normal development: `develop`

## Commit conventions to remember
- Repository convention: conventional-commit style types such as `feat`, `fix`, `chore`, `refactor`, `style`, `docs`, `test`, `ci`, `build`, `perf`
- Workspace-level Lore protocol also applies when writing final commit messages in Codex-led flows.

## Work already understood from prior sessions
- The agent may be expected to handle the full flow:
  - issue review/authoring
  - branch creation
  - implementation
  - verification
  - PR drafting
  - merge follow-through
- When that full flow is requested again, consult this file plus the task plan first.

## Current implementation checkpoint
- 2026-05-24 planning direction:
  - Use specs 41~44 as the backlog.
  - Start with the smallest high-value shared foundation from specs 43~44.
  - Current issue/branch:
    - Issue: `#837` - `Add specs 43-44 ops readiness foundation`
    - Branch: `feat/837--ops-readiness-foundation`
  - Completed implementation slices:
    - health endpoint + deployment env readiness validator
    - audit log foundation + admin audit log API + admin mutation hooks
