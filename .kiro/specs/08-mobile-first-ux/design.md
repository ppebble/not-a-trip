# Design Document: 모바일 퍼스트 UX 개선 (Mobile First UX)

## Overview

이 설계 문서는 Not a Trip 서비스의 모바일 퍼스트 UX 개선을 위한 기술적 설계를 정의합니다. 성지순례는 100% 야외에서 모바일로 사용하는 서비스이므로, 한 손 조작성, 스와이프 제스처, 빠른 로딩을 핵심으로 합니다.

### 핵심 목표

1. **모바일 지도 UX**: Bottom Sheet 기반 스팟 정보 표시, 제스처 지원
2. **스팟 상세 최적화**: 스와이프 갤러리, 길찾기 딥링크, 오프라인 캐싱
3. **빠른 인증 플로우**: 카메라 연동, 뷰파인더 오버레이, 백그라운드 업로드
4. **PWA 지원**: manifest, Service Worker, 푸시 알림, Safe Area
5. **성능 최적화**: WebP 변환, 클라이언트 이미지 압축, 스켈레톤 UI

## Architecture

### 전체 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        Mobile First UX Layer                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Bottom Sheet│  │  Swipeable  │  │  Viewfinder │              │
│  │  Component  │  │   Gallery   │  │   Overlay   │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│  ┌──────┴────────────────┴────────────────┴──────┐              │
│  │              Gesture Handler Layer             │              │
│  │    (touch events, swipe, pinch, double-tap)   │              │
│  └───────────────────────┬───────────────────────┘              │
│                          │                                       │
├──────────────────────────┼───────────────────────────────────────┤
│  ┌───────────────────────┴───────────────────────┐              │
│  │              State Management (Zustand)        │              │
│  │  - bottomSheetStore (height, isOpen, spotId)  │              │
│  │  - galleryStore (currentIndex, images)        │              │
│  │  - uploadStore (queue, progress, status)      │              │
│  └───────────────────────┬───────────────────────┘              │
│                          │                                       │
├──────────────────────────┼───────────────────────────────────────┤
│  ┌───────────────────────┴───────────────────────┐              │
│  │              PWA Infrastructure                │              │
│  │  - Service Worker (caching, offline)          │              │
│  │  - Web Push API (notifications)               │              │
│  │  - manifest.json (installability)             │              │
│  └───────────────────────────────────────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Image Processing Pipeline                       ││
│  │  - Client-side compression (browser-image-compression)      ││
│  │  - WebP conversion (Next.js Image Optimization)             ││
│  │  - Progressive loading (blur placeholder)                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 컴포넌트 계층 구조

```
src/
├── components/
│   ├── mobile/
│   │   ├── BottomSheet.tsx          # 바텀 시트 컴포넌트
│   │   ├── SwipeableGallery.tsx     # 스와이프 갤러리
│   │   ├── ViewfinderOverlay.tsx    # 뷰파인더 오버레이
│   │   ├── LocationButton.tsx       # 현재 위치 버튼
│   │   ├── GpsErrorFallback.tsx     # GPS 오류 폴백 UI
│   │   └── SafeAreaWrapper.tsx      # Safe Area 래퍼
│   ├── common/
│   │   ├── SkeletonUI.tsx           # 스켈레톤 UI 컴포넌트
│   │   └── DirectionsButton.tsx     # 길찾기 버튼
│   └── checkin/
│       └── QuickCheckIn.tsx         # 빠른 인증 플로우
├── hooks/
│   ├── useBottomSheet.ts            # 바텀 시트 제스처 훅
│   ├── useSwipeGesture.ts           # 스와이프 제스처 훅
│   ├── useGeolocation.ts            # 위치 정보 훅
│   ├── useCamera.ts                 # 카메라 접근 훅
│   ├── useNetworkStatus.ts          # 네트워크 상태 감지 훅
│   ├── useBackgroundUpload.ts       # 백그라운드 업로드 훅
│   └── useImageCompression.ts       # 이미지 압축 훅
├── stores/
│   ├── bottomSheetStore.ts          # 바텀 시트 상태
│   ├── uploadQueueStore.ts          # 업로드 큐 상태
│   └── networkStore.ts              # 네트워크 상태 (오프라인 감지)
├── lib/
│   ├── image-compression.ts         # 이미지 압축 유틸
│   ├── directions.ts                # 길찾기 딥링크 유틸
│   └── push-notifications.ts        # 푸시 알림 유틸
└── public/
    ├── manifest.json                # PWA manifest
    ├── sw.js                        # Service Worker
    └── offline.html                 # 오프라인 페이지
```

