# Requirements Document

## Introduction

현재 스팟(Spot)의 관련 작품 정보는 `relatedContent[]` 배열로 스팟 문서에 직접 내장(embedded)되어 있다. 이 구조는 한 스팟에 여러 작품이 연결될 때 우선순위, 관계 유형, 신뢰도, 기간성 등을 표현할 수 없어 데이터 품질과 UI 확장성에 한계가 있다.

이 기능은 `docs/spot-content-relation-architecture.md`에 정의된 아키텍처를 기반으로, 스팟과 작품 사이의 관계를 독립 엔티티(`SpotContentRelation`)로 승격시키는 Phase 1 마이그레이션을 수행한다. 기존 `relatedContent[]` 데이터를 새 컬렉션으로 이관하고, 읽기 경로를 전환하며, 스팟 상세 UI를 대표 관계 중심으로 재구성한다.

## Glossary

- **Spot**: 현실 세계의 고유한 장소를 나타내는 엔티티. MongoDB `spots` 컬렉션에 저장된다.
- **Content**: 작품 또는 IP 단위(애니메이션, 영화, 드라마, 게임, 아티스트, 스포츠팀 등)를 나타내는 개념. 현재는 독립 컬렉션 없이 `RelatedContent` 인터페이스로 표현된다.
- **SpotContentRelation**: Spot과 Content 사이의 연결 정보를 표현하는 독립 엔티티. MongoDB `spot_content_relations` 컬렉션에 저장된다.
- **RelationEvidence**: SpotContentRelation을 뒷받침하는 구체적 증거(장면 캡처, 공식 링크, 이벤트 정보 등). 향후 확장 대상이며 Phase 1에서는 기본 필드만 포함한다.
- **Relation_Type**: 관계의 유형을 구분하는 열거값. `scene_depicted`, `inspired_by`, `filming_location`, `collaboration_event`, `merchandise_spot`, `fan_inferred`, `promotional_reference` 중 하나.
- **Confidence_Level**: 관계의 신뢰도를 나타내는 열거값. `high`, `medium`, `low` 중 하나.
- **Officialness**: 관계의 공식성을 나타내는 열거값. `official`, `community_verified`, `user_submitted`, `unverified` 중 하나.
- **Relation_Status**: 관계의 현재 유효 상태를 나타내는 열거값. `active`, `expired`, `scheduled`, `archived` 중 하나.
- **Display_Priority**: 관계의 UI 표시 우선순위를 나타내는 숫자값. 낮을수록 먼저 표시된다.
- **Migration_Script**: 기존 `relatedContent[]` 데이터를 `spot_content_relations` 컬렉션으로 이관하는 일회성 스크립트.
- **Spot_Detail_API**: `GET /api/spots/[id]` 엔드포인트. 스팟 상세 정보를 반환한다.
- **Relations_API**: `GET /api/spots/[id]/relations` 엔드포인트. 특정 스팟의 SpotContentRelation 목록을 반환한다.
- **Same_Content_Spots_Component**: 같은 작품의 다른 스팟을 표시하는 `SameContentSpots` 컴포넌트.
- **Related_Routes_Component**: 관련 순례 코스를 표시하는 `RelatedRoutes` 컴포넌트.
- **Share_Utils**: 스팟 공유 텍스트를 생성하는 `formatSpotShareText` 유틸리티.

## Requirements

### Requirement 1: SpotContentRelation 데이터 모델 정의

**User Story:** As a 개발자, I want SpotContentRelation 엔티티를 독립 MongoDB 컬렉션으로 정의하고 싶다, so that 스팟과 작품의 관계를 유형, 신뢰도, 우선순위와 함께 구조적으로 저장할 수 있다.

#### Acceptance Criteria

