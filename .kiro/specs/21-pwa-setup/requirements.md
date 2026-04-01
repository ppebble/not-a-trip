# 요구사항 문서

## 소개

"Not a Trip" 프로젝트에 Progressive Web App(PWA) 기능을 본격적으로 구축한다. 기존에 수동으로 작성된 Service Worker(public/sw.js)와 manifest.json을 **@serwist/next** 라이브러리 기반으로 전환하여 Next.js 15 App Router 환경과의 호환성을 확보한다. 정적 에셋 프리캐싱, 마스코트 일러스트가 포함된 전용 오프라인 페이지, 커스텀 앱 설치 바텀 시트("여권 발급받기"), iOS Safari 수동 설치 유도 UI를 구현하여 네이티브 앱에 준하는 사용자 경험을 제공한다.

## 용어 사전

- **Serwist**: @serwist/next 라이브러리. Next.js 15 App Router와 호환되는 Service Worker 관리 도구
- **Service_Worker**: 브라우저 백그라운드에서 실행되는 스크립트로, 네트워크 요청 가로채기, 캐싱, 오프라인 지원 등을 담당
- **Manifest**: Web App Manifest 파일(manifest.json). 앱 이름, 아이콘, 테마 컬러, 시작 URL 등 PWA 메타데이터를 정의
- **Pre_Cache**: Service Worker 설치 시점에 지정된 정적 에셋을 브라우저 캐시 스토리지에 미리 저장하는 전략
- **Offline_Page**: 네트워크 연결이 없을 때 사용자에게 보여주는 전용 폴백 페이지 (/offline)
- **BeforeInstallPrompt**: 브라우저가 PWA 설치 조건을 충족했을 때 발생시키는 이벤트. 이를 가로채어 커스텀 설치 UI를 구현할 수 있음
- **Install_Bottom_Sheet**: "Not a Trip 여권 발급받기 (앱 설치)" 문구가 포함된 커스텀 바텀 시트 UI
- **PWA_Store**: BeforeInstallPrompt 이벤트 객체와 설치 상태를 전역으로 관리하는 Zustand 스토어
- **Welcome_Page**: 사용자가 처음 접속하거나 비로그인 상태에서 보게 되는 웰컴/랜딩 페이지
- **iOS_Install_Guide**: iOS Safari에서 beforeinstallprompt가 지원되지 않으므로, 수동 홈 화면 추가 방법을 안내하는 전용 UI
- **Apple_Touch_Icon**: iOS 기기에서 홈 화면에 추가할 때 표시되는 아이콘을 지정하는 `<link rel="apple-touch-icon">` 태그
- **Maskable_Icon**: 안드로이드 기기에서 다양한 형태(원형, 사각형 등)의 아이콘 마스크에 대응하는 아이콘 에셋
- **Standalone_Mode**: PWA가 브라우저 UI 없이 독립 앱처럼 실행되는 디스플레이 모드
- **Runtime_Caching**: Service Worker가 런타임에 네트워크 요청을 가로채어 캐시하는 전략. 외부 도메인의 동적 에셋(예: 지도 타일)에 적용하며, Pre_Cache와 달리 빌드 시점이 아닌 실제 요청 시점에 캐싱이 이루어짐
- **SerwistRegistration**: Next.js App Router 환경에서 Service Worker를 클라이언트 측에서 등록하기 위한 Client Component. 'use client' 지시어가 필요하며 app/layout.tsx에 주입됨

## 요구사항

### 요구사항 1: @serwist/next 기반 인프라 전환

**사용자 스토리:** 개발자로서, 기존 수동 Service Worker를 @serwist/next 기반으로 전환하고 싶다. 그래야 Next.js 15 빌드 파이프라인과 자연스럽게 통합되고, 프리캐싱 매니페스트가 자동 생성된다.

#### 인수 조건

1. THE Serwist SHALL @serwist/next 패키지를 프로젝트에 설치하고 next.config.ts에 withSerwist 래퍼를 적용한다
2. THE Serwist SHALL 기존 public/sw.js의 캐싱 전략(지도 타일 Cache First, 스팟 데이터 Stale While Revalidate, 정적 에셋 Network First, 코스 프리패치)을 Serwist 기반 Service Worker 파일로 이전한다
3. THE Serwist SHALL 빌드 시점에 Next.js가 생성하는 정적 에셋(JS 번들, CSS, 이미지 등)의 프리캐싱 매니페스트를 자동으로 생성한다
4. THE Serwist SHALL 기존 ServiceWorkerRegistrar 컴포넌트를 Serwist의 자동 등록 메커니즘으로 대체하거나 호환되도록 수정한다
5. IF Serwist 설정 과정에서 기존 Sentry 플러그인(withSentryConfig)과 충돌이 발생할 경우, THEN THE Serwist SHALL 두 래퍼가 정상적으로 체이닝되도록 next.config.ts를 구성한다
6. THE Serwist SHALL app/layout.tsx 하위에 Client Component로 작성된 `<SerwistRegistration />` (또는 동등한 훅) 컴포넌트를 주입하여 브라우저 로드 시 Service Worker가 자동 등록되도록 한다. Next.js App Router 환경에서는 Service Worker 등록이 런타임에 클라이언트 측에서 수행되어야 하므로, 반드시 'use client' 지시어가 포함된 별도 컴포넌트로 분리한다