## Components and Interfaces

### 1. Bottom Sheet 컴포넌트

```typescript
// src/components/mobile/BottomSheet.tsx

interface BottomSheetProps {
  /** 바텀 시트 열림 여부 */
  isOpen: boolean
  /** 닫기 핸들러 */
  onClose: () => void
  /** 스팟 ID */
  spotId: string | null
  /** 초기 높이 (collapsed, half, full) */
  initialHeight?: 'collapsed' | 'half' | 'full'
  /** Safe Area 하단 여백 적용 여부 */
  useSafeArea?: boolean
}

interface BottomSheetState {
  /** 현재 높이 (px) */
  currentHeight: number
  /** 스냅 포인트 (collapsed: 120px, half: 50vh, full: 90vh) */
  snapPoints: {
    collapsed: number
    half: number
    full: number
  }
  /** 드래그 중 여부 */
  isDragging: boolean
}

/**
 * 바텀 시트 높이 계산 함수
 * Safe Area를 고려하여 최대 높이 계산
 */
function calculateMaxHeight(safeAreaBottom: number): number {
  return window.innerHeight - safeAreaBottom - 56 // 헤더 높이 제외
}
```

### 2. 스와이프 갤러리 컴포넌트

```typescript
// src/components/mobile/SwipeableGallery.tsx

interface SwipeableGalleryProps {
  /** 이미지 URL 배열 */
  images: string[]
  /** 현재 인덱스 변경 핸들러 */
  onIndexChange?: (index: number) => void
  /** 초기 인덱스 */
  initialIndex?: number
  /** 자동 재생 여부 */
  autoPlay?: boolean
  /** 자동 재생 간격 (ms) */
  autoPlayInterval?: number
}

interface SwipeState {
  /** 현재 이미지 인덱스 */
  currentIndex: number
  /** 스와이프 방향 */
  direction: 'left' | 'right' | null
  /** 스와이프 거리 (px) */
  deltaX: number
  /** 스와이프 속도 (px/ms) */
  velocity: number
}

/**
 * 스와이프 임계값 상수
 */
const SWIPE_THRESHOLD = 50 // 최소 스와이프 거리 (px)
const VELOCITY_THRESHOLD = 0.3 // 최소 스와이프 속도 (px/ms)
```

### 3. 뷰파인더 오버레이 컴포넌트

```typescript
// src/components/mobile/ViewfinderOverlay.tsx

interface ViewfinderOverlayProps {
  /** 오버레이할 씬 이미지 URL */
  sceneImageUrl: string
  /** 투명도 (0.3 ~ 0.5) */
  opacity?: number
  /** 오버레이 표시 여부 */
  isVisible: boolean
  /** 토글 핸들러 */
  onToggle: () => void
  /** 사진 촬영 핸들러 */
  onCapture: (imageBlob: Blob) => void
}

interface CameraState {
  /** 카메라 활성화 여부 */
  isCameraActive: boolean
  /** 카메라 스트림 */
  stream: MediaStream | null
  /** 카메라 오류 */
  error: CameraError | null
  /** 전면/후면 카메라 */
  facingMode: 'user' | 'environment'
}

interface CameraError {
  code:
    | 'NOT_ALLOWED'
    | 'NOT_FOUND'
    | 'NOT_READABLE'
    | 'OVERCONSTRAINED'
    | 'UNKNOWN'
  message: string
}

/**
 * 카메라 접근 훅
 * navigator.mediaDevices.getUserMedia를 통해 카메라 스트림 획득
 */
// src/hooks/useCamera.ts
interface UseCameraOptions {
  /** 선호 카메라 방향 (기본: 후면) */
  facingMode?: 'user' | 'environment'
  /** 해상도 */
  resolution?: { width: number; height: number }
}

interface UseCameraReturn {
  /** 비디오 요소 ref */
  videoRef: React.RefObject<HTMLVideoElement>
  /** 카메라 상태 */
  state: CameraState
  /** 카메라 시작 */
  startCamera: () => Promise<void>
  /** 카메라 중지 */
  stopCamera: () => void
  /** 카메라 전환 (전면/후면) */
  switchCamera: () => Promise<void>
  /** 사진 촬영 */
  capturePhoto: () => Promise<Blob | null>
}

/**
 * 투명도 유효성 검증
 * @param opacity 투명도 값
 * @returns 유효한 투명도 값 (0.3 ~ 0.5 범위로 클램핑)
 */
function clampOpacity(opacity: number): number {
  return Math.max(0.3, Math.min(0.5, opacity))
}
```

