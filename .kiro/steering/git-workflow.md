---
inclusion: always
---

## 📋 작업 진행 가이드

### ⚠️ Task 실행 전 필수 체크리스트

**모든 작업은 한글로 작성해**

**🚨 코드 작업 시작 전 반드시 수행:**

1. **GitHub Issue 생성 (필수)**
   - 해당 Task에 대한 GitHub Issue 먼저 생성
   - `.github/ISSUE_TEMPLATE/` 중 적절한 템플릿 사용
   - Issue 제목: `[Type] Task 번호 - 간단한 설명`
   - 예: `[Feat] Task 5.2 - SpotPin 컴포넌트 구현`

2. **작업 내용 분석**
   - 구현할 파일들과 기능 범위 파악
   - 논리적 커밋 단위로 나눌 계획 수립
   - 필요시 여러 이슈로 분할 검토

3. **브랜치 전략 수립**
   - 단일 기능: 하나의 브랜치
   - 복합 작업: 기능별로 브랜치 분할
   - Git stash 활용 계획 수립

### 각 Task 시작 시 체크리스트

1. **Issue 생성 및 번호 확인**: GitHub Issue 생성 후 번호 메모
2. **브랜치 생성**: `{type}/{이슈번호}--{간단한-설명}` 형식
   2-1. {간단한-설명} 의 마지막은 동사가 올 수 있도록함(ex, feat/1--ex-component--add)
3. **Task 상태 업데이트**: `taskStatus` 도구로 "in_progress" 설정
4. **요구사항 확인**: 해당 task의 Requirements 번호 확인
5. **하위 작업 순서**: 하위 task가 있으면 순서대로 진행

### 각 Task 완료 후 체크리스트

1. **코드 품질 확인**: `npm run lint`, `npm run type-check`, `npm run build`
2. **논리적 커밋 분할**: 기능별로 의미있는 단위로 커밋
3. **Task 상태 업데이트**: `taskStatus` 도구로 "completed" 설정
4. **브랜치 푸시**: 작업 브랜치를 원격 저장소에 푸시
5. **PR 생성**: develop 브랜치로 PR 생성 (템플릿 활용)
6. **Issue 연결**: PR에서 `Closes #{이슈번호}` 작성하여 Issue 자동 연결

### Property-Based Test (PBT) 작업 시

1. **테스트 실행**: 해당 속성 테스트 실행
2. **상태 업데이트**: `updatePBTStatus` 도구로 결과 업데이트
3. **실패 시**: 실패 예제와 함께 상태 업데이트, 즉시 수정하지 말고 사용자에게 문의

### 브랜치 분할 전략 (500줄 이하 원칙)

- Task 4 (상태 관리 설정): 924줄 - **리뷰하기에 너무 많음**

**앞으로의 개선 방향:**
각 Task를 500줄 이하의 하위 브랜치로 분할하여 리뷰 효율성 향상

### 다음 작업자를 위한 정보

- **현재 완료**: Task 1 (프로젝트 초기 설정), Task 2 (데이터베이스 및 API 기반 구축), Task 3 (Checkpoint), Task 4 (상태 관리 설정), Task 5.1 (PilgrimageMap 컴포넌트 구현)
- **다음 예정**: Task 5.2 (SpotPin 컴포넌트 구현)
- **현재 브랜치**: `feat/4--state-management-setup` (PR 대기 중), `fix/5--github-actions-errors` (GitHub Actions 수정)

### 🚨 다음 Task 실행 시 필수 프로세스

**Task 5.2 실행 예시:**

1. **Issue 생성 먼저!**

   ```
   제목: [Feat] Task 5.2 - SpotPin 컴포넌트 구현
   템플릿: Feature 템플릿 사용
   내용: SpotPin 컴포넌트 구현 및 마커 표시 기능
   ```

   **2번을 시작하기전에 작업을 중단하고 다음 행동을 기다리도록함. 직접 이슈 생성 후 다음단계 진행**

2. **Issue 번호 확인 후 브랜치 생성**

   ```bash
   # 예: Issue #15가 생성되었다면
   git checkout develop
   git pull origin develop
   git checkout -b feat/15--spot-pin-component
   ```

3. **논리적 커밋 분할 계획**
   - `feat: SpotPin 컴포넌트 기본 구현`
   - `style: SpotPin 마커 스타일링 추가`
   - `feat: 클릭 이벤트 핸들링 구현`

4. **작업 완료 후 PR 생성**
   - PR 제목: `[Feat] SpotPin 컴포넌트 구현`
   - PR 내용에 `Closes #15` 포함

---

## Notes

- **⚠️ 필수**: 모든 Task 실행 전 GitHub Issue 생성 필수
- **커밋 전략**: 논리적 단위로 커밋 분할 (한 줄 메시지 + PR에 상세 내용)
- **브랜치 분할**: 복합 작업 시 기능별로 브랜치 분할 권장
- **리뷰 효율성**: 500줄 이하 원칙으로 PR 크기 관리
- **추적성**: 모든 작업은 Issue와 연결하여 추적 가능하도록 관리
- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다
- 체크포인트에서 점진적 검증을 수행합니다
- 속성 테스트는 보편적 정확성 속성을 검증합니다
- 단위 테스트는 특정 예제와 에지 케이스를 검증합니다

# Git 워크플로우 필수 프로세스

## 🚨 코드 작업 시작 전 필수 체크리스트

**모든 Task 실행 시 반드시 다음 순서를 따라야 합니다:**

### 1️⃣ GitHub Issue 생성 (필수)

- 작업 시작 전 반드시 GitHub에서 Issue 생성
- Issue 제목: `[Type] Task 번호 - 간단한 설명`
- 예: `[Feat] Task 5.2 - SpotPin 컴포넌트 구현`

### 2️⃣ 브랜치 생성

```bash
# develop 브랜치에서 새 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b {type}/{이슈번호}--{간단한-요약}
```

**브랜치 명명 규칙:**

- `feat/{이슈번호}--{간단한-요약}`
- `ui/{이슈번호}--{간단한-요약}`
- `fix/{이슈번호}--{간단한-요약}`
- `chore/{이슈번호}--{간단한-요약}`

### 3️⃣ 논리적 커밋 분할

```bash
# 핵심 기능 구현
git add [파일들]
git commit -m "feat: [기능] 구현"

# 스타일링 추가
git add [CSS 파일들]
git commit -m "style: [컴포넌트] 네이비 테마 스타일링 추가"
```

### 4️⃣ PR 생성 및 Issue 연결

```bash
git push -u origin [브랜치명]
```

- GitHub에서 develop 브랜치로 PR 생성
- PR 설명에 `Closes #{이슈번호}` 작성

## ⚠️ 주의사항

- 브랜치명: 모두 소문자, 하이픈 사용
- 커밋 크기: 500줄 이하 권장
- 반드시 Issue와 연결하여 추적성 확보
