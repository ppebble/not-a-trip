# Implementation Plan: OAuth Integration

## Overview

X(Twitter) OAuth 프로바이더 추가, Auth.js 기본 보안 정책 준수(자동 Account Linking 차단), Account_Settings_Page를 통한 수동 Account Linking, 소셜 전용 계정 비밀번호 설정, 로그인 오류 페이지 개선을 구현합니다. 기존 `src/lib/auth.ts`의 NextAuth 설정을 확장하고, 신규 API 엔드포인트와 설정 페이지를 추가합니다.

## Tasks

- [x] 1. X(Twitter) OAuth 프로바이더 추가 및 Auth 설정 확장
  - [x] 1.1 `src/lib/auth.ts`에 X(Twitter) 프로바이더 추가
    - `next-auth/providers/twitter`에서 Twitter 프로바이더 import
    - providers 배열에 Twitter 프로바이더 추가 (`TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` 환경변수 사용)
    - X(Twitter)가 이메일 미제공 시에도 계정 생성이 가능하도록 처리 (사용자 ID를 고유 식별자로 사용)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [x] 1.2 `src/hooks/useAuth.ts`의 `loginWithProvider` 타입 확장
    - provider 파라미터 타입에 `'twitter'` 추가: `'google' | 'kakao' | 'naver' | 'twitter'`
    - _Requirements: 1.2_

  - [x] 1.3 `.env.example`에 X(Twitter) OAuth 환경변수 추가
    - `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET` 항목 추가
    - _Requirements: 1.1_

  - [ ]* 1.4 X(Twitter) 프로바이더 단위 테스트 작성
    - X(Twitter) 이메일 미제공 시 계정 생성 테스트 (edge-case: 1.6)
    - _Requirements: 1.3, 1.4, 1.6_

- [x] 2. Sign_In_Page에 X(Twitter) 로그인 버튼 추가
  - [x] 2.1 `src/app/auth/signin/page.tsx`에 X(Twitter) 로그인 버튼 추가
    - X(Twitter) 브랜드 아이콘과 "X(Twitter)로 로그인" 텍스트 표시
    - 기존 Google, Kakao, Naver 버튼과 동일한 레이아웃으로 배치
    - 로그인 요청 처리 중 모든 버튼 비활성화 상태 유지
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 2.2 Sign_In_Page 단위 테스트 작성
    - X(Twitter) 버튼 렌더링 확인 (example: 2.1, 2.2)
    - 로딩 중 버튼 비활성화 확인 (example: 2.3)
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. 동일 이메일 계정 보호 및 오류 페이지 개선
  - [x] 3.1 Auth.js 기본 보안 정책 확인 및 `signIn` 콜백 정비
    - `allowDangerousEmailAccountLinking` 미사용 확인
    - Auth.js 기본 동작으로 동일 이메일 다른 프로바이더 로그인 시 `OAuthAccountNotLinked` 에러 발생 확인
    - OAuth 이메일 미제공 시 기존 계정과 충돌 없이 새 계정 생성 처리
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1_

  - [x] 3.2 `src/app/auth/error/page.tsx` 오류 메시지 개선
    - `OAuthAccountNotLinked` 에러 시 "이미 다른 로그인 방식으로 가입된 이메일입니다. 기존 방식으로 로그인한 후 계정 설정에서 소셜 계정을 연결해주세요." 메시지 표시
    - `OAuthSignin`, `OAuthCallback` 등 오류 유형별 구체적 한국어 메시지 매핑
    - Sign_In_Page로 돌아가는 링크 제공
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 3.3 Property 테스트 — 중복 이메일 거부
    - **Property 1: Duplicate email rejection**
    - **Validates: Requirements 3.1, 3.3, 8.1**

  - [ ]* 3.4 Property 테스트 — 에러 메시지 매핑 완전성
    - **Property 11: Error message mapping completeness**
    - **Validates: Requirements 10.1**

  - [ ]* 3.5 오류 페이지 단위 테스트 작성
    - OAuthAccountNotLinked 에러 메시지 정확성 (example: 10.3)
    - 오류 페이지에 로그인 페이지 링크 존재 (example: 10.2)
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 4. Checkpoint — 기본 OAuth 플로우 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. 계정 연동 API 엔드포인트 구현
  - [ ] 5.1 `src/app/api/account/linked-accounts/route.ts` 생성 — GET 핸들러
    - 인증된 사용자의 연결된 계정 목록 조회 (accounts 컬렉션에서 userId로 조회)
    - 응답: `{ accounts: LinkedAccount[], hasPassword: boolean }`
    - 미인증 요청 시 401 응답
    - _Requirements: 6.1, 6.3, 5.1_

  - [ ] 5.2 `src/app/api/account/linked-accounts/route.ts` 확장 — DELETE 핸들러
    - 지정된 프로바이더 연결 해제 (accounts 컬렉션에서 제거)
    - 마지막 로그인 수단 해제 시 400 에러 반환 ("최소 하나의 로그인 수단이 필요합니다")
    - 존재하지 않는 프로바이더 해제 시 404 응답
    - 미인증 요청 시 401 응답
    - Account Linking 이벤트(해제) 서버 로그 기록
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 5.5, 5.6, 8.4_

  - [ ] 5.3 `src/app/api/account/set-password/route.ts` 생성 — POST 핸들러
    - 소셜 전용 계정에 비밀번호 설정 (bcrypt 해시 후 users 컬렉션 업데이트)
    - 비밀번호 최소 6자 검증
    - 이미 비밀번호 설정된 경우 409 응답
    - 미인증 요청 시 401 응답
    - _Requirements: 5.8, 6.3_

  - [ ]* 5.4 Property 테스트 — 미인증 API 거부
    - **Property 8: Unauthenticated API rejection**
    - **Validates: Requirements 6.3, 8.2**

  - [ ]* 5.5 Property 테스트 — 연결 해제 동작
    - **Property 5: Unlinking removes provider from account**
    - **Validates: Requirements 5.5, 6.2**

  - [ ]* 5.6 Property 테스트 — 마지막 로그인 수단 보호
    - **Property 6: Last login method protection**
    - **Validates: Requirements 5.6, 6.5**

  - [ ]* 5.7 Property 테스트 — 비밀번호 설정 라운드 트립
    - **Property 7: Password setting round trip**
    - **Validates: Requirements 5.8**

  - [ ]* 5.8 Property 테스트 — 연결된 계정 목록 완전성
    - **Property 12: Linked accounts API returns complete list**
    - **Validates: Requirements 5.1, 6.1**

  - [ ]* 5.9 단위 테스트 — 존재하지 않는 프로바이더 해제 시 404 응답
    - 존재하지 않는 프로바이더 해제 시 404 응답 (edge-case: 6.4)
    - _Requirements: 6.4_

