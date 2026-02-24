# Implementation Plan: 모바일 퍼스트 UX 개선 (Mobile First UX)

## Overview

이 구현 계획은 Not a Trip 서비스의 모바일 퍼스트 UX 개선을 위한 단계별 작업을 정의합니다. 각 작업은 요구사항과 연결되어 추적 가능하며, 점진적으로 기능을 구축합니다.

## Tasks

- [x] 1. 기반 인프라 설정
  - [x] 1.1 모바일 컴포넌트 디렉토리 구조 생성
    - `src/components/mobile/` 디렉토리 생성
    - `src/hooks/` 에 모바일 관련 훅 파일 생성
    - `src/stores/` 에 새로운 스토어 파일 생성
    - `src/lib/` 에 유틸리티 파일 생성
    - _Requirements: 전체_

  - [x] 1.2 Tailwind Safe Area 유틸리티 클래스 추가
    - `tailwind.config.ts`에 Safe Area 관련 유틸리티 추가
    - `env(safe-area-inset-*)` CSS 변수 활용
    - _Requirements: 4.4_

  - [x] 1.3 browser-image-compression 패키지 설치
    - `npm install browser-image-compression` 실행
    - 타입 정의 확인
    - _Requirements: 5.5_

- [x] 2. PWA 기반 설정 (조기 설정 - 충돌 방지)
  - [x] 2.1 manifest.json 생성 (public/manifest.json)
    - 앱 이름, 설명, 아이콘 설정
    - display: standalone
    - theme_color, background_color 설정
    - start_url 설정
    - _Requirements: 4.1_

  - [ ]\* 2.2 manifest.json 속성 테스트 작성
    - **Property 8: PWA Manifest 스키마 유효성**
    - **Validates: Requirements 4.1**

  - [x] 2.3 기본 Service Worker 설정 (public/sw.js)
    - 기본 캐싱 전략 설정
    - 정적 자산 캐싱 (App Shell)
    - 오프라인 폴백 페이지 라우팅
    - _Requirements: 2.4, 4.2_

  - [x] 2.4 오프라인 페이지 구현 (public/offline.html)
    - 오프라인 상태 안내
    - 재연결 시도 버튼
    - _Requirements: 4.2_

  - [x] 2.5 layout.tsx에 PWA 메타태그 추가
    - manifest 링크
    - theme-color 메타태그
    - apple-touch-icon
    - viewport 설정 (viewport-fit=cover)
    - _Requirements: 4.1, 4.4_

  - [x] 2.6 iOS Safari PWA 설치 유도 컴포넌트 구현
    - iOS Safari 감지 로직
    - 수동 설치 방법 안내 바텀시트/툴팁 UI
    - localStorage로 "다시 보지 않기" 상태 저장
    - _Requirements: 4.1_

- [x] 3. Checkpoint - 기반 설정 확인
  - 모든 디렉토리 구조 확인
  - 패키지 설치 확인
  - PWA manifest 유효성 확인
  - Service Worker 등록 확인
  - 빌드 오류 없음 확인

