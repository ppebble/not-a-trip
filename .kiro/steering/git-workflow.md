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

## MCP Agent Worker (AI 에이전트 도구)

단순 반복 작업은 MCP agent-worker 서버로 위임한다 (Gemini API 직접 호출):

- `mcp_agent_worker_bulk_replace` — 대규모 문자열 치환/리팩토링
- `mcp_agent_worker_lint_fix` — ESLint 에러 분석 및 일괄 수정
- `mcp_agent_worker_generate_docs` — 문서 생성 (changelog, commit-summary, pr-description)
- `mcp_agent_worker_ask_agent` — 자유 프롬프트로 코드 작업 위임

> 기존 gemini-cli hook은 deprecated. agent-worker MCP 도구를 우선 사용.
