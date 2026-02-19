# Requirements Document: 성지순례 코스/루트 시스템 (Pilgrimage Route)

## Introduction

성지는 보통 흩어져 있어 효율적인 동선 계획이 필요합니다. 유저들이 특정 작품이나 지역의 성지들을 묶어 코스로 만들고 공유할 수 있는 기능입니다. "도쿄 반일 봇치 더 록 코스", "가마쿠라 슬램덩크 1일 코스" 등의 플레이리스트 형태로 제공됩니다.

## Glossary

- **Route (루트/코스)**: 여러 스팟을 순서대로 묶은 순례 동선
- **Estimated Time (예상 소요시간)**: 코스 전체를 돌아보는 데 걸리는 예상 시간
- **Route Creator (코스 제작자)**: 코스를 만든 유저

## Requirements

### Requirement 1: 코스 생성 기능

**User Story:** As a 유저, I want 여러 스팟을 묶어 코스를 만들 수 있기를, so that 효율적인 순례 동선을 계획하고 공유할 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 "코스 만들기" 버튼을 클릭할 때 THEN THE System SHALL 코스 생성 페이지를 표시한다
2. WHEN 유저가 코스를 생성할 때 THEN THE System SHALL 다음 정보를 입력받는다: 코스명, 설명, 예상 소요시간, 난이도, 스팟 목록(순서)
3. WHEN 스팟을 추가할 때 THEN THE System SHALL 지도에서 선택하거나 검색하여 추가할 수 있도록 한다
4. THE System SHALL 스팟 간 이동 수단(도보/전철/버스)과 예상 이동시간을 표시한다
5. THE System SHALL 코스를 공개/비공개로 설정할 수 있도록 한다

### Requirement 2: 코스 조회 및 탐색

**User Story:** As a 유저, I want 다른 유저들이 만든 코스를 탐색할 수 있기를, so that 순례 계획을 쉽게 세울 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 코스 목록 페이지에 접근할 때 THEN THE System SHALL 인기순/최신순/소요시간순으로 코스를 표시한다
2. WHEN 유저가 코스를 필터링할 때 THEN THE System SHALL 작품별, 지역별, 소요시간별 필터를 제공한다
3. WHEN 코스 상세 페이지를 조회할 때 THEN THE System SHALL 지도에 전체 동선을 표시하고 각 스팟 정보를 순서대로 보여준다
4. THE System SHALL 코스 저장(북마크) 기능을 제공한다

### Requirement 3: 코스 따라가기 모드

**User Story:** As a 유저, I want 코스를 따라가며 네비게이션을 받을 수 있기를, so that 현장에서 쉽게 순례할 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 "코스 시작" 버튼을 클릭할 때 THEN THE System SHALL 현재 위치 기반 네비게이션 모드를 시작한다
2. WHEN 유저가 스팟에 도착하면 THEN THE System SHALL 해당 스팟 정보와 인증 버튼을 표시한다
3. THE System SHALL 다음 스팟까지의 거리와 예상 시간을 실시간으로 표시한다
4. THE System SHALL 코스 진행률(완료한 스팟 수/전체 스팟 수)을 표시한다

### Requirement 4: 추천 코스 (큐레이션)

**User Story:** As a 유저, I want 검증된 추천 코스를 볼 수 있기를, so that 믿을 수 있는 동선으로 순례할 수 있습니다.

#### Acceptance Criteria

1. THE System SHALL 관리자가 선정한 "공식 추천 코스"를 별도로 표시한다
2. THE System SHALL 인기 코스(저장 수, 완주 수 기준)를 자동으로 추천한다
3. WHEN 특정 작품 페이지를 조회할 때 THEN THE System SHALL 해당 작품 관련 추천 코스를 표시한다

</content>
