# Requirements Document

## Introduction

개인 프로필 페이지(`/profile/[id]`)를 "내 활동 허브"로 완성한다. 현재 프로필 페이지는 인증 갤러리/배지/진행 현황/최초 제보 스팟 4개 탭만 제공하지만, 실제 서비스에서 유저가 생성·참여하는 데이터는 훨씬 다양하다.

본 spec은 서비스 전체 인벤토리를 기반으로 마이페이지를 **활동 / 기여 / 커뮤니티 / 보관함 / 관리** 5개 섹션으로 재편하고, `/settings/account` 페이지를 프로필에 통합하며, 헤더 프로필 링크를 수정하고, 프로필 편집 기능을 구현한다. 또한 현재 `/profile/[id]` 접근 시 발생하는 에러를 함께 수정한다.

## Glossary

- **Profile_Page**: `/profile/[id]` 경로의 유저 프로필 페이지
- **Activity_Hub**: 프로필 페이지의 전체 구조 — 활동/기여/커뮤니티/보관함/관리 섹션으로 구성
- **Header**: 전역 네비게이션 헤더 컴포넌트 (`src/components/layout/Header.tsx`)
- **Owner**: URL 파라미터 `id`와 현재 로그인 유저의 Session `user.id`가 일치하는 경우 (본인 프로필)
- **Visitor**: Owner가 아닌 프로필 페이지 방문자 (비로그인 포함)
- **Section_Navigation**: 프로필 페이지의 섹션/탭 전환 UI
- **Route_Bookmark**: `route_bookmarks` 컬렉션의 코스 북마크 데이터
- **Route_Completion**: `route_completions` 컬렉션의 코스 완주 기록 데이터
- **Spot_Report**: `spot_reports` 컬렉션의 신규 스팟 제보 데이터 (reporterId 기반)
- **Supplement**: `supplements` 컬렉션의 정보보완 신청 데이터 (contributorId 기반)
- **Status_Report**: `status_reports` 컬렉션의 현재 상태 신고 데이터 (reporterId 기반)

## Requirements

### Requirement 1: 프로필 페이지 에러 수정 및 헤더 링크 변경

**User Story:** As a 로그인한 유저, I want 헤더의 프로필 아이콘을 클릭하면 에러 없이 내 프로필 페이지로 이동하기를, so that 내 활동과 정보를 바로 확인할 수 있다.

#### Acceptance Criteria

1. THE Profile_Page SHALL `/profile/[id]` 경로 접근 시 에러 없이 정상적으로 렌더링된다.
2. WHEN 로그인한 유저가 Header의 프로필 아이콘/이름 영역을 클릭하면, THE Header SHALL `/profile/{현재 로그인 유저의 ID}` 경로로 이동한다.
3. WHEN 로그인한 유저가 모바일 메뉴에서 프로필 관련 링크를 클릭하면, THE Header SHALL `/profile/{현재 로그인 유저의 ID}` 경로로 이동한다.
4. THE Header SHALL 기존 `/settings/account` 링크를 모두 `/profile/{현재 로그인 유저의 ID}` 링크로 대체한다.

### Requirement 2: 섹션 구조 재설계 — 활동 허브

**User Story:** As a 프로필 페이지 방문자, I want 유저의 다양한 활동을 체계적으로 구분하여 탐색하기를, so that 원하는 정보를 빠르게 찾을 수 있다.

#### Acceptance Criteria

1. THE Profile_Page SHALL 다음 5개 섹션을 제공한다: **활동**, **기여**, **커뮤니티**, **보관함**, **관리**.
2. THE Section_Navigation SHALL 섹션 간 전환을 지원하며, 현재 활성 섹션을 시각적으로 구분한다.
3. THE Section_Navigation SHALL 화면 너비가 좁을 경우 가로 스크롤 또는 드롭다운으로 접근성을 유지한다.
4. WHEN Owner가 본인 프로필을 방문하면, THE Profile_Page SHALL 5개 섹션 모두를 표시한다.
5. WHEN Visitor가 타인 프로필을 방문하면, THE Profile_Page SHALL "관리" 섹션을 표시하지 않는다.
6. WHEN 비로그인 상태에서 프로필 페이지를 방문하면, THE Profile_Page SHALL Visitor와 동일하게 "관리" 섹션을 표시하지 않는다.

### Requirement 3: 활동 섹션 — 인증, 코스 완주, 배지, 진행도

