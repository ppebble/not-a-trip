# Requirements Document

## Introduction

Not a Trip 프로젝트에 Sentry 에러 모니터링을 도입한다. 클라이언트(브라우저)와 서버(Node.js) 양쪽에서 발생하는 에러를 자동으로 수집하고, 소스맵을 통해 원본 코드 위치를 추적할 수 있도록 한다. 환경(development, staging, production)별로 분리된 설정을 적용하며, 기존 ErrorBoundary 컴포넌트와 Sentry를 통합하여 렌더링 에러도 캡처한다.

## Glossary

- **Sentry_SDK**: Sentry에서 제공하는 JavaScript/Node.js 에러 모니터링 라이브러리 (`@sentry/nextjs`)
- **DSN**: Sentry 프로젝트에 에러를 전송하기 위한 고유 식별 URL (Data Source Name)
- **Source_Map**: 빌드된 코드와 원본 TypeScript 소스 코드 간의 매핑 파일
- **Error_Boundary**: React 컴포넌트 트리에서 발생한 렌더링 에러를 포착하는 컴포넌트
- **Instrumentation**: Next.js 서버 시작 시 실행되는 초기화 훅 (`instrumentation.ts`)
- **Sample_Rate**: 전체 이벤트 중 Sentry로 전송할 비율 (0.0 ~ 1.0)
- **Next_Config**: Next.js 빌드 및 런타임 설정 파일 (`next.config.ts`)
- **Global_Error_Page**: Next.js App Router의 최상위 에러 처리 페이지 (`global-error.tsx`)
- **Tunnel_Route**: Sentry 이벤트를 프록시하여 광고 차단기 우회를 지원하는 API 경로

## Requirements

### Requirement 1: Sentry SDK 설치 및 초기화

**User Story:** As a 개발자, I want Sentry SDK가 프로젝트에 설치되고 초기화되도록, so that 클라이언트와 서버에서 발생하는 에러를 자동으로 수집할 수 있다.

#### Acceptance Criteria

1. THE Sentry_SDK SHALL `@sentry/nextjs` 패키지를 프로젝트 의존성으로 포함한다
2. WHEN Next.js 애플리케이션이 브라우저에서 로드될 때, THE Sentry_SDK SHALL 클라이언트 측 초기화를 수행한다 (`sentry.client.config.ts`)
3. WHEN Next.js 서버가 시작될 때, THE Sentry_SDK SHALL 서버 측 초기화를 수행한다 (`sentry.server.config.ts`)
4. WHEN Next.js Edge Runtime이 시작될 때, THE Sentry_SDK SHALL Edge 환경 초기화를 수행한다 (`sentry.edge.config.ts`)
5. THE Instrumentation SHALL `src/instrumentation.ts` 파일에 위치하여 Next.js 15 표준 런타임 훅으로 Sentry 서버/Edge 설정을 등록한다 (Next.js 15에서 정식 기능으로 승격되어 experimental 설정 불필요)
6. THE Next_Config SHALL `withSentryConfig` 래퍼를 통해 Sentry 빌드 플러그인을 적용한다

### Requirement 2: 환경 변수 및 환경별 설정

**User Story:** As a 개발자, I want 환경별로 Sentry 설정이 분리되도록, so that development에서는 불필요한 에러 전송을 방지하고 production에서는 모든 에러를 수집할 수 있다.

#### Acceptance Criteria

1. THE Sentry_SDK SHALL DSN 값을 `NEXT_PUBLIC_SENTRY_DSN` 환경 변수에서 읽는다
2. THE Sentry_SDK SHALL `SENTRY_AUTH_TOKEN` 환경 변수를 소스맵 업로드 인증에 사용한다
3. WHILE 환경이 development인 동안, THE Sentry_SDK SHALL Sample_Rate를 0.0으로 설정하여 에러 전송을 비활성화한다
4. WHILE 환경이 production인 동안, THE Sentry_SDK SHALL Sample_Rate를 1.0으로 설정하여 모든 에러를 전송한다
5. THE Sentry_SDK SHALL `SENTRY_ORG`와 `SENTRY_PROJECT` 환경 변수를 빌드 시 소스맵 업로드에 사용한다
6. THE Sentry_SDK SHALL `.env.example` 파일에 모든 Sentry 관련 환경 변수를 문서화한다
7. IF DSN 환경 변수가 설정되지 않은 경우, THEN THE Sentry_SDK SHALL 초기화를 건너뛰고 애플리케이션을 정상적으로 실행한다

### Requirement 3: 에러 바운더리 통합

**User Story:** As a 개발자, I want 기존 ErrorBoundary 컴포넌트가 Sentry와 통합되도록, so that React 렌더링 에러가 자동으로 Sentry에 보고된다.

