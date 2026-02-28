# Implementation Plan: 관리자 대시보드 통합 (Admin Dashboard Integration)

## Overview

관리자 대시보드 랜딩 페이지와 누락된 두 가지 관리 기능(정보 보완 검토, 상태 신고 검토)을 구현합니다. 기존 `AdminReportList + AdminReportReview` 패턴과 `/api/admin/reports` API 패턴을 그대로 따르며, 대시보드 요약 API는 `Promise.all`로 병렬 count 쿼리를 실행합니다.

## Tasks

- [x] 1. 타입 정의 확장 및 대시보드 요약 API 구현
  - [x] 1.1 `src/types/report.ts` 확장 — SpotSupplement, SpotStatusReport 타입 업데이트
    - SpotSupplement에 `status: 'pending' | 'approved' | 'rejected'` 필드 추가 (기존 `approved: boolean` 대체)
    - SpotSupplement에 `rejectionReason?: string` 필드 추가
    - SpotStatusReport에 `reviewStatus: 'pending' | 'resolved'` 필드 추가
    - API 요청/응답 인터페이스 추가: `SupplementReviewRequest`, `StatusReportReviewRequest`, `SpotStatusUpdateRequest`, `DashboardSummaryResponse`, `AdminSupplementsResponse`, `AdminStatusReportsResponse`
    - _Requirements: 2.2, 2.3, 4.3, 6.1, 6.2, 6.3_

  - [x] 1.2 `src/app/api/admin/dashboard/summary/route.ts` 생성 — 대시보드 요약 API
    - GET 핸들러: 관리자 인증 검사 (401/403)
    - `Promise.all`로 3개 컬렉션 병렬 count 쿼리 실행
    - `pendingReports`: spot_reports에서 `status: 'pending'` count
    - `pendingSupplements`: spot_supplements에서 `status: 'pending'` count
    - `pendingStatusReports`: spot_status_reports에서 `reviewStatus: 'pending'` count
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 1.3 Property 테스트 — 대시보드 요약 count 정확성
    - **Property 8: 대시보드 요약 count 정확성**
    - 임의의 3개 컬렉션 데이터셋에 대해 반환되는 count가 실제 pending 문서 수와 일치하는지 검증
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 1.4 Property 테스트 — 비관리자 접근 차단
    - **Property 1: 비관리자 접근 차단**
    - 임의의 비관리자 세션으로 admin API 호출 시 401/403 반환 및 데이터 미포함 검증
    - **Validates: Requirements 2.4, 4.4, 6.4**

- [ ] 2. Checkpoint — 타입 및 요약 API 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. 정보 보완 관리자 API 구현
  - [x] 3.1 `src/app/api/admin/supplements/route.ts` 생성 — 정보 보완 목록 API
    - GET 핸들러: 관리자 인증 검사 (401/403)
    - `status` 쿼리 파라미터로 필터링 (pending/approved/rejected/all)
    - `page`, `limit` 쿼리 파라미터로 페이지네이션
    - `createdAt` 내림차순 정렬
    - 응답: `{ supplements, total, page, limit, totalPages }`
    - _Requirements: 2.1, 2.4_

  - [x] 3.2 `src/app/api/admin/supplements/[id]/review/route.ts` 생성 — 정보 보완 검토 API
    - PUT 핸들러: 관리자 인증 검사 (401/403)
    - 존재하지 않는 ID → 404, 이미 처리된 supplement → 400
    - `action: 'approve'` 시: type별 Append 병합 로직 실행 후 `status: 'approved'`로 변경
      - `photo`: Spot.photos 배열에 `$push`
      - `scene_info`: scenes 컬렉션에 새 문서 `insertOne`
      - `description`: 기존 description 뒤에 append
      - `other`: 자동 병합 없음
    - `action: 'reject'` 시: `rejectionReason` 필수 검증, `status: 'rejected'`로 변경
    - 병합 연산 먼저 수행, 성공 시에만 status 변경
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.3 Property 테스트 — 정보 보완 목록 필터링 및 페이지네이션
    - **Property 2: 정보 보완 목록 필터링 및 페이지네이션**
    - 임의의 SpotSupplement 배열과 필터/페이지 파라미터에 대해 결과가 필터 조건을 만족하고 limit 이하이며 createdAt 내림차순인지 검증
    - **Validates: Requirements 2.1**

  - [ ]* 3.4 Property 테스트 — 정보 보완 승인 시 Append 병합
    - **Property 3: 정보 보완 승인 시 Append 병합**
    - 각 type별로 기존 데이터가 보존되고 보완 데이터가 올바르게 추가되며 status가 'approved'로 변경되는지 검증
    - **Validates: Requirements 2.2**

  - [ ]* 3.5 Property 테스트 — 정보 보완 반려 시 상태 유지 및 사유 기록
    - **Property 4: 정보 보완 반려 시 상태 유지 및 사유 기록**
    - 반려 후 status가 'rejected'이고 rejectionReason이 입력 사유와 일치하며 Spot 데이터가 변경되지 않는지 검증
    - **Validates: Requirements 2.3**