### 4. 네트워크 상태 훅

```typescript
// src/hooks/useNetworkStatus.ts

interface NetworkState {
  /** 온라인 여부 */
  isOnline: boolean
  /** 연결 유형 (wifi, cellular, etc.) */
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown' | null
  /** 다운링크 속도 (Mbps) */
  downlink: number | null
  /** 왕복 시간 (ms) */
  rtt: number | null
  /** 데이터 절약 모드 */
  saveData: boolean
}

/**
 * 네트워크 상태 감지 훅
 * - navigator.onLine 및 online/offline 이벤트 감지
 * - Network Information API 활용 (지원 브라우저)
 */
interface UseNetworkStatusReturn {
  /** 네트워크 상태 */
  networkState: NetworkState
  /** 느린 연결 여부 (3g 이하 또는 rtt > 500ms) */
  isSlowConnection: boolean
}
```

### 5. 길찾기 딥링크 유틸

```typescript
// src/lib/directions.ts

interface Coordinates {
  lat: number
  lng: number
}

interface DirectionsOptions {
  /** 목적지 좌표 */
  destination: Coordinates
  /** 목적지 이름 */
  destinationName?: string
  /** 선호 앱 (auto: 자동 감지) */
  preferredApp?: 'google' | 'apple' | 'kakao' | 'naver' | 'auto'
}

/**
 * 플랫폼별 딥링크 URL 생성
 */
interface DirectionsUrls {
  google: string
  apple: string
  kakao: string
  naver: string
}

/**
 * 길찾기 딥링크 URL 생성 함수
 *
 * 각 플랫폼의 Universal Link / Deep Link 표준 포맷 사용:
 * - Google Maps: Universal Link (https://www.google.com/maps/dir/)
 * - Apple Maps: URL Scheme (maps://)
 * - Kakao Map: URL Scheme (kakaomap://)
 * - Naver Map: URL Scheme (nmap://)
 *
 * @param options 길찾기 옵션
 * @returns 플랫폼별 딥링크 URL 객체
 */
function generateDirectionsUrls(options: DirectionsOptions): DirectionsUrls {
  const { destination, destinationName = '' } = options
  const encodedName = encodeURIComponent(destinationName)

  return {
    // Google Maps Universal Link (웹/앱 모두 지원)
    google: `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`,
    // Apple Maps URL Scheme
    apple: `maps://maps.apple.com/?daddr=${destination.lat},${destination.lng}&dirflg=w`,
    // Kakao Map URL Scheme (도보 모드)
    kakao: `kakaomap://route?ep=${destination.lat},${destination.lng}&by=FOOT`,
    // Naver Map URL Scheme (도보 모드)
    naver: `nmap://route/walk?dlat=${destination.lat}&dlng=${destination.lng}&dname=${encodedName}&appname=com.notatrip`,
  }
}

/**
 * 사용자 플랫폼 감지 및 적절한 지도 앱 선택
 */
