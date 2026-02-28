# Requirements Document: 덕후 친화적 편의시설 (Otaku-Friendly Facilities)

## Introduction

일반적인 편의시설 정보(식당, 편의점, 카페, 역)를 넘어, 성지순례 유저(오타쿠)의 실질적 페인포인트를 해결하는 특화 편의시설 정보를 제공합니다. 기존 편의시설 시스템(`FacilityType`: restaurant, convenience_store, cafe, station, other)을 확장하여 코인 로커, 혼밥 친화 식당, 충전/와이파이 카페, 개방 화장실, 굿즈/잡화점 등 덕후 특화 카테고리를 추가합니다.

## Glossary

- **Facility_System**: 스팟 주변 편의시설 정보를 관리하고 표시하는 시스템
- **Otaku_Category**: 덕후 특화 편의시설 카테고리 (coin_locker, solo_dining, charging_cafe, public_restroom, goods_shop)
- **Legacy_Category**: 기존 편의시설 카테고리 (restaurant, convenience_store, cafe, station, other)
- **Coin_Locker (코인 로커)**: 역이나 상업시설에 설치된 유료 짐 보관함
- **Solo_Dining (혼밥 친화 식당)**: 1인 식사에 적합한 구조(카운터석, 1인 메뉴 등)를 갖춘 식당
- **Charging_Cafe (충전/와이파이 카페)**: 콘센트(충전)와 무료 와이파이를 제공하는 카페 또는 공간
- **Public_Restroom (개방 화장실)**: 누구나 이용 가능한 공중 화장실 또는 상업시설 내 개방 화장실
- **Goods_Shop (굿즈/잡화점)**: 서브컬처 매장(애니메이트, 만다라케 등) 및 대형 잡화점(돈키호테 등)
- **Spot_Detail_Page**: 개별 스팟의 상세 정보를 표시하는 페이지
- **Facility_Filter**: 편의시설 카테고리를 선택하여 표시를 제어하는 UI 컴포넌트
- **Facility_Card**: 개별 편의시설의 정보를 표시하는 UI 컴포넌트
- **Facility_Report_Form**: 유저가 새로운 편의시설 정보를 제보하는 입력 폼
- **Micro_Vote**: 편의시설 상세 정보의 정확성을 유저 투표로 검증하는 간단한 예/아니오 UI
- **Verification_Score**: Micro_Vote 결과를 기반으로 산출되는 편의시설 정보의 신뢰도 점수 (upvotes, downvotes로 계산)
- **Facility_Status**: 편의시설의 현재 상태 (active: 정상 표시, needs_verification: 확인 필요, hidden: 숨김)

## Requirements

### Requirement 1: 덕후 특화 편의시설 카테고리 확장

**User Story:** As a 성지순례 유저, I want 덕후에게 필요한 편의시설 카테고리로 분류된 정보를 볼 수 있기를, so that 순례 중 필요한 시설을 빠르게 찾을 수 있습니다.

#### Acceptance Criteria

1. THE Facility_System SHALL 기존 Legacy_Category(restaurant, convenience_store, cafe, station, other)에 추가로 Otaku_Category(coin_locker, solo_dining, charging_cafe, public_restroom, goods_shop) 5개 카테고리를 지원한다
2. THE Facility_System SHALL 각 Otaku_Category에 대해 고유한 아이콘과 라벨을 표시한다
3. WHEN 유저가 Spot_Detail_Page를 조회할 때, THE Facility_System SHALL 해당 스팟 반경 내의 편의시설을 Legacy_Category와 Otaku_Category 모두 포함하여 목록으로 표시한다
4. WHEN 유저가 Facility_Filter에서 특정 카테고리를 선택할 때, THE Facility_System SHALL 선택된 카테고리에 해당하는 편의시설만 목록에 표시한다
5. WHEN 유저가 Facility_Filter에서 카테고리 선택을 해제할 때, THE Facility_System SHALL 모든 카테고리의 편의시설을 다시 표시한다

### Requirement 2: 코인 로커 상세 정보

**User Story:** As a 짐이 많은 순례 유저, I want 근처 코인 로커의 위치와 크기/가격 정보를 확인할 수 있기를, so that 무거운 짐(굿즈, 캐리어 등)을 보관하고 가볍게 순례할 수 있습니다.

#### Acceptance Criteria

1. THE Facility_Card SHALL coin_locker 타입 편의시설에 대해 위치, 크기 정보(소형/중형/대형), 가격 정보를 표시한다
2. THE Facility_Card SHALL coin_locker 타입 편의시설에 대해 이용 가능 시간을 표시한다
3. THE Facility_Card SHALL coin_locker 타입 편의시설에 대해 대형 로커(캐리어 보관 가능) 유무를 명시한다
4. IF coin_locker 편의시설의 크기 또는 가격 정보가 등록되지 않은 경우, THEN THE Facility_Card SHALL "정보 미등록" 텍스트를 해당 필드에 표시한다

