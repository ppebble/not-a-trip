# Requirements Document

## Introduction

UX 품질 개선 2차 작업으로, 사용자 피드백과 서비스 성장에 따라 필요해진 3가지 기능을 추가한다:

1. 코스 생성 최소 스팟 수 유연화 (1개 스팟 코스 허용)
2. 스팟/코스 공유 기능 (Web Share API)
3. 신규 사용자 온보딩 가이드 투어

이 개선을 통해 콘텐츠 생성 진입 장벽을 낮추고, 바이럴 공유를 촉진하며, 신규 사용자의 서비스 이해도를 높인다.

## Glossary

- **Route_Form**: `RouteFormContent.tsx` 컴포넌트. 코스 생성/수정 폼 UI를 제공하며 스팟 추가, 순서 변경, 유효성 검사를 수행
- **Route_API**: `/api/routes` 엔드포인트. 코스 생성(POST) 및 수정(PUT) 요청을 처리하는 서버 API
- **Guide_Panel**: `GuidePanel.tsx` 컴포넌트. 코스 가이드 모드에서 체크리스트 형태의 안내 패널
- **Spot_Detail_Page**: `/spots/[id]` 경로의 스팟 상세 페이지. SpotDetailClient 컴포넌트로 구성
- **Route_Detail_Page**: `/routes/[id]` 경로의 코스 상세 페이지. RouteDetailContent 컴포넌트로 구성
- **Share_Button**: 공유 기능을 제공하는 버튼 컴포넌트. Web Share API 또는 클립보드 복사를 수행
- **Web_Share_API**: 브라우저의 `navigator.share()` API. 모바일에서 네이티브 공유 시트를 호출
- **Clipboard_Fallback**: Web Share API 미지원 환경에서 `navigator.clipboard.writeText()`로 URL을 복사하는 대체 동작
- **OG_Tag**: Open Graph 메타 태그. 공유 시 미리보기 이미지와 설명을 제공 (기존 `/api/og` 활용)
- **Onboarding_Tour**: 신규 사용자에게 주요 UI 요소를 설명하는 툴팁 오버레이 가이드
- **Tour_Step**: 온보딩 가이드의 개별 단계. 특정 UI 요소를 하이라이트하고 설명 툴팁을 표시
- **Tour_State**: localStorage에 저장되는 온보딩 완료 상태. 키: `not-a-trip-onboarding-completed`
- **Spot_Order_List**: `SpotOrderList.tsx` 컴포넌트. 코스 내 스팟 순서를 표시하고 드래그로 재정렬하는 UI

## Requirements

### Requirement 1: 코스 생성 최소 스팟 수 1개로 변경

**User Story:** 팬으로서, 단일 스팟만으로도 코스를 생성하고 싶다. 그래야 스팟이 적은 작품이라도 순례 코스를 만들어 공유할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Route_Form에서 스팟을 1개 이상 추가하면, THE Route_Form SHALL 코스 생성을 허용한다
2. WHEN 사용자가 Route_Form에서 스팟을 0개 추가한 상태로 제출하면, THE Route_Form SHALL "코스에는 최소 1개의 스팟이 필요합니다" 에러 메시지를 표시한다
3. WHEN Route_API가 스팟 1개 이상의 코스 생성 요청을 받으면, THE Route_API SHALL 유효성 검사를 통과시키고 코스를 저장한다
4. WHEN Route_API가 스팟 0개의 코스 생성/수정 요청을 받으면, THE Route_API SHALL "코스에는 최소 1개의 스팟이 필요합니다" 에러를 반환한다
5. WHILE 코스의 스팟이 1개인 상태에서, THE Spot_Order_List SHALL "더 많은 스팟을 추가하면 풍성한 순례 경험을 만들 수 있어요!" 안내 메시지를 표시한다
6. WHILE 코스의 스팟이 1개인 상태에서, THE Guide_Panel SHALL "다음 스팟" 관련 거리/시간 정보를 표시하지 않고 단일 스팟 인증 UI만 제공한다
7. THE Route_Detail_Page SHALL 스팟 1개 코스를 정상적으로 표시하며, 코스 순서 섹션에 단일 스팟만 나열한다

### Requirement 2: 스팟/코스 공유 기능

**User Story:** 팬으로서, 발견한 스팟이나 코스를 친구에게 쉽게 공유하고 싶다. 그래야 함께 성지순례를 계획하거나 좋은 장소를 추천할 수 있다.

#### Acceptance Criteria