- [x] 4. Checkpoint — 정보 보완 API 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. 상태 신고 관리자 API 구현
  - [x] 5.1 `src/app/api/admin/status-reports/route.ts` 생성 — 상태 신고 목록 API
    - GET 핸들러: 관리자 인증 검사 (401/403)
    - `reviewStatus` 쿼리 파라미터로 필터링 (pending/resolved/all)
    - `status` 쿼리 파라미터로 신고 상태 유형별 필터링 (normal/partially_changed/under_construction/demolished/inaccessible/all)
    - `page`, `limit` 쿼리 파라미터로 페이지네이션
    - `createdAt` 내림차순 정렬
    - 응답: `{ reports, total, page, limit, totalPages }`
    - _Requirements: 4.1, 4.4_

  - [x] 5.2 `src/app/api/admin/status-reports/[id]/review/route.ts` 생성 — 상태 신고 확인 처리 API
    - PUT 핸들러: 관리자 인증 검사 (401/403)
    - 존재하지 않는 ID → 404
    - `action: 'resolve'` 시: `reviewStatus`를 `'resolved'`로 변경
    - _Requirements: 4.3, 4.4_

  - [x] 5.3 `src/app/api/admin/status-reports/spots/[spotId]/status/route.ts` 생성 — 스팟 상태 수동 변경 API
    - PUT 핸들러: 관리자 인증 검사 (401/403)
    - 존재하지 않는 spotId → 404
    - 유효하지 않은 SpotStatus 값 → 400
    - 해당 Spot의 `spotStatus`를 지정된 상태로 `$set`
    - 해당 spotId의 `reviewStatus: 'pending'`인 모든 SpotStatusReport를 `'resolved'`로 일괄 `updateMany`
    - _Requirements: 4.2, 4.4, 4.5, 4.6_

  - [ ]* 5.4 Property 테스트 — 상태 신고 목록 필터링 및 페이지네이션
    - **Property 5: 상태 신고 목록 필터링 및 페이지네이션**
    - 임의의 SpotStatusReport 배열과 필터/페이지 파라미터에 대해 결과가 필터 조건을 만족하고 limit 이하이며 createdAt 내림차순인지 검증
    - **Validates: Requirements 4.1**

  - [ ]* 5.5 Property 테스트 — 스팟 상태 수동 변경 및 일괄 resolved 처리
    - **Property 6: 스팟 상태 수동 변경 및 일괄 resolved 처리**
    - 임의의 Spot과 SpotStatus 값에 대해 spotStatus가 업데이트되고 해당 spotId의 pending 신고가 모두 resolved로 변경되는지 검증
    - **Validates: Requirements 4.2, 4.6**

  - [ ]* 5.6 Property 테스트 — 상태 신고 확인 처리
    - **Property 7: 상태 신고 확인 처리**
    - 임의의 pending SpotStatusReport에 대해 확인 처리 후 reviewStatus가 'resolved'로 변경되는지 검증
    - **Validates: Requirements 4.3**

- [x] 6. Checkpoint — 상태 신고 API 검증
  - Ensure all tests pass, ask the user if questions arise.

- [-] 7. 정보 보완 검토 UI 구현
  - [x] 7.1 `src/components/admin/AdminSupplementList.tsx` 생성 — 정보 보완 목록 컴포넌트
    - 기존 `AdminReportList` 패턴 동일하게 구현
    - status별 필터 (미승인/승인/반려/전체)
    - 페이지네이션 (page, limit)
    - 항목 선택 시 `onSelectSupplement` 콜백 호출
    - 보완 유형, 기여자명, 대상 스팟명, 상태 배지 표시
    - _Requirements: 3.1, 3.3_

  - [x] 7.2 `src/components/admin/AdminSupplementReview.tsx` 생성 — 정보 보완 상세/검토 컴포넌트
    - 기존 `AdminReportReview` 패턴 동일하게 구현
    - 보완 유형, 내용, 씬 정보, 사진, 기여자, 대상 스팟명 상세 표시
    - 승인 버튼: `PUT /api/admin/supplements/[id]/review` 호출 (`action: 'approve'`)
    - 반려 버튼: 반려 사유 입력 필드 표시 후 `action: 'reject'` 호출
    - API 호출 성공/실패 시 인라인 메시지 표시
    - _Requirements: 3.2, 3.4, 3.5_

  - [-] 7.3 `src/app/admin/supplements/page.tsx` 생성 — 정보 보완 검토 페이지
    - 기존 `AdminReportsPage` 패턴 동일 (Split-pane 레이아웃)
    - 관리자 권한 검사 (미인증/비관리자 → 메인 페이지 리다이렉트)
    - 좌측: `AdminSupplementList`, 우측: `AdminSupplementReview`
    - _Requirements: 3.1, 3.2_