### Requirement 3: 혼밥 친화 식당 정보

**User Story:** As a 혼자 순례하는 유저, I want 혼밥하기 편한 식당을 구분하여 찾을 수 있기를, so that 눈치 보지 않고 편하게 식사할 수 있습니다.

#### Acceptance Criteria

1. THE Facility_Card SHALL solo_dining 타입 편의시설에 대해 "1인 OK" 태그를 표시한다
2. THE Facility_Card SHALL solo_dining 타입 편의시설에 대해 카운터석 유무와 1인 메뉴 유무 정보를 표시한다
3. IF solo_dining 편의시설의 카운터석 또는 1인 메뉴 정보가 등록되지 않은 경우, THEN THE Facility_Card SHALL "정보 미등록" 텍스트를 해당 필드에 표시한다
4. THE Facility_Card SHALL solo_dining 타입 편의시설에 대해 빠른 식사 가능 여부(패스트푸드/규동 체인점 등)와 심야 영업 여부를 필터링할 수 있는 정보를 표시한다

### Requirement 4: 덕후 쇼핑 및 잡화점 정보

**User Story:** As a 유저, I want 성지 근처의 서브컬처 매장과 잡화점 위치를 확인할 수 있기를, so that 순례 중 필요한 물품이나 기념품을 구매할 수 있습니다.

#### Acceptance Criteria

1. THE Facility_Card SHALL goods_shop 타입 편의시설에 대해 주요 서브컬처 매장(애니메이트, 만다라케 등)의 매장명과 위치를 표시한다
2. THE Facility_Card SHALL goods_shop 타입 편의시설에 대해 여행 중 필요한 물품이나 가벼운 기념품을 살 수 있는 대형 잡화점(예: 돈키호테)의 위치를 표시한다
3. THE Facility_Card SHALL goods_shop 타입 편의시설에 대해 영업시간 정보를 표시한다

### Requirement 5: 편의시설 제보 기능

**User Story:** As a 유저, I want 내가 발견한 덕후 특화 편의시설을 제보할 수 있기를, so that 다른 순례 유저들에게 도움이 될 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 Spot_Detail_Page에서 "편의시설 제보" 버튼을 클릭할 때, THE Facility_System SHALL Facility_Report_Form을 표시한다
2. THE Facility_Report_Form SHALL 편의시설 이름, 카테고리(Legacy_Category 또는 Otaku_Category 중 택 1), 위치(지도 핀 또는 주소 입력), 상세 정보 입력 필드를 제공한다
3. WHEN 유저가 Facility_Report_Form에서 coin_locker 카테고리를 선택할 때, THE Facility_Report_Form SHALL 크기, 가격, 이용 시간 입력 필드를 추가로 표시한다
4. WHEN 유저가 Facility_Report_Form에서 solo_dining 카테고리를 선택할 때, THE Facility_Report_Form SHALL 카운터석 유무, 1인 메뉴 유무, 빠른 식사 가능 여부, 심야 영업 여부 입력 필드를 추가로 표시한다
5. WHEN 유저가 Facility_Report_Form에서 goods_shop 카테고리를 선택할 때, THE Facility_Report_Form SHALL 매장 유형(서브컬처 매장/대형 잡화점), 영업시간 입력 필드를 추가로 표시한다
6. WHEN 유저가 Facility_Report_Form에서 charging_cafe 카테고리를 선택할 때, THE Facility_Report_Form SHALL 충전 콘센트 유무, 무료 와이파이 유무 입력 필드를 추가로 표시한다
7. WHEN 유저가 Facility_Report_Form에서 public_restroom 카테고리를 선택할 때, THE Facility_Report_Form SHALL 장애인 접근 가능 여부, 24시간 이용 가능 여부 입력 필드를 추가로 표시한다
8. WHEN 유저가 필수 필드(이름, 카테고리, 위치)를 모두 입력하고 제출 버튼을 클릭할 때, THE Facility_System SHALL 제보 데이터를 저장하고 성공 메시지를 표시한다
9. IF 유저가 필수 필드를 입력하지 않고 제출 버튼을 클릭한 경우, THEN THE Facility_Report_Form SHALL 미입력 필드에 대한 오류 메시지를 표시한다
10. THE Facility_System SHALL 편의시설 상세 정보에 Micro_Vote UI를 제공하여(예: "여기에 콘센트가 있나요? 예/아니오") 유저 투표로 데이터를 지속적으로 검증 및 갱신한다
11. WHEN 특정 편의시설의 downvotes가 upvotes보다 일정 기준(예: 5개) 이상 많아지거나 Verification_Score가 임계치 이하로 떨어질 경우, THEN THE Facility_System SHALL 해당 편의시설을 '확인 필요' 상태로 변경하고 지도 기본 표시 대상에서 제외(숨김)한다