- [ ] 6. Checkpoint — API 엔드포인트 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. useLinkedAccounts Hook 및 Account_Settings_Page 구현
  - [ ] 7.1 `src/hooks/useLinkedAccounts.ts` 생성
    - React Query 기반 연결된 계정 목록 조회 (`GET /api/account/linked-accounts`)
    - 연결 해제 mutation (`DELETE /api/account/linked-accounts`)
    - 비밀번호 설정 mutation (`POST /api/account/set-password`)
    - 계정 연결 래퍼 함수 (`signIn(provider, { callbackUrl: '/settings/account' })`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 7.2 `src/app/settings/account/page.tsx` 생성 — Account_Settings_Page
    - 로그인된 사용자만 접근 가능 (미인증 시 로그인 페이지로 리다이렉트)
    - 연결된 모든 Linked_Account 목록 표시 (프로바이더 이름, 연결 상태)
    - 미연결 OAuth_Provider에 "연결하기" 버튼 표시
    - 연결된 Linked_Account에 "연결 해제" 버튼 표시
    - 마지막 로그인 수단 해제 시도 시 에러 메시지 표시
    - 연결 해제 실패 시 기존 상태 유지 및 에러 메시지 표시
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 7.3 Account_Settings_Page에 비밀번호 설정 폼 추가
    - 소셜 전용 계정(비밀번호 미설정)인 경우 비밀번호 설정 폼 표시
    - 비밀번호 입력 및 확인 필드, 최소 6자 클라이언트 검증
    - 설정 성공/실패 시 toast 메시지 표시
    - _Requirements: 5.8_

  - [ ]* 7.4 Property 테스트 — 수동 연결 시 프로바이더 추가
    - **Property 2: Manual linking adds provider to account**
    - **Validates: Requirements 4.1, 5.3**

  - [ ]* 7.5 Property 테스트 — 중복 연결 멱등성
    - **Property 4: Duplicate linking is idempotent**
    - **Validates: Requirements 4.4**

- [ ] 8. 수동 Account Linking 보안 및 프로필 보존 처리
  - [ ] 8.1 `src/lib/auth.ts`의 `signIn` 콜백에 Account Linking 보안 로직 추가
    - 로그인된 세션이 유효한 경우에만 계정 연결 허용
    - `email_verified: false`인 프로바이더의 계정 연결 거부
    - Account Linking 이벤트(연결, 해제) 서버 로그 기록
    - _Requirements: 8.2, 8.3, 8.4_

  - [ ] 8.2 프로필 정보 동기화 로직 구현
    - 소셜 계정 최초 가입 시 OAuth_Provider 프로필 정보(이름, 이미지) 저장
    - 기존 프로필 정보가 있는 사용자가 새 프로바이더 연결 시 기존 정보 유지
    - users 컬렉션의 `provider` 필드에 Primary_Account 프로바이더 저장
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 8.3 Property 테스트 — 연결 시 프로필 보존
    - **Property 9: Profile preservation on linking**
    - **Validates: Requirements 7.2, 7.3**

  - [ ]* 8.4 Property 테스트 — 이메일 검증 필수
    - **Property 10: Email verification required for linking**
    - **Validates: Requirements 8.3**

  - [ ]* 8.5 Property 테스트 — 연결된 계정으로 이중 로그인
    - **Property 3: Linked account enables dual login**
    - **Validates: Requirements 4.2, 4.3**

- [ ] 9. 기존 OAuth 프로바이더 정비 및 데이터 정합성
  - [ ] 9.1 기존 Google, Kakao, Naver 프로바이더 Account Linking 호환성 확인
    - 모든 OAuth_Provider에 동일한 Account_Linking 로직 적용 확인
    - 기존 소셜 로그인 사용자 로그인 시 accounts 컬렉션에 연결 정보 존재 확인, 없으면 자동 생성
    - users 컬렉션의 `provider` 필드와 accounts 컬렉션 데이터 정합성 유지
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 9.2 Property 테스트 — 프로바이더 데이터 정합성 불변식
    - **Property 13: Provider data consistency invariant**
    - **Validates: Requirements 9.3**

- [ ] 10. Final Checkpoint — 전체 통합 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` 표시된 태스크는 선택사항이며 빠른 MVP를 위해 건너뛸 수 있습니다
- 각 태스크는 특정 Requirements를 참조하여 추적 가능합니다
- Property 테스트는 `fast-check` 라이브러리를 사용합니다
- 수동 Account Linking은 Auth.js의 `signIn()` 함수를 활용하며 별도 커스텀 API를 구축하지 않습니다
- 환경변수 `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`는 X Developer Portal에서 발급 필요합니다
