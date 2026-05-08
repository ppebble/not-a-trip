# Requirements Document

## Introduction

코스 진행 중 인증 시 페이지 이탈 문제를 해결하고, 갤러리에서 탐색으로 이어지는 루프를 강화하는 기능이다.

현재 GuidePanel에서 "여기서 인증하기" 버튼을 누르면 `router.push('/spots/${spotId}')`로 스팟 상세 페이지로 완전 이동하여 코스 진행 상태(현재 스팟, 진행률, 다음 목적지)가 사라진다. 또한 갤러리 피드 카드에서 해당 스팟/작품/코스로 이동하는 연결이 약하여 감상 후 다음 행동 전환이 부족하다.

이 Spec은 다음을 구현한다:
1. 코스 진행 중 인증을 인라인 바텀시트로 전환 (페이지 이탈 없음)
2. 인증 완료 후 자동으로 다음 스팟으로 진행 (체크리스트 업데이트)
3. 코스 진행 상태의 글로벌 유지 (다른 페이지에서도 "코스 진행 중" 배너 표시)
4. 갤러리 인증 카드에서 스팟/작품/코스 연결 강화

## Glossary

- **Inline_CheckIn_Sheet**: 코스 진행 중 페이지 이탈 없이 인증을 수행할 수 있는 바텀시트 UI 컴포넌트
- **GuidePanel**: 코스 진행 시 하단에 표시되는 체크리스트 가이드 패널 (스팟 목록, 진행률, 인증 버튼 포함)
- **CourseProgressStore**: Zustand 기반 코스 진행 상태 글로벌 스토어 (activeRoute, checkedSpotIds, currentSpotIndex 등)
- **Course_Progress_Banner**: 코스 진행 중 다른 페이지에서도 표시되는 플로팅 배너 (현재 코스명, 진행률, 복귀 버튼)
- **Gallery_CheckIn_Card**: 갤러리 피드에서 인증 사진을 표시하는 카드 컴포넌트
- **QuickCheckIn**: 기존 빠른 인증 플로우 컴포넌트 (작품 선택 → 사진 → 코멘트 → 완료)
- **RouteDetailContent**: 코스 상세 페이지의 메인 콘텐츠 컴포넌트

## Requirements

### Requirement 1: 코스 진행 중 인라인 인증 바텀시트

**User Story:** 코스를 진행하는 사용자로서, 인증 시 페이지를 이탈하지 않고 현재 코스 화면에서 바로 인증을 완료하고 싶다. 그래야 코스 진행 흐름이 끊기지 않는다.

#### Acceptance Criteria

1. WHEN 사용자가 GuidePanel의 "여기서 인증하기" 버튼을 클릭하면, THE Inline_CheckIn_Sheet SHALL 현재 페이지 위에 바텀시트 형태로 표시된다
2. WHILE Inline_CheckIn_Sheet가 열려 있는 동안, THE RouteDetailContent SHALL 배경에 그대로 유지되며 페이지 이동이 발생하지 않는다
3. THE Inline_CheckIn_Sheet SHALL QuickCheckIn 컴포넌트의 인증 플로우(작품 선택 → 사진 선택 → 코멘트 → 완료)를 동일하게 제공한다
4. WHEN 사용자가 Inline_CheckIn_Sheet의 배경 영역을 탭하거나 닫기 버튼을 클릭하면, THE Inline_CheckIn_Sheet SHALL 닫히고 코스 진행 화면으로 복귀한다
5. WHEN Inline_CheckIn_Sheet가 열릴 때, THE Inline_CheckIn_Sheet SHALL 해당 스팟의 이름과 순서 번호를 헤더에 표시한다
6. IF 인증 API 호출이 실패하면, THEN THE Inline_CheckIn_Sheet SHALL 에러 메시지를 표시하고 재시도 옵션을 제공한다

### Requirement 2: 인증 완료 후 자동 진행

**User Story:** 코스를 진행하는 사용자로서, 인증을 완료하면 자동으로 체크리스트가 업데이트되고 다음 스팟으로 안내받고 싶다. 그래야 수동으로 다음 단계를 찾지 않아도 된다.

