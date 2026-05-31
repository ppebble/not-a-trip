# Session Handoffs

This directory is the manual handoff surface for closing one agent session and starting the next. It also keeps lightweight continuation notes from the older handoff workflow.

Use it when Codex/OMX work must continue in a later session without reconstructing context from chat history.

## Directory map

- `_template.md` — template for a dated session handoff file.
- `YYYY-MM-DD-short-topic.md` — concrete session handoff records.
- `status.md` — rolling snapshot of the current branch/workstream state.
- `workflow.md` — repeatable continuation workflow and reference documents.
- `todo.md` — candidate next-session tasks.

## Agent invocation contract

When the user says any of the following, the agent must execute this document as a runbook:

- "handoff 작업을 시작해"
- "handoff process 시작"
- "다음 세션 인수인계 작성해"
- "세션 종료용 handoff 만들어"

This is a **manual user-triggered process**, not an automatic hook. Do not run it merely because a session is long. Run it when the user asks for handoff, or when project instructions explicitly require handoff before ending a substantial session.

Expected agent behavior after invocation:

1. Inspect current repo state and recent work using the commands below.
2. Create or update one handoff file under this directory.
3. Record continuation-critical facts only.
4. If the handoff itself changes files, commit it unless the user explicitly says not to commit.
5. Report the handoff file path, commit SHA if committed, and final working-tree state.

Do not ask whether to proceed unless there are destructive or ambiguous choices. The safe default is to create a new dated handoff file.

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
   git diff --name-only
   ```

2. Confirm required process references before any Git/PR text.

   - `.github/PULL_REQUEST_TEMPLATE.md`
   - `docs/commit-convention.md`
   - `docs/git-workflow.md`
   - `AGENTS.md`

3. Decide whether to create or update a handoff file.

   - If there is no handoff for the current workstream/date, create a new file from `_template.md`.
   - If a same-day handoff already exists for the same workstream, update it.
   - If in doubt, create a new file and cross-reference the previous one.

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

5. Capture ownership of uncommitted changes.

   - Separate user-authored changes from agent-authored changes when possible.
   - If unsure who authored a change, mark it as "unattributed working-tree change".
   - Do not stage unrelated user-authored changes silently.

6. Verification for the handoff itself.

   - Run `npx prettier --write docs/session-handoffs/<file>.md` when practical.
   - If only docs changed, runtime tests are not required.
   - If code changed since the last verified state, record which tests were already run and which should be run next.

7. Commit behavior.

   - Commit the handoff docs if they are the agent's own changes.
   - Use a docs commit, for example:

     ```bash
     git add docs/session-handoffs/<file>.md
     git commit -m "docs: update session handoff"
     ```

   - Follow repository commit rules and include Lore-style trailers when useful.

8. Before final response, state:

   - handoff file path
   - whether it was committed
   - final `git status -sb`
   - safest next action for the next session

## Minimum acceptable handoff

A valid handoff must let the next agent answer these questions in under one minute:

1. What branch and commit am I on?
2. What changed and why?
3. What has already been verified?
4. What must not be changed/re-litigated?
5. What is the safest next action?

## Quality bar

The handoff is incomplete if it only says "work completed." It must preserve the operational state required for the next agent to continue safely:

- exact branch
- exact latest commits
- pending files
- verification status
- constraints not to violate
- next commands/actions
