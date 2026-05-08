# Requirements Document

## Introduction

스팟 품질 워크플로 강화 기능은 기존 스팟 제보/보완/상태 신고 시스템을 확장하여, 중복 스팟 방지를 강화하고, 스팟 라이프사이클 상태 관리를 체계화하며, 신고 처리 SLA를 도입하고, 폐업/폐쇄 자동 감지 메커니즘을 추가하는 것을 목표로 한다.

현재 시스템에는 50m 이내 좌표 근접 감지(`useNearbyCheck`), 성지 제보(`SpotReport`), 정보 보완(`SpotSupplement`), 상태 신고(`SpotStatusReport`)가 구현되어 있으며, 이 기능은 해당 시스템들의 품질과 운영 효율을 높이는 데 집중한다.

## Glossary

- **Spot_Quality_System**: 스팟 등록, 상태 관리, 신고 처리, 보완 요청을 총괄하는 시스템
- **Duplicate_Detector**: 좌표 근접도와 이름 유사도를 결합하여 중복 스팟을 감지하는 모듈
- **Spot_Lifecycle_Manager**: 스팟의 상태 전이(draft → pending → approved → archived/closed)를 관리하는 모듈
- **Report_Processor**: 사용자 신고를 접수하고 관리자 처리까지의 SLA를 추적하는 모듈
- **Supplement_Manager**: 스팟 정보 보완 요청을 관리하고 기여자에게 알림을 보내는 모듈
- **Closure_Detector**: 폐업/폐쇄 상태를 사용자 제보 누적 또는 외부 데이터를 통해 감지하는 모듈
- **SLA**: Service Level Agreement, 신고 접수 후 관리자가 처리해야 하는 기한
- **Similarity_Score**: 두 스팟 이름 간의 유사도를 0~1 사이 값으로 나타낸 점수
- **Proximity_Radius**: 중복 감지를 위한 좌표 근접 반경 (기본 50m, 확장 200m)

## Requirements

### Requirement 1: 중복 스팟 감지 강화

**User Story:** As a 스팟 등록자, I want 등록하려는 스팟이 이미 존재하는지 좌표와 이름 유사도로 정확하게 감지받고 싶다, so that 불필요한 중복 스팟 등록을 방지할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 스팟 등록 폼에서 좌표를 선택하면, THE Duplicate_Detector SHALL 반경 200m 이내의 기존 승인된 스팟과 대기 중인 제보를 조회하여 목록으로 반환한다
2. WHEN 반경 200m 이내에 기존 스팟이 존재하고 입력된 이름과의 Similarity_Score가 0.7 이상이면, THE Duplicate_Detector SHALL 해당 스팟을 "높은 중복 가능성" 경고로 표시한다
3. WHEN 반경 50m 이내에 기존 스팟이 존재하면, THE Duplicate_Detector SHALL 좌표 거리와 관계없이 해당 스팟을 "근접 스팟" 경고로 표시한다
4. WHEN 중복 가능성이 높은 스팟이 감지되면, THE Spot_Quality_System SHALL 사용자에게 기존 스팟의 정보 보완을 권유하는 안내 메시지를 표시한다
5. IF 사용자가 중복 경고를 무시하고 등록을 진행하면, THEN THE Spot_Quality_System SHALL 해당 제보에 "중복 의심" 플래그를 추가하여 관리자 검토 우선순위를 높인다
6. THE Duplicate_Detector SHALL 이름 유사도 계산 시 한글 자모 분리, 공백 제거, 특수문자 제거를 전처리한 후 Levenshtein 거리 기반 유사도를 산출한다

### Requirement 2: 스팟 라이프사이클 상태 관리

**User Story:** As a 관리자, I want 스팟의 전체 라이프사이클을 체계적으로 관리하고 싶다, so that 스팟 품질을 일관되게 유지할 수 있다.

#### Acceptance Criteria

1. THE Spot_Lifecycle_Manager SHALL 스팟 상태를 draft, pending, approved, archived, closed 중 하나로 관리한다
2. WHEN 사용자가 스팟 제보를 제출하면, THE Spot_Lifecycle_Manager SHALL 해당 제보의 초기 상태를 pending으로 설정한다
3. WHEN 관리자가 제보를 승인하면, THE Spot_Lifecycle_Manager SHALL 스팟 상태를 approved로 전이하고 지도에 표시한다
4. WHEN 관리자가 스팟을 보관 처리하면, THE Spot_Lifecycle_Manager SHALL 스팟 상태를 archived로 전이하고 지도에서 숨기되 데이터는 보존한다
5. WHEN 폐업/폐쇄가 확인되어 스팟을 종료 처리하면, THE Spot_Lifecycle_Manager SHALL 스팟 상태를 closed로 전이하고 지도에서 "폐쇄됨" 표시와 함께 유지한다
6. THE Spot_Lifecycle_Manager SHALL 모든 상태 전이 시 변경 사유, 변경자 ID, 변경 시각을 이력으로 기록한다
7. IF 유효하지 않은 상태 전이가 요청되면, THEN THE Spot_Lifecycle_Manager SHALL 에러 메시지와 함께 허용된 전이 목록을 반환한다

### Requirement 3: 스팟 신고 기능 확장

