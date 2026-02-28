# Implementation Plan: 덕후 친화적 편의시설 (Otaku-Friendly Facilities)

## Overview

기존 편의시설 시스템(5개 Legacy_Category)을 확장하여 덕후 특화 5개 카테고리를 추가하고, 유저 제보 및 마이크로 투표 기반 데이터 검증 시스템을 구축합니다. 기존 타입/컴포넌트/API를 하위 호환성을 유지하며 확장하고, 신규 컴포넌트와 API를 추가합니다.

## Tasks

- [-] 1. 데이터 모델 및 타입 정의
  - [x] 1.1 `src/types/facility.ts` 신규 생성 — 카테고리별 상세 인터페이스 정의
    - `CoinLockerDetails`, `SoloDiningDetails`, `ChargingCafeDetails`, `PublicRestroomDetails`, `GoodsShopDetails` 인터페이스 작성
    - `OtakuFacilityDetails` 판별 유니온 타입 정의
    - `LockerSize`, `GoodsShopSubtype`, `FacilityStatus` 타입 정의
    - `FacilityVoteDocument` 인터페이스 정의 (facility_votes 컬렉션용)
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.8, 6.9_

  - [x] 1.2 `src/types/spot.ts` 확장 — FacilityType 및 NearbyFacility 인터페이스 확장
    - `LegacyFacilityType`, `OtakuFacilityType` 타입 분리 후 `FacilityType` 유니온으로 통합
    - `NearbyFacility` 인터페이스에 `status`, `verificationScore`, `upvotes`, `downvotes`, `googlePlaceId`, `otakuDetails`, `reportedBy`, `createdAt`, `updatedAt` 필드 추가
    - 기존 `Facility` 인터페이스도 동일하게 확장
    - 기존 Legacy_Category 코드와의 하위 호환성 유지
    - _Requirements: 1.1, 6.1, 6.7, 6.8, 6.9, 6.10_

  - [-] 1.3 `src/lib/facility-utils.ts` 확장 — 유틸리티 함수 업데이트
    - `groupFacilitiesByType` 함수에 Otaku_Category 5개 추가
    - `VALID_FACILITY_TYPES` 배열에 신규 카테고리 추가
    - 기존 Legacy_Category 분류 로직 유지
    - _Requirements: 1.1, 6.7_

  - [ ]* 1.4 Property 테스트 — 카테고리 분류 무결성
    - **Property 1: 카테고리 분류 무결성**
    - `groupFacilitiesByType` 함수가 모든 시설을 누락 없이 분류하는지 검증
    - **Validates: Requirements 1.1, 6.7**

  - [ ]* 1.5 Property 테스트 — 하위 호환성
    - **Property 2: 하위 호환성**
    - Legacy_Category 편의시설이 `otakuDetails` 없이도 정상 처리되는지 검증
    - **Validates: Requirements 6.7**