1. THE SpotContentRelation 모델 SHALL 다음 필수 필드를 포함한다: `id`, `spotId`, `contentId`, `contentName`, `contentType`, `relationType`, `confidenceLevel`, `officialness`, `displayPriority`, `status`, `createdAt`, `updatedAt`.
2. THE SpotContentRelation 모델 SHALL 다음 선택 필드를 포함한다: `summary`, `startDate`, `endDate`, `sourceCount`, `verificationScore`, `createdBy`, `updatedBy`.
3. THE SpotContentRelation 모델 SHALL `contentName`과 `contentType` 필드에 기존 `RelatedContent` 인터페이스의 `name`과 `type` 값을 저장한다.
4. WHEN `relationType` 값이 설정될 때, THE SpotContentRelation 모델 SHALL `scene_depicted`, `inspired_by`, `filming_location`, `collaboration_event`, `merchandise_spot`, `fan_inferred`, `promotional_reference` 중 하나만 허용한다.
5. WHEN `confidenceLevel` 값이 설정될 때, THE SpotContentRelation 모델 SHALL `high`, `medium`, `low` 중 하나만 허용한다.
6. WHEN `officialness` 값이 설정될 때, THE SpotContentRelation 모델 SHALL `official`, `community_verified`, `user_submitted`, `unverified` 중 하나만 허용한다.
7. WHEN `status` 값이 설정될 때, THE SpotContentRelation 모델 SHALL `active`, `expired`, `scheduled`, `archived` 중 하나만 허용한다.
8. THE SpotContentRelation TypeScript 인터페이스 SHALL `src/types/spot.ts` 파일에 정의된다.

### Requirement 2: MongoDB 컬렉션 및 인덱스 설정

**User Story:** As a 개발자, I want `spot_content_relations` 컬렉션에 적절한 인덱스를 설정하고 싶다, so that 스팟별 관계 조회와 작품별 스팟 조회가 효율적으로 수행된다.

#### Acceptance Criteria

1. THE Database 초기화 로직 SHALL `spot_content_relations` 컬렉션을 생성한다.
2. THE Database 초기화 로직 SHALL `spotId` 필드에 단일 인덱스를 생성한다.
3. THE Database 초기화 로직 SHALL `contentName` 필드에 단일 인덱스를 생성한다.
4. THE Database 초기화 로직 SHALL `spotId`와 `contentName` 조합에 복합 유니크 인덱스를 생성하여 동일 스팟-작품 관계의 중복을 방지한다.
5. THE Database 초기화 로직 SHALL `status` 필드에 단일 인덱스를 생성한다.

### Requirement 3: 데이터 마이그레이션 스크립트

**User Story:** As a 개발자, I want 기존 `relatedContent[]` 데이터를 `spot_content_relations` 컬렉션으로 이관하는 스크립트를 실행하고 싶다, so that 기존 데이터가 새 구조로 안전하게 전환된다.

#### Acceptance Criteria

1. WHEN Migration_Script가 실행될 때, THE Migration_Script SHALL 모든 스팟의 `relatedContent[]` 배열 항목을 개별 SpotContentRelation 문서로 변환한다.
2. WHEN Migration_Script가 `relatedContent` 항목을 변환할 때, THE Migration_Script SHALL `contentId`를 `{spotId}_{contentName의 정규화된 값}` 형식으로 생성한다.
3. WHEN Migration_Script가 `relatedContent` 항목을 변환할 때, THE Migration_Script SHALL 기본값으로 `relationType`을 `scene_depicted`, `confidenceLevel`을 `medium`, `officialness`를 `user_submitted`, `status`를 `active`, `displayPriority`를 배열 인덱스 기반으로 설정한다.
4. WHEN Migration_Script가 기존 `relatedContent` 항목의 `year`와 `additionalInfo` 필드를 발견할 때, THE Migration_Script SHALL 해당 값을 SpotContentRelation의 `summary` 필드에 포함한다.
5. WHEN Migration_Script가 기존 `relatedContent` 항목의 `imageUrl` 필드를 발견할 때, THE Migration_Script SHALL 해당 값을 SpotContentRelation의 `contentImageUrl` 필드에 저장한다.
6. IF Migration_Script 실행 중 동일 `spotId`와 `contentName` 조합이 이미 존재하면, THEN THE Migration_Script SHALL 해당 항목을 건너뛰고 로그에 기록한다.
7. WHEN Migration_Script가 완료될 때, THE Migration_Script SHALL 처리된 스팟 수, 생성된 관계 수, 건너뛴 중복 수를 콘솔에 출력한다.
8. THE Migration_Script SHALL `scripts/migrate-relations.ts` 경로에 위치한다.

