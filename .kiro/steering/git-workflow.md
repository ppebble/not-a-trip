---
inclusion: always
---

# Git 워크플로우

**모든 작업은 한글로 작성한다.**

## MCP GitHub 도구

GitHub Issue, PR, 머지는 MCP 도구로 직접 수행한다.

- **리포지토리**: owner=`ppebble`, repo=`not-a-trip`
- `mcp_github_create_issue` — Issue 생성
- `mcp_github_create_pull_request` — PR 생성
- `mcp_github_merge_pull_request` — PR 머지 (squash)
- `mcp_github_get_issue`, `mcp_github_list_pull_requests` — 조회

Issue body는 `.github/ISSUE_TEMPLATE/` 형식, PR body는 `.github/PULL_REQUEST_TEMPLATE.md` 형식 참고.

## Kiro Agent Hooks (폴백)

MCP 사용 불가 시에만 gemini-cli 폴백 사용:

- `create-issue-via-gemini-cli` — Issue 생성
- `create-pr-via-gemini-cli` — PR 생성
- `generate-pr-description-via-gemini-cli` — PR 설명 생성
- `bulk-replace-via-gemini-cli` — 대규모 문자열 치환
- `lint-fix-via-gemini-cli` — ESLint 에러 일괄 수정
