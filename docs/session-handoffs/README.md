# Session Handoffs

This directory is the manual handoff surface for closing one agent session and starting the next.

Use it when you are about to close Codex/OMX and want the next session to continue without reconstructing context from chat history.

## When to write a handoff

Write or update a handoff when any of these are true:

- More than one commit or one feature slice was completed.
- There are unmerged changes, PR follow-ups, or known verification gaps.
- The next session must preserve a decision, constraint, or risk.
- The session included environment/process discoveries that are not obvious from code.

Skip a handoff for trivial, fully committed one-line fixes where `git log -1` is enough.

## Handoff process

1. Inspect repository state.

   ```bash
   git status -sb
   git log --oneline -8
   git diff --stat
   ```

2. Confirm required process references before any Git/PR text.

   - `.github/PULL_REQUEST_TEMPLATE.md`
   - `docs/commit-convention.md`
   - `docs/git-workflow.md`
   - `AGENTS.md`

3. Create a new file from `_template.md`.

   Naming convention:

   ```text
   YYYY-MM-DD-short-topic.md
   ```

4. Record only continuation-critical facts.

   Include:

   - branch and working-tree status
   - latest commits and what each means
   - completed behavior, not just changed files
   - verification commands and outcomes
   - known constraints and rejected approaches
   - next recommended commands/actions

   Exclude:

   - full console logs
   - full AGENTS.md copies
   - exhaustive file lists when commits already encode the work
   - speculation that the next agent cannot verify

5. If there are uncommitted user-authored changes, call them out explicitly and do not hide them inside your own summary.

6. Before final response, state the handoff file path and whether the working tree is clean.

## Minimum acceptable handoff

A valid handoff must let the next agent answer these questions in under one minute:

1. What branch and commit am I on?
2. What changed and why?
3. What has already been verified?
4. What must not be changed/re-litigated?
5. What is the safest next action?
