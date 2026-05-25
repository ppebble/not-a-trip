# 구현 계획: PWA Setup

## 개요

기존 수동 Service Worker(`public/sw.js`)와 PWA 컴포넌트를 `@serwist/next` 기반으로 전환하고, 오프라인 폴백 페이지, 커스텀 앱 설치 UX("여권 발급받기"), iOS Safari 대응 전략을 구현한다. 기존 파일 삭제 → 인프라 전환 → UI 컴포넌트 구현 순서로 진행하며, 각 단계에서 점진적으로 기능을 검증한다.

## Tasks

- [x] 1. @serwist/next 인프라 전환 및 빌드 설정
  - [x] 1.1 @serwist/next 패키지 설치 및 next.config.ts 수정
    - `@serwist/next`, `serwist` 패키지 설치
    - `next.config.ts`에 `withSerwistInit` 래퍼를 `withSentryConfig`와 체이닝 적용
    - `swSrc: 'src/sw.ts'`, `swDest: 'public/sw.js'`, `disable: process.env.NODE_ENV === 'development'` 설정
    - _Requirements: 1.1, 1.5_

  - [x] 1.2 Serwist 기반 Service Worker 소스 작성 (src/sw.ts)
    - `src/sw.ts` 파일 생성
    - `self.__SW_MANIFEST` 프리캐싱 매니페스트 자동 주입 설정
    - 기존 `public/sw.js`의 캐싱 전략 이전: 지도 타일 CacheFirst, 스팟 데이터 StaleWhileRevalidate, 코스 데이터 NetworkFirst
    - 외부 타일 서버(basemaps.cartocdn.com 등) 런타임 캐싱 설정
    - 오프라인 폴백 설정: 네비게이션 요청 실패 시 `/offline`으로 폴백
    - 기존 푸시 알림 핸들러(push, notificationclick, message 이벤트) 이전
    - _Requirements: 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.5_

  - [x] 1.3 SerwistRegistration 컴포넌트 생성 및 layout.tsx 통합
    - `src/components/pwa/SerwistRegistration.tsx` 생성 ('use client' 지시어 포함)
    - `src/components/pwa/index.ts` barrel export 파일 생성
    - `src/app/layout.tsx`에서 기존 `ServiceWorkerRegistrar` import를 `SerwistRegistration`으로 교체
    - `src/app/layout.tsx`에서 기존 `IosPwaPrompt` import 제거
    - _Requirements: 1.4, 1.6_

  - [x] 1.4 레거시 파일 삭제
    - `public/sw.js` 삭제 (빌드 시 자동 생성됨)
    - `public/offline.html` 삭제 (App Router 페이지로 대체)
    - `src/components/mobile/ServiceWorkerRegistrar.tsx` 삭제
    - `src/components/mobile/IosPwaPrompt.tsx` 삭제
    - _Requirements: 1.2, 1.4_

- [x] 2. Web App Manifest 정비 및 타입 선언
  - [x] 2.1 manifest.json 메타데이터 검증 및 정비
    - `public/manifest.json`의 필드 값 검증: name, short_name, theme_color, display, orientation, start_url, icons 배열
    - 현재 manifest가 이미 요구사항과 일치하는지 확인하고, 누락/불일치 항목 수정
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 2.2 BeforeInstallPromptEvent 타입 선언 파일 생성
    - `src/types/pwa.d.ts` 파일 생성
    - `BeforeInstallPromptEvent` 인터페이스 정의 (platforms, userChoice with optional platform, prompt())
    - `WindowEventMap`에 `beforeinstallprompt` 이벤트 타입 추가
    - _Requirements: 5.1, 5.2_

  - [x] 2.3 layout.tsx head 태그에 iOS 메타 태그 추가
    - `<meta name="apple-mobile-web-app-status-bar-style" content="default">` 메타 태그 추가
    - 기존 `apple-touch-icon` 링크 태그 유지 확인
    - _Requirements: 6.1, 6.9_

