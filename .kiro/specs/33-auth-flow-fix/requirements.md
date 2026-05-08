# Requirements Document

## Introduction

인증 업로드 유저의 전환 경로(Funnel)에 존재하는 결함을 수정하는 기능 개선 사양이다.
비로그인 유저가 인증을 시도할 때 로그인 페이지로 올바르게 이동하지 않는 문제, 스팟 검색 시 작품 맥락이 부재한 문제, 인증 완료 후 다음 행동 유도가 없는 문제를 해결한다.

## Glossary

- **LoginRequiredModal**: 로그인이 필요한 기능에 접근할 때 표시되는 공통 모달 컴포넌트
- **CheckInButton**: 스팟 상세 페이지에서 순례 인증을 시작하는 버튼 컴포넌트
- **FloatingActionButton**: 갤러리 페이지에서 순례 인증을 시작하는 플로팅 버튼 컴포넌트
- **SpotSearchModal**: 인증 시 스팟을 검색하는 모달 컴포넌트
- **QuickCheckIn**: 모바일 환경에서 빠른 인증 플로우를 제공하는 컴포넌트
- **CheckInModal**: 데스크탑 환경에서 인증 업로드를 처리하는 모달 컴포넌트
- **callbackUrl**: 로그인 완료 후 원래 페이지로 복귀하기 위해 전달하는 URL 파라미터
- **contentName**: 스팟과 연결된 작품(애니메이션, 영화, 드라마 등)의 제목
- **CTA**: Call To Action, 사용자에게 다음 행동을 유도하는 UI 요소

## Requirements

### Requirement 1: LoginRequiredModal 로그인 전환 통일

**User Story:** As a 비로그인 유저, I want 인증 시도 시 로그인 페이지로 바로 이동하고 싶다, so that 로그인 후 원래 하려던 인증을 이어서 할 수 있다.

#### Acceptance Criteria

1. WHEN 비로그인 유저가 CheckInButton을 클릭하여 LoginRequiredModal이 표시될 때, THE LoginRequiredModal SHALL 확인 버튼 클릭 시 `/auth/signin` 페이지로 이동한다
2. WHEN 비로그인 유저가 FloatingActionButton을 클릭하여 LoginRequiredModal이 표시될 때, THE LoginRequiredModal SHALL 확인 버튼 클릭 시 `/auth/signin` 페이지로 이동한다
3. WHEN LoginRequiredModal의 확인 버튼이 클릭될 때, THE LoginRequiredModal SHALL 현재 페이지 URL을 `callbackUrl` 쿼리 파라미터로 포함하여 `/auth/signin?callbackUrl={현재URL}` 형태로 이동한다
4. THE LoginRequiredModal SHALL 모든 사용처에서 동일한 로그인 전환 동작을 수행한다 (모달만 닫는 동작 금지)

### Requirement 2: SpotSearchModal 검색 결과 작품 맥락 표시

**User Story:** As a 인증 업로드 유저, I want 스팟 검색 결과에서 작품명과 카테고리를 확인하고 싶다, so that 동명 스팟을 구분하고 올바른 스팟을 선택할 수 있다.

#### Acceptance Criteria

1. WHEN 스팟 검색 결과가 표시될 때, THE SpotSearchModal SHALL 각 검색 결과 항목에 연결된 작품명(contentName)을 표시한다
2. WHEN 스팟 검색 결과가 표시될 때, THE SpotSearchModal SHALL 각 검색 결과 항목에 카테고리 라벨을 표시한다
3. IF 스팟에 연결된 작품이 없는 경우, THEN THE SpotSearchModal SHALL 작품명 영역을 비워두고 카테고리만 표시한다
4. WHEN API 응답에서 스팟 데이터를 매핑할 때, THE SpotSearchModal SHALL `contentName` 필드를 검색 결과 객체에 포함한다

### Requirement 3: 인증 완료 후 다음 행동 유도 UI

**User Story:** As a 인증 완료 유저, I want 인증 완료 후 다음에 할 수 있는 행동을 바로 선택하고 싶다, so that 서비스 내에서 자연스럽게 다음 활동으로 이어갈 수 있다.

#### Acceptance Criteria

1. WHEN 인증이 성공적으로 완료될 때, THE QuickCheckIn SHALL 완료 화면에 "내 인증 보기" CTA 버튼을 표시한다
2. WHEN 인증이 성공적으로 완료될 때, THE QuickCheckIn SHALL 완료 화면에 "같은 작품 더 보기" CTA 버튼을 표시한다
3. WHEN 인증이 성공적으로 완료될 때, THE CheckInModal SHALL 성공 콜백 호출 후 다음 행동 유도 UI를 표시한다
4. WHEN 유저가 "내 인증 보기" CTA를 클릭할 때, THE QuickCheckIn SHALL 유저의 인증 목록 페이지(`/gallery?tab=my`)로 이동한다
5. WHEN 유저가 "같은 작품 더 보기" CTA를 클릭할 때, THE QuickCheckIn SHALL 해당 작품의 스팟 목록 페이지로 이동한다
6. WHEN 유저가 "확인" 버튼을 클릭할 때, THE QuickCheckIn SHALL 모달을 닫고 현재 페이지에 머문다