**User Story:** As a 프로필 페이지 방문자, I want 유저의 순례 활동 기록을 한눈에 보기를, so that 유저의 순례 성과를 확인할 수 있다.

#### Acceptance Criteria

1. THE 활동 섹션 SHALL 다음 하위 탭을 포함한다: 인증 갤러리, 코스 완주, 트로피 룸, 진행 현황.
2. WHEN "인증 갤러리" 탭이 활성화되면, THE Profile_Page SHALL 유저의 체크인 기록을 사진 그리드로 표시한다.
3. THE 인증 갤러리 SHALL 각 인증에 사진, 스팟 이름, 방문일, 코멘트를 포함한다.
4. WHEN Owner가 본인 인증 갤러리를 볼 때, THE Profile_Page SHALL 각 인증에 삭제 버튼을 표시한다.
5. WHEN "코스 완주" 탭이 활성화되면, THE Profile_Page SHALL 유저의 Route_Completion 목록을 표시한다.
6. THE 코스 완주 목록 SHALL 각 완주 기록에 코스 이름, 완주일, 스팟 수를 포함한다.
7. WHEN "트로피 룸" 탭이 활성화되면, THE Profile_Page SHALL 유저의 획득 배지 목록을 표시한다.
8. WHEN "진행 현황" 탭이 활성화되면, THE Profile_Page SHALL 유저의 작품별 스팟 방문 진행률을 표시한다.

### Requirement 4: 기여 섹션 — 등록 스팟, 제보, 정보보완, 상태신고

**User Story:** As a 프로필 페이지 방문자, I want 유저가 서비스에 기여한 내역을 보기를, so that 유저의 기여도를 확인할 수 있다.

#### Acceptance Criteria

1. THE 기여 섹션 SHALL 다음 하위 탭을 포함한다: 등록한 스팟, 신규 제보, 정보보완, 상태신고.
2. WHEN "등록한 스팟" 탭이 활성화되면, THE Profile_Page SHALL `authorId`가 해당 유저인 스팟 목록을 표시한다.
3. THE 등록한 스팟 목록 SHALL 각 스팟에 이름, 주소, 카테고리, 등록일을 포함한다.
4. WHEN "신규 제보" 탭이 활성화되면, THE Profile_Page SHALL 유저의 Spot_Report 목록을 상태(대기/승인/반려)와 함께 표시한다.
5. THE 신규 제보 목록 SHALL 각 제보에 스팟 이름, 제보일, 처리 상태를 포함한다.
6. WHEN "정보보완" 탭이 활성화되면, THE Profile_Page SHALL 유저의 Supplement 목록을 상태와 함께 표시한다.
7. THE 정보보완 목록 SHALL 각 신청에 대상 스팟, 보완 유형, 신청일, 처리 상태를 포함한다.
8. WHEN "상태신고" 탭이 활성화되면, THE Profile_Page SHALL 유저의 Status_Report 목록을 표시한다.
9. THE 상태신고 목록 SHALL 각 신고에 대상 스팟, 신고 상태, 신고일, 처리 여부를 포함한다.

### Requirement 5: 커뮤니티 섹션 — 게시글, 댓글

**User Story:** As a 프로필 페이지 방문자, I want 유저의 커뮤니티 활동을 보기를, so that 유저가 작성한 글과 댓글을 확인할 수 있다.

#### Acceptance Criteria

1. THE 커뮤니티 섹션 SHALL 다음 하위 탭을 포함한다: 내 게시글, 내 댓글.
2. WHEN "내 게시글" 탭이 활성화되면, THE Profile_Page SHALL `userId`가 해당 유저인 게시글 목록을 표시한다.
3. THE 게시글 목록 SHALL 각 게시글에 제목(또는 내용 미리보기), 작성일, 조회수, 댓글 수를 포함한다.
4. WHEN 유저가 게시글을 클릭하면, THE Profile_Page SHALL 해당 게시글 상세 페이지로 이동한다.
5. WHEN "내 댓글" 탭이 활성화되면, THE Profile_Page SHALL `userId`가 해당 유저인 댓글 목록을 표시한다.
6. THE 댓글 목록 SHALL 각 댓글에 내용 미리보기, 작성일, 원문 게시글 링크를 포함한다.
7. WHEN 유저가 댓글 항목을 클릭하면, THE Profile_Page SHALL 해당 댓글이 달린 게시글로 이동한다.

### Requirement 6: 보관함 섹션 — 저장한 코스, 내가 만든 코스

**User Story:** As a 프로필 페이지 방문자, I want 유저의 코스 관련 데이터를 보기를, so that 유저가 만들거나 저장한 코스를 참고할 수 있다.

