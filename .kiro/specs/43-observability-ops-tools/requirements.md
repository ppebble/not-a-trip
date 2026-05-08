# Requirements Document

## Introduction

Not a Trip 프로젝트의 관측성(Observability) 및 운영 도구를 강화하는 기능이다. 현재 Sentry와 Google Analytics 기본 설정은 되어 있으나, 에러 알림 자동화, 관리자 감사 로그, 운영 대시보드 확장, 백업/복구 자동화, 데이터 마이그레이션 runbook, 헬스체크 엔드포인트가 부재하다. 이 기능을 통해 운영 안정성과 장애 대응 능력을 확보한다.

## Glossary

- **Alert_System**: Sentry 에러 이벤트를 감지하여 Slack 또는 Discord 채널로 알림을 전송하는 시스템
- **Audit_Logger**: 관리자(admin) 역할의 사용자가 수행한 작업을 기록하는 모듈
- **Ops_Dashboard**: 실시간 운영 지표(DAU, 체크인 수, 에러율 등)를 조회할 수 있는 관리자 대시보드
- **Backup_System**: MongoDB 데이터베이스의 백업 생성 및 복구를 수행하는 자동화 스크립트
- **Migration_Runner**: 스키마 변경 시 데이터 마이그레이션을 안전하게 수행하는 도구
- **Health_Endpoint**: 애플리케이션과 의존 서비스의 상태를 확인하는 API 엔드포인트
- **Audit_Log**: 관리자 작업 이력을 저장하는 MongoDB 컬렉션 레코드
- **DAU**: Daily Active Users, 일일 활성 사용자 수
- **Webhook**: 외부 서비스가 특정 이벤트 발생 시 지정된 URL로 HTTP 요청을 보내는 메커니즘

## Requirements

### Requirement 1: Sentry 에러 알림 설정

**User Story:** As a 운영자, I want Sentry에서 감지된 에러를 Slack 또는 Discord로 즉시 알림받고 싶다, so that 장애를 빠르게 인지하고 대응할 수 있다.

#### Acceptance Criteria

1. WHEN Sentry에서 새로운 에러 이벤트가 발생하면, THE Alert_System SHALL 설정된 Webhook URL로 알림 메시지를 전송한다
2. THE Alert_System SHALL 알림 메시지에 에러 제목, 발생 시각, 영향받는 사용자 수, Sentry 이슈 링크를 포함한다
3. WHEN 동일한 에러가 1시간 내에 10회 이상 반복 발생하면, THE Alert_System SHALL 에러 급증 알림을 별도로 전송한다
4. THE Alert_System SHALL Slack Webhook URL과 Discord Webhook URL을 환경 변수로 관리한다
5. IF Webhook 전송이 실패하면, THEN THE Alert_System SHALL 실패 사유를 서버 로그에 기록하고 3회까지 재시도한다

### Requirement 2: 관리자 감사 로그

**User Story:** As a 관리자, I want 모든 관리자 작업의 이력을 기록하고 조회하고 싶다, so that 누가 언제 어떤 작업을 수행했는지 추적할 수 있다.

#### Acceptance Criteria

1. WHEN 관리자가 스팟 승인, 삭제, 상태 변경 등의 작업을 수행하면, THE Audit_Logger SHALL 해당 작업을 Audit_Log로 기록한다
2. THE Audit_Logger SHALL 각 Audit_Log에 작업자 ID, 작업자 이름, 작업 유형, 대상 리소스 ID, 대상 리소스 유형, 변경 전 값, 변경 후 값, 수행 시각, IP 주소를 포함한다
3. WHEN 관리자가 감사 로그 목록을 요청하면, THE Audit_Logger SHALL 최신순으로 페이지네이션된 로그 목록을 반환한다
4. WHERE 감사 로그 필터링 기능이 활성화된 경우, THE Audit_Logger SHALL 작업 유형, 작업자, 날짜 범위로 필터링을 지원한다
5. THE Audit_Logger SHALL Audit_Log 데이터를 90일간 보관한다
6. THE Audit_Logger SHALL 감사 로그 기록 실패가 원본 작업의 실행을 차단하지 않도록 비동기로 처리한다

### Requirement 3: 운영 대시보드 확장

**User Story:** As a 운영자, I want 실시간 운영 지표를 한눈에 확인하고 싶다, so that 서비스 상태를 빠르게 파악하고 이상 징후를 감지할 수 있다.

#### Acceptance Criteria