function detectPlatform(): 'ios' | 'android' | 'web' {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'web'
}

/**
 * 플랫폼별 기본 지도 앱 반환
 */
function getDefaultMapApp(
  platform: 'ios' | 'android' | 'web'
): keyof DirectionsUrls {
  switch (platform) {
    case 'ios':
      return 'apple'
    case 'android':
      return 'google'
    default:
      return 'google'
  }
}
```

### 6. 이미지 압축 유틸

```typescript
// src/lib/image-compression.ts

interface CompressionOptions {
  /** 최대 너비 (px) */
  maxWidth?: number
  /** 최대 높이 (px) */
  maxHeight?: number
  /** 품질 (0 ~ 1) */
  quality?: number
  /** 최대 파일 크기 (bytes) */
  maxSizeMB?: number
  /** 출력 포맷 */
  fileType?: 'image/webp' | 'image/jpeg'
}

interface CompressionResult {
  /** 압축된 파일 */
  file: File
  /** 원본 크기 (bytes) */
  originalSize: number
  /** 압축 후 크기 (bytes) */
  compressedSize: number
  /** 압축률 (%) */
  compressionRatio: number
}

/**
 * 기본 압축 옵션
 */
const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  maxSizeMB: 1,
  fileType: 'image/webp',
}
```

### 7. 백그라운드 업로드 스토어

```typescript
// src/stores/uploadQueueStore.ts

interface UploadItem {
  /** 고유 ID */
  id: string
  /** 파일 */
  file: File
  /** 업로드 상태 */
  status: 'pending' | 'uploading' | 'completed' | 'error'
  /** 진행률 (0 ~ 100) */
  progress: number
  /** 에러 메시지 */
  errorMessage?: string
  /** 재시도 횟수 */
  retryCount: number
  /** 생성 시간 */
  createdAt: Date
}

interface UploadQueueStore {
  /** 업로드 큐 */
  queue: UploadItem[]
  /** 현재 업로드 중인 아이템 ID */
  currentUploadId: string | null
  /** 큐에 추가 */
  addToQueue: (file: File) => string
  /** 큐에서 제거 */
  removeFromQueue: (id: string) => void
  /** 상태 업데이트 */
  updateStatus: (
    id: string,
    status: UploadItem['status'],
    progress?: number
  ) => void
  /** 재시도 */
  retry: (id: string) => void
  /** 전체 진행률 */
  getTotalProgress: () => number
}
```

### 9. PWA Manifest

```typescript
// public/manifest.json 스키마

interface PWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  background_color: string
  theme_color: string
  orientation: 'portrait' | 'landscape' | 'any'
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose?: 'any' | 'maskable' | 'monochrome'
  }>
  categories: string[]
  screenshots?: Array<{
    src: string
    sizes: string
    type: string
    form_factor?: 'narrow' | 'wide'
  }>
}
```

### 10. Safe Area 래퍼 컴포넌트

```typescript
// src/components/mobile/SafeAreaWrapper.tsx

interface SafeAreaWrapperProps {
  /** 자식 요소 */
  children: React.ReactNode
  /** 적용할 방향 */
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>
  /** 추가 패딩 (px) */
  additionalPadding?: number
  /** 클래스명 */
  className?: string
}

/**
 * Safe Area Inset CSS 변수
 */
interface SafeAreaInsets {
  top: string // env(safe-area-inset-top)
  bottom: string // env(safe-area-inset-bottom)
  left: string // env(safe-area-inset-left)
  right: string // env(safe-area-inset-right)
}
```

## Data Models

### 1. 바텀 시트 상태 모델

```typescript
interface BottomSheetData {
  /** 열림 여부 */
  isOpen: boolean
  /** 현재 스팟 ID */
  spotId: string | null
  /** 현재 높이 상태 */
  heightState: 'collapsed' | 'half' | 'full'
  /** 스팟 미리보기 데이터 */
  previewData: SpotPreviewData | null
}

