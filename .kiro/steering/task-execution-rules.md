---
inclusion: always
---

# Task 실행 필수 규칙

## 🤖 토큰 최적화 및 작업 분담

Kiro는 코드 구현, 아키텍처 설계, 버그 추적에 집중한다.
단순 반복 작업은 gemini-cli 또는 bash 스크립트로 위임한다.

### Gemini CLI 위임 대상

- 전체 파일의 특정 텍스트 일괄 치환 (예: `slate-900` → `surface`)
- 단순 반복적인 변수명 일괄 리팩토링
- 대규모 포맷팅 / 린트 에러 일괄 수정
- 변경 로그 생성 → `node .kiro/hooks/run-gemini-cli.js generate-docs changelog`
- 커밋 메시지 제안 → `node .kiro/hooks/run-gemini-cli.js generate-docs commit-summary`

### Kiro 직접 담당 (위임 금지)

- 코드 구현 및 아키텍처 설계
- 버그 추적 및 디버깅
- Spec 문서 작성/수정 (requirements.md, design.md, tasks.md)
- 속성 기반 테스트(PBT) 설계 및 작성
- 코드 리뷰 및 품질 검증

### MCP GitHub 도구 (Kiro 직접 수행)

GitHub Issue와 PR은 MCP 도구로 직접 생성한다. gemini-cli 위임은 MCP 사용 불가 시 폴백으로만 사용.

- **Issue 생성**: `mcp_github_create_issue` (owner: `ppebble`, repo: `not-a-trip`)
- **PR 생성**: `mcp_github_create_pull_request` (owner: `ppebble`, repo: `not-a-trip`)
- **Issue/PR 조회**: `mcp_github_get_issue`, `mcp_github_list_pull_requests` 등
- Issue body는 `.github/ISSUE_TEMPLATE/` 형식 참고
- PR body는 `.github/PULL_REQUEST_TEMPLATE.md` 형식 참고
- Issue labels: `feat`, `fix`, `chore`, `test`, `ui`, `enhancement` 중 선택

---

## 🚨 모든 Task 실행 시 반드시 준수

### 1️⃣ 작업 시작 전 (필수)

1. **GitHub Issue 생성** — `mcp_github_create_issue` 도구로 직접 생성
   - 제목: `[Type] Task 번호 - 간단한 설명`
   - 예: `[Feat] Task 8.1 - SpotDetail 페이지 구현`
   - body: `.github/ISSUE_TEMPLATE/` 형식 참고

2. **브랜치 생성**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b {type}/{이슈번호}--{간단한-요약}
   ```

3. **Task 상태 업데이트** — `taskStatus` 도구로 `in_progress` 설정

### 2️⃣ 작업 중 (필수)

1. **논리적 커밋 분할** — 기능별로 의미있는 단위로 커밋 (commit-guidelines.md 준수)
2. **코드 품질 확인**
   ```bash
   npm run type-check
   npm run build
   ```

### 3️⃣ 작업 완료 후 (필수)

1. **Task 상태 업데이트** — `taskStatus` 도구로 `completed` 설정
2. **브랜치 푸시**
   ```bash
   git push -u origin [브랜치명]
   ```
3. **PR 생성** — `mcp_github_create_pull_request` 도구로 직접 생성
   - base: `develop`
   - body에 `Closes #{이슈번호}` 포함
   - `.github/PULL_REQUEST_TEMPLATE.md` 형식 참고

---

## 🔄 브랜치 명명 규칙

> ⚠️ 허용 prefix: `feat|fix|ui|enhancement|chore|refactor|hotfix|test` (`style/`은 GitHub Actions에서 차단됨)

| prefix | 용도 | 예시 |
|--------|------|------|
| `feat/` | 새로운 기능 | `feat/15--spot-pin-component--add` |
| `ui/` | UI/스타일 수정 | `ui/407--button-form-card-migration` |
| `fix/` | 버그 수정 | `fix/20--map-marker-crash--fix` |
| `chore/` | 빌드, 설정, 문서 | `chore/30--eslint-config--update` |
| `test/` | 테스트 | `test/25--pbt-token-integrity--add` |
| `refactor/` | 리팩토링 | `refactor/40--store-structure--improve` |

- 형식: `{type}/{이슈번호}--{간단한-요약}`
- 요약 마지막에 동사 권장 (`--add`, `--fix`, `--update`, `--improve`)
- 모두 소문자, 하이픈 사용

---

## 📋 Property-Based Test (PBT) 작업 시

1. 테스트 실행 후 `updatePBTStatus` 도구로 상태 업데이트 필수
2. 실패 시 즉시 수정하지 말고 사용자에게 문의 (실패 예제 포함)

---

## ⚠️ 주의사항

- 한 번에 하나의 Task만 실행
- 500줄 이하 원칙으로 PR 크기 관리
- 모든 작업은 Issue와 연결하여 추적성 확보
- Requirements 번호 반드시 참조

---

## 🧪 UI 컴포넌트 테스트 페이지

화면에 바로 표시되지 않는 컴포넌트 개발 시 테스트 페이지 필수.

1. 테스트 페이지는 항상 1개만 유지: `src/app/test/{컴포넌트명}/page.tsx`
2. Header의 🧪 테스트 버튼으로 접근 가능 (`src/components/layout/Header.tsx` 링크 수정)
3. 새 테스트 페이지 필요 시 기존 폴더 삭제 후 생성
4. 완성된 기능의 테스트 페이지는 삭제
