# Git 워크플로우 가이드

## 브랜치 전략

이 프로젝트는 **Git Flow** 기반의 브랜치 전략을 사용합니다.

### 브랜치 구조

```
main (프로덕션 배포)
├── develop (개발 통합)
    ├── feature/상태관리-설정
    ├── feature/지도-컴포넌트-구현
    ├── feature/스팟-상세-페이지
    ├── feature/커뮤니티-게시판
    ├── bugfix/API-에러-처리
    └── hotfix/보안-패치
```

### 브랜치 명명 규칙

| 브랜치 타입    | 형식                               | 예시                          | 용도                   |
| -------------- | ---------------------------------- | ----------------------------- | ---------------------- |
| `feat/`        | `feat/{이슈번호}--{기능명}`        | `feat/5--user-auth`           | 새로운 기능 개발       |
| `fix/`         | `fix/{이슈번호}--{버그명}`         | `fix/12--login-error`         | 버그 수정              |
| `ui/`          | `ui/{이슈번호}--{UI명}`            | `ui/15--mobile-button`        | UI/UX 개선             |
| `enhancement/` | `enhancement/{이슈번호}--{개선명}` | `enhancement/25--search-perf` | 기능 개선, 성능 최적화 |
| `chore/`       | `chore/{이슈번호}--{작업명}`       | `chore/20--lint-setup`        | 빌드, 설정 등          |
| `refactor/`    | `refactor/{이슈번호}--{리팩터명}`  | `refactor/30--api-structure`  | 코드 리팩토링          |
| `hotfix/`      | `hotfix/{이슈번호}--{핫픽스명}`    | `hotfix/99--security-patch`   | 긴급 수정              |

## 워크플로우

### 1. 새 기능 개발

```bash
# develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 새 feature 브랜치 생성 (이슈 번호 포함)
git checkout -b feat/5--user-login-ui

# 개발 작업 수행
# ... 코드 작성 ...

# 커밋 (commitlint 규칙 준수)
git add .
git commit -m "feat: 사용자 로그인 UI 구현"

# 원격 브랜치에 푸시
git push -u origin feat/5--user-login-ui

# GitHub에서 develop으로 PR 생성
```

### 2. 버그 수정

```bash
# develop 브랜치에서 시작
git checkout develop
git pull origin develop

# bugfix 브랜치 생성
git checkout -b fix/12--login-validation-error

# 버그 수정
# ... 코드 수정 ...

# 커밋
git add .
git commit -m "fix: 로그인 폼 유효성 검사 오류 수정"

# 푸시 및 PR 생성
git push -u origin fix/12--login-validation-error
```

### 3. UI 개선

```bash
# develop 브랜치에서 시작
git checkout develop
git pull origin develop

# UI 개선 브랜치 생성
git checkout -b ui/15--mobile-responsive-header

# UI 개선 작업
# ... 스타일 수정 ...

# 커밋
git add .
git commit -m "ui: 모바일 헤더 반응형 레이아웃 개선"

# 푸시 및 PR 생성
git push -u origin ui/15--mobile-responsive-header
```

### 4. 긴급 수정 (Hotfix)

```bash
# main 브랜치에서 시작
git checkout main
git pull origin main

# hotfix 브랜치 생성
git checkout -b hotfix/99--security-patch

# 긴급 수정
# ... 코드 수정 ...

# 커밋
git add .
git commit -m "fix: 보안 취약점 긴급 패치"

# main과 develop 모두에 머지 필요
git push -u origin hotfix/99--security-patch
```

## 커밋 메시지 규칙

### 형식

```
<type>: <description>

[optional body]

[optional footer]
```

### 타입 종류

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 파일 수정
- `perf`: 성능 개선
- `ci`: CI/CD 설정 변경

### 예시

```bash
feat: 사용자 인증 기능 구현
fix: 로그인 시 발생하는 에러 수정
docs: API 문서 업데이트
style: ESLint 규칙에 따른 코드 포맷팅
refactor: 데이터베이스 연결 로직 개선
test: 사용자 인증 테스트 케이스 추가
chore: 의존성 패키지 업데이트
```

## PR (Pull Request) 가이드

### PR 제목 형식

```
[타입] 간단한 설명
```

### PR 템플릿

```markdown
## 변경 사항

- 구현한 기능이나 수정한 내용

## 테스트

- [ ] 단위 테스트 통과
- [ ] 통합 테스트 통과
- [ ] 수동 테스트 완료

## 체크리스트

- [ ] 코드 리뷰 요청
- [ ] 문서 업데이트 (필요시)
- [ ] 브레이킹 체인지 확인
```

## 자동화된 검사

### Pre-commit 훅

- ESLint 검사
- Prettier 포맷팅
- TypeScript 타입 체크

### CI/CD 파이프라인

- 코드 품질 검사
- 테스트 실행
- 빌드 검증
- 자동 배포 (main 브랜치)

## 브랜치 보호 규칙

### main 브랜치

- PR 필수
- 최소 1명의 승인 필요
- 모든 상태 체크 통과 필수
- 최신 상태 유지 필수

### develop 브랜치

- PR 필수
- 상태 체크 통과 필수

## 유용한 Git 명령어

```bash
# 현재 브랜치 확인
git branch

# 브랜치 전환
git checkout 브랜치명

# 원격 브랜치 동기화
git fetch origin

# 브랜치 삭제 (로컬)
git branch -d 브랜치명

# 브랜치 삭제 (원격)
git push origin --delete 브랜치명

# 커밋 히스토리 확인
git log --oneline --graph

# 변경사항 확인
git status
git diff
```


## Release Validation Scope

- main/develop 포함 파일 기준으로 릴리스 검증 범위를 판단한다.
- 테스트 파일을 main에서 제거하지 않는다.
- develop을 main에 무차별 merge하지 않는다.
