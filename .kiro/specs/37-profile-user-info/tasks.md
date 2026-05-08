# 구현 계획: 프로필 페이지 실제 유저 정보 표시

## 개요

`/profile/[id]` 페이지에서 하드코딩된 `'순례자'` 대신 실제 유저 정보를 표시한다.
`GET /api/users/[id]` API Route 신규 구현 → API 상수 등록 → `useUserInfo` 훅 추가 → 프로필 페이지 수정 순서로 진행하며, 본인/타인 프로필 구분 및 편집 버튼 조건부 노출을 포함한다.

## Tasks

- [ ] 1. API 상수 등록 및 API Route 구현
  - [ ] 1.1 `API_ROUTES.USERS.INFO` 상수 추가
    - `src/lib/api-routes.ts`의 `USERS` 객체에 `INFO: (id: string) => \`/api/users/\${id}\`` 항목 추가
    - 기존 `STATS`, `BADGES`, `PROGRESS` 항목 위에 위치
    - _Requirements: 5.1_

  - [ ] 1.2 `GET /api/users/[id]` API Route 구현
    - `src/app/api/users/[id]/route.ts` 신규 생성
    - `getCollection`과 `COLLECTIONS` 임포트, 기존 `stats/route.ts` 패턴 준수
    - MongoDB projection으로 `_id`, `name`, `image`, `createdAt`만 조회 (`password`, `email` 등 민감 필드 제외)
    - `findOne` 결과가 `null`이면 404 반환
    - `_id`를 `id`로 변환, `createdAt`을 `toISOString()`으로 직렬화하여 응답
    - DB 오류 시 500 반환
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.3 API Route 속성 테스트 — Property 1: API 응답 필드 완전성
    - **Property 1: API 응답 필드 완전성**
    - `__tests__/profile-user-info/api.property.test.ts` 신규 생성
    - 유효한 유저 도큐먼트에 대해 응답에 `id`, `name`, `image`, `createdAt` 필드가 항상 포함됨을 검증
    - fast-check 100회 이상, 태그: `Feature: 37-profile-user-info, Property 1: API 응답 필드 완전성`
    - **Validates: Requirements 1.2**

  - [ ]* 1.4 API Route 속성 테스트 — Property 2: 민감 필드 비노출
    - **Property 2: 민감 필드 비노출**
    - `__tests__/profile-user-info/api.property.test.ts`에 추가
    - `password`, `email` 포함 여부와 무관하게 응답에 두 필드가 절대 포함되지 않음을 검증
    - fast-check 100회 이상, 태그: `Feature: 37-profile-user-info, Property 2: 민감 필드 비노출`
    - **Validates: Requirements 1.5**

- [ ] 2. `useUserInfo` React Query 훅 구현
  - [ ] 2.1 `UserInfo` 타입 및 `userKeys.info` 쿼리 키 추가
    - `src/hooks/useUserQueries.ts`에 `UserInfo` 인터페이스 추가 (`id`, `name`, `image`, `createdAt` 필드)
    - `userKeys` 팩토리에 `info: (userId: string) => [...userKeys.all, 'info', userId] as const` 추가
    - _Requirements: 2.3, 2.5_

  - [ ] 2.2 `useUserInfo` 훅 구현
    - `src/hooks/useUserQueries.ts`에 `useUserInfo(userId: string | undefined)` 훅 추가
    - `API_ROUTES.USERS.INFO(userId)` 상수 사용
    - `enabled: !!userId` 조건으로 빈 문자열 및 `undefined` 시 요청 차단
    - API 실패 시 에러 throw
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.2_

  - [ ]* 2.3 훅 속성 테스트 — Property 3: 빈 userId 요청 차단
    - **Property 3: 빈 userId 요청 차단**
    - `__tests__/profile-user-info/hook.property.test.ts` 신규 생성
    - `undefined` 또는 빈 문자열 전달 시 `enabled` 조건이 `false`가 되어 API 요청이 실행되지 않음을 검증
    - fast-check 100회 이상, 태그: `Feature: 37-profile-user-info, Property 3: 빈 userId 요청 차단`
    - **Validates: Requirements 2.2**