- [x] 4. 핵심 훅 구현
  - [x] 4.1 useNetworkStatus 훅 구현
    - `navigator.onLine` 및 online/offline 이벤트 감지
    - Network Information API 활용 (지원 브라우저)
    - Zustand networkStore와 연동
    - _Requirements: 2.4, 3.3_

  - [ ]\* 4.2 useNetworkStatus 속성 테스트 작성
    - **Property 6: 백그라운드 업로드 상태 독립성**
    - **Validates: Requirements 3.3**

  - [x] 4.3 useGeolocation 훅 구현
    - `navigator.geolocation.getCurrentPosition` 래핑
    - 권한 상태 관리 (granted/denied/prompt)
    - 에러 핸들링 및 폴백 상태 관리
    - _Requirements: 1.4, 1.5_

  - [ ]\* 4.4 useGeolocation 속성 테스트 작성
    - **Property 3: GPS 폴백 UI 표시**
    - **Validates: Requirements 1.5**

  - [x] 4.5 useSwipeGesture 훅 구현
    - 터치 이벤트 (touchstart, touchmove, touchend) 처리
    - 스와이프 방향, 거리, 속도 계산
    - 임계값 기반 스와이프 감지
    - _Requirements: 1.3, 2.2_

  - [ ]\* 4.6 useSwipeGesture 속성 테스트 작성
    - **Property 4: 갤러리 스와이프 인덱스 변화**
    - **Validates: Requirements 2.2**

  - [x] 4.7 useCamera 훅 구현
    - `navigator.mediaDevices.getUserMedia` 래핑
    - 전면/후면 카메라 전환
    - 사진 촬영 (canvas 캡처)
    - 에러 핸들링
    - **컴포넌트 언마운트 시 미디어 스트림 트랙 명시적 종료 (track.stop())**
    - useEffect cleanup에서 모든 트랙 정리
    - _Requirements: 3.1, 3.4_

- [x] 5. Checkpoint - 훅 테스트 확인
  - 모든 훅 단위 테스트 통과 확인
  - 속성 테스트 통과 확인

- [ ] 6. 이미지 처리 파이프라인 구현
  - [ ] 6.1 이미지 압축 유틸리티 구현 (src/lib/image-compression.ts)
    - browser-image-compression 라이브러리 래핑
    - WebP 변환 옵션 설정
    - 최대 크기 제한 (1MB)
    - 압축 결과 반환 (원본/압축 크기, 압축률)
    - _Requirements: 5.1, 5.5_

  - [ ]\* 6.2 이미지 압축 속성 테스트 작성
    - **Property 11: WebP 이미지 변환**
    - **Property 12: 클라이언트 이미지 압축**
    - **Validates: Requirements 5.1, 5.5**

  - [ ] 6.3 useImageCompression 훅 구현
    - 압축 유틸리티 래핑
    - 로딩/에러 상태 관리
    - 압축 진행률 제공
    - _Requirements: 5.5_

- [x] 7. 백그라운드 업로드 시스템 구현
  - [x] 7.1 uploadQueueStore 구현 (src/stores/uploadQueueStore.ts)
    - 업로드 큐 관리 (추가, 제거, 상태 업데이트)
    - 재시도 로직 (지수 백오프)
    - 전체 진행률 계산
    - _Requirements: 3.3_

  - [x] 7.2 useBackgroundUpload 훅 구현
    - uploadQueueStore 연동
    - 네트워크 상태에 따른 업로드 일시정지/재개
    - 업로드 완료 콜백
    - _Requirements: 3.3_

- [x] 8. Checkpoint - 이미지 처리 확인
  - 이미지 압축 테스트 통과 확인
  - 백그라운드 업로드 동작 확인

- [ ] 9. Bottom Sheet 컴포넌트 구현
  - [ ] 9.1 bottomSheetStore 구현 (src/stores/bottomSheetStore.ts)
    - 열림/닫힘 상태 관리
    - 높이 상태 (collapsed/half/full) 관리
    - 현재 스팟 ID 관리
    - _Requirements: 1.2, 1.3_

  - [ ] 9.2 useBottomSheet 훅 구현
    - 드래그 제스처 처리
    - 스냅 포인트 계산 (Safe Area 고려)
    - 높이 상태 전환 로직
    - _Requirements: 1.2, 1.3, 4.4_

  - [ ]\* 9.3 useBottomSheet 속성 테스트 작성
    - **Property 2: Bottom Sheet 상태 전환**
    - **Property 10: Safe Area 스타일 계산**
    - **Validates: Requirements 1.2, 1.3, 4.4**

  - [ ] 9.4 BottomSheet 컴포넌트 구현 (src/components/mobile/BottomSheet.tsx)
    - 드래그 핸들 UI
    - 스냅 애니메이션
    - Safe Area 패딩 적용
    - 스팟 미리보기 콘텐츠 렌더링
    - _Requirements: 1.2, 1.3, 4.4_

  - [ ] 9.5 PilgrimageMap에 Bottom Sheet 통합
    - 기존 SpotPreview를 Bottom Sheet로 대체 (모바일)
    - 마커 탭 시 Bottom Sheet 열기
    - 반응형 처리 (데스크탑은 기존 방식 유지)
    - _Requirements: 1.2_