### Requirement 6: 편의시설 데이터 모델 확장

**User Story:** As a 개발자, I want 덕후 특화 편의시설의 상세 정보를 저장할 수 있는 데이터 구조를 갖추기를, so that 카테고리별 특화 정보를 관리할 수 있습니다.

#### Acceptance Criteria

1. THE Facility_System SHALL 기존 NearbyFacility 인터페이스를 확장하여 Otaku_Category 타입을 FacilityType에 추가한다
2. THE Facility_System SHALL coin_locker 타입에 대해 sizes(크기 목록), prices(가격 정보), operatingHours(이용 시간), hasLargeLocker(대형 로커 유무) 필드를 저장한다
3. THE Facility_System SHALL solo_dining 타입에 대해 hasCounterSeat(카운터석 유무), hasSoloMenu(1인 메뉴 유무), isQuickMeal(빠른 식사 가능 여부), isLateNight(심야 영업 여부) 필드를 저장한다
4. THE Facility_System SHALL charging_cafe 타입에 대해 hasCharging(충전 콘센트 유무), hasWifi(무료 와이파이 유무) 필드를 저장한다
5. THE Facility_System SHALL public_restroom 타입에 대해 isAccessible(장애인 접근 가능 여부), is24Hours(24시간 이용 가능 여부) 필드를 저장한다
6. THE Facility_System SHALL goods_shop 타입에 대해 subtype(매장 유형: subculture_shop 또는 general_store), operatingHours(영업시간) 필드를 저장한다
7. THE Facility_System SHALL 기존 Legacy_Category 편의시설 데이터와 하위 호환성을 유지한다
8. THE Facility_System SHALL 모든 편의시설 데이터에 verificationScore(투표 기반 신뢰도 점수), upvotes(긍정 투표 수), downvotes(부정 투표 수) 필드를 저장하여 Micro_Vote를 통한 정보 신뢰성을 관리한다
9. THE Facility_System SHALL 모든 편의시설 데이터에 status(상태: active, needs_verification, hidden) 필드를 포함하여, Verification_Score에 따른 지도 표시 여부를 제어한다
10. THE Facility_System SHALL 기존 외부 지도 서비스(구글맵 등)의 장소와 매핑할 수 있도록 선택적 필드인 googlePlaceId를 제공하여, 중복 장소 생성을 방지하고 기본 정보(주소, 영업시간 등)를 동기화할 수 있는 기반을 마련한다

### Requirement 7: 편의시설 API 확장

**User Story:** As a 개발자, I want 덕후 특화 편의시설을 조회하고 등록할 수 있는 API를 갖추기를, so that 클라이언트에서 편의시설 데이터를 활용할 수 있습니다.

#### Acceptance Criteria

1. WHEN GET /api/spots/[id]/facilities 요청에 type 쿼리 파라미터가 포함된 경우, THE Facility_System SHALL 해당 카테고리이면서 Facility_Status가 'active' 또는 'needs_verification'인 편의시설만 필터링하여 반환한다
2. WHEN GET /api/spots/[id]/facilities 요청에 type 쿼리 파라미터가 없는 경우, THE Facility_System SHALL Facility_Status가 'hidden'인 시설을 제외한 모든 카테고리(Legacy_Category + Otaku_Category)의 편의시설을 반환한다
3. WHEN POST /api/facilities/report 요청에 유효한 제보 데이터가 포함된 경우, THE Facility_System SHALL 편의시설 데이터를 저장하고 201 상태 코드를 반환한다
4. IF POST /api/facilities/report 요청에 필수 필드(name, type, coordinates)가 누락된 경우, THEN THE Facility_System SHALL 400 상태 코드와 누락 필드 목록을 반환한다
5. THE Facility_System SHALL 편의시설 조회 응답에 카테고리별 상세 정보(coin_locker의 크기/가격, solo_dining의 카운터석 유무, charging_cafe의 충전/와이파이 유무, public_restroom의 접근성/24시간 여부, goods_shop의 매장 유형 등)를 포함한다
6. WHEN POST /api/facilities/[id]/vote 요청에 투표 데이터(예/아니오 및 평가 항목)가 포함된 경우, THE Facility_System SHALL 투표 결과를 반영하고 업데이트된 verificationScore를 반환한다
7. IF POST /api/facilities/[id]/vote 요청에 평가 항목 또는 투표 값이 누락된 경우, THEN THE Facility_System SHALL 400 상태 코드와 오류 메시지를 반환한다
8. WHEN 동일한 유저가 이미 투표한 항목에 대해 POST /api/facilities/[id]/vote 요청을 다시 보낼 경우, THE Facility_System SHALL 기존 투표 결과를 새로운 값으로 업데이트하되 중복 누적시키지 않는다