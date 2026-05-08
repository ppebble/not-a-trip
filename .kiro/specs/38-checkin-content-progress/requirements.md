# Requirements Document

## Introduction

체크인 시 유저의 작품별 진행률(contentProgress)을 계산하여 `user_stats` 컬렉션에 저장하는 기능을 구현한다.
현재 `updateUserStats` 함수에 `contentProgress: []` TODO가 존재하며, 이를 실제 계산 로직으로 대체한다.

진행률은 `spot_content_relations` 컬렉션의 `contentName` 기준으로 해당 작품에 연결된 총 스팟 수와 유저가 인증한 스팟 수를 비교하여 산출한다. 계산된 진행률은 프로필 페이지의 "진행 현황" 탭에 표시된다.

## Glossary

- **ContentProgress**: 특정 작품에 대한 유저의 진행률 데이터 (`contentName`, `totalSpots`, `checkedSpots`, `progress` 필드 포함)
- **UserStats**: 유저 통계 문서 (`user_stats` 컬렉션에 저장, `contentProgress` 배열 포함)
- **SpotContentRelation**: `spot_content_relations` 컬렉션의 문서. 스팟과 작품의 연결 정보를 담으며 `contentName`, `spotId`, `status` 필드를 포함
- **ContentName**: 작품명 문자열. `spot_content_relations.contentName` 기준으로 집계
- **ProgressCalculator**: `updateUserStats` 내부에서 `contentProgress`를 계산하는 로직 단위
- **ProgressAPI**: `GET /api/users/[id]/progress` 엔드포인트

## Requirements

### Requirement 1: contentProgress 계산 로직 구현

**User Story:** As a 서비스 운영자, I want 체크인 발생 시 유저의 작품별 진행률이 자동으로 계산되어 저장되기를, so that 프로필 페이지에서 실시간 진행 현황을 확인할 수 있다.

#### Acceptance Criteria

1. WHEN 체크인이 생성될 때, THE ProgressCalculator SHALL `spot_content_relations` 컬렉션에서 `status: 'active'`인 문서를 `contentName` 기준으로 집계하여 작품별 총 스팟 수를 산출한다
2. WHEN 체크인이 생성될 때, THE ProgressCalculator SHALL 해당 유저의 `checkins` 컬렉션에서 `migrationStatus: { $ne: 'unresolved' }`인 문서를 `contentName` 기준으로 집계하여 작품별 인증 스팟 수를 산출한다
3. WHEN 진행률을 계산할 때, THE ProgressCalculator SHALL `Math.round((checkedSpots / totalSpots) * 100)` 공식으로 0~100 범위의 정수 진행률을 계산한다
4. WHEN 진행률이 계산될 때, THE ProgressCalculator SHALL 진행률이 0인 작품(인증 스팟 수가 0인 경우)을 `contentProgress` 배열에서 제외한다
5. WHEN `updateUserStats`가 실행될 때, THE ProgressCalculator SHALL 계산된 `ContentProgress[]`를 `user_stats` 컬렉션의 `contentProgress` 필드에 저장한다
6. WHEN 동일 스팟에 여러 번 체크인이 존재할 때, THE ProgressCalculator SHALL 해당 스팟을 중복 없이 1회로 계산한다 (distinct spotId 기준)

### Requirement 2: spot_content_relations 기반 총 스팟 수 집계

**User Story:** As a 개발자, I want 작품별 총 스팟 수가 `spot_content_relations` 컬렉션 기준으로 정확히 집계되기를, so that 진행률 분모가 항상 최신 데이터를 반영한다.

#### Acceptance Criteria

1. THE ProgressCalculator SHALL `spot_content_relations` 컬렉션에서 `status: 'active'`인 문서만 집계 대상으로 포함한다
2. WHEN 동일 `contentName`에 동일 `spotId`가 여러 relation으로 연결된 경우, THE ProgressCalculator SHALL 해당 스팟을 1회로 계산한다 (distinct spotId 기준)
3. IF `spot_content_relations` 컬렉션에 특정 `contentName`의 active relation이 존재하지 않는 경우, THEN THE ProgressCalculator SHALL 해당 작품을 진행률 계산 대상에서 제외한다

### Requirement 3: GET /api/users/[id]/progress API 연동

**User Story:** As a 프론트엔드 개발자, I want `GET /api/users/[id]/progress`가 `spot_content_relations` 기반의 실제 진행률 데이터를 반환하기를, so that 프로필 페이지 "진행 현황" 탭에 정확한 데이터가 표시된다.

#### Acceptance Criteria

1. WHEN `GET /api/users/[id]/progress`가 호출될 때, THE ProgressAPI SHALL `spot_content_relations` 컬렉션 기반으로 진행률을 계산하여 반환한다
2. WHEN 진행률 목록을 반환할 때, THE ProgressAPI SHALL `checkedSpots > 0`인 항목만 포함한다 (0% 작품 제외)
3. WHEN 진행률 목록을 반환할 때, THE ProgressAPI SHALL 진행률 높은 순으로 정렬하여 반환한다
4. THE ProgressAPI SHALL `{ progress: ContentProgress[], total: number }` 형태의 JSON을 반환한다
5. IF 데이터베이스 조회 중 오류가 발생하면, THEN THE ProgressAPI SHALL HTTP 500 상태 코드와 한국어 오류 메시지를 반환한다

### Requirement 4: 기존 progress API 로직 교체

**User Story:** As a 개발자, I want 기존 `GET /api/users/[id]/progress`의 `spots.relatedContent` 기반 로직이 `spot_content_relations` 기반으로 교체되기를, so that 데이터 소스가 단일화되어 일관성이 유지된다.

#### Acceptance Criteria

1. WHEN `GET /api/users/[id]/progress`가 실행될 때, THE ProgressAPI SHALL `spots` 컬렉션의 `relatedContent` 필드 대신 `spot_content_relations` 컬렉션을 데이터 소스로 사용한다
2. THE ProgressAPI SHALL `spot_content_relations`에서 `status: 'active'`인 문서만 집계 대상으로 포함한다
3. WHEN 유저가 인증한 스팟을 집계할 때, THE ProgressAPI SHALL `checkins` 컬렉션에서 `migrationStatus: { $ne: 'unresolved' }`인 문서만 포함한다