1. THE Spot_Detail_Page SHALL 헤더 영역에 Share_Button을 표시한다
2. THE Route_Detail_Page SHALL 액션 버튼 영역에 Share_Button을 표시한다
3. WHEN 사용자가 Spot_Detail_Page에서 Share_Button을 클릭하고 Web_Share_API가 지원되면, THE Share_Button SHALL 네이티브 공유 시트를 호출한다
4. WHEN 사용자가 Route_Detail_Page에서 Share_Button을 클릭하고 Web_Share_API가 지원되면, THE Share_Button SHALL 네이티브 공유 시트를 호출한다
5. WHEN Web_Share_API가 지원되지 않는 브라우저에서 Share_Button을 클릭하면, THE Share_Button SHALL 현재 페이지 URL을 클립보드에 복사하고 "링크가 복사되었습니다" 토스트 메시지를 표시한다
6. WHEN 스팟 공유 시, THE Share_Button SHALL 공유 텍스트를 "[Not a Trip] {작품명}의 성지순례 스팟 {스팟명}을 확인해보세요!" 형식으로 구성한다
7. WHEN 코스 공유 시, THE Share_Button SHALL 공유 텍스트를 "[Not a Trip] {코스명} 순례 코스를 확인해보세요!" 형식으로 구성한다
8. THE Share_Button SHALL 공유 URL에 기존 OG_Tag 메타데이터가 포함되도록 현재 페이지의 canonical URL을 사용한다
9. IF Web_Share_API 호출이 사용자 취소(AbortError)로 실패하면, THEN THE Share_Button SHALL 에러 메시지를 표시하지 않는다
10. IF Web_Share_API 호출이 기타 에러로 실패하면, THEN THE Share_Button SHALL Clipboard_Fallback으로 전환하여 URL을 복사한다
11. WHEN 서비스가 HTTP 환경(localhost 개발 환경 등)에서 실행되면, THE Share_Button SHALL Web_Share_API를 사용하지 않고 Clipboard_Fallback으로 자동 전환한다

### Requirement 3: 신규 사용자 온보딩 가이드 투어

**User Story:** 신규 사용자로서, 서비스를 처음 방문했을 때 주요 기능의 사용법을 안내받고 싶다. 그래야 빠르게 서비스를 이해하고 원하는 기능을 찾을 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 서비스에 최초 방문하고 Tour_State가 존재하지 않으면, THE Onboarding_Tour SHALL 자동으로 시작된다
2. WHEN Onboarding_Tour가 지도 페이지에서 시작되면, THE Onboarding_Tour SHALL 카테고리 필터, 검색 입력, 마커 클릭 순서로 Tour_Step을 표시한다
3. WHEN Onboarding_Tour가 코스 페이지에서 시작되면, THE Onboarding_Tour SHALL 코스 시작 방법을 안내하는 Tour_Step을 표시한다
4. WHEN Onboarding_Tour가 갤러리 페이지에서 시작되면, THE Onboarding_Tour SHALL 인증샷 업로드 방법을 안내하는 Tour_Step을 표시한다
5. THE Tour_Step SHALL 대상 UI 요소를 하이라이트하고, 나머지 영역을 반투명 오버레이로 어둡게 처리한다
6. THE Tour_Step SHALL 대상 요소 근처에 설명 툴팁을 표시하며, "다음" 버튼과 "건너뛰기" 버튼을 포함한다
7. WHEN 사용자가 "건너뛰기" 버튼을 클릭하면, THE Onboarding_Tour SHALL 즉시 종료되고 Tour_State를 localStorage에 완료로 저장한다
8. WHEN 사용자가 모든 Tour_Step을 완료하면, THE Onboarding_Tour SHALL Tour_State를 localStorage에 완료로 저장한다
9. WHILE Tour_State가 완료 상태이면, THE Onboarding_Tour SHALL 자동으로 시작되지 않는다
10. THE Onboarding_Tour SHALL 설정 메뉴 또는 도움말에서 "가이드 다시 보기" 옵션을 제공하여 Tour_State를 초기화할 수 있다
11. THE Tour_Step SHALL 모바일 뷰포트에서 툴팁이 화면 밖으로 벗어나지 않도록 위치를 자동 조정한다
12. WHEN Tour_Step의 대상 요소가 현재 페이지에 존재하지 않으면, THE Onboarding_Tour SHALL 해당 단계를 건너뛰고 다음 단계로 진행한다
13. THE Onboarding_Tour SHALL 키보드 Tab 키로 툴팁 내 버튼 간 이동이 가능하고, Escape 키로 투어를 종료할 수 있어야 한다
14. THE Onboarding_Tour SHALL 스크린 리더 사용자를 위해 적절한 ARIA 속성(aria-modal, aria-describedby)을 제공한다