- [-] 8. 상태 신고 검토 UI 구현
  - [x] 8.1 `src/components/admin/AdminStatusReportList.tsx` 생성 — 상태 신고 목록 컴포넌트
    - 기존 `AdminReportList` 패턴 동일하게 구현
    - reviewStatus별 필터 (전체/대기 중/확인 완료)
    - 신고 상태 유형별 필터 (전체/정상/일부 변경/공사중/소실됨/접근 불가)
    - 페이지네이션 (page, limit)
    - 항목 선택 시 `onSelectReport` 콜백 호출
    - 신고 상태, 신고자명, 대상 스팟명, reviewStatus 배지 표시
    - _Requirements: 5.1, 5.3_

  - [x] 8.2 `src/components/admin/AdminStatusReportReview.tsx` 생성 — 상태 신고 상세/검토 컴포넌트
    - 기존 `AdminReportReview` 패턴 동일하게 구현
    - 신고 상태, 설명, 증거 사진, 신고자, 대상 스팟명, 현재 스팟 상태 상세 표시
    - 확인 처리 버튼: `PUT /api/admin/status-reports/[id]/review` 호출
    - 스팟 상태 수동 변경: 상태 선택 드롭다운 + `PUT /api/admin/status-reports/spots/[spotId]/status` 호출
    - API 호출 성공/실패 시 인라인 메시지 표시
    - _Requirements: 5.2, 5.4, 5.5_

  - [x] 8.3 `src/app/admin/status-reports/page.tsx` 생성 — 상태 신고 검토 페이지
    - 기존 `AdminReportsPage` 패턴 동일 (Split-pane 레이아웃)
    - 관리자 권한 검사 (미인증/비관리자 → 메인 페이지 리다이렉트)
    - 좌측: `AdminStatusReportList`, 우측: `AdminStatusReportReview`
    - _Requirements: 5.1, 5.2_

- [ ] 9. Checkpoint — 검토 UI 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. 관리자 대시보드 랜딩 페이지 구현 및 통합
  - [ ] 10.1 `src/components/admin/AdminDashboardCard.tsx` 생성 — 대시보드 네비게이션 카드 컴포넌트
    - props: `title`, `description`, `icon`, `pendingCount`, `href`
    - 카드 클릭 시 해당 관리 페이지로 이동 (Next.js Link)
    - 대기 중 항목 수 배지 표시
    - _Requirements: 1.1, 1.4_

  - [ ] 10.2 `src/app/admin/page.tsx` 생성 — 대시보드 랜딩 페이지
    - 관리자 권한 검사 (미인증/비관리자 → 메인 페이지 리다이렉트)
    - `GET /api/admin/dashboard/summary` 호출하여 대기 항목 수 로드
    - 4개 `AdminDashboardCard` 렌더링:
      - 제보 관리 (`/admin/reports`, pendingReports)
      - 정보 보완 검토 (`/admin/supplements`, pendingSupplements)
      - 상태 신고 검토 (`/admin/status-reports`, pendingStatusReports)
      - 콘텐츠 이미지 관리 (`/admin/content-images`, count 없음)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 10.3 단위 테스트 — 대시보드 및 검토 UI edge case
    - 존재하지 않는 ID로 요청 시 404 반환 (Requirements 2.5, 4.5)
    - 이미 승인된 supplement 재승인 시 400 반환
    - 반려 시 사유 미입력 시 400 반환
    - 유효하지 않은 action/status 값 시 400 반환
    - 대시보드 요약에서 컬렉션이 비어있는 경우 0 반환
    - _Requirements: 2.3, 2.5, 4.5_

- [ ] 11. Final Checkpoint — 전체 기능 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 기존 `AdminReportList + AdminReportReview` 패턴을 그대로 따라 일관성을 유지합니다
- SpotSupplement의 `approved: boolean`을 `status: 'pending' | 'approved' | 'rejected'` 3-state로 변경합니다
- 정보 보완 승인 시 Append 방식 병합으로 기존 데이터를 보존합니다
- 병합 연산을 먼저 수행하고 성공 시에만 status를 변경하여 데이터 정합성을 보장합니다
- Property 테스트는 `fast-check` 라이브러리를 사용합니다
