# Implementation Plan: Anime Pilgrimage Map

## Overview

Next.js 15 App Router 기반의 애니메이션 성지순례 스팟 공유 웹 플랫폼 구현 계획입니다. TanStack Query, Zustand, Tailwind CSS를 활용하여 단계적으로 구현합니다.

## 🔄 Git 워크플로우 및 브랜치 전략

### ⚠️ 필수 프로세스: Issue 기반 개발

**🚨 중요: 코드 작업 시작 전 반드시 GitHub Issue 생성 필수!**

모든 Task 실행 시 다음 순서를 반드시 따라야 합니다:

### 1️⃣ 사전 준비 (코드 작업 전 필수)

**Step 1: GitHub Issue 생성**

- 작업 시작 전 반드시 GitHub에서 Issue 생성
- Issue 템플릿 활용 (Feature, UI Improvement, Chore 등)
- 명확한 제목과 작업 내용 작성
- 라벨 및 마일스톤 설정

**Step 2: 작업 내용 분석 및 브랜치 전략 수립**

- 구현할 내용을 기능별/파일별로 분석
- 논리적 단위로 커밋을 나눌 계획 수립
- 필요시 여러 이슈로 분할 검토

### 2️⃣ Git 컨벤션

**브랜치 명명 규칙:**

```
{type}/{이슈번호}--{간단한-요약}
```

**타입별 분류:**

- `feat`: 새로운 기능 구현
- `ui`: UI/UX 개선, 스타일 수정
- `fix`: 버그 수정
- `chore`: 설정, 빌드, 의존성 관리
- `refactor`: 기능 변경 없는 코드 개선
- `test`: 테스트 코드 추가/수정

**예시:**

- `feat/12--pilgrimage-map-component`
- `ui/13--mobile-responsive-layout`
- `chore/14--jest-config-improvement`

**커밋 메시지 규칙:**

```
{type}: {한 줄 요약}
```

**예시:**

- `feat: PilgrimageMap 컴포넌트 구현`
- `style: 네이비 테마 스타일링 추가`
- `chore: Jest 설정에 tsx 파일 테스트 패턴 추가`

### 3️⃣ 작업 진행 방식

**Step 1: Issue 생성 및 브랜치 생성**

```bash
# 1. GitHub에서 Issue 생성 (예: Issue #12 생성됨)
# 2. develop 브랜치에서 새 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feat/12--pilgrimage-map-component
```

**Step 2: 논리적 단위로 커밋 분할**

```bash
# 핵심 기능 구현
git add src/components/map/PilgrimageMap.tsx
git commit -m "feat: PilgrimageMap 컴포넌트 구현"

# 스타일링 추가
git add src/components/map/map.css
git commit -m "style: PilgrimageMap 네이비 테마 스타일링 추가"

# 설정 파일 추가
git add src/components/map/index.ts
git commit -m "feat: map 컴포넌트 export 설정 추가"
```

**Step 3: PR 생성 및 Issue 연결**

```bash
git push -u origin feat/12--pilgrimage-map-component
```

- GitHub에서 develop 브랜치로 PR 생성
- PR 템플릿 활용하여 상세 내용 작성
- PR 설명에 `Closes #12` 작성하여 Issue 자동 연결
- CI 통과 후 리뷰 및 머지

### 4️⃣ 복합 작업 시 브랜치 분할 전략

**작업 내용이 여러 영역에 걸칠 때:**

1. **기능별로 이슈 분할**
   - 메인 기능: `feat/{이슈번호}--main-feature`
   - 설정 개선: `chore/{이슈번호}--config-improvement`
   - UI 개선: `ui/{이슈번호}--styling-enhancement`

2. **Git Stash 활용**

   ```bash
   # 전체 작업 내용을 stash로 저장
   git stash push -m "전체 작업 내용 설명"

   # 각 브랜치에서 필요한 파일만 선택적으로 복원
   git stash pop
   git add {특정 파일들}
   git stash push -m "나머지 작업 내용"
   ```

### 5️⃣ 주의사항

- **브랜치명**: 모두 소문자, 하이픈 사용
- **작업 범위**: 한 번에 하나의 논리적 단위만 작업
- **커밋 크기**: 500줄 이하 권장 (리뷰 효율성)
- **PR 연결**: 반드시 Issue와 연결하여 추적성 확보

---

## Tasks

