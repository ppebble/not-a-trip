# Requirements Document: 모바일 퍼스트 UX 개선 (Mobile First UX)

## Introduction

성지순례는 100% 밖에서 핸드폰을 켜고 걸어 다니며 보는 서비스입니다. 데스크탑 뷰보다 모바일 웹 UI/UX를 1순위로 개선합니다. 한 손 조작성, 스와이프 제스처, 빠른 로딩을 핵심으로 합니다.

## Glossary

- **PWA (Progressive Web App)**: 웹 기술로 만든 앱과 유사한 경험을 제공하는 웹 애플리케이션
- **Gesture (제스처)**: 스와이프, 핀치 등의 터치 동작
- **Bottom Sheet**: 화면 하단에서 올라오는 UI 패널

## Requirements

### Requirement 1: 모바일 지도 UX 개선

**User Story:** As a 모바일 유저, I want 한 손으로 편하게 지도를 조작할 수 있기를, so that 걸어다니면서도 쉽게 사용할 수 있습니다.

#### Acceptance Criteria

1. THE System SHALL 지도 확대/축소를 더블탭, 핀치 제스처로 지원한다
2. WHEN 스팟 마커를 탭할 때 THEN THE System SHALL 하단에서 Bottom Sheet 형태로 스팟 정보를 표시한다
3. THE System SHALL Bottom Sheet를 위로 스와이프하여 상세 정보를 펼칠 수 있도록 한다
4. THE System SHALL 현재 위치 버튼을 엄지손가락이 닿기 쉬운 위치에 배치한다

### Requirement 2: 스팟 상세 페이지 모바일 최적화

**User Story:** As a 모바일 유저, I want 스팟 정보를 빠르게 확인할 수 있기를, so that 현장에서 바로 필요한 정보를 얻을 수 있습니다.

#### Acceptance Criteria

1. THE System SHALL 스팟 상세 페이지를 스크롤 없이 핵심 정보(사진, 위치, 작품명)를 먼저 표시한다
2. THE System SHALL 이미지 갤러리를 좌우 스와이프로 탐색할 수 있도록 한다
3. THE System SHALL "길찾기" 버튼을 탭하면 네이티브 지도 앱(구글맵, 애플맵)으로 연결한다
4. THE System SHALL 오프라인에서도 기본 정보를 볼 수 있도록 캐싱한다

### Requirement 3: 빠른 인증 플로우

**User Story:** As a 현장에 있는 유저, I want 빠르게 인증샷을 올릴 수 있기를, so that 순례 흐름이 끊기지 않습니다.

#### Acceptance Criteria

1. WHEN 스팟 상세 페이지에서 "인증" 버튼을 탭할 때 THEN THE System SHALL 바로 카메라를 실행하거나 갤러리를 열 수 있도록 한다
2. THE System SHALL 인증 과정을 3단계 이내로 완료할 수 있도록 한다 (사진 선택 → 코멘트 → 완료)
3. THE System SHALL 업로드 중에도 다른 기능을 사용할 수 있도록 백그라운드 업로드를 지원한다

### Requirement 4: PWA 지원

**User Story:** As a 유저, I want 앱처럼 홈 화면에 추가하여 사용할 수 있기를, so that 빠르게 접근할 수 있습니다.

#### Acceptance Criteria

1. THE System SHALL PWA manifest를 제공하여 홈 화면 추가를 지원한다
2. THE System SHALL 오프라인 기본 페이지를 제공한다
3. THE System SHALL 푸시 알림을 지원한다 (뱃지 획득, 제보 승인 등)

### Requirement 5: 성능 최적화

**User Story:** As a 유저, I want 페이지가 빠르게 로딩되기를, so that 데이터가 느린 환경에서도 사용할 수 있습니다.

#### Acceptance Criteria

1. THE System SHALL 이미지를 WebP 포맷으로 최적화하여 제공한다
2. THE System SHALL 지도 타일을 캐싱하여 재방문 시 빠르게 로딩한다
3. THE System SHALL Lighthouse 모바일 점수 80점 이상을 유지한다
4. THE System SHALL 스켈레톤 UI를 제공하여 체감 로딩 시간을 줄인다

</content>
