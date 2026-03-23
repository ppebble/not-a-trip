# Implementation Plan: Sentry Integration

## Overview

Not a Trip 프로젝트에 `@sentry/nextjs` SDK를 통합하여 클라이언트/서버 에러 모니터링을 구현한다. 환경별 설정 분리, ErrorBoundary 통합, 소스맵 업로드, 광고 차단기 우회 터널, 사용자 컨텍스트 설정을 단계적으로 구현한다.

## Tasks

- [x] 1. Sentry SDK 설치 및 기본 설정
  - [x] 1.1 `@sentry/nextjs` 패키지 설치 및 환경 변수 추가
    - `npm install @sentry/nextjs` 실행
    - `.env.example`에 Sentry 관련 환경 변수 추가 (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`)
    - `.env.local`에 실제 DSN 값 설정
    - _Requirements: 1.1, 2.1, 2.2, 2.5, 2.6_

  - [x] 1.2 환경별 설정 헬퍼 함수 생성
    - `src/lib/sentry.ts` 파일 생성
    - `getSentryConfig(env: string)` 함수 구현
    - `isSentryEnabled(dsn)` 헬퍼 함수 구현
    - _Requirements: 2.3, 2.4, 2.7, 5.1, 5.2, 5.3, 5.4_

  - [x] 1.3 Sentry 초기화 설정 파일 생성
    - `src/instrumentation-client.ts` 생성 (클라이언트 측 초기화, 환경별 설정 적용, DSN guard, tunnel, replayIntegration)
    - `sentry.server.config.ts` 생성 (서버 측 초기화, DSN guard, 환경별 tracesSampleRate)
    - `sentry.edge.config.ts` 생성 (Edge Runtime 초기화, DSN guard, 환경별 tracesSampleRate)
    - `src/instrumentation.ts` 생성 (런타임별 config 동적 import, onRequestError)
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.3, 2.4, 2.7, 5.1, 5.2, 5.3, 5.4, 6.2_

  - [x] 1.4 Next.js 설정 수정
    - `next.config.ts`에 `withSentryConfig` 래퍼 적용
    - `tunnelRoute: "/monitoring"` 설정 (광고 차단기 우회)
    - sentryConfig 옵션: `silent`, `widenClientFileUpload`, `treeshake.removeDebugLogging`
    - _Requirements: 1.6, 4.1, 4.3, 4.4, 4.5, 6.1, 6.3_

  - [x] 1.5 `global-error.tsx` 최상위 에러 처리 페이지 생성
    - `src/app/global-error.tsx` 생성
    - `useEffect`에서 `Sentry.captureException` 호출
    - "다시 시도" 버튼으로 `reset()` 호출
    - 프로젝트 스타일(Tailwind CSS, 한글 UI)과 일관된 UI
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 1.6 `.gitignore` 업데이트
    - `.env.sentry-build-plugin` 파일 제외 추가

- [ ] 2. Checkpoint - 기본 설정 검증
  - `npm run build`로 빌드 정상 동작 확인
  - `npm run type-check`로 타입 에러 없음 확인
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. ErrorBoundary 컴포넌트에 Sentry 보고 추가
  - [ ] 3.1 `componentDidCatch`에서 `Sentry.captureException` 호출 추가
    - Sentry SDK 초기화 여부 확인 후 조건부 호출
    - 기존 `console.error` 동작 유지 (항상 실행)
    - _Requirements: 3.1, 3.5_

  - [ ]* 3.2 에러 핸들러 Sentry 보고 속성 테스트 작성
    - **Property 3: 에러 핸들러의 Sentry 보고 (Error Capture)**
    - `fc.string()`으로 임의의 에러 메시지 생성, ErrorBoundary의 `componentDidCatch` 호출 시 `captureException` 호출 확인
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 3.3 Sentry 미초기화 시 ErrorBoundary 정상 동작 속성 테스트 작성
    - **Property 4: Sentry 미초기화 시 ErrorBoundary 정상 동작 (Graceful Degradation)**
    - Sentry mock 없이 ErrorBoundary에 에러 전달 시 `console.error` 호출 및 폴백 UI 렌더링 확인
    - **Validates: Requirements 3.5**

- [ ] 4. 사용자 컨텍스트 설정
  - [ ] 4.1 `SentryUserManager` 컴포넌트 생성
    - `src/components/common/SentryUserManager.tsx` 파일 생성
    - `useSession()`으로 세션 감지
    - 로그인 시 `Sentry.setUser({ id: session.user.id })` 호출
    - 로그아웃 시 `Sentry.setUser(null)` 호출
    - 이메일/이름 등 개인정보 절대 포함하지 않음
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 4.2 `Providers` 컴포넌트에 `SentryUserManager` 추가
    - `src/lib/providers.tsx`의 `SessionProvider` 하위에 `SentryUserManager` 배치
    - _Requirements: 7.1_

  - [ ]* 4.3 사용자 컨텍스트 PII 보호 속성 테스트 작성
    - **Property 5: 사용자 컨텍스트 PII 보호 (User Context Privacy)**
    - `fc.record({ id: fc.string(), email: fc.emailAddress(), name: fc.string() })`로 임의의 세션 데이터 생성
    - `Sentry.setUser` 호출 시 `id` 필드만 포함, `email`/`username`/`name`/`ip_address` 미포함 확인
    - 로그아웃 시 `Sentry.setUser(null)` 호출 확인
    - **Validates: Requirements 7.1, 7.2**

- [ ]* 5. 속성 테스트 - 환경별 설정 및 DSN Guard
  - [ ]* 5.1 환경별 설정 헬퍼 속성 테스트 작성
    - **Property 1: 환경별 설정값 정합성 (Environment Config Mapping)**
    - `fc.constantFrom('development', 'production')`으로 환경별 반환값 검증
    - **Validates: Requirements 2.3, 2.4, 5.1, 5.2, 5.3, 5.4**

  - [ ]* 5.2 DSN Guard 속성 테스트 작성
    - **Property 2: DSN 미설정 시 초기화 건너뛰기 (DSN Guard)**
    - `fc.constantFrom(undefined, '', null)`로 falsy DSN 값에 대해 `isSentryEnabled`가 false 반환 확인
    - **Validates: Requirements 2.7**

- [ ] 6. Final Checkpoint - 전체 통합 검증
  - `npm run build`로 빌드 정상 동작 확인
  - `npm run type-check`로 타입 에러 없음 확인
  - `npm test`로 모든 테스트 통과 확인
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 각 task는 specific requirements 번호를 참조하여 추적 가능
- Checkpoints에서 점진적 검증 수행
- Property tests는 fast-check 라이브러리 사용 (이미 devDependencies에 포함)
- 최신 Sentry SDK에서 `tunnelRoute` 옵션이 App Router도 지원하므로 `rewrites` 대신 `tunnelRoute` 사용
- 클라이언트 초기화는 `src/instrumentation-client.ts`에 위치 (최신 Sentry SDK 방식)
- `instrumentation.ts`는 `src/instrumentation.ts`에 위치 (Next.js 15 표준)