- [ ] 1. 프로젝트 초기 설정
  - [x] 1.1 Next.js 15 프로젝트 생성 및 TypeScript 설정
    - `create-next-app`으로 프로젝트 생성
    - App Router 구조 설정
    - _Requirements: 1.1_
  - [x] 1.2 핵심 의존성 설치
    - TanStack Query, Zustand, react-leaflet, MongoDB 드라이버 설치
    - _Requirements: 1.1_
  - [x] 1.3 프로젝트 구조 및 타입 정의
    - `src/types/index.ts`에 공통 타입 정의
    - 폴더 구조 생성
    - _Requirements: 6.1, 6.2_

- [x] 2. 데이터베이스 및 API 기반 구축
  - [x] 2.1 MongoDB 연결 설정
    - `src/lib/db.ts`에 MongoDB 연결 유틸리티 작성
    - _Requirements: 6.1, 6.2_
  - [x] 2.2 Spot API 라우트 구현
    - `GET /api/spots` - 스팟 목록 조회
    - `GET /api/spots/[id]` - 스팟 상세 조회
    - _Requirements: 1.2, 3.1, 3.2, 6.2_
  - [x] 2.3 Spot 데이터 직렬화 라운드트립 속성 테스트
    - **Property 9: 스팟 데이터 직렬화 라운드트립**
    - **Validates: Requirements 6.3**
  - [x] 2.4 Facility API 라우트 구현
    - `GET /api/spots/[id]/facilities` - 근처 편의시설 조회
    - _Requirements: 4.1, 4.2_

- [x] 3. Checkpoint - API 기반 완료 확인
  - ✅ 모든 PBT 테스트 통과 (3/3)
  - ✅ TypeScript 타입 체크 통과
  - ✅ Next.js 빌드 성공
  - ✅ Jest 설정 Next.js 15 호환성 수정

- [x] 4. 상태 관리 설정
  - [x] 4.1 TanStack Query Provider 설정
    - ✅ QueryClient 최적화된 설정 (5분 staleTime, 10분 gcTime)
    - ✅ 개발환경 DevTools 활성화
    - ✅ 앱 전체에 Provider 적용
    - _Requirements: 1.1_
  - [x] 4.2 Zustand 스토어 구현
    - ✅ `mapStore.ts` - 지도 중심, 줌, 선택된 스팟 상태 관리
    - ✅ `uiStore.ts` - 미리보기, 모바일 메뉴, 로딩 상태 관리
    - ✅ DevTools 미들웨어 및 최적화된 셀렉터 제공
    - _Requirements: 2.1, 2.3_
  - [x] 4.3 TanStack Query 커스텀 훅 구현
    - ✅ `useSpots`, `useSpotPreview` - 스팟 목록 및 미리보기
    - ✅ `useSpotDetail`, `useNearbyFacilities` - 스팟 상세 및 편의시설
    - ✅ `usePosts`, `useCreatePost`, `useCreateComment` - 게시글 CRUD
    - ✅ 체계적인 쿼리 키 구조 및 캐싱 전략
    - _Requirements: 1.2, 3.1_

- [ ] 5. 지도 컴포넌트 구현
  - [ ] 5.1 PilgrimageMap 컴포넌트 구현
    - Leaflet 지도 렌더링
    - 줌/팬 인터랙션 지원
    - _Requirements: 1.1, 1.3_
  - [ ] 5.2 SpotPin 컴포넌트 구현
    - 스팟 위치에 마커 표시
    - 클릭 이벤트 핸들링
    - _Requirements: 1.2, 2.1_
  - [ ] 5.3 스팟 핀 좌표 일치 속성 테스트
    - **Property 1: 스팟 핀 좌표 일치**
    - **Validates: Requirements 1.2**
  - [ ] 5.4 SpotPreview 컴포넌트 구현
    - 팝업 UI 구현
    - 필수 정보 표시 (이름, 사진, 설명, 주소)
    - 상세보기 버튼
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ] 5.5 스팟 미리보기 필수 정보 포함 속성 테스트
    - **Property 2: 스팟 미리보기 필수 정보 포함**
    - **Validates: Requirements 2.2**

- [ ] 6. 메인 페이지 구현
  - [ ] 6.1 메인 페이지 레이아웃 구현
    - `src/app/page.tsx` 구현
    - 네이비 테마 적용
    - _Requirements: 1.1, 1.4_
  - [ ] 6.2 지도와 스팟 핀 통합
    - 스팟 데이터 로딩 및 핀 표시
    - _Requirements: 1.2_

