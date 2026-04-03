---
inclusion: always
---

# Git 워크플로우

**모든 작업은 한글로 작성한다.**

## Task 실행 전체 흐름

```
1. Issue 생성 (MCP) → 2. 브랜치 생성 → 3. 구현 & 커밋 → 4. 푸시 → 5. PR 생성 (MCP)
```

### 1️⃣ Issue 생성

- `mcp_github_create_issue` 도구로 직접 생성 (owner: `ppebble`, repo: `not-a-trip`)
- 제목: `[Type] Task 번호 - 간단한 설명`
- body: `.github/ISSUE_TEMPLATE/` 형식 참고
- labels: `feat`, `fix`, `chore`, `test`, `ui`, `enhancement` 중 선택

### 2️⃣ 브랜치 생성

```bash
git checkout develop
git pull origin develop
git checkout -b {type}/{이슈번호}--{간단한-요약}
```

- 형식: `{type}/{이슈번호}--{간단한-요약}` (마지막에 동사 권장: `--add`, `--fix`)
- 모두 소문자, 하이픈 사용
- 허용 prefix: `feat|fix|ui|enhancement|chore|refactor|hotfix|test`
- `style/`은 GitHub Actions에서 차단 → UI 작업은 `ui/` 사용

### 3️⃣ 논리적 커밋 분할

- commit-guidelines.md 규칙 준수
- 한 줄 커밋, 한글, 50자 이내, 소문자 시작, 마침표 없음
- 여러 기능 = 여러 커밋 (필수)

```bash
# ✅ 기능별 분할
git add src/app/spots/[id]/page.tsx
git commit -m "feat: spot detail 페이지 구현"

git add src/hooks/useSpotDetail.ts
git commit -m "fix: useSpotDetail API 응답 처리 수정"

# ❌ 여러 기능을 하나의 커밋에 (금지)
git add .
git commit -m "feat: spot detail 페이지 구현 및 에러 수정"
```

### 4️⃣ 푸시

```bash
git push -u origin [브랜치명]
```

### 5️⃣ PR 생성

- `mcp_github_create_pull_request` 도구로 직접 생성 (owner: `ppebble`, repo: `not-a-trip`)
- base: `develop`
- body: `.github/PULL_REQUEST_TEMPLATE.md` 형식 참고
- body에 `Closes #{이슈번호}` 포함

---

## Task 시작 시 체크리스트

1. Issue 생성 (MCP) → 이슈 번호 확인
2. 브랜치 생성: `{type}/{이슈번호}--{간단한-설명}`
3. `taskStatus` 도구로 `in_progress` 설정
4. 해당 task의 Requirements 번호 확인
5. 하위 task가 있으면 순서대로 진행

## Task 완료 후 체크리스트

1. 코드 품질 확인: `npm run type-check`, `npm run build`
2. 논리적 커밋 분할 완료 확인
3. `taskStatus` 도구로 `completed` 설정
4. 브랜치 푸시
5. PR 생성 (MCP) — `Closes #{이슈번호}` 포함

---

## 주의사항

- 커밋 크기: 500줄 이하 권장
- 반드시 Issue와 연결하여 추적성 확보
- 복합 작업 시 기능별로 브랜치 분할 권장
