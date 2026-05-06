---
inclusion: always
priority: 2
---

# Shell 명령어 안전 규칙

## 🚨 bash에서 괄호 포함 문자열 금지

이 프로젝트의 shell은 **bash**입니다. bash에서 `(`, `)` 문자가 명령어에 포함되면 `syntax error near unexpected token '('` 에러가 발생합니다.

### 절대 금지 패턴

```bash
# ❌ git log에 --decorate 기본값으로 괄호가 출력됨
git log --oneline

# ❌ 괄호가 포함된 경로나 문자열을 직접 사용
cat "file (copy).txt"

# ❌ 괄호가 포함된 파일 경로를 따옴표 없이 사용 (Next.js route groups!)
git add src/app/(main)/contents/page.tsx
git commit -- src/app/(main)/layout.tsx
```

### 필수 사용 패턴

```bash
# ✅ git log는 항상 --no-decorate 옵션 사용
git log --oneline --no-decorate

# ✅ 괄호가 포함될 수 있는 출력은 파이프로 처리하거나 옵션으로 제거
git log --format="%h %s" -5

# ✅ 파일 경로에 괄호가 있으면 반드시 작은따옴표로 감싸기
cat 'file (copy).txt'

# ✅ Next.js route group 경로 ((main), (auth) 등)는 반드시 따옴표 사용
git add 'src/app/(main)/contents/page.tsx'
git add 'src/app/(main)/'

# ✅ 여러 파일 중 괄호 경로가 있으면 해당 파일만 따옴표
git add 'src/app/(main)/contents/page.tsx' src/components/content/ContentListClient.tsx

# ✅ glob 패턴으로 괄호 회피도 가능
git add src/app/*/contents/page.tsx
```

### 적용 대상

- `git log` → 항상 `--no-decorate` 또는 `--format` 사용
- `git branch` → `--no-column` 사용 권장
- `git add`, `git commit`, `git diff` 등 **파일 경로 인자** → `(main)`, `(auth)` 등 Next.js route group 경로는 **반드시 작은따옴표**로 감싸기
- 모든 shell 명령어에서 출력에 괄호가 포함될 가능성이 있으면 사전에 제거 옵션 적용

### 이유

Windows bash 환경에서 명령어 출력에 `(` 또는 `)`가 포함되면 shell이 이를 subshell 구문으로 해석하려다 syntax error를 발생시킵니다. 이는 명령어 자체의 문제가 아니라 출력이 다음 프롬프트에 영향을 주는 환경 특성입니다.
