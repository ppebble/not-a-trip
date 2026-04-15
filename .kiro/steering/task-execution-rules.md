---
inclusion: always
---

# Task 실행 필수 규칙

## 실행 모드: Run All Tasks (자동화)

모든 Spec의 Task는 "Run All Tasks"로 일괄 실행한다.
Kiro가 각 Task에 대해 Issue 생성 → 브랜치 → 구현 → 커밋 → 푸시 → PR → 머지까지 자동 수행한다.
사용자는 마지막 Checkpoint Task에서 변경사항을 직접 검증한다.

---

## 🔄 Task별 자동 실행 흐름

각 구현 Task(Checkpoint 제외)마다 아래 흐름을 반복한다:

```
Issue 생성 → 브랜치 생성 → 구현 & 커밋 → 푸시 → PR 생성 → PR 머지 → 다음 Task
```

### 1️⃣ Task 시작

1. **GitHub Issue 생성** — `mcp_github_create_issue` (owner: `ppebble`, repo: `not-a-trip`)
   - 제목: `[Type] Task 번호 - 간단한 설명`
   - labels: `feat`, `fix`, `chore`, `test`, `ui`, `enhancement` 중 선택
2. **브랜치 생성** — develop에서 분기
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b {type}/{이슈번호}--{간단한-요약}
   ```
3. **Task 상태** → `in_progress`

### 2️⃣ 구현 & 커밋

1. 코드 구현 (commit-guidelines.md 준수)
2. 논리적 커밋 분할 — 기능별 의미있는 단위
3. 코드 품질 확인: `npm run type-check`

### 3️⃣ Task 완료 & PR

1. 브랜치 푸시: `git push -u origin [브랜치명]`
2. **PR 생성** — `mcp_github_create_pull_request` (base: `develop`)
   - body에 `Closes #{이슈번호}` 포함
3. **🚨 GitHub Actions 통과 확인 (필수)** — PR 머지 전 반드시 CI 결과를 확인한다
   - `mcp_github_get_pull_request_status`로 PR의 체크 상태 조회
   - 모든 체크가 `success`일 때만 머지 진행
   - 체크가 `pending`이면 10~15초 대기 후 재조회 (최대 5회 재시도)
   - 체크가 `failure`/`error`이면 **머지하지 않고** 실패 원인을 분석하여 수정 후 재푸시
   - ⚠️ CI 실패 상태에서 머지하면 develop 브랜치가 깨질 수 있으므로 절대 금지
4. **PR 머지** — `mcp_github_merge_pull_request` (merge_method: `squash`)
5. **Task 상태** → `completed`
6. develop 브랜치로 복귀 후 다음 Task 진행

---

## 🧪 Checkpoint Task (마지막 Task)

모든 Spec의 tasks.md 마지막에는 반드시 Checkpoint Task가 포함되어야 한다.

- Checkpoint Task에서는 코드를 작성하지 않음
- 모든 테스트 통과 확인, 사용자에게 변경사항 검증 요청
- 사용자가 직접 앱을 실행하여 기능을 테스트

---

## 🤖 토큰 최적화 및 작업 분담

Kiro는 코드 구현, 아키텍처 설계, 버그 추적에 집중한다.
단순 반복 작업은 MCP agent-worker 도구로 위임한다.

### Agent Worker MCP 위임 대상

- `mcp_agent_worker_bulk_replace` — 전체 파일의 특정 텍스트 일괄 치환
- `mcp_agent_worker_lint_fix` — 대규모 린트 에러 일괄 수정
- `mcp_agent_worker_generate_docs` — 변경 로그, 커밋 메시지, PR 설명 생성
- `mcp_agent_worker_ask_agent` — 자유 프롬프트로 단순 반복 작업 위임

### Kiro 직접 담당 (위임 금지)

- 코드 구현 및 아키텍처 설계
- 버그 추적 및 디버깅
- Spec 문서 작성/수정
- 속성 기반 테스트(PBT) 설계 및 작성
- GitHub Issue/PR 생성 및 머지 (MCP 도구)

---

## 🔄 브랜치 명명 규칙

> ⚠️ 허용 prefix: `feat|fix|ui|enhancement|chore|refactor|hotfix|test` (`style/`은 GitHub Actions에서 차단됨)

- 형식: `{type}/{이슈번호}--{간단한-요약}`
- 요약 마지막에 동사 권장 (`--add`, `--fix`, `--update`, `--improve`)
- 모두 소문자, 하이픈 사용

---

## 📋 Property-Based Test (PBT) 작업 시

1. 테스트 실행 후 `updatePBTStatus` 도구로 상태 업데이트 필수
2. 실패 시 즉시 수정하지 말고 사용자에게 문의 (실패 예제 포함)

---

## 🧪 UI 컴포넌트 테스트 페이지

화면에 바로 표시되지 않는 컴포넌트 개발 시 테스트 페이지 필수.

1. 테스트 페이지는 항상 1개만 유지: `src/app/test/{컴포넌트명}/page.tsx`
2. Header의 🧪 테스트 버튼으로 접근 가능
3. 새 테스트 페이지 필요 시 기존 폴더 삭제 후 생성
4. 완성된 기능의 테스트 페이지는 삭제