#### Acceptance Criteria

1. THE 보관함 섹션 SHALL 다음 하위 탭을 포함한다: 내가 만든 코스, 저장한 코스.
2. WHEN "내가 만든 코스" 탭이 활성화되면, THE Profile_Page SHALL 해당 유저가 생성한 코스 목록을 표시한다.
3. THE 코스 목록 SHALL 각 코스에 이름, 스팟 수, 생성일, 북마크 수를 포함한다.
4. WHEN "저장한 코스" 탭이 활성화되면, THE Profile_Page SHALL 해당 유저의 Route_Bookmark 목록을 표시한다.
5. THE 저장한 코스 목록 SHALL 각 코스에 이름, 작성자, 스팟 수를 포함한다.
6. WHEN 유저가 코스 카드를 클릭하면, THE Profile_Page SHALL 해당 코스 상세 페이지(`/routes/[id]`)로 이동한다.
7. WHEN 해당 목록이 비어있으면, THE Profile_Page SHALL 적절한 빈 상태 메시지와 관련 페이지 링크를 표시한다.
8. WHEN Owner가 본인 프로필의 빈 상태를 볼 때, THE Profile_Page SHALL "코스 만들기" 또는 "코스 탐색하기" 액션 링크를 포함한다.

### Requirement 7: 관리 섹션 — 계정 설정, 프로필 편집, 푸시 알림

**User Story:** As a 로그인한 유저, I want 프로필 페이지에서 계정과 알림을 관리하기를, so that 별도 페이지로 이동하지 않고 한 곳에서 모든 설정을 처리할 수 있다.

#### Acceptance Criteria

1. THE 관리 섹션 SHALL Owner에게만 표시되며, 다음 하위 탭을 포함한다: 프로필 편집, 계정 연동, 알림 설정.
2. WHEN "프로필 편집" 탭이 활성화되면, THE Profile_Page SHALL 이름과 프로필 이미지 변경 폼을 표시한다.
3. WHEN Owner가 이름을 변경하고 저장하면, THE Profile_Page SHALL `PUT /api/users/[id]` 엔드포인트를 호출하여 이름을 업데이트한다.
4. WHEN Owner가 프로필 이미지를 변경하고 저장하면, THE Profile_Page SHALL 이미지를 업로드하고 유저 정보를 업데이트한다.
5. IF 이름이 빈 문자열이면, THEN THE Profile_Page SHALL "이름을 입력해주세요" 유효성 검사 에러를 표시한다.
6. WHEN "계정 연동" 탭이 활성화되면, THE Profile_Page SHALL 각 OAuth 프로바이더(Google, 카카오, 네이버, X)의 연결 상태와 연결/해제 버튼을 표시한다.
7. WHILE 유저에게 비밀번호가 설정되어 있지 않으면, THE 계정 연동 탭 SHALL 이메일/비밀번호 설정 폼을 표시한다.
8. WHEN "알림 설정" 탭이 활성화되면, THE Profile_Page SHALL 푸시 알림 구독/해제 토글을 표시한다.
9. THE 관리 섹션 SHALL 기존 `/settings/account` 페이지의 모든 기능을 동일하게 제공한다.

### Requirement 8: 프로필 헤더 및 통계 영역

**User Story:** As a 프로필 페이지 방문자, I want 유저의 기본 정보와 핵심 통계를 프로필 상단에서 바로 보기를, so that 유저의 전반적인 활동 수준을 빠르게 파악할 수 있다.

#### Acceptance Criteria

1. THE Profile_Page SHALL 프로필 헤더에 유저 이름, 프로필 이미지, 가입일을 표시한다.
2. WHEN Owner가 본인 프로필을 방문하면, THE Profile_Page SHALL 프로필 헤더에 "편집" 버튼을 표시한다.
3. WHEN Visitor가 타인 프로필을 방문하면, THE Profile_Page SHALL "편집" 버튼을 표시하지 않는다.
4. THE Profile_Page SHALL 통계 영역에 총 인증 수, 방문 스팟 수, 획득 배지 수, 완주 코스 수를 표시한다.
5. THE Profile_Page SHALL 통계 영역에 등록한 스팟 수, 제보 수, 게시글 수를 추가로 표시한다.

### Requirement 9: 프로필 API 확장

**User Story:** As a 프론트엔드 개발자, I want 유저의 활동 데이터를 조회하는 API를 사용하기를, so that 프로필 페이지에서 필요한 데이터를 효율적으로 가져올 수 있다.