- [ ] 7. Checkpoint - 메인 페이지 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. 스팟 상세 페이지 구현
  - [ ] 8.1 SpotDetail 페이지 구현
    - `src/app/spots/[id]/page.tsx` 구현
    - 스팟 상세 정보 표시
    - _Requirements: 3.1, 3.2_
  - [ ] 8.2 스팟 상세 필수 정보 포함 속성 테스트
    - **Property 3: 스팟 상세 필수 정보 포함**
    - **Validates: Requirements 3.2**
  - [ ] 8.3 상세 페이지 지도 컴포넌트 구현
    - 스팟 위치 및 근처 편의시설 표시
    - _Requirements: 3.3_
  - [ ] 8.4 NearbyFacilities 컴포넌트 구현
    - 편의시설 목록 타입별 분류 표시
    - _Requirements: 3.4, 4.1, 4.2, 4.3_
  - [ ] 8.5 편의시설 타입별 분류 속성 테스트
    - **Property 4: 편의시설 타입별 분류**
    - **Validates: Requirements 3.4, 4.2**
  - [ ] 8.6 편의시설 필수 정보 포함 속성 테스트
    - **Property 5: 편의시설 필수 정보 포함**
    - **Validates: Requirements 4.1**

- [ ] 9. Checkpoint - 스팟 상세 페이지 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. 커뮤니티 게시판 구현
  - [ ] 10.1 Posts API 라우트 구현
    - `GET /api/posts` - 게시글 목록
    - `POST /api/posts` - 게시글 작성
    - `GET /api/posts/[id]` - 게시글 상세
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 10.2 Comments API 라우트 구현
    - `GET /api/posts/[id]/comments` - 댓글 목록
    - `POST /api/posts/[id]/comments` - 댓글 작성
    - _Requirements: 5.3, 5.4_
  - [ ] 10.3 게시글 유효성 검사 속성 테스트
    - **Property 7: 게시글 유효성 검사**
    - **Validates: Requirements 5.2**
  - [ ] 10.4 댓글 시간순 정렬 속성 테스트
    - **Property 8: 댓글 시간순 정렬**
    - **Validates: Requirements 5.4**
  - [ ] 10.5 PostList 컴포넌트 구현
    - 게시글 목록 표시
    - _Requirements: 5.1_
  - [ ] 10.6 게시글 목록 필수 정보 포함 속성 테스트
    - **Property 6: 게시글 목록 필수 정보 포함**
    - **Validates: Requirements 5.1**
  - [ ] 10.7 PostDetail 및 CommentSection 컴포넌트 구현
    - 게시글 상세 및 댓글 표시
    - 댓글 작성 폼
    - _Requirements: 5.3, 5.4_
  - [ ] 10.8 게시판 페이지 구현
    - `src/app/community/page.tsx` - 목록 페이지
    - `src/app/community/[id]/page.tsx` - 상세 페이지
    - _Requirements: 5.1, 5.3_

- [ ] 11. Checkpoint - 커뮤니티 기능 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. 반응형 디자인 및 마무리
  - [ ] 12.1 반응형 레이아웃 적용
    - 모바일/태블릿/데스크톱 대응
    - _Requirements: 7.1, 7.2_
  - [ ] 12.2 네이비 테마 일관성 확인
    - 전체 페이지 테마 적용 확인
    - _Requirements: 1.4, 7.3_
  - [ ] 12.3 에러 핸들링 및 로딩 상태 구현
    - API 에러 처리
    - 로딩 스켈레톤/스피너
    - _Requirements: 5.5_

- [ ] 13. Final Checkpoint - 전체 기능 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

---

## 📋 작업 진행 가이드

## 📋 작업 진행 가이드

### ⚠️ Task 실행 전 필수 체크리스트

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

**현재 완료된 작업:**

- Task 4 (상태 관리 설정): 924줄 - **리뷰하기에 너무 많음**

**앞으로의 개선 방향:**
각 Task를 500줄 이하의 하위 브랜치로 분할하여 리뷰 효율성 향상

**예시 분할 전략:**

```
Task 5 (지도 컴포넌트 구현) → 3개 브랜치로 분할
├── feat/5-1--leaflet-map-setup (~200줄)
├── feat/5-2--spot-pins-markers (~150줄)
└── feat/5-3--spot-preview-popup (~200줄)

Task 8 (스팟 상세 페이지) → 2개 브랜치로 분할
├── feat/8-1--spot-detail-page (~300줄)
└── feat/8-2--nearby-facilities (~250줄)
```

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
