# Requirements Document: 관리자 대시보드 통합 (Admin Dashboard Integration)

## Introduction

현재 관리자 시스템에는 성지 제보(SpotReport) 관리와 콘텐츠 이미지 관리 페이지만 존재합니다. 사용자가 제출한 정보 보완(SpotSupplement)과 상태 신고(SpotStatusReport)에 대한 관리자 검토 UI/API가 누락되어 있어, 관리자가 이를 검토하거나 승인/반려할 수 없는 상태입니다. 이 기능은 관리자 대시보드 랜딩 페이지를 추가하고, 누락된 두 가지 관리 기능(정보 보완 검토, 상태 신고 검토)을 구현하여 모든 관리 기능을 하나의 대시보드에서 통합 관리할 수 있도록 합니다.

## Glossary

- **Admin_Dashboard (관리자 대시보드)**: `/admin` 경로의 랜딩 페이지로, 모든 관리 기능으로의 네비게이션과 대기 항목 요약을 제공하는 페이지
- **Supplement_Review_Page (정보 보완 검토 페이지)**: 사용자가 제출한 SpotSupplement를 관리자가 검토/승인/반려할 수 있는 관리 페이지
- **StatusReport_Review_Page (상태 신고 검토 페이지)**: 사용자가 제출한 SpotStatusReport를 관리자가 검토하고 스팟 상태를 수동으로 관리할 수 있는 관리 페이지
- **Supplement_Admin_API (정보 보완 관리자 API)**: 관리자 전용으로 정보 보완 목록 조회, 승인, 반려 기능을 제공하는 API 엔드포인트
- **StatusReport_Admin_API (상태 신고 관리자 API)**: 관리자 전용으로 상태 신고 목록 조회 및 스팟 상태 수동 변경 기능을 제공하는 API 엔드포인트
- **SpotSupplement (정보 보완)**: 사용자가 기존 스팟에 대해 추가 정보(씬 정보, 설명, 사진 등)를 제출하는 데이터. `approved: boolean` 필드로 승인 여부를 관리
- **SpotStatusReport (상태 신고)**: 사용자가 스팟의 현재 상태(정상, 일부 변경, 공사중, 소실됨, 접근 불가)를 신고하는 데이터. 처리 상태를 나타내는 `reviewStatus` (`'pending'` | `'resolved'`) 필드로 관리
- **Admin (관리자)**: `session.user.role === 'admin'`인 인증된 사용자

## Requirements

### Requirement 1: 관리자 대시보드 랜딩 페이지

**User Story:** As a 관리자, I want `/admin` 경로에 대시보드 랜딩 페이지가 있기를, so that 모든 관리 기능의 현황을 한눈에 파악하고 빠르게 이동할 수 있습니다.

#### Acceptance Criteria

1. WHEN 관리자가 `/admin` 경로에 접근할 때, THE Admin_Dashboard SHALL 각 관리 기능(제보 관리, 정보 보완 검토, 상태 신고 검토, 콘텐츠 이미지 관리)으로의 네비게이션 카드를 표시한다
2. WHEN Admin_Dashboard가 로드될 때, THE Admin_Dashboard SHALL 각 관리 기능별 대기 중인 항목 수를 요약하여 표시한다
3. WHEN 비관리자 또는 미인증 사용자가 `/admin` 경로에 접근할 때, THE Admin_Dashboard SHALL 접근을 차단하고 메인 페이지로 리다이렉트한다
4. WHEN 관리자가 네비게이션 카드를 클릭할 때, THE Admin_Dashboard SHALL 해당 관리 페이지(`/admin/reports`, `/admin/supplements`, `/admin/status-reports`, `/admin/content-images`)로 이동한다

### Requirement 2: 정보 보완 관리자 API

**User Story:** As a 관리자, I want 정보 보완 제보를 조회하고 승인/반려할 수 있는 API가 있기를, so that 사용자가 제출한 정보 보완을 체계적으로 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 관리자가 정보 보완 목록을 요청할 때, THE Supplement_Admin_API SHALL 페이지네이션(page, limit)이 적용된 SpotSupplement 목록을 승인 상태별로 필터링하여 반환한다
2. WHEN 관리자가 정보 보완을 승인할 때, THE Supplement_Admin_API SHALL 해당 SpotSupplement의 `approved` 필드를 `true`로 변경하고, 제출된 보완 데이터(사진, 설명, 씬 정보 등)를 대상 스팟(Spot) 데이터에 병합(Merge)하여 업데이트한다
3. WHEN 관리자가 정보 보완을 반려할 때, THE Supplement_Admin_API SHALL 해당 SpotSupplement의 `approved` 필드를 `false`로 유지하고 반려 사유를 기록한다
4. IF 비관리자가 Supplement_Admin_API에 접근하면, THEN THE Supplement_Admin_API SHALL 403 상태 코드를 반환한다
5. IF 존재하지 않는 SpotSupplement ID로 요청하면, THEN THE Supplement_Admin_API SHALL 404 상태 코드를 반환한다

### Requirement 3: 정보 보완 검토 UI

**User Story:** As a 관리자, I want 정보 보완 제보를 검토할 수 있는 관리 페이지가 있기를, so that 사용자가 제출한 추가 정보를 효율적으로 검토하고 승인/반려할 수 있습니다.

