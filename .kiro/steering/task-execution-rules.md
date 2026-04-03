---
inclusion: always
---
## 🤖 토큰 최적화 및 단순 작업 위임 (Gemini CLI 연동)

Kiro(당신)는 고차원적인 논리 설계, 버그 추적, 아키텍처 구성에 집중합니다. 
다음과 같은 "단순하지만 범위가 넓은 작업(토큰 과소비 작업)"은 직접 코드를 한 줄씩 수정하지 말고, 설치된 `gemini-cli` 또는 `bash` 스크립트 도구를 호출하여 위임해야 합니다.

1. **위임 대상 작업:**
   - 전체 파일의 특정 텍스트 일괄 치환 (예: `slate-900` -> `surface`)
   - 단순 반복적인 변수명 일괄 리팩토링
   - 대규모 포맷팅 / 린트 에러 일괄 수정
   - **변경 로그 생성** → `node .kiro/hooks/run-gemini-cli.js generate-docs changelog`
   - **커밋 메시지 제안** → `node .kiro/hooks/run-gemini-cli.js generate-docs commit-summary`

2. **Kiro가 직접 담당하는 작업 (위임 금지):**
   - 코드 구현 및 아키텍처 설계
   - 버그 추적 및 디버깅
   - Spec 문서 작성/수정 (requirements.md, design.md, tasks.md)
   - 속성 기반 테스트(PBT) 설계 및 작성
   - 코드 리뷰 및 품질 검증

3. **위임 방법 (명령어 실행):**
   - 직접 파일을 수정하지 말고, 쉘 명령어 실행 도구를 사용하여 `gemini` CLI를 호출하거나 `sed`, `awk` 스크립트를 작성하여 실행할 것.
   - 위임 스크립트: `node .kiro/hooks/run-gemini-cli.js <task-type> [args...]`
   - 지원 task-type: `bulk-replace`, `generate-docs`, `lint-fix`

4. **GitHub Issue/PR 생성 (MCP 직접 수행):**
   - GitHub Issue와 PR은 Kiro가 MCP GitHub 도구(`mcp_github_create_issue`, `mcp_github_create_pull_request`)를 사용하여 직접 생성한다
   - gemini-cli 위임 대신 MCP 도구를 우선 사용
   - 리포지토리: owner=`ppebble`, repo=`anime-pilgrim`
   - Issue 생성 시 `.github/ISSUE_TEMPLATE/` 형식을 참고하여 body 작성
   - PR 생성 시 `.github/PULL_REQUEST_TEMPLATE.md` 형식을 참고하여 body 작성
   
# Task 실행 필수 규칙

## 🚨 모든 Task 실행 시 반드시 준수

### 1️⃣ 작업 시작 전 (필수)

1. **GitHub Issue 생성 (MCP 도구로 직접 생성)**
   - `mcp_github_create_issue` 도구를 사용하여 직접 생성
   - Issue 제목: `[Type] Task 번호 - 간단한 설명`
   - 예: `[Feat] Task 8.1 - SpotDetail 페이지 구현`
   - `.github/ISSUE_TEMPLATE/` 형식을 참고하여 body 작성

2. **브랜치 생성**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b {type}/{이슈번호}--{간단한-요약}
   ```

3. **Task 상태 업데이트**
   - `taskStatus` 도구로 "in_progress" 설정

### 2️⃣ 작업 중 (필수)

1. **논리적 커밋 분할**
   - 기능별로 의미있는 단위로 커밋
   - 커밋 메시지는 commit-guidelines.md 규칙 준수

2. **코드 품질 확인**
   ```bash
   npm run type-check
   npm run build
   ```

### 3️⃣ 작업 완료 후 (필수)

1. **Task 상태 업데이트**
   - `taskStatus` 도구로 "completed" 설정

2. **브랜치 푸시**

   ```bash
   git push -u origin [브랜치명]
   ```

3. **PR 생성 (MCP 도구로 직접 생성)**
   - `mcp_github_create_pull_request` 도구를 사용하여 직접 생성
   - develop 브랜치로 PR 생성
   - PR 설명에 `Closes #{이슈번호}` 포함
   - `.github/PULL_REQUEST_TEMPLATE.md` 형식을 참고하여 body 작성

## 🔄 브랜치 명명 규칙

> ⚠️ `가능한 브랜치 헤더 (!!반드시 확인):: feat|fix|ui|enhancement|chore|refactor|hotfix|test).

- `feat/{이슈번호}--{간단한-요약}` — 새 기능
- `ui/{이슈번호}--{간단한-요약}` — UI/스타일 수정 (style/ 대신 사용)
- `fix/{이슈번호}--{간단한-요약}` — 버그 수정
- `chore/{이슈번호}--{간단한-요약}` — 빌드, 설정, 문서
- `test/{이슈번호}--{간단한-요약}` — 테스트
- `refactor/{이슈번호}--{간단한-요약}` — 리팩토링

## 📋 Property-Based Test (PBT) 작업 시

1. **테스트 실행 후 상태 업데이트 필수**
   - `updatePBTStatus` 도구 사용
2. **실패 시 처리**
   - 즉시 수정하지 말고 사용자에게 문의
   - 실패 예제와 함께 상태 업데이트

## ⚠️ 주의사항

- **한 번에 하나의 Task만** 실행
- **500줄 이하** 원칙으로 PR 크기 관리
- **모든 작업은 Issue와 연결**하여 추적성 확보
- **Requirements 번호** 반드시 참조

## 🧪 UI 컴포넌트 테스트 페이지

**화면에 바로 표시되지 않는 컴포넌트** 개발 시 테스트 페이지 필수

### 테스트 페이지 규칙

1. **테스트 페이지는 항상 1개만 유지**
   - 경로: `src/app/test/{컴포넌트명}/page.tsx`
   - Header의 🧪 테스트 버튼으로 접근 가능

2. **새 테스트 페이지 필요 시**
   - 기존 테스트 페이지 폴더 삭제
   - 새 테스트 페이지 생성
   - Header 링크 업데이트 (`src/components/layout/Header.tsx`)

3. **테스트 페이지 생성 절차**

   ```bash
   # 1. 기존 테스트 페이지 삭제
   Remove-Item -Recurse -Force src/app/test/{기존폴더}

   # 2. 새 테스트 페이지 생성
   src/app/test/{새폴더}/page.tsx

   # 3. Header 링크 수정
   # href="/test/{새폴더}"로 변경
   ```

4. **테스트 페이지 포함 내용**
   - 컴포넌트 다양한 상태 테스트
   - 현재 상태 표시 패널
   - 인터랙션 테스트 가능한 UI

5. **완성된 기능의 테스트 페이지는 삭제**
   - 메인 화면에서 직접 확인 가능한 기능은 테스트 페이지 불필요