- [ ] 10. Checkpoint - Bottom Sheet 확인
  - Bottom Sheet 제스처 동작 확인
  - Safe Area 적용 확인
  - 모바일/데스크탑 반응형 확인

- [ ] 11. 모바일 지도 UX 개선
  - [ ] 11.1 LocationButton 컴포넌트 구현
    - 화면 하단 우측 배치
    - 현재 위치로 이동 기능
    - 로딩/에러 상태 표시
    - _Requirements: 1.4_

  - [ ] 11.2 GpsErrorFallback 컴포넌트 구현
    - GPS 오류 유형별 메시지 표시
    - 수동 지도 탐색 안내
    - 설정 페이지 링크 (권한 거부 시)
    - _Requirements: 1.5_

  - [ ] 11.3 지도 제스처 설정 최적화
    - Leaflet 더블탭 줌 활성화 확인
    - 핀치 줌 활성화 확인
    - 모바일 터치 이벤트 최적화
    - _Requirements: 1.1_

  - [ ]\* 11.4 지도 제스처 속성 테스트 작성
    - **Property 1: 지도 제스처 줌 동작**
    - **Validates: Requirements 1.1**

- [x] 12. 스팟 상세 페이지 모바일 최적화
  - [x] 12.1 SwipeableGallery 컴포넌트 구현
    - 좌우 스와이프 제스처
    - 인디케이터 (현재 위치 표시)
    - 터치 슬라이드 애니메이션
    - _Requirements: 2.2_

  - [x] 12.2 DirectionsButton 컴포넌트 구현 (src/components/common/DirectionsButton.tsx)
    - 플랫폼 감지 (iOS/Android/Web)
    - 지도 앱 선택 모달
    - 딥링크 URL 생성 및 열기
    - _Requirements: 2.3_

  - [ ]\* 12.3 DirectionsButton 속성 테스트 작성
    - **Property 5: 길찾기 딥링크 URL 생성**
    - **Validates: Requirements 2.3**

  - [x] 12.4 스팟 상세 페이지 레이아웃 최적화
    - 핵심 정보 (사진, 위치, 작품명) 상단 배치
    - 스크롤 없이 핵심 정보 표시 (모바일 뷰포트)
    - SwipeableGallery 적용
    - DirectionsButton 추가
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 13. Checkpoint - 스팟 상세 확인
  - 스와이프 갤러리 동작 확인
  - 길찾기 버튼 동작 확인
  - 모바일 레이아웃 확인

- [x] 14. 빠른 인증 플로우 구현
  - [x] 14.1 ViewfinderOverlay 컴포넌트 구현
    - 카메라 스트림 표시 (video 태그)
    - 씬 이미지 오버레이 (30~50% 투명도)
    - 투명도 조절 슬라이더
    - 촬영 버튼
    - _Requirements: 3.4_

  - [ ]\* 14.2 ViewfinderOverlay 속성 테스트 작성
    - **Property 7: 뷰파인더 오버레이 투명도 범위**
    - **Validates: Requirements 3.4**

  - [x] 14.3 QuickCheckIn 컴포넌트 구현 (src/components/checkin/QuickCheckIn.tsx)
    - 3단계 플로우 (사진 선택 → 코멘트 → 완료)
    - 카메라/갤러리 선택 옵션
    - 이미지 압축 적용
    - 백그라운드 업로드 연동
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 14.4 기존 CheckInModal 개선
    - QuickCheckIn 플로우 적용
    - ViewfinderOverlay 옵션 추가
    - 백그라운드 업로드 상태 표시
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 15. Checkpoint - 인증 플로우 확인
  - 카메라 접근 동작 확인
  - 뷰파인더 오버레이 동작 확인
  - 3단계 플로우 완료 확인
  - 백그라운드 업로드 동작 확인