interface SpotPreviewData {
  id: string
  name: string
  address: string
  photoUrl: string | null
  category: SpotCategory
  distance?: number // 현재 위치에서의 거리 (m)
}
```

### 2. 위치 정보 상태 모델

```typescript
interface GeolocationState {
  /** 현재 좌표 */
  coordinates: {
    lat: number
    lng: number
  } | null
  /** 정확도 (m) */
  accuracy: number | null
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 상태 */
  error: GeolocationError | null
  /** 권한 상태 */
  permissionState: 'granted' | 'denied' | 'prompt' | null
}

interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN'
  message: string
}
```

### 3. 푸시 알림 페이로드 모델

```typescript
interface PushNotificationPayload {
  /** 알림 유형 */
  type: 'badge_earned' | 'spot_approved' | 'comment_reply' | 'new_checkin'
  /** 제목 */
  title: string
  /** 본문 */
  body: string
  /** 아이콘 URL */
  icon?: string
  /** 클릭 시 이동할 URL */
  url?: string
  /** 추가 데이터 */
  data?: Record<string, unknown>
  /** 태그 (중복 알림 그룹화) */
  tag?: string
}
```

## Correctness Properties

_정확성 속성(Correctness Property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 이는 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다._

### Property 1: 지도 제스처 줌 동작

_For any_ 지도 상태와 더블탭 이벤트에 대해, 더블탭 후 줌 레벨은 이전 줌 레벨보다 정확히 1 증가해야 한다 (최대 줌 레벨 미만인 경우).

**Validates: Requirements 1.1**

### Property 2: Bottom Sheet 상태 전환

_For any_ Bottom Sheet 상태와 스와이프 제스처에 대해, 위로 스와이프 시 높이 상태는 collapsed → half → full 순서로 전환되어야 하고, 아래로 스와이프 시 역순으로 전환되어야 한다.

**Validates: Requirements 1.2, 1.3**

### Property 3: GPS 폴백 UI 표시

_For any_ GPS 오류 상태(권한 거부, 수신 불가)에 대해, 시스템은 항상 폴백 UI를 표시하고 지도 수동 탐색이 가능해야 한다.

**Validates: Requirements 1.5**

### Property 4: 갤러리 스와이프 인덱스 변화

_For any_ 이미지 배열과 스와이프 제스처에 대해, 왼쪽 스와이프 시 인덱스는 1 증가하고 (마지막이 아닌 경우), 오른쪽 스와이프 시 인덱스는 1 감소해야 한다 (첫 번째가 아닌 경우).

**Validates: Requirements 2.2**

### Property 5: 길찾기 딥링크 URL 생성

_For any_ 유효한 좌표(lat, lng)에 대해, 생성된 딥링크 URL은 해당 좌표를 포함하고 각 플랫폼(Google, Apple, Kakao, Naver)의 URL 스킴을 준수해야 한다.

**Validates: Requirements 2.3**

### Property 6: 백그라운드 업로드 상태 독립성

_For any_ 업로드 큐 상태에서, 업로드 진행 중에도 다른 UI 상호작용(페이지 이동, 버튼 클릭)이 차단되지 않아야 한다.

**Validates: Requirements 3.3**

### Property 7: 뷰파인더 오버레이 투명도 범위

_For any_ 설정된 투명도 값에 대해, 실제 적용되는 투명도는 항상 0.3 이상 0.5 이하의 범위 내에 있어야 한다.

**Validates: Requirements 3.4**

### Property 8: PWA Manifest 스키마 유효성

_For any_ manifest.json 파일에 대해, 필수 필드(name, short_name, start_url, display, icons)가 존재하고 유효한 값을 가져야 한다.

**Validates: Requirements 4.1**

### Property 9: 푸시 알림 페이로드 구조

_For any_ 푸시 알림 이벤트(뱃지 획득, 제보 승인)에 대해, 생성된 페이로드는 type, title, body 필드를 포함하고 유효한 값을 가져야 한다.

**Validates: Requirements 4.3**

### Property 10: Safe Area 스타일 계산

_For any_ Safe Area Inset 값에 대해, 하단 네비게이션 및 Bottom Sheet의 패딩은 해당 Inset 값 이상이어야 한다.

**Validates: Requirements 4.4**

### Property 11: WebP 이미지 변환

_For any_ 입력 이미지(JPEG, PNG)에 대해, 변환 후 출력 이미지의 MIME 타입은 'image/webp'이어야 한다.

**Validates: Requirements 5.1**

### Property 12: 클라이언트 이미지 압축

_For any_ 입력 이미지에 대해, 압축 후 파일 크기는 원본 파일 크기보다 작거나 같아야 하고, 최대 파일 크기 제한(1MB)을 초과하지 않아야 한다.

**Validates: Requirements 5.5**

## Error Handling

### 1. GPS 오류 처리

```typescript
/**
 * GPS 오류 유형별 처리 전략
 */