### Requirement 4: Relations API 엔드포인트

**User Story:** As a 프론트엔드 개발자, I want 스팟별 관계 목록을 조회하는 API를 사용하고 싶다, so that 스팟 상세 페이지에서 관계 데이터를 표시할 수 있다.

#### Acceptance Criteria

1. WHEN `GET /api/spots/[id]/relations` 요청이 수신될 때, THE Relations_API SHALL 해당 스팟의 모든 `active` 상태 SpotContentRelation 문서를 반환한다.
2. THE Relations_API SHALL 반환 결과를 `displayPriority` 오름차순으로 정렬한다.
3. WHEN 해당 스팟에 관계가 없을 때, THE Relations_API SHALL 빈 배열 `{ relations: [], total: 0 }`을 반환한다.
4. IF 존재하지 않는 스팟 ID로 요청이 수신되면, THEN THE Relations_API SHALL HTTP 404 상태 코드와 에러 메시지를 반환한다.
5. IF 서버 내부 오류가 발생하면, THEN THE Relations_API SHALL HTTP 500 상태 코드와 에러 메시지를 반환한다.

### Requirement 5: 스팟 상세 API 응답 확장

**User Story:** As a 프론트엔드 개발자, I want 스팟 상세 API 응답에 관계 요약 정보가 포함되기를 원한다, so that 추가 API 호출 없이 기본 관계 정보를 표시할 수 있다.

#### Acceptance Criteria

1. WHEN Spot_Detail_API가 스팟 상세를 반환할 때, THE Spot_Detail_API SHALL 기존 `relatedContent` 필드를 유지하면서 `relations` 필드를 추가로 포함한다.
2. THE Spot_Detail_API SHALL `relations` 필드에 해당 스팟의 `active` 상태 SpotContentRelation 목록을 `displayPriority` 오름차순으로 포함한다.
3. WHILE 마이그레이션 과도기 동안, THE Spot_Detail_API SHALL `relatedContent` 필드와 `relations` 필드를 모두 반환하여 하위 호환성을 유지한다.

### Requirement 6: 같은 작품 스팟 조회 전환

**User Story:** As a 사용자, I want 같은 작품의 다른 스팟을 정확하게 조회하고 싶다, so that 한 스팟에 여러 작품이 연결되어 있어도 각 작품별로 올바른 스팟 목록을 볼 수 있다.

#### Acceptance Criteria

1. WHEN Same_Content_Spots_Component가 렌더링될 때, THE Same_Content_Spots_Component SHALL `spot_content_relations` 컬렉션을 기반으로 같은 `contentName`을 가진 다른 스팟을 조회한다.
2. WHEN 스팟에 여러 작품이 연결되어 있을 때, THE Same_Content_Spots_Component SHALL 첫 번째 작품이 아닌 대표 관계(`displayPriority`가 가장 낮은 관계)의 작품을 기준으로 조회한다.
3. THE Same_Content_Spots_Component SHALL 현재 스팟을 결과에서 제외한다.
4. WHEN `GET /api/spots/relations/by-content` 요청에 `contentName` 파라미터가 전달될 때, THE Relations_API SHALL 해당 작품과 연결된 모든 `active` 상태의 스팟 ID 목록을 반환한다.

### Requirement 7: 관련 순례 코스 및 공유 텍스트 전환

**User Story:** As a 사용자, I want 관련 순례 코스와 공유 텍스트가 새 관계 구조를 기반으로 정확하게 동작하기를 원한다, so that 여러 작품이 연결된 스팟에서도 올바른 정보가 표시된다.

#### Acceptance Criteria