- [x] 16. PWA 고도화
  - [x] 16.1 Service Worker 캐싱 고도화
    - 지도 타일 캐싱 전략 추가
    - 스팟 데이터 캐싱
    - 캐시 버전 관리
    - _Requirements: 2.4, 5.2_

  - [x] 16.2 오프라인 페이지 고도화
    - 캐시된 스팟 목록 표시 (가능한 경우)
    - 오프라인 상태에서 저장된 데이터 표시
    - _Requirements: 4.2_

- [ ] 17. 푸시 알림 설정
  - [ ] 17.1 푸시 알림 유틸리티 구현 (src/lib/push-notifications.ts)
    - 알림 권한 요청
    - 구독 등록/해제
    - 알림 페이로드 생성
    - _Requirements: 4.3_

  - [ ]\* 17.2 푸시 알림 속성 테스트 작성
    - **Property 9: 푸시 알림 페이로드 구조**
    - **Validates: Requirements 4.3**

  - [ ] 17.3 푸시 알림 API 엔드포인트 구현
    - 구독 저장 API
    - 알림 발송 API (뱃지 획득, 제보 승인)
    - _Requirements: 4.3_

- [ ] 18. Checkpoint - PWA 고도화 확인
  - 지도 타일 캐싱 동작 확인
  - 오프라인 페이지 고도화 확인
  - 푸시 알림 권한 요청 확인

- [ ] 19. 성능 최적화
  - [ ] 19.1 스켈레톤 UI 컴포넌트 구현 (src/components/common/SkeletonUI.tsx)
    - 스팟 카드 스켈레톤
    - 갤러리 스켈레톤
    - 지도 스켈레톤
    - _Requirements: 5.4_

  - [ ] 19.2 기존 컴포넌트에 스켈레톤 UI 적용
    - 스팟 상세 페이지
    - 갤러리 페이지
    - 메인 지도 페이지
    - _Requirements: 5.4_

  - [ ] 19.3 이미지 최적화 설정 확인
    - Next.js Image 컴포넌트 WebP 변환 확인
    - 이미지 크기 최적화 확인
    - blur placeholder 적용
    - _Requirements: 5.1_

- [ ] 20. SafeAreaWrapper 컴포넌트 구현
  - [ ] 20.1 SafeAreaWrapper 컴포넌트 구현 (src/components/mobile/SafeAreaWrapper.tsx)
    - env(safe-area-inset-\*) CSS 변수 활용
    - 방향별 패딩 적용 옵션
    - 추가 패딩 옵션
    - _Requirements: 4.4_

  - [ ] 20.2 하단 네비게이션에 Safe Area 적용
    - Header 컴포넌트 Safe Area 적용
    - Bottom Sheet Safe Area 적용
    - _Requirements: 4.4_

- [ ] 21. 최종 Checkpoint
  - 모든 테스트 통과 확인
  - Lighthouse 모바일 점수 80점 이상 확인
  - 모바일 디바이스 실제 테스트
  - 오프라인 모드 테스트

## Notes

- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다
- 체크포인트에서 점진적 검증을 수행합니다
- `*` 표시된 태스크는 선택적 속성 테스트입니다 (핵심 기능 우선 구현)
- 속성 테스트는 fast-check 라이브러리를 사용합니다
- 각 속성 테스트는 최소 100회 반복 실행됩니다
- PWA 설정을 조기에 배치하여 Next.js 웹팩 충돌 방지
- useCamera 훅에서 언마운트 시 미디어 스트림 트랙 명시적 종료 필수
- iOS Safari는 PWA 자동 설치 팝업이 없으므로 수동 설치 안내 UI 필요