### 요구사항 2: Web App Manifest 메타데이터 정비

**사용자 스토리:** 사용자로서, 앱을 설치했을 때 "Not a Trip"이라는 이름과 예쁜 아이콘이 홈 화면에 표시되기를 원한다.

#### 인수 조건

1. THE Manifest SHALL name 필드를 "Not a Trip - 특별한 여행지 탐색"으로, short_name 필드를 "Not a Trip"으로 정의한다
2. THE Manifest SHALL theme_color를 마스코트 팔레트의 Primary 컬러(#4164a5)로 설정한다
3. THE Manifest SHALL 192x192 크기의 일반 아이콘(purpose: any)을 /icons/icon-192x192.png 경로로 포함한다
4. THE Manifest SHALL 512x512 크기의 일반 아이콘(purpose: any)을 /icons/icon-512x512.png 경로로 포함한다
5. THE Manifest SHALL 192x192 크기의 Maskable_Icon(purpose: maskable)을 /icons/icon-maskable-192x192.png 경로로 포함한다
6. THE Manifest SHALL 512x512 크기의 Maskable_Icon(purpose: maskable)을 /icons/icon-maskable-512x512.png 경로로 포함한다
7. THE Manifest SHALL display를 "standalone", orientation을 "portrait", start_url을 "/"로 설정한다
8. THE Manifest SHALL Serwist 빌드 파이프라인과 연동되어 자동으로 참조되도록 구성한다

### 요구사항 3: 정적 에셋 프리캐싱

**사용자 스토리:** 사용자로서, 한 번 방문한 후에는 폰트, 마스코트 일러스트, 로딩 애니메이션 등 핵심 비주얼 에셋이 빠르게 로드되기를 원한다.

#### 인수 조건

1. THE Service_Worker SHALL 폰트 파일(public/fonts/PretendardVariable.woff2)을 Pre_Cache 목록에 포함한다
2. THE Service_Worker SHALL 마스코트 일러스트 에셋(public/mascot/ 디렉토리 내 파일)을 Pre_Cache 목록에 포함한다
3. THE Service_Worker SHALL 로딩 애니메이션 에셋을 Pre_Cache 목록에 포함한다
4. THE Service_Worker SHALL 앱 아이콘 파일(public/icons/icon-192x192.png, icon-512x512.png)을 Pre_Cache 목록에 포함한다
5. THE Service_Worker SHALL Offline_Page를 Pre_Cache 목록에 포함하여 오프라인 시 즉시 표시 가능하도록 한다
6. WHEN Pre_Cache 대상 에셋이 업데이트될 때, THE Service_Worker SHALL 빌드 시 리비전 해시를 통해 변경된 에셋만 갱신한다
7. THE Service_Worker SHALL 외부 도메인(예: basemaps.cartocdn.com 등 Leaflet 타일 서버)에서 불러오는 동적 이미지 자산에 대해 Pre_Cache가 아닌 Runtime Caching(StaleWhileRevalidate 또는 CacheFirst 전략)을 적용한다. 빌드 타임 프리캐싱(Pre_Cache)은 프로젝트 내부 정적 에셋에만 한정하고, 외부 동적 에셋은 런타임 캐싱으로 명확히 분리한다

### 요구사항 4: 오프라인 폴백 페이지

**사용자 스토리:** 사용자로서, 인터넷이 끊겼을 때 빈 화면 대신 친근한 마스코트와 함께 오프라인 상태를 안내받고 싶다.

#### 인수 조건

1. THE Offline_Page SHALL /offline 경로에 Next.js App Router 페이지로 구현한다 (기존 public/offline.html 대체)
2. THE Offline_Page SHALL "네트워크가 연결되지 않았습니다" 문구를 표시한다
3. THE Offline_Page SHALL 땀 흘리는 마스코트 일러스트를 문구와 함께 표시한다
4. THE Offline_Page SHALL "다시 시도" 버튼을 제공하여 페이지를 새로고침할 수 있도록 한다
5. WHEN 사용자가 네비게이션 요청 중 네트워크 연결이 없을 때, THE Service_Worker SHALL Offline_Page로 폴백한다
6. THE Offline_Page SHALL 프로젝트의 디자인 시스템(Tailwind CSS, Semantic_Color 토큰)을 적용하여 일관된 시각적 경험을 제공한다
7. WHEN 네트워크가 복구될 때, THE Offline_Page SHALL 자동으로 감지하여 사용자에게 새로고침을 유도한다

### 요구사항 5: 커스텀 앱 설치 UX (여권 발급받기 바텀 시트)

**사용자 스토리:** 사용자로서, 브라우저의 기본 설치 팝업 대신 "Not a Trip 여권 발급받기"라는 재미있는 커스텀 UI를 통해 앱을 설치하고 싶다.

#### 인수 조건

1. WHEN 브라우저가 BeforeInstallPrompt 이벤트를 발생시킬 때, THE PWA_Store SHALL 기본 브라우저 팝업을 preventDefault()로 차단하고 이벤트 객체를 Zustand 전역 상태에 저장한다
2. THE PWA_Store SHALL 설치 가능 여부(isInstallable), 저장된 이벤트 객체(deferredPrompt), 설치 완료 여부(isInstalled) 상태를 관리한다
3. WHEN 사용자가 Welcome_Page에 진입할 때, THE Install_Bottom_Sheet SHALL 모바일 해상도(768px 미만)에서는 화면 하단에서 올라오는 바텀 시트 형태로 표시되고, 데스크탑 해상도(768px 이상)에서는 헤더(Header)의 '앱 설치' 버튼 또는 우측 하단 토스트(Toast) 팝업 형태로 표시된다
4. THE Install_Bottom_Sheet SHALL "Not a Trip 여권 발급받기 (앱 설치)" 문구와 설치 버튼을 포함한다
5. WHEN 사용자가 설치 버튼을 클릭할 때, THE Install_Bottom_Sheet SHALL 저장된 BeforeInstallPrompt 이벤트의 prompt() 메서드를 호출하여 네이티브 설치 프롬프트를 실행한다
6. WHEN 사용자가 설치를 완료하거나 거부할 때, THE PWA_Store SHALL userChoice 결과에 따라 설치 상태를 업데이트하고 Install_Bottom_Sheet를 닫는다
7. THE Install_Bottom_Sheet SHALL 닫기 버튼을 제공하여 사용자가 설치를 나중으로 미룰 수 있도록 한다
8. WHILE 앱이 이미 Standalone_Mode로 실행 중일 때, THE Install_Bottom_Sheet SHALL 표시되지 않는다
9. THE Install_Bottom_Sheet SHALL 프로젝트의 디자인 시스템(Tailwind CSS, Semantic_Color 토큰)을 적용하여 일관된 시각적 경험을 제공한다

### 요구사항 6: iOS Safari 대응 전략

**사용자 스토리:** iOS 사용자로서, Safari에서도 앱을 홈 화면에 추가하는 방법을 쉽게 안내받고 싶다.

#### 인수 조건

1. THE Apple_Touch_Icon SHALL layout.tsx의 `<head>` 태그 내에 `<link rel="apple-touch-icon" href="/icons/icon-192x192.png">` 태그를 포함한다
2. THE iOS_Install_Guide SHALL 사용자의 User-Agent를 분석하여 iOS Safari 브라우저인지 감지한다
3. WHEN iOS Safari 사용자가 감지되고 앱이 Standalone_Mode가 아닐 때, THE iOS_Install_Guide SHALL "하단 공유 버튼(⎙)을 누르고 '홈 화면에 추가'를 선택해 주세요"라는 안내 문구를 표시한다
4. THE iOS_Install_Guide SHALL 공유 버튼 아이콘(⎙)과 단계별 설치 방법을 시각적으로 안내한다
5. THE iOS_Install_Guide SHALL "다시 보지 않기" 옵션을 제공하여 사용자가 안내를 영구적으로 닫을 수 있도록 한다
6. THE iOS_Install_Guide SHALL "다시 보지 않기" 상태를 localStorage에 저장하여 재방문 시에도 유지한다
7. WHILE 앱이 iOS에서 Standalone_Mode로 실행 중일 때, THE iOS_Install_Guide SHALL 표시되지 않는다
8. THE iOS_Install_Guide SHALL 프로젝트의 디자인 시스템(Tailwind CSS, Semantic_Color 토큰)을 적용하여 일관된 시각적 경험을 제공한다
9. THE Apple_Touch_Icon SHALL layout.tsx의 `<head>` 태그 내에 `<meta name="apple-mobile-web-app-status-bar-style" content="default">` (또는 `black-translucent`) 메타 태그를 포함하여, Standalone_Mode 실행 시 iOS 상태바 영역이 앱의 디자인과 자연스럽게 어우러지도록 한다