#### Acceptance Criteria

1. THE Error_Boundary SHALL `componentDidCatch`에서 포착한 에러를 Sentry에 전송한다
2. THE Global_Error_Page SHALL `src/app/global-error.tsx` 파일로 생성되어 최상위 에러를 처리한다
3. WHEN Global_Error_Page가 에러를 포착할 때, THE Global_Error_Page SHALL 해당 에러를 Sentry에 보고한다
4. WHEN 사용자가 에러 화면에서 "다시 시도" 버튼을 클릭할 때, THE Global_Error_Page SHALL 에러 상태를 초기화하고 페이지를 복구한다
5. IF Sentry_SDK가 초기화되지 않은 상태에서 에러가 발생한 경우, THEN THE Error_Boundary SHALL 기존 console.error 동작을 유지하고 정상적으로 폴백 UI를 표시한다

### Requirement 4: 소스맵 업로드

**User Story:** As a 개발자, I want 빌드 시 소스맵이 Sentry에 자동 업로드되도록, so that 에러 발생 시 원본 TypeScript 코드 위치를 확인할 수 있다.

#### Acceptance Criteria

1. WHEN 프로덕션 빌드가 실행될 때, THE Next_Config SHALL Source_Map 파일을 Sentry에 자동 업로드한다
2. THE Next_Config SHALL 업로드 완료 후 배포 번들에서 Source_Map 파일을 제거하여 클라이언트에 노출되지 않도록 한다
3. THE Next_Config SHALL `widenClientFileUpload` 옵션을 활성화하여 클라이언트 소스맵 커버리지를 확장한다
4. IF 소스맵 업로드가 실패한 경우, THEN THE Next_Config SHALL 빌드를 중단하지 않고 경고 로그를 출력한다
5. THE Next_Config SHALL Sentry 빌드 로그를 비활성화하여 빌드 출력을 깔끔하게 유지한다

### Requirement 5: 성능 모니터링 및 세션 리플레이

**User Story:** As a 개발자, I want 성능 트레이싱과 세션 리플레이를 설정할 수 있도록, so that 에러 발생 전후의 사용자 행동과 성능 병목을 파악할 수 있다.

#### Acceptance Criteria

1. WHILE 환경이 production인 동안, THE Sentry_SDK SHALL 성능 트레이싱 Sample_Rate를 0.1로 설정한다
2. WHILE 환경이 production인 동안, THE Sentry_SDK SHALL 세션 리플레이 Sample_Rate를 0.1로 설정한다
3. WHEN 에러가 발생한 세션에서, THE Sentry_SDK SHALL 해당 세션의 리플레이 Sample_Rate를 1.0으로 설정하여 에러 세션을 전수 캡처한다
4. WHILE 환경이 development인 동안, THE Sentry_SDK SHALL 성능 트레이싱과 세션 리플레이를 비활성화한다

### Requirement 6: 광고 차단기 우회를 위한 터널 라우트

**User Story:** As a 개발자, I want Sentry 이벤트가 광고 차단기에 의해 차단되지 않도록, so that 모든 클라이언트 에러를 누락 없이 수집할 수 있다.

#### Acceptance Criteria

1. THE Next_Config SHALL `rewrites` 기능을 사용하여 `/monitoring` 경로의 요청을 Sentry DSN 서버로 프록시 포워딩한다 (Sentry의 `tunnelRoute` 옵션은 Pages Router 기반이므로 App Router 전용 프로젝트에서는 사용하지 않는다)
2. WHEN 클라이언트에서 Sentry 이벤트가 발생할 때, THE Sentry_SDK SHALL `sentry.client.config.ts`의 `tunnel` 옵션을 통해 `/monitoring` 경로로 이벤트를 전송한다
3. THE Next_Config의 rewrites SHALL `/monitoring` 요청을 Sentry ingest 도메인으로 프록시하여 동일 출처(same-origin) 요청으로 이벤트를 전송한다

### Requirement 7: 에러 컨텍스트 강화

**User Story:** As a 개발자, I want 에러에 사용자 정보와 추가 컨텍스트가 포함되도록, so that 에러 원인을 빠르게 파악하고 영향받는 사용자를 식별할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 로그인한 상태에서 에러가 발생할 때, THE Sentry_SDK SHALL 사용자 ID를 에러 컨텍스트에 포함한다
2. THE Sentry_SDK SHALL 사용자의 이메일, 이름 등 개인정보를 에러 컨텍스트에 포함하지 않는다
3. THE Sentry_SDK SHALL 현재 환경(environment) 태그를 모든 이벤트에 포함한다
