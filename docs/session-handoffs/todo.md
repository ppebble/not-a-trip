# Next Session Todo

## Immediate next work

- Reconfirm the latest product priority before starting implementation.
- If continuing content/data work:
  1. Read the latest dated handoff.
  2. Run the relevant validators before editing data.
  3. Preserve source-grounded media and route constraints.
- If continuing spec work:
  1. Confirm the related `requirements.md` exists.
  2. Add or update `design.md` only when the feature needs architectural decisions.
  3. Add or update `tasks.md` before implementation.
  4. Implement against the task checklist.
  5. Verify with targeted tests first, then type-check/build as needed.

## Rules for continuation

- Do not duplicate implementation for a spec already verified complete; audit status first.
- Do not stage unrelated user-authored working-tree changes silently.
- Start Git work from an issue/branch that matches `docs/git-workflow.md` unless the current task is a merge/recovery operation.
- Prefer dated handoff files for historical facts; use this file only for the current queue.

## Candidate starting points

- Audit remaining specs that lack `tasks.md`.
- Continue route/media validation work if new destination data is added.
- Clean up stale handoff/status wording when Git history proves it is obsolete.
