# Requirements Document: 성지 제보 시스템 (Spot Report Wiki)

## Introduction

유저들이 직접 새로운 성지를 제보하고, 기존 성지 정보를 보완할 수 있는 집단지성 위키 시스템입니다. 혼자서 전 세계의 성지 DB를 채울 수 없으므로, 유저 참여를 통해 데이터를 확장합니다. 최초 제보자에게는 명예를 부여하여 참여 동기를 높입니다.

## Glossary

- **Spot Report (성지 제보)**: 유저가 새로운 성지 위치를 제보하는 행위
- **Scene Info (씬 정보)**: 해당 장소가 등장하는 작품명, 에피소드, 타임스탬프 등의 정보
- **First Reporter (최초 제보자)**: 해당 성지를 처음 제보한 유저
- **Verification (검증)**: 관리자 또는 커뮤니티가 제보 내용을 확인하는 과정

## Requirements

### Requirement 1: 성지 제보 기능

**User Story:** As a 유저, I want 내가 발견한 성지를 제보할 수 있기를, so that 다른 유저들도 해당 장소를 방문할 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 지도에서 특정 위치를 길게 누르거나 "성지 제보" 버튼을 클릭할 때 THEN THE System SHALL 제보 폼을 표시한다
2. WHEN 유저가 제보 폼을 작성할 때 THEN THE System SHALL 다음 정보를 입력받는다: 위치(핀), 장소명, 작품명, 에피소드/타임스탬프, 설명, 참고 이미지
3. WHEN 제보가 제출되면 THEN THE System SHALL 관리자 검토 대기 상태로 저장한다
4. WHEN 관리자가 제보를 승인하면 THEN THE System SHALL 해당 스팟을 지도에 추가하고 최초 제보자 정보를 표시한다
5. THE System SHALL 제보 상태(대기중/승인/반려)를 유저에게 알린다

### Requirement 2: 최초 제보자 명예 시스템

**User Story:** As a 제보자, I want 내가 제보한 성지에 내 이름이 표시되기를, so that 기여에 대한 인정을 받을 수 있습니다.

#### Acceptance Criteria

1. WHEN 스팟 상세 페이지를 조회할 때 THEN THE System SHALL "최초 제보: @username" 형태로 제보자 정보를 표시한다
2. WHEN 유저 프로필을 조회할 때 THEN THE System SHALL 해당 유저가 제보한 스팟 목록을 표시한다
3. THE System SHALL 제보 수에 따른 "성지 발굴가" 뱃지를 부여한다

### Requirement 3: 기존 스팟 정보 보완 제보

**User Story:** As a 유저, I want 기존 스팟의 부족한 정보를 보완할 수 있기를, so that 더 정확하고 풍부한 정보를 제공할 수 있습니다.

#### Acceptance Criteria

1. WHEN 스팟 상세 페이지에서 "정보 수정 제안" 버튼을 클릭할 때 THEN THE System SHALL 수정 제안 폼을 표시한다
2. WHEN 유저가 추가 씬 정보(다른 에피소드, 다른 작품)를 제보할 때 THEN THE System SHALL 기존 스팟에 씬 정보를 추가한다
3. THE System SHALL 정보 보완 기여자 목록을 스팟 상세 페이지에 표시한다

### Requirement 4: 스팟 상태 관리 (소실/변경 신고)

**User Story:** As a 유저, I want 성지가 철거되거나 변경된 경우 신고할 수 있기를, so that 다른 유저들이 헛걸음하지 않도록 할 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 "현재 상태 신고" 버튼을 클릭할 때 THEN THE System SHALL 상태 신고 폼을 표시한다
2. THE System SHALL 다음 상태를 선택할 수 있도록 한다: 정상, 일부 변경, 공사중, 소실됨, 접근 불가
3. WHEN 상태 신고가 일정 수 이상 누적되면 THEN THE System SHALL 해당 스팟에 경고 표시를 추가한다
4. THE System SHALL 지도에서 소실/변경된 스팟을 시각적으로 구분하여 표시한다

### Requirement 5: 제보 검토 시스템 (관리자)

**User Story:** As a 관리자, I want 유저 제보를 효율적으로 검토할 수 있기를, so that 품질 높은 데이터를 유지할 수 있습니다.

#### Acceptance Criteria

1. WHEN 관리자가 제보 관리 페이지에 접근할 때 THEN THE System SHALL 대기중인 제보 목록을 표시한다
2. WHEN 관리자가 제보를 검토할 때 THEN THE System SHALL 승인/반려/수정요청 옵션을 제공한다
3. THE System SHALL 반려 시 사유를 입력하고 제보자에게 알릴 수 있도록 한다

</content>