#### Acceptance Criteria

1. WHEN 인증이 성공적으로 완료되면, THE CourseProgressStore SHALL 해당 스팟을 checkedSpotIds에 추가하고 GuidePanel의 체크리스트를 즉시 업데이트한다
2. WHEN 인증이 성공적으로 완료되면, THE Inline_CheckIn_Sheet SHALL 완료 애니메이션을 표시한 후 1.5초 뒤에 자동으로 닫힌다
3. WHEN 인증 완료 후 다음 미인증 스팟이 존재하면, THE CourseProgressStore SHALL currentSpotIndex를 다음 미인증 스팟으로 자동 이동한다
4. WHEN 인증 완료로 모든 유효 스팟이 인증되면, THE GuidePanel SHALL 완주 상태를 표시하고 완주 축하 이펙트를 트리거한다
5. WHILE 인증이 진행 중인 동안, THE Inline_CheckIn_Sheet SHALL 제출 버튼을 비활성화하고 로딩 상태를 표시한다

### Requirement 3: 코스 진행 상태 글로벌 유지

**User Story:** 코스를 진행하는 사용자로서, 다른 페이지(갤러리, 스팟 상세 등)로 이동하더라도 코스 진행 중임을 인지하고 빠르게 코스로 복귀하고 싶다. 그래야 코스 진행 맥락을 잃지 않는다.

#### Acceptance Criteria

1. WHILE CourseProgressStore의 isNavigating이 true인 동안, THE Course_Progress_Banner SHALL 코스 상세 페이지 이외의 모든 페이지 하단에 플로팅 배너로 표시된다
2. THE Course_Progress_Banner SHALL 현재 코스명, 진행률(퍼센트), "코스로 돌아가기" 버튼을 포함한다
3. WHEN 사용자가 Course_Progress_Banner의 "코스로 돌아가기" 버튼을 클릭하면, THE Course_Progress_Banner SHALL 코스 상세 페이지(`/routes/{routeId}`)로 이동한다
4. WHEN 사용자가 Course_Progress_Banner의 닫기(X) 버튼을 클릭하면, THE Course_Progress_Banner SHALL 배너를 일시적으로 숨기되 코스 진행 상태는 유지한다
5. THE CourseProgressStore SHALL persist 미들웨어를 사용하여 브라우저 새로고침 후에도 코스 진행 상태를 유지한다
6. WHEN 코스가 종료(endRoute)되면, THE Course_Progress_Banner SHALL 즉시 사라진다

### Requirement 4: 갤러리 인증 카드 연결 강화

**User Story:** 갤러리에서 인증 사진을 감상하는 사용자로서, 해당 인증이 어떤 스팟/작품/코스와 관련되는지 빠르게 확인하고 이동하고 싶다. 그래야 감상에서 탐색으로 자연스럽게 전환된다.

#### Acceptance Criteria

1. WHEN 사용자가 Gallery_CheckIn_Card를 클릭하여 상세 보기를 열면, THE Gallery_CheckIn_Card SHALL 스팟 이름과 스팟 상세 페이지 링크를 표시한다
2. WHEN 인증에 연결된 작품(relatedContent)이 존재하면, THE Gallery_CheckIn_Card SHALL 작품명과 작품 허브 페이지 링크를 표시한다
3. WHEN 인증된 스팟이 포함된 코스가 존재하면, THE Gallery_CheckIn_Card SHALL "이 스팟이 포함된 코스" 섹션에 코스명과 코스 상세 페이지 링크를 표시한다
4. WHEN 사용자가 Gallery_CheckIn_Card의 스팟 링크를 클릭하면, THE Gallery_CheckIn_Card SHALL 해당 스팟 상세 페이지(`/spots/{spotId}`)로 이동한다
5. WHEN 사용자가 Gallery_CheckIn_Card의 코스 링크를 클릭하면, THE Gallery_CheckIn_Card SHALL 해당 코스 상세 페이지(`/routes/{routeId}`)로 이동한다
6. THE Gallery_CheckIn_Card SHALL 스팟/작품/코스 링크를 인증 사진 하단에 칩(chip) 형태로 표시하여 시각적으로 구분한다