**User Story:** As a 사용자, I want 부정확한 정보, 폐업/폐쇄, 중복 등 다양한 사유로 스팟을 신고하고 싶다, so that 스팟 정보의 정확성을 유지하는 데 기여할 수 있다.

#### Acceptance Criteria

1. THE Spot_Quality_System SHALL 신고 유형을 inaccurate_info(부정확한 정보), closed_permanently(폐업/폐쇄), duplicate(중복 스팟), inappropriate(부적절한 콘텐츠), other(기타) 중 하나로 분류한다
2. WHEN 사용자가 신고를 제출하면, THE Report_Processor SHALL 신고 유형, 상세 설명, 증거 사진(선택), 신고자 ID, 접수 시각을 저장한다
3. WHEN 동일 스팟에 대해 동일 유형의 신고가 3건 이상 누적되면, THE Report_Processor SHALL 해당 스팟을 "긴급 검토 필요" 상태로 표시하고 관리자에게 알린다
4. WHILE 사용자가 신고 폼을 작성하는 동안, THE Spot_Quality_System SHALL 해당 스팟의 기존 신고 이력 요약을 표시한다
5. IF 동일 사용자가 동일 스팟에 대해 24시간 이내에 같은 유형의 신고를 중복 제출하면, THEN THE Report_Processor SHALL 중복 신고를 거부하고 기존 신고를 안내한다

### Requirement 4: 신고 처리 SLA

**User Story:** As a 관리자, I want 신고 처리에 명확한 기한이 설정되어 있어서, so that 사용자 신고가 방치되지 않고 적시에 처리될 수 있다.

#### Acceptance Criteria

1. THE Report_Processor SHALL 신고 접수 시 처리 기한을 유형별로 설정한다: closed_permanently는 48시간, duplicate는 72시간, inaccurate_info는 120시간, inappropriate는 24시간, other는 120시간
2. WHEN 신고 처리 기한의 80%가 경과하면, THE Report_Processor SHALL 담당 관리자에게 처리 임박 알림을 발송한다
3. IF 신고 처리 기한이 초과되면, THEN THE Report_Processor SHALL 해당 신고를 "SLA 초과" 상태로 표시하고 상위 관리자에게 에스컬레이션 알림을 발송한다
4. THE Report_Processor SHALL 관리자 대시보드에 SLA 준수율, 평균 처리 시간, 초과 건수를 집계하여 표시한다
5. WHEN 관리자가 신고를 처리 완료하면, THE Report_Processor SHALL 처리 결과(승인/반려/보류), 처리 사유, 처리 시각을 기록하고 신고자에게 결과를 알린다

### Requirement 5: 스팟 보완 요청 강화

**User Story:** As a 관리자, I want 정보가 부족한 스팟에 대해 사용자에게 보완을 요청하고 싶다, so that 스팟 정보의 완성도를 높일 수 있다.

#### Acceptance Criteria

1. WHEN 관리자가 스팟에 보완 요청을 생성하면, THE Supplement_Manager SHALL 요청 유형(사진 추가, 설명 보완, 주소 확인, 운영 정보 확인), 요청 내용, 기한을 저장한다
2. WHEN 보완 요청이 생성되면, THE Supplement_Manager SHALL 해당 스팟의 최초 제보자와 최근 기여자에게 보완 요청 알림을 발송한다
3. WHILE 스팟에 미처리 보완 요청이 존재하는 동안, THE Spot_Quality_System SHALL 스팟 상세 페이지에 "보완 필요" 배지를 표시한다
4. WHEN 사용자가 보완 요청에 응답하여 정보를 제출하면, THE Supplement_Manager SHALL 제출된 정보를 관리자 검토 대기열에 추가한다
5. IF 보완 요청 기한이 초과되고 응답이 없으면, THEN THE Supplement_Manager SHALL 해당 요청을 "미응답" 상태로 변경하고 관리자에게 후속 조치를 안내한다

### Requirement 6: 폐업/폐쇄 상태 감지

**User Story:** As a 사용자, I want 방문하려는 스팟이 폐업/폐쇄되었는지 미리 알고 싶다, so that 헛걸음을 방지할 수 있다.

#### Acceptance Criteria

1. WHEN 동일 스팟에 대해 closed_permanently 유형 신고가 2건 이상 누적되면, THE Closure_Detector SHALL 해당 스팟을 "폐쇄 의심" 상태로 자동 전환하고 관리자 확인을 요청한다
2. WHILE 스팟이 "폐쇄 의심" 상태인 동안, THE Spot_Quality_System SHALL 스팟 상세 페이지와 지도 핀에 "폐쇄 확인 중" 경고를 표시한다
3. WHEN 관리자가 폐쇄를 확인하면, THE Closure_Detector SHALL 스팟 상태를 closed로 전이하고 폐쇄 확인 일자를 기록한다
4. WHEN 관리자가 폐쇄 의심을 기각하면, THE Closure_Detector SHALL 스팟 상태를 approved로 복원하고 관련 신고를 "기각됨"으로 처리한다
5. THE Closure_Detector SHALL 폐쇄 확인된 스팟의 지도 핀을 회색 처리하고 "폐쇄됨" 라벨을 표시하되, 기존 체크인 기록과 사진은 보존한다