- [ ] 3. 체크포인트 — API 및 훅 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. 프로필 페이지 수정
  - [ ] 4.1 `formatJoinDate` 유틸 함수 구현 및 유저 정보 연동
    - `src/app/profile/[id]/page.tsx` 수정
    - `useUserInfo`, `useSession` 임포트 추가
    - `formatJoinDate(createdAt: string): string` 함수 구현 — `YYYY년 MM월 가입` 형식 반환 (월 두 자리 패딩)
    - `useUserInfo(userId)` 훅 호출, `isLoading` 조건에 `userInfoLoading` 포함
    - 하드코딩된 `userInfo` 객체 제거, 실제 `userInfo` 데이터 사용
    - `userInfo.image` 존재 시 `Image` 컴포넌트, 없으면 `AppIcon name="profile-front"` 표시
    - `userInfo.createdAt` 존재 시 `formatJoinDate` 결과를 프로필 헤더에 표시
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 4.2 유틸 속성 테스트 — Property 5: 가입일 포맷 일관성
    - **Property 5: 가입일 포맷 일관성**
    - `__tests__/profile-user-info/format.property.test.ts` 신규 생성
    - 임의의 유효한 `Date` 값에 대해 `formatJoinDate`가 항상 `/^\d{4}년 \d{2}월 가입$/` 패턴을 반환함을 검증
    - fast-check 100회 이상, 태그: `Feature: 37-profile-user-info, Property 5: 가입일 포맷 일관성`
    - **Validates: Requirements 3.5**

  - [ ] 4.3 본인/타인 프로필 구분 및 편집 버튼 조건부 노출
    - `src/app/profile/[id]/page.tsx` 수정
    - `useSession()` 훅으로 현재 세션 조회
    - `isOwner = session?.user?.id === userId` 계산
    - `isOwner`가 `true`일 때만 프로필 헤더에 편집 버튼 렌더링
    - 편집 버튼 클릭 시 `/profile/edit` 경로로 이동 (`Link` 컴포넌트 사용)
    - 비로그인 상태(`session === null`) 및 타인 프로필에서는 편집 버튼 미표시
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 4.4 편집 버튼 속성 테스트 — Property 6: 편집 버튼 소유권 조건
    - **Property 6: 편집 버튼 소유권 조건**
    - `__tests__/profile-user-info/ownership.property.test.ts` 신규 생성
    - 임의의 `sessionUserId`와 `urlUserId` 조합에 대해 두 값이 동일할 때만 `isOwner`가 `true`임을 검증
    - fast-check 100회 이상, 태그: `Feature: 37-profile-user-info, Property 6: 편집 버튼 소유권 조건`
    - **Validates: Requirements 4.2, 4.3, 4.4**

  - [ ]* 4.5 유저 이름 렌더링 속성 테스트 — Property 4: 유저 이름 렌더링
    - **Property 4: 유저 이름 렌더링**
    - `__tests__/profile-user-info/render.property.test.ts` 신규 생성
    - 유효한 `UserInfo` 데이터에 대해 프로필 페이지 헤더에 `userInfo.name`이 항상 표시됨을 검증
    - fast-check 100회 이상, 태그: `Feature: 37-profile-user-info, Property 4: 유저 이름 렌더링`
    - **Validates: Requirements 3.2**

- [ ] 5. 최종 체크포인트 — 전체 기능 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적 가능
- 체크포인트에서 증분 검증 수행
- 속성 테스트는 설계 문서의 Correctness Properties를 검증
- `src/app/api/users/[id]/route.ts` 신규 생성 시 기존 `stats/route.ts` 패턴을 그대로 따름
- `useUserInfo` 훅은 기존 `useUserStats` 등과 동일한 파일(`useUserQueries.ts`)에 추가