- [ ] 2. Checkpoint — 데이터 모델 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. 편의시설 API 확장
  - [ ] 3.1 `src/app/api/spots/[id]/facilities/route.ts` 확장 — GET API에 type/status 필터 추가
    - `type` 쿼리 파라미터로 특정 카테고리 필터링 지원
    - `status`가 `hidden`인 시설 자동 제외
    - 응답에 `otakuDetails`, `status`, `verificationScore`, `upvotes`, `downvotes` 포함
    - _Requirements: 7.1, 7.2, 7.5_

  - [ ] 3.2 `src/app/api/facilities/report/route.ts` 신규 생성 — 편의시설 제보 API
    - POST 핸들러: 필수 필드(`name`, `type`, `coordinates`) 검증
    - 카테고리별 `otakuDetails` 저장 처리
    - 기본값 설정: `status: 'active'`, `verificationScore: 50`, `upvotes: 0`, `downvotes: 0`
    - 성공 시 201, 필수 필드 누락 시 400 + 누락 필드 목록 반환
    - _Requirements: 7.3, 7.4_

  - [ ] 3.3 `src/app/api/facilities/[id]/vote/route.ts` 신규 생성 — 마이크로 투표 API
    - POST 핸들러: `value`(boolean) 필드 검증
    - `facility_votes` 컬렉션에서 `{ facilityId, userId }` 복합 유니크 인덱스 활용
    - 기존 투표 존재 시 값 업데이트, 신규 시 삽입
    - `upvotes`/`downvotes` 재계산 및 `verificationScore` 산출
    - `downvotes - upvotes >= 5` 시 `needs_verification` 상태 전이
    - `verificationScore < 20` 시 `hidden` 상태 전이
    - 투표 값 또는 인증 누락 시 400 반환
    - _Requirements: 7.6, 7.7, 7.8, 5.11_

  - [ ]* 3.4 Property 테스트 — Verification Score 범위 불변식
    - **Property 4: Verification Score 범위 불변식**
    - `verificationScore`가 항상 0~100 범위이며, 투표 0건이면 50인지 검증
    - **Validates: Requirements 6.8, 5.11**

  - [ ]* 3.5 Property 테스트 — 제보 필수 필드 검증
    - **Property 6: 제보 필수 필드 검증**
    - `name`, `type`, `coordinates` 중 하나라도 누락 시 400 에러 반환 검증
    - **Validates: Requirements 7.3, 7.4**

  - [ ]* 3.6 Property 테스트 — Status 필터링 일관성
    - **Property 5: Status 필터링 일관성**
    - GET API 응답에 `status: 'hidden'`인 시설이 포함되지 않는지 검증
    - **Validates: Requirements 7.1, 7.2**

- [ ] 4. Checkpoint — API 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. FacilityFilter 컴포넌트 구현
  - [ ] 5.1 `src/components/spot/FacilityFilter.tsx` 신규 생성 — 카테고리 필터 칩 UI
    - Legacy_Category + Otaku_Category 전체 카테고리 필터 칩 렌더링
    - "전체" 칩 포함, 복수 선택 지원
    - 칩 클릭 시 해당 카테고리 토글, 전체 해제 시 모든 카테고리 표시
    - 각 카테고리별 아이콘/라벨 표시 (FACILITY_CONFIG 활용)
    - _Requirements: 1.4, 1.5_

  - [ ] 5.2 `src/components/spot/NearbyFacilities.tsx` 확장 — FACILITY_CONFIG 및 필터 통합
    - `FACILITY_CONFIG`에 Otaku_Category 5개 추가 (아이콘, 라벨, 색상)
    - `FacilityFilter` 컴포넌트를 목록 상단에 통합
    - 선택된 카테고리에 따라 편의시설 목록 필터링 로직 추가
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [ ] 6. FacilityCard 카테고리별 상세 렌더링 확장
  - [ ] 6.1 `src/components/spot/FacilityCard.tsx` 확장 — 카테고리별 상세 정보 렌더링
    - `coin_locker`: 크기별 가격 테이블, 대형 로커 유무 배지, 이용 시간 표시, 미등록 시 "정보 미등록" 텍스트
    - `solo_dining`: "1인 OK" 태그, 카운터석/1인 메뉴 유무, 빠른 식사/심야 배지, 미등록 시 "정보 미등록" 텍스트
    - `charging_cafe`: 충전/와이파이 유무 아이콘 표시
    - `public_restroom`: 접근성/24시간 유무 아이콘 표시
    - `goods_shop`: 매장 유형 배지(서브컬처/잡화), 영업시간 표시
    - 신뢰도 점수(`verificationScore`) 및 투표 수(`upvotes`/`downvotes`) 표시
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3_

  - [ ]* 6.2 단위 테스트 — FacilityCard 카테고리별 렌더링
    - Legacy_Category 시설이 기존과 동일하게 렌더링되는지 확인
    - 각 Otaku_Category 시설의 상세 정보가 올바르게 표시되는지 확인
    - 미등록 필드에 "정보 미등록" 텍스트가 표시되는지 확인
    - _Requirements: 2.4, 3.3, 6.7_

