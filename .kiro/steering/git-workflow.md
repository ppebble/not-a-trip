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

## 🚨 PR body 작성 규칙 (필수)

`mcp_github_create_pull_request`의 `body` 파라미터에서 **`\\n` 이스케이프 시퀀스를 사용하지 않는다.**
실제 줄바꿈(multi-line string)을 사용해야 GitHub에서 마크다운이 정상 렌더링된다.

```
# ❌ 잘못된 예시 (\\n이 텍스트로 출력됨)
body: "## 변경 사항\\n\\n- 항목 1\\n- 항목 2"

# ✅ 올바른 예시 (실제 줄바꿈 사용)
body: "## 변경 사항

- 항목 1
- 항목 2"
```

PR body는 반드시 `.github/PULL_REQUEST_TEMPLATE.md` 섹션 구조를 따르되, 실제 줄바꿈으로 작성한다.

## MCP Agent Worker (AI 에이전트 도구)

단순 반복 작업은 MCP agent-worker 서버로 위임한다 (Gemini API 직접 호출):

- `mcp_agent_worker_bulk_replace` — 대규모 문자열 치환/리팩토링
- `mcp_agent_worker_lint_fix` — ESLint 에러 분석 및 일괄 수정
- `mcp_agent_worker_generate_docs` — 문서 생성 (changelog, commit-summary, pr-description)
- `mcp_agent_worker_ask_agent` — 자유 프롬프트로 코드 작업 위임

> 기존 gemini-cli hook은 deprecated. agent-worker MCP 도구를 우선 사용.
