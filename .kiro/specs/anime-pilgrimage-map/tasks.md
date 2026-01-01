# Implementation Plan: Anime Pilgrimage Map

## Overview

Next.js 15 App Router 기반의 애니메이션 성지순례 스팟 공유 웹 플랫폼 구현 계획입니다. TanStack Query, Zustand, Tailwind CSS를 활용하여 단계적으로 구현합니다.

## 🔄 Git 워크플로우 및 브랜치 전략

### 브랜치 명명 규칙

```
{type}/{이슈번호}--{요약}
```

**타입**: `feat`, `fix`, `ui`, `enhancement`, `chore`, `refactor`, `hotfix`
**예시**: `feat/4--state-management-setup`

### 작업 진행 방식

1. **develop 브랜치에서 새 브랜치 생성**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/{이슈번호}--{요약}
   ```

2. **작업 완료 후 커밋**

   ```bash
   git add .
   git commit -m "feat: 작업 내용 요약"
   git push -u origin feat/{이슈번호}--{요약}
   ```

3. **develop으로 PR 생성**
   - GitHub에서 develop 브랜치로 PR 생성
   - PR 템플릿에 따라 상세 정보 작성
   - CI 통과 후 리뷰 및 머지

### 주의사항

- 브랜치명은 모두 소문자, 하이픈 사용
- 한 번에 하나의 task만 작업
- 각 task 완료 후 반드시 PR 생성

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

### 각 Task 시작 전 체크리스트

1. **브랜치 생성**: `feat/{task번호}--{간단한-설명}`
2. **Task 상태 업데이트**: `taskStatus` 도구로 "in_progress" 설정
3. **요구사항 확인**: 해당 task의 Requirements 번호 확인
4. **하위 작업 순서**: 하위 task가 있으면 순서대로 진행

### 각 Task 완료 후 체크리스트

1. **코드 품질 확인**: `npm run lint`, `npm run type-check`, `npm run build`
2. **Task 상태 업데이트**: `taskStatus` 도구로 "completed" 설정
3. **커밋 및 푸시**: 의미있는 커밋 메시지로 푸시
4. **PR 생성**: develop 브랜치로 PR 생성 (템플릿 활용)

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

- **현재 완료**: Task 1 (프로젝트 초기 설정), Task 2 (데이터베이스 및 API 기반 구축), Task 3 (Checkpoint), Task 4 (상태 관리 설정)
- **다음 예정**: Task 5 (지도 컴포넌트 구현)
- **현재 브랜치**: `feat/4--state-management-setup` (PR 대기 중)
- **다음 브랜치**: `feat/5-1--leaflet-map-setup` (PilgrimageMap 컴포넌트 기본 구현)

---

## Notes

- 모든 태스크는 필수입니다
- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다
- 체크포인트에서 점진적 검증을 수행합니다
- 속성 테스트는 보편적 정확성 속성을 검증합니다
- 단위 테스트는 특정 예제와 에지 케이스를 검증합니다
- 단위 테스트는 특정 예제와 에지 케이스를 검증합니다