- [ ] 7. MicroVoteButton 컴포넌트 구현
  - [ ] 7.1 `src/components/spot/MicroVoteButton.tsx` 신규 생성 — 마이크로 투표 UI
    - "이 정보가 정확한가요?" 텍스트와 👍/👎 버튼 렌더링
    - `POST /api/facilities/[id]/vote` API 호출 연동
    - 이미 투표한 경우 선택 상태 하이라이트 표시
    - 투표 후 `verificationScore` 실시간 업데이트
    - 비로그인 유저에게 로그인 유도 메시지 표시
    - _Requirements: 5.10, 7.6_

  - [ ] 7.2 `src/components/spot/FacilityCard.tsx`에 MicroVoteButton 통합
    - FacilityCard 하단에 MicroVoteButton 배치
    - _Requirements: 5.10_

  - [ ]* 7.3 Property 테스트 — 투표 중복 방지 불변식
    - **Property 3: 투표 중복 방지 불변식**
    - 동일 유저가 동일 시설에 투표 시 `facility_votes`에 최대 1개 문서만 존재하는지 검증
    - **Validates: Requirements 7.8**

- [ ] 8. Checkpoint — UI 컴포넌트 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. FacilityReportForm 제보 폼 구현
  - [ ] 9.1 `src/components/spot/FacilityReportForm.tsx` 신규 생성 — 제보 폼 모달 기본 구조
    - 모달 형태의 제보 폼 레이아웃
    - 장소 입력 방식 선택 UI (구글맵 검색 / 직접 핀 꽂기 투트랙)
    - 공통 필수 필드: 이름, 카테고리 선택 드롭다운, 위치(좌표)
    - 필수 필드 미입력 시 오류 메시지 표시
    - _Requirements: 5.1, 5.2, 5.8, 5.9_

  - [ ] 9.2 FacilityReportForm 카테고리별 동적 필드 구현
    - `coin_locker` 선택 시: 크기, 가격, 이용 시간, 대형 로커 유무 필드 표시
    - `solo_dining` 선택 시: 카운터석 유무, 1인 메뉴 유무, 빠른 식사 가능 여부, 심야 영업 여부 필드 표시
    - `goods_shop` 선택 시: 매장 유형(서브컬처/잡화), 영업시간 필드 표시
    - `charging_cafe` 선택 시: 충전 콘센트 유무, 무료 와이파이 유무 필드 표시
    - `public_restroom` 선택 시: 장애인 접근 가능 여부, 24시간 이용 가능 여부 필드 표시
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 9.3 FacilityReportForm API 연동 및 제출 처리
    - `POST /api/facilities/report` API 호출 연동
    - 성공 시 성공 메시지 표시 및 폼 초기화
    - 에러 시 서버 응답 기반 오류 메시지 표시
    - _Requirements: 5.8, 5.9, 7.3_

- [ ] 10. 통합 및 와이어링
  - [ ] 10.1 `src/hooks/useSpotDetail.ts` 확장 — useFacilities 훅에 필터/투표 기능 추가
    - `type` 파라미터를 활용한 카테고리별 조회 지원
    - 투표 API 호출 함수 추가
    - 제보 후 목록 갱신 로직 추가
    - _Requirements: 1.3, 1.4, 7.1_

  - [ ] 10.2 Spot Detail 페이지에 "편의시설 제보" 버튼 및 FacilityReportForm 연결
    - NearbyFacilities 영역에 "편의시설 제보" 버튼 추가
    - 버튼 클릭 시 FacilityReportForm 모달 열기
    - 제보 완료 후 편의시설 목록 자동 갱신
    - _Requirements: 5.1_

  - [ ]* 10.3 통합 테스트 — 편의시설 조회/제보/투표 플로우
    - 편의시설 목록 조회 → 카테고리 필터링 → 상세 정보 표시 플로우 검증
    - 제보 폼 제출 → API 저장 → 목록 갱신 플로우 검증
    - 투표 → 점수 업데이트 → 상태 전이 플로우 검증
    - _Requirements: 1.3, 5.8, 5.10, 5.11_

- [ ] 11. Final Checkpoint — 전체 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 기존 Legacy_Category 편의시설과의 하위 호환성을 최우선으로 유지합니다
- 구글맵 Places Autocomplete 연동은 FacilityReportForm 내에서 구현하되, API 키 설정은 환경 변수로 관리합니다
- `facility_votes` 컬렉션의 `{ facilityId, userId }` 복합 유니크 인덱스는 API 초기화 시 생성합니다
- Property 테스트는 구현 직후 배치하여 조기 오류 감지를 지원합니다