const GPS_ERROR_HANDLERS: Record<GeolocationError['code'], ErrorHandler> = {
  PERMISSION_DENIED: {
    message: '위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.',
    action: 'show_settings_guide',
    fallback: 'manual_map_navigation',
  },
  POSITION_UNAVAILABLE: {
    message:
      'GPS 신호를 수신할 수 없습니다. 실외로 이동하거나 잠시 후 다시 시도해주세요.',
    action: 'retry_with_delay',
    fallback: 'manual_map_navigation',
  },
  TIMEOUT: {
    message: '위치 확인에 시간이 오래 걸리고 있습니다.',
    action: 'retry_immediately',
    fallback: 'manual_map_navigation',
  },
  UNKNOWN: {
    message: '알 수 없는 오류가 발생했습니다.',
    action: 'log_and_retry',
    fallback: 'manual_map_navigation',
  },
}
```

### 2. 이미지 업로드 오류 처리

```typescript
/**
 * 업로드 오류 처리 전략
 */
interface UploadErrorStrategy {
  /** 최대 재시도 횟수 */
  maxRetries: 3
  /** 재시도 간격 (ms) */
  retryDelay: [1000, 2000, 4000] // 지수 백오프
  /** 오프라인 시 처리 */
  offlineStrategy: 'queue_for_later'
  /** 파일 크기 초과 시 처리 */
  fileSizeExceeded: 'compress_and_retry'
}
```

### 3. Service Worker 오류 처리

```typescript
/**
 * Service Worker 등록 실패 시 폴백
 */
async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported')
    return
  }

  try {
    await navigator.serviceWorker.register('/sw.js')
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    // 폴백: 기본 브라우저 캐싱에 의존
  }
}
```

## Testing Strategy

### 단위 테스트 (Unit Tests)

단위 테스트는 개별 함수와 컴포넌트의 특정 동작을 검증합니다.

**테스트 대상:**

- 길찾기 URL 생성 함수 (특정 좌표에 대한 예상 URL)
- 이미지 압축 함수 (특정 입력에 대한 출력 크기)
- Safe Area 계산 함수 (특정 Inset 값에 대한 패딩)
- Bottom Sheet 스냅 포인트 계산

**테스트 프레임워크:** Jest + React Testing Library

### 속성 기반 테스트 (Property-Based Tests)

속성 기반 테스트는 다양한 입력에 대해 불변 속성이 유지되는지 검증합니다.

**테스트 라이브러리:** fast-check

**테스트 설정:**

- 각 속성 테스트는 최소 100회 반복 실행
- 각 테스트는 설계 문서의 속성 번호를 태그로 포함

```typescript
// 테스트 태그 형식
/**
 * @tag Feature: mobile-first-ux, Property 5: 길찾기 딥링크 URL 생성
 */
```

### 통합 테스트 (Integration Tests)

**테스트 대상:**

- Bottom Sheet + 지도 마커 상호작용
- 이미지 압축 + 업로드 파이프라인
- PWA 설치 플로우

### E2E 테스트 (End-to-End Tests)

**테스트 대상:**

- 모바일 뷰포트에서의 전체 인증 플로우
- 오프라인 모드 동작
- 푸시 알림 수신

**테스트 프레임워크:** Playwright (모바일 에뮬레이션)