- [x] 3. 체크포인트 - 빌드 검증
  - `npm run type-check` 및 `npm run build` 실행하여 Serwist 통합, 타입 선언, 레거시 파일 삭제 후 빌드가 정상 동작하는지 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. pwaStore 및 설치 이벤트 리스너 구현
  - [x] 4.1 pwaStore Zustand 스토어 생성
    - `src/stores/pwaStore.ts` 파일 생성
    - `PwaState` 인터페이스 구현: deferredPrompt, isInstallable, isInstalled, isDismissed
    - `setDeferredPrompt`, `triggerInstall`, `dismiss`, `setInstalled`, `reset` 액션 구현
    - `triggerInstall()`에서 `deferredPrompt.prompt()` 호출 및 `userChoice` 결과에 따른 상태 업데이트
    - `src/stores/index.ts`에 pwaStore export 추가
    - _Requirements: 5.1, 5.2, 5.6_

  - [ ]* 4.2 pwaStore 상태 전이 속성 테스트 작성
    - **Property 1: pwaStore 상태 전이 일관성**
    - `setDeferredPrompt` 호출 시 `isInstallable === true`, `deferredPrompt !== null` 검증
    - 초기 상태에서 `isInstallable === false`, `deferredPrompt === null` 검증
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 4.3 triggerInstall userChoice 결과 속성 테스트 작성
    - **Property 2: userChoice 결과에 따른 상태 업데이트**
    - `'accepted'` 결과 시 `isInstalled === true`, `deferredPrompt === null` 검증
    - `'dismissed'` 결과 시 `isInstalled === false`, `deferredPrompt === null` 검증
    - **Validates: Requirements 5.6**

  - [x] 4.4 InstallPromptListener 컴포넌트 생성
    - `src/components/pwa/InstallPromptListener.tsx` 생성 ('use client')
    - `beforeinstallprompt` 이벤트 리스너 등록 → `preventDefault()` 호출 → `pwaStore.setDeferredPrompt()` 저장
    - `appinstalled` 이벤트 리스너 등록 → `pwaStore.setInstalled()` 호출
    - `display-mode: standalone` 미디어 쿼리로 이미 설치된 상태 감지
    - `src/components/pwa/index.ts`에 export 추가
    - `src/app/layout.tsx`의 Providers 내부에 `<InstallPromptListener />` 주입
    - _Requirements: 5.1, 5.8_

- [x] 5. 오프라인 폴백 페이지 구현
  - [x] 5.1 /offline 페이지 구현
    - `src/app/offline/page.tsx` 생성
    - "네트워크가 연결되지 않았습니다" 문구 표시
    - 마스코트 일러스트(캐릭터정면1.webp) 표시
    - "다시 시도" 버튼 → `window.location.reload()` 호출
    - `navigator.onLine` + `online` 이벤트로 네트워크 복구 자동 감지 → 새로고침 유도 UI 표시
    - Tailwind CSS 및 Semantic Color 토큰 적용
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_