#### Acceptance Criteria

1. WHEN 관리자가 `/admin/supplements` 페이지에 접근할 때, THE Supplement_Review_Page SHALL 대기 중인 정보 보완 목록을 좌측에 표시한다
2. WHEN 관리자가 목록에서 정보 보완 항목을 선택할 때, THE Supplement_Review_Page SHALL 우측에 해당 항목의 상세 정보(보완 유형, 내용, 씬 정보, 사진, 기여자, 대상 스팟명)를 표시한다
3. THE Supplement_Review_Page SHALL 승인 상태별 필터(미승인/승인/전체)를 제공한다
4. WHEN 관리자가 승인 버튼을 클릭할 때, THE Supplement_Review_Page SHALL Supplement_Admin_API를 호출하여 해당 항목을 승인 처리하고 목록을 갱신한다
5. WHEN 관리자가 반려 버튼을 클릭할 때, THE Supplement_Review_Page SHALL 반려 사유 입력 필드를 표시하고, 사유 입력 후 Supplement_Admin_API를 호출하여 반려 처리한다

### Requirement 4: 상태 신고 관리자 API

**User Story:** As a 관리자, I want 상태 신고를 조회하고 스팟 상태를 수동으로 변경할 수 있는 API가 있기를, so that 자동 전환 로직 외에도 관리자가 직접 스팟 상태를 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 관리자가 상태 신고 목록을 요청할 때, THE StatusReport_Admin_API SHALL 페이지네이션(page, limit)이 적용된 SpotStatusReport 목록을 처리 상태(`reviewStatus`)별로 필터링하여 최신순으로 반환한다
2. WHEN 관리자가 특정 스팟의 상태를 수동으로 변경할 때, THE StatusReport_Admin_API SHALL 해당 스팟의 `spotStatus` 필드를 지정된 상태로 업데이트한다
3. WHEN 관리자가 상태 신고를 확인 처리할 때, THE StatusReport_Admin_API SHALL 해당 신고의 `reviewStatus`를 `'resolved'`로 변경한다
4. IF 비관리자가 StatusReport_Admin_API에 접근하면, THEN THE StatusReport_Admin_API SHALL 403 상태 코드를 반환한다
5. IF 존재하지 않는 스팟 ID로 상태 변경을 요청하면, THEN THE StatusReport_Admin_API SHALL 404 상태 코드를 반환한다
6. WHEN 관리자가 특정 스팟의 상태를 수동으로 변경할 때, THE StatusReport_Admin_API SHALL 해당 스팟에 대해 대기 중(`reviewStatus: 'pending'`)인 모든 SpotStatusReport를 자동으로 `'resolved'` 상태로 일괄 업데이트한다

### Requirement 5: 상태 신고 검토 UI

**User Story:** As a 관리자, I want 상태 신고를 검토할 수 있는 관리 페이지가 있기를, so that 사용자가 신고한 스팟 상태 변경을 확인하고 필요 시 수동으로 상태를 조정할 수 있습니다.

#### Acceptance Criteria

1. WHEN 관리자가 `/admin/status-reports` 페이지에 접근할 때, THE StatusReport_Review_Page SHALL 상태 신고 목록을 좌측에 표시한다
2. WHEN 관리자가 목록에서 상태 신고 항목을 선택할 때, THE StatusReport_Review_Page SHALL 우측에 해당 항목의 상세 정보(신고 상태, 설명, 증거 사진, 신고자, 대상 스팟명, 현재 스팟 상태)를 표시한다
3. THE StatusReport_Review_Page SHALL 처리 상태별 필터(전체/대기 중/확인 완료)와 신고된 상태 유형별 필터(전체/정상/일부 변경/공사중/소실됨/접근 불가)를 제공한다
4. WHEN 관리자가 스팟 상태를 수동으로 변경할 때, THE StatusReport_Review_Page SHALL 상태 선택 드롭다운을 제공하고 StatusReport_Admin_API를 호출하여 스팟 상태를 업데이트한다
5. WHEN 관리자가 신고를 확인 처리할 때, THE StatusReport_Review_Page SHALL 해당 신고의 `reviewStatus`를 `'resolved'`로 변경하고 목록을 갱신한다

### Requirement 6: 관리자 대시보드 요약 API

**User Story:** As a 관리자, I want 대시보드에서 각 관리 기능의 대기 항목 수를 확인할 수 있기를, so that 어떤 항목에 우선적으로 대응해야 하는지 빠르게 판단할 수 있습니다.

#### Acceptance Criteria

1. WHEN 관리자가 대시보드 요약 API를 호출할 때, THE Admin_Dashboard SHALL 대기 중인 성지 제보 수(status: 'pending')를 반환한다
2. WHEN 관리자가 대시보드 요약 API를 호출할 때, THE Admin_Dashboard SHALL 미승인 정보 보완 수(approved: false)를 반환한다
3. WHEN 관리자가 대시보드 요약 API를 호출할 때, THE Admin_Dashboard SHALL 미확인 상태 신고 수(`reviewStatus: 'pending'`)를 반환한다
4. IF 비관리자가 대시보드 요약 API에 접근하면, THEN THE Admin_Dashboard SHALL 403 상태 코드를 반환한다
