---
inclusion: always
priority: 1
---

# Steering 시스템 메타 설정

이 디렉토리의 모든 steering 파일들은 Kiro 실행 시 자동으로 포함됩니다.

## 포함된 가이드라인

1. **project-context.md** - 프로젝트 개요, 기술 스택, 데이터 모델, 폴더 구조
2. **commit-guidelines.md** - 커밋 메시지 작성 필수 규칙
3. **task-execution-rules.md** - Task 실행 필수 프로세스 및 도구 사용 규칙
4. **git-workflow.md** - Git 워크플로우 전체 가이드 (브랜치, PR, Issue)

## 사용 가능한 도구

### MCP GitHub 도구 (Kiro 직접 수행)

- `mcp_github_create_issue` — GitHub Issue 생성
- `mcp_github_create_pull_request` — GitHub PR 생성
- `mcp_github_list_issues` / `mcp_github_get_issue` — Issue 조회
- `mcp_github_list_pull_requests` / `mcp_github_get_pull_request` — PR 조회
- `mcp_github_create_branch` — 브랜치 생성
- 리포지토리: owner=`ppebble`, repo=`not-a-trip`

### Kiro Agent Hooks (`.kiro/hooks/`)

- `bulk-replace-via-gemini-cli` — 대규모 문자열 치환 (userTriggered)
- `lint-fix-via-gemini-cli` — ESLint 에러 일괄 수정 (userTriggered)
- `generate-pr-description-via-gemini-cli` — git diff 기반 PR 설명 생성 (userTriggered)
- `create-issue-via-gemini-cli` — Gemini CLI로 Issue 생성 (MCP 사용 불가 시 폴백)
- `create-pr-via-gemini-cli` — Gemini CLI로 PR 생성 (MCP 사용 불가 시 폴백)

### 위임 스크립트

- `node .kiro/hooks/run-gemini-cli.js <task-type> [args...]`
- 지원: `bulk-replace`, `generate-docs`, `lint-fix`

## 적용 범위

- 모든 커밋 작성 시
- 모든 Task 실행 시
- 모든 브랜치 생성 시
- 모든 Issue/PR 생성 시

이 가이드라인들을 준수하지 않으면 작업이 거부될 수 있습니다.