- [x] 6. 커스텀 앱 설치 UI 구현
  - [x] 6.1 InstallBottomSheet 컴포넌트 구현 (모바일)
    - `src/components/pwa/InstallBottomSheet.tsx` 생성 ('use client')
    - mounted 상태 패턴으로 Hydration 에러 방지 (SSR 시 null 반환)
    - `window.matchMedia('(max-width: 767px)')` 체크로 모바일에서만 표시
    - "Not a Trip 여권 발급받기 (앱 설치)" 문구 및 설치 버튼 포함
    - 설치 버튼 클릭 시 `pwaStore.triggerInstall()` 호출
    - 닫기 버튼 → `pwaStore.dismiss()` 호출
    - standalone 모드 시 미표시
    - Tailwind CSS 및 Semantic Color 토큰 적용
    - `src/components/pwa/index.ts`에 export 추가
    - _Requirements: 5.3, 5.4, 5.5, 5.7, 5.8, 5.9_

  - [x] 6.2 InstallToast 컴포넌트 구현 (데스크탑)
    - `src/components/pwa/InstallToast.tsx` 생성 ('use client')
    - mounted 상태 패턴으로 Hydration 에러 방지
    - `window.matchMedia('(min-width: 768px)')` 체크로 데스크탑에서만 표시
    - 우측 하단 토스트 팝업 형태로 설치 안내
    - 설치 버튼 클릭 시 `pwaStore.triggerInstall()` 호출
    - standalone 모드 시 미표시
    - `src/components/pwa/index.ts`에 export 추가
    - _Requirements: 5.3, 5.8, 5.9_

  - [x] 6.3 설치 UI를 layout.tsx에 통합
    - `src/app/layout.tsx`의 Providers 내부에 `<InstallBottomSheet />`, `<InstallToast />` 주입
    - _Requirements: 5.3_

  - [ ]* 6.4 standalone 모드 UI 미표시 속성 테스트 작성
    - **Property 3: standalone 모드에서 설치 UI 미표시**
    - standalone 모드 활성화 시 InstallBottomSheet, InstallToast가 null 반환 검증
    - **Validates: Requirements 5.8, 6.7**

- [x] 7. 체크포인트 - 설치 UI 검증
  - `npm run type-check` 및 `npm run build` 실행
  - pwaStore, InstallPromptListener, InstallBottomSheet, InstallToast 통합 확인
  - Ensure all tests pass, ask the user if questions arise.

- [-] 8. iOS Safari 대응 전략 구현
  - [x] 8.1 IosPwaGuide 컴포넌트 구현
    - `src/components/pwa/IosPwaGuide.tsx` 생성 ('use client')
    - User-Agent 분석으로 iOS Safari 감지 (`iphone`, `ipad`, `ipod` 키워드)
    - standalone 모드가 아닌 경우에만 표시
    - 공유 버튼 아이콘(⎙)과 단계별 설치 방법 시각적 안내
    - "다시 보지 않기" 옵션 → localStorage(`not-a-trip-ios-guide-dismissed`) 저장
    - Tailwind CSS 및 Semantic Color 토큰 적용
    - `src/components/pwa/index.ts`에 export 추가
    - `src/app/layout.tsx`의 Providers 내부에 `<IosPwaGuide />` 주입
    - 2026-05-22: 공용 `isIosSafari` 유틸 재사용, `isInstalled`/standalone 상태 연동, 마스코트 기반 안내 UI로 보강 완료
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ]* 8.2 iOS Safari UA 감지 속성 테스트 작성
    - **Property 4: iOS Safari UA 감지 정확성**
    - `iphone`, `ipad`, `ipod` 포함 UA → `true` 반환 검증
    - Android, Chrome, Firefox 등 비-iOS UA → `false` 반환 검증
    - **Validates: Requirements 6.2**

  - [ ]* 8.3 dismiss 상태 localStorage 영속성 속성 테스트 작성
    - **Property 5: dismiss 상태 localStorage 영속성**
    - dismiss 후 localStorage에 키가 `'true'`로 저장 검증
    - 재마운트 시 가이드 미표시 검증
    - localStorage에 키 없을 때 iOS Safari 환경에서 가이드 표시 검증
    - **Validates: Requirements 6.5, 6.6**

- [x] 9. 최종 체크포인트 - 전체 통합 검증
  - `npm run type-check`, `npm run build`, `npm run test` 실행
  - 모든 PWA 컴포넌트 통합 확인: SerwistRegistration, InstallPromptListener, InstallBottomSheet, InstallToast, IosPwaGuide
  - 오프라인 페이지 빌드 포함 확인
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 요구사항 번호를 참조하여 추적 가능
- 체크포인트에서 점진적으로 빌드 및 테스트 검증 수행
- 속성 테스트는 `fast-check` 라이브러리 사용 (이미 devDependencies에 설치됨)
- Hydration 안전성을 위해 InstallBottomSheet, InstallToast는 반드시 mounted 상태 패턴 적용
