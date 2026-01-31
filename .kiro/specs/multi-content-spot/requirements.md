# Requirements Document

## Introduction

이 문서는 "다중 작품 연결 스팟" 기능의 요구사항을 정의합니다. 현재 스팟에는 relatedContent 배열이 존재하지만, UI에서 여러 작품을 효과적으로 추가/관리하는 기능이 부족합니다. 예를 들어, 도쿄타워는 도쿄구울, 원피스타워, 그 외 여러 작품에 등장하지만 현재는 하나의 작품만 쉽게 추가할 수 있습니다. 이 기능을 통해 사용자가 스팟 등록/수정 시 여러 작품을 쉽게 추가하고 관리할 수 있도록 합니다.

## Glossary

- **Spot**: 특별한 여행지 정보를 담은 데이터 엔티티
- **RelatedContent**: 스팟과 연결된 작품/콘텐츠 정보 (이름, 타입, 연도, 추가정보 포함)
- **ContentType**: 콘텐츠의 종류 (anime, movie, drama, sports_team, artist, game, other)
- **RelatedContentForm**: 관련 콘텐츠를 입력하는 폼 컴포넌트
- **SpotForm**: 스팟 등록/수정을 위한 메인 폼 컴포넌트
- **SpotDetailPage**: 스팟 상세 정보를 표시하는 페이지

## Requirements

### Requirement 1: 다중 콘텐츠 추가 UI 개선

**User Story:** As a 사용자, I want 스팟 등록 시 여러 관련 콘텐츠를 연속으로 쉽게 추가할 수 있기를, so that 하나의 스팟에 여러 작품을 빠르게 연결할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 관련 콘텐츠를 추가한 후 THEN THE RelatedContentForm SHALL 추가 완료 후 즉시 새로운 콘텐츠 추가 버튼을 표시한다
2. WHEN 사용자가 여러 콘텐츠를 추가했을 때 THEN THE RelatedContentForm SHALL 추가된 모든 콘텐츠를 목록으로 표시한다
3. WHEN 사용자가 추가된 콘텐츠 목록에서 특정 항목을 삭제하려 할 때 THEN THE RelatedContentForm SHALL 해당 항목만 삭제하고 나머지는 유지한다
4. THE RelatedContentForm SHALL 추가된 콘텐츠 개수를 표시한다

### Requirement 2: 콘텐츠 순서 관리

**User Story:** As a 사용자, I want 추가한 관련 콘텐츠의 순서를 변경할 수 있기를, so that 가장 중요한 작품을 먼저 표시할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 콘텐츠 목록에서 드래그 앤 드롭을 수행할 때 THEN THE RelatedContentForm SHALL 콘텐츠의 순서를 변경한다
2. WHEN 콘텐츠 순서가 변경되었을 때 THEN THE RelatedContentForm SHALL 변경된 순서를 즉시 반영하여 표시한다
3. THE RelatedContentForm SHALL 각 콘텐츠 항목에 순서 변경을 위한 드래그 핸들을 표시한다

### Requirement 3: 스팟 상세 페이지 다중 콘텐츠 표시

**User Story:** As a 사용자, I want 스팟 상세 페이지에서 연결된 모든 작품을 볼 수 있기를, so that 해당 장소와 관련된 모든 콘텐츠를 확인할 수 있습니다.

#### Acceptance Criteria

1. WHEN 스팟에 여러 relatedContent가 있을 때 THEN THE SpotDetailPage SHALL 모든 관련 콘텐츠를 그리드 형태로 표시한다
2. WHEN 관련 콘텐츠가 4개 이상일 때 THEN THE SpotDetailPage SHALL 처음 3개만 표시하고 "더보기" 버튼을 제공한다
3. WHEN 사용자가 "더보기" 버튼을 클릭할 때 THEN THE SpotDetailPage SHALL 나머지 모든 콘텐츠를 표시한다
4. THE SpotDetailPage SHALL 각 콘텐츠의 타입 아이콘, 이름, 연도, 추가정보를 표시한다

### Requirement 4: 콘텐츠 중복 방지

**User Story:** As a 사용자, I want 동일한 작품을 중복으로 추가하지 않도록 안내받기를, so that 데이터의 일관성을 유지할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 이미 추가된 콘텐츠와 동일한 이름의 콘텐츠를 추가하려 할 때 THEN THE RelatedContentForm SHALL 중복 경고 메시지를 표시한다
2. WHEN 중복 경고가 표시될 때 THEN THE RelatedContentForm SHALL 사용자가 그래도 추가할 수 있는 옵션을 제공한다
3. THE RelatedContentForm SHALL 콘텐츠 이름 비교 시 대소문자를 무시하고 앞뒤 공백을 제거하여 비교한다

### Requirement 5: 스팟 수정 시 기존 콘텐츠 유지

**User Story:** As a 사용자, I want 스팟 수정 시 기존에 등록된 관련 콘텐츠가 유지되기를, so that 실수로 데이터를 잃지 않습니다.

#### Acceptance Criteria

1. WHEN 스팟 수정 페이지가 로드될 때 THEN THE SpotForm SHALL 기존에 등록된 모든 relatedContent를 표시한다
2. WHEN 사용자가 기존 콘텐츠를 수정하지 않고 저장할 때 THEN THE SpotForm SHALL 기존 콘텐츠를 그대로 유지한다
3. WHEN 사용자가 새 콘텐츠를 추가하고 저장할 때 THEN THE SpotForm SHALL 기존 콘텐츠와 새 콘텐츠를 모두 저장한다

### Requirement 6: 빈 콘텐츠 목록 처리

**User Story:** As a 사용자, I want 관련 콘텐츠가 없는 스팟도 등록할 수 있기를, so that 나중에 콘텐츠를 추가할 수 있습니다.

#### Acceptance Criteria

1. WHEN 사용자가 관련 콘텐츠 없이 스팟을 등록할 때 THEN THE SpotForm SHALL 정상적으로 스팟을 저장한다
2. WHEN 스팟에 관련 콘텐츠가 없을 때 THEN THE SpotDetailPage SHALL "관련 콘텐츠" 섹션을 표시하지 않는다
3. WHEN 스팟에 관련 콘텐츠가 없을 때 THEN THE RelatedContentForm SHALL 콘텐츠 추가를 유도하는 안내 메시지를 표시한다