1. WHEN 관리자가 운영 대시보드를 조회하면, THE Ops_Dashboard SHALL 당일 DAU, 총 체크인 수, 에러율을 표시한다
2. WHEN 관리자가 운영 대시보드를 조회하면, THE Ops_Dashboard SHALL 최근 7일간의 DAU 추이를 일별로 표시한다
3. WHEN 관리자가 운영 대시보드를 조회하면, THE Ops_Dashboard SHALL 최근 7일간의 체크인 수 추이를 일별로 표시한다
4. THE Ops_Dashboard SHALL 에러율을 최근 24시간 내 API 요청 대비 5xx 응답 비율로 계산한다
5. WHEN 관리자가 대시보드를 새로고침하면, THE Ops_Dashboard SHALL 5초 이내에 최신 데이터를 반환한다
6. THE Ops_Dashboard SHALL 신규 스팟 등록 수, 신규 사용자 수를 당일 기준으로 표시한다

### Requirement 4: MongoDB 백업/복구 자동화

**User Story:** As a 운영자, I want MongoDB 데이터를 정기적으로 백업하고 필요 시 복구할 수 있다, so that 데이터 유실 사고에 대비할 수 있다.

#### Acceptance Criteria

1. THE Backup_System SHALL mongodump를 사용하여 전체 데이터베이스의 백업을 생성하는 스크립트를 제공한다
2. THE Backup_System SHALL 백업 파일에 생성 일시를 포함한 파일명을 부여한다
3. THE Backup_System SHALL 백업 완료 후 백업 파일의 무결성을 검증한다
4. THE Backup_System SHALL mongorestore를 사용하여 지정된 백업 파일로부터 데이터를 복구하는 스크립트를 제공한다
5. WHEN 복구 스크립트가 실행되면, THE Backup_System SHALL 복구 대상 데이터베이스명과 백업 파일 경로를 인자로 받는다
6. THE Backup_System SHALL 최근 7일간의 백업을 보관하고 이전 백업을 자동 삭제한다
7. IF 백업 또는 복구 과정에서 오류가 발생하면, THEN THE Backup_System SHALL 오류 내용을 로그 파일에 기록하고 비정상 종료 코드를 반환한다

### Requirement 5: 데이터 마이그레이션 Runbook

**User Story:** As a 개발자, I want 스키마 변경 시 안전하게 데이터를 마이그레이션할 수 있는 절차와 도구가 있다, so that 스키마 변경으로 인한 데이터 손실이나 서비스 중단을 방지할 수 있다.

#### Acceptance Criteria

1. THE Migration_Runner SHALL 마이그레이션 스크립트를 버전 번호와 설명이 포함된 파일명으로 관리한다
2. THE Migration_Runner SHALL 이미 적용된 마이그레이션을 추적하여 중복 실행을 방지한다
3. WHEN 마이그레이션 스크립트가 실행되면, THE Migration_Runner SHALL 적용 전 현재 컬렉션의 문서 수를 기록한다
4. WHEN 마이그레이션 스크립트가 실행되면, THE Migration_Runner SHALL 적용 후 영향받은 문서 수를 출력한다
5. IF 마이그레이션 실행 중 오류가 발생하면, THEN THE Migration_Runner SHALL 해당 마이그레이션을 롤백하고 오류 내용을 출력한다
6. THE Migration_Runner SHALL dry-run 모드를 지원하여 실제 변경 없이 영향 범위를 미리 확인할 수 있다
7. THE Migration_Runner SHALL 마이그레이션 이력을 migrations 컬렉션에 기록한다

### Requirement 6: 헬스체크 엔드포인트

**User Story:** As a 운영자, I want 애플리케이션과 의존 서비스의 상태를 확인할 수 있는 엔드포인트가 있다, so that 모니터링 도구에서 서비스 가용성을 자동으로 확인할 수 있다.

#### Acceptance Criteria

1. WHEN GET /api/health 요청이 수신되면, THE Health_Endpoint SHALL 애플리케이션 상태를 JSON 형식으로 반환한다
2. THE Health_Endpoint SHALL 응답에 전체 상태(healthy 또는 unhealthy), MongoDB 연결 상태, 응답 시간, 서버 시각을 포함한다
3. WHEN MongoDB 연결이 정상이면, THE Health_Endpoint SHALL HTTP 200 상태 코드를 반환한다
4. WHEN MongoDB 연결이 실패하면, THE Health_Endpoint SHALL HTTP 503 상태 코드와 함께 실패 사유를 반환한다
5. THE Health_Endpoint SHALL 인증 없이 접근 가능하다
6. THE Health_Endpoint SHALL 500ms 이내에 응답한다
7. THE Health_Endpoint SHALL 애플리케이션 버전 정보를 응답에 포함한다
