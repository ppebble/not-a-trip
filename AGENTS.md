# AGENTS.md

This repository has explicit Git and PR writing conventions. Codex must read and follow them before creating commits, commit messages, PR titles, or PR bodies.

## Required References

Review these files before writing Git-related text:

1. `.github/PULL_REQUEST_TEMPLATE.md`
2. `docs/commit-convention.md`
3. `docs/git-workflow.md`

If a Git template file is later added under `.git` or configured through Git settings, treat that template as an additional required reference.

## PR Writing Rules

- Use the section order and checklist structure from `.github/PULL_REQUEST_TEMPLATE.md`.
- Do not replace the template with a free-form summary.
- Fill every relevant section with concrete content based on the actual change.
- Keep unchecked boxes only when the work was not performed.

## Commit Message Rules

- Follow `docs/commit-convention.md`.
- Match the repository's commit type conventions exactly.
- Do not invent a different commit or PR format.

## Workflow Expectation

- Before opening a PR, confirm the branch name, commit message style, and PR body format all align with the repository documentation.
- When uncertain, prefer the repository template and docs over default Codex habits.
