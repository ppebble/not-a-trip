# 브랜치 보호 규칙 설정 가이드

GitHub 저장소에서 다음 브랜치 보호 규칙을 설정해주세요:

## main 브랜치 보호 규칙

1. **Settings** → **Branches** → **Add rule**
2. **Branch name pattern**: `main`
3. 다음 옵션들을 체크:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (최소 1명)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Restrict pushes that create files larger than 100MB

### 필수 상태 체크:

- `lint-and-test (18.x)`
- `lint-and-test (20.x)`
- `build`

## develop 브랜치 보호 규칙

1. **Branch name pattern**: `develop`
2. 다음 옵션들을 체크:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### 필수 상태 체크:

- `validate-feature`

## 브랜치 전략

```
main (프로덕션)
├── develop (개발)
    ├── feature/user-authentication
    ├── feature/map-integration
    ├── bugfix/login-error
    └── hotfix/critical-security-fix
```

### 브랜치 명명 규칙:

- `feature/기능명`: 새로운 기능 개발
- `bugfix/버그명`: 버그 수정
- `hotfix/핫픽스명`: 긴급 수정
- `chore/작업명`: 빌드, 설정 등 기타 작업