1. WHEN Related_Routes_Component가 렌더링될 때, THE Related_Routes_Component SHALL `relations` 데이터에서 `contentName` 목록을 추출하여 관련 코스를 조회한다.
2. WHEN Share_Utils가 공유 텍스트를 생성할 때, THE Share_Utils SHALL `relations` 데이터에서 대표 관계(`displayPriority`가 가장 낮은 관계)의 `contentName`을 사용한다.
3. WHILE 마이그레이션 과도기 동안, THE Related_Routes_Component SHALL `relations` 데이터가 없으면 기존 `relatedContent` 데이터로 폴백한다.
4. WHILE 마이그레이션 과도기 동안, THE Share_Utils SHALL `relations` 데이터가 없으면 기존 `relatedContent` 데이터로 폴백한다.

### Requirement 8: 스팟 상세 UI 관계 표시 재구성

**User Story:** As a 사용자, I want 스팟 상세 페이지에서 관련 작품을 대표 관계 중심으로 보고 싶다, so that 작품이 많은 스팟에서도 핵심 정보를 빠르게 파악할 수 있다.

#### Acceptance Criteria

1. WHEN 스팟 상세 페이지가 렌더링될 때, THE RelatedContentSection SHALL 대표 관계 최대 3개를 상단에 카드 형태로 먼저 표시한다.
2. WHEN 관계가 4개 이상일 때, THE RelatedContentSection SHALL "더보기 (+N)" 버튼을 표시하고, 클릭 시 나머지 관계를 펼쳐 표시한다.
3. THE RelatedContentSection SHALL 각 관계 카드에 작품명, 작품 타입, 관계 유형 라벨을 표시한다.
4. WHEN 관계에 `summary` 정보가 있을 때, THE RelatedContentSection SHALL 해당 요약을 카드에 표시한다.
5. THE RelatedContentSection SHALL 관계 유형별 한글 라벨을 표시한다 (`scene_depicted`: "장면 등장", `inspired_by`: "모티프", `filming_location`: "촬영지", `collaboration_event`: "콜라보 이벤트", `merchandise_spot`: "굿즈/전시", `fan_inferred`: "팬 추정 성지", `promotional_reference`: "홍보 등장").
6. WHEN 관계 목록이 비어있을 때, THE RelatedContentSection SHALL 섹션을 숨긴다.
7. THE RelatedContentSection SHALL 각 관계 카드에 "작품별 스팟 보기" 링크를 포함한다.

### Requirement 9: 검색 필터 호환성 유지

**User Story:** As a 사용자, I want 작품명으로 스팟을 검색할 때 기존과 동일하게 결과를 얻고 싶다, so that 데이터 구조 변경이 검색 경험에 영향을 주지 않는다.

#### Acceptance Criteria

1. WHEN 검색어가 입력될 때, THE Spots_API SHALL `spot_content_relations` 컬렉션에서 `contentName`이 검색어와 부분 일치하는 `spotId` 목록을 조회한 후 해당 스팟을 반환한다.
2. WHILE 마이그레이션 과도기 동안, THE Spots_API SHALL `spot_content_relations` 조회 결과와 기존 `relatedContent.name` 조회 결과를 합산(union)하여 반환한다.
3. THE Spots_API SHALL 검색 결과에서 중복 스팟을 제거한다.

### Requirement 10: 스팟 등록/수정 시 관계 동기화

**User Story:** As a 사용자, I want 스팟을 등록하거나 수정할 때 관련 작품 정보가 새 관계 구조에도 반영되기를 원한다, so that 새로 등록되는 데이터도 일관된 구조로 저장된다.

#### Acceptance Criteria

1. WHEN 새 스팟이 등록될 때, THE Spots_API SHALL `relatedContent` 배열의 각 항목을 `spot_content_relations` 컬렉션에도 SpotContentRelation 문서로 생성한다.
2. WHEN 스팟이 수정되어 `relatedContent`가 변경될 때, THE Spots_API SHALL 해당 스팟의 기존 SpotContentRelation 문서를 삭제하고 새 `relatedContent` 기반으로 재생성한다.
3. WHEN 스팟이 삭제될 때, THE Spots_API SHALL 해당 스팟의 모든 SpotContentRelation 문서를 함께 삭제한다.
4. THE Spots_API SHALL 스팟 등록/수정 시 기존 `relatedContent` 필드에도 데이터를 저장하여 하위 호환성을 유지한다.