#### Acceptance Criteria

1. WHEN `GET /api/users/[id]/routes` 요청이 수신되면, THE API SHALL 해당 유저가 생성한 코스 목록을 반환한다.
2. WHEN `GET /api/users/[id]/bookmarks` 요청이 수신되면, THE API SHALL 해당 유저가 북마크한 코스 목록을 반환한다.
3. WHEN `GET /api/users/[id]/completions` 요청이 수신되면, THE API SHALL 해당 유저의 코스 완주 기록을 반환한다.
4. WHEN `GET /api/users/[id]/reports` 요청이 수신되면, THE API SHALL 해당 유저의 신규 스팟 제보 목록을 반환한다.
5. WHEN `GET /api/users/[id]/supplements` 요청이 수신되면, THE API SHALL 해당 유저의 정보보완 신청 목록을 반환한다.
6. WHEN `GET /api/users/[id]/status-reports` 요청이 수신되면, THE API SHALL 해당 유저의 상태신고 목록을 반환한다.
7. WHEN `GET /api/users/[id]/posts` 요청이 수신되면, THE API SHALL 해당 유저의 게시글 목록을 반환한다.
8. WHEN `GET /api/users/[id]/comments` 요청이 수신되면, THE API SHALL 해당 유저의 댓글 목록을 반환한다.
9. WHEN `PUT /api/users/[id]` 요청이 수신되면, THE API SHALL 유저의 이름과 이미지를 업데이트한다.
10. IF `PUT /api/users/[id]` 요청의 Session 유저 ID와 URL 파라미터 `id`가 일치하지 않으면, THEN THE API SHALL HTTP 403 응답을 반환한다.
11. IF 요청된 `id`에 해당하는 유저가 존재하지 않으면, THEN THE API SHALL HTTP 404 응답을 반환한다.

### Requirement 10: `/settings/account` 경로 리다이렉트

**User Story:** As a 기존 유저, I want `/settings/account` URL로 접근해도 프로필 페이지로 안내받기를, so that 기존 북마크나 링크가 깨지지 않는다.

#### Acceptance Criteria

1. WHEN 로그인한 유저가 `/settings/account` 경로에 접근하면, THE System SHALL `/profile/{현재 로그인 유저의 ID}` 경로로 리다이렉트한다 (관리 섹션 활성 상태).
2. WHEN 비로그인 유저가 `/settings/account` 경로에 접근하면, THE System SHALL 로그인 페이지로 리다이렉트한다.

### Requirement 11: 빈 상태 및 로딩 UX

**User Story:** As a 프로필 페이지 방문자, I want 데이터가 없거나 로딩 중일 때 적절한 피드백을 받기를, so that 페이지 상태를 명확히 인지할 수 있다.

#### Acceptance Criteria

1. WHILE 각 섹션의 데이터를 로딩 중이면, THE Profile_Page SHALL 해당 영역에 스켈레톤 UI를 표시한다.
2. WHEN 특정 탭의 데이터가 비어있으면, THE Profile_Page SHALL 해당 탭에 맞는 빈 상태 메시지를 표시한다.
3. WHEN Owner가 본인 프로필의 빈 상태를 볼 때, THE Profile_Page SHALL 관련 기능으로 이동하는 액션 링크를 포함한다.
4. IF API 요청이 실패하면, THEN THE Profile_Page SHALL 에러 메시지를 표시하고 재시도 버튼을 제공한다.

### Requirement 12: 우선순위 보류 항목 (설계 보완 후 추가)

**User Story:** As a 서비스 운영자, I want 현재 데이터 모델이 부족한 기능을 식별하기를, so that 향후 마이페이지 확장 시 필요한 스키마 변경을 계획할 수 있다.

#### Acceptance Criteria

1. THE System SHALL 현재 scene 스키마에 작성자 ID가 없어 "내가 추가한 작품 속 장면" 기능은 본 spec 범위에서 제외한다.
2. THE System SHALL 현재 장면 좋아요 조회 API가 없어 "내가 좋아요한 장면" 기능은 본 spec 범위에서 제외한다.
3. THE System SHALL 현재 시설 제보의 reportedBy가 세션 기반이 아니어서 "내가 제보한 시설" 기능은 본 spec 범위에서 제외한다.
4. THE System SHALL 위 3개 항목을 향후 스키마 보완 후 마이페이지에 추가할 수 있도록 확장 가능한 구조로 설계한다.
