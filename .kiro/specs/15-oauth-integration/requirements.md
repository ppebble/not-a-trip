# Requirements Document

## Introduction

Not a Trip 플랫폼의 OAuth 통합 기능을 정의한다. 현재 시스템은 이메일/비밀번호 기반 로그인과 Google, Kakao, Naver OAuth 프로바이더를 지원하지만, 계정 연동(Account Linking) 시나리오가 부재하고 X(Twitter) OAuth가 미지원 상태이다. 타겟 유저층인 서브컬처 팬들의 가입 허들을 낮추고, 기존 로컬 계정과 소셜 계정 간의 원활한 연동을 구현하는 것이 목표이다.

## Glossary

- **Auth_System**: NextAuth.js(Auth.js v5) 기반의 인증/인가 시스템. JWT 전략과 MongoDBAdapter를 사용한다.
- **OAuth_Provider**: 외부 소셜 로그인 서비스 (Google, Kakao, Naver, X/Twitter).
- **Credentials_Provider**: 이메일/비밀번호 기반 자체 인증 프로바이더.
- **Account_Linking**: 동일 사용자의 여러 인증 수단(소셜 계정, 로컬 계정)을 하나의 사용자 프로필로 연결하는 기능.
- **Linked_Account**: Account_Linking을 통해 하나의 사용자 프로필에 연결된 개별 인증 수단.
- **Primary_Account**: 사용자가 최초 가입 시 사용한 인증 수단. 사용자 프로필의 기본 정보(이름, 이메일, 프로필 이미지)의 원본이 된다.
- **Sign_In_Page**: 사용자가 로그인 수단을 선택하고 인증을 수행하는 페이지 (`/auth/signin`).
- **Account_Settings_Page**: 로그인한 사용자가 연결된 계정을 관리하는 설정 페이지.
- **Users_Collection**: MongoDB의 `users` 컬렉션. 사용자 프로필 정보를 저장한다.
- **Accounts_Collection**: MongoDB의 `accounts` 컬렉션. MongoDBAdapter가 관리하며, 각 OAuth 프로바이더별 연결 정보를 저장한다.

## Requirements

### Requirement 1: X(Twitter) OAuth 프로바이더 추가

**User Story:** As a 서브컬처 팬, I want X(Twitter) 계정으로 로그인하고 싶다, so that 별도 회원가입 없이 빠르게 서비스를 이용할 수 있다.

#### Acceptance Criteria

1. THE Auth_System SHALL X(Twitter) OAuth 2.0 프로바이더를 지원한다.
2. WHEN 사용자가 Sign_In_Page에서 X(Twitter) 로그인 버튼을 클릭하면, THE Auth_System SHALL X(Twitter) OAuth 인증 플로우를 시작한다.
3. WHEN X(Twitter) OAuth 인증이 성공하면, THE Auth_System SHALL X(Twitter)에서 제공하는 사용자 정보(이름, 프로필 이미지, 이메일)를 Users_Collection에 저장한다.
4. WHEN X(Twitter) OAuth 인증이 성공하면, THE Auth_System SHALL Accounts_Collection에 X(Twitter) 프로바이더 연결 정보를 저장한다.
5. IF X(Twitter) OAuth 인증이 실패하면, THEN THE Auth_System SHALL 사용자에게 인증 실패 사유를 포함한 오류 메시지를 표시한다.
6. IF X(Twitter)가 이메일 정보를 제공하지 않으면, THEN THE Auth_System SHALL X(Twitter) 사용자 ID를 고유 식별자로 사용하여 계정을 생성한다.

### Requirement 2: Sign_In_Page에 X(Twitter) 로그인 버튼 추가

**User Story:** As a 사용자, I want Sign_In_Page에서 X(Twitter) 로그인 옵션을 확인하고 싶다, so that 원하는 소셜 계정으로 로그인할 수 있다.

#### Acceptance Criteria

1. THE Sign_In_Page SHALL X(Twitter) 로그인 버튼을 Google, Kakao, Naver 버튼과 함께 표시한다.
2. THE Sign_In_Page SHALL X(Twitter) 로그인 버튼에 X(Twitter) 브랜드 아이콘과 "X(Twitter)로 로그인" 텍스트를 표시한다.
3. WHILE Auth_System이 로그인 요청을 처리하는 동안, THE Sign_In_Page SHALL 모든 로그인 버튼을 비활성화 상태로 표시한다.

### Requirement 3: 동일 이메일 가입 시도 시 계정 보호

**User Story:** As a 기존 사용자, I want 다른 사람이 내 이메일과 동일한 소셜 계정으로 내 계정에 무단 접근하는 것을 방지하고 싶다, so that 계정 보안이 유지된다.

#### Acceptance Criteria

1. WHEN 소셜 로그인 시 OAuth_Provider가 제공한 이메일이 Users_Collection에 이미 다른 프로바이더(또는 Credentials_Provider)로 가입되어 있으면, THE Auth_System SHALL 새 계정을 생성하거나 자동 연결하지 않고 로그인을 거부한다.
2. WHEN 동일 이메일로 인해 로그인이 거부되면, THE Auth_System SHALL 사용자를 오류 페이지(`/auth/error?error=OAuthAccountNotLinked`)로 리다이렉트한다.
3. THE Auth_System SHALL Auth.js의 기본 보안 정책(자동 Account Linking 차단)을 준수하여, 이메일 소유권이 검증되지 않은 자동 계정 병합을 수행하지 않는다.
4. IF OAuth_Provider가 이메일 정보를 제공하지 않으면, THEN THE Auth_System SHALL 기존 계정과의 충돌 없이 새 계정을 생성한다.

### Requirement 4: 수동 Account_Linking (Account_Settings_Page 경유)

**User Story:** As a 이메일/비밀번호로 가입한 사용자, I want 계정 설정 페이지에서 소셜 계정을 기존 계정에 수동으로 연결하고 싶다, so that 소셜 로그인으로도 동일한 계정에 접근할 수 있다.

#### Acceptance Criteria

1. WHEN 로그인된 사용자가 Account_Settings_Page에서 OAuth_Provider "연결하기"를 수행하면, THE Auth_System SHALL 현재 세션의 사용자 계정에 해당 OAuth_Provider를 Linked_Account로 연결한다.
2. WHEN Credentials 계정에 OAuth_Provider가 연결되면, THE Auth_System SHALL 사용자가 Credentials_Provider와 연결된 OAuth_Provider 모두로 로그인할 수 있도록 한다.
3. WHEN Credentials 계정에 OAuth_Provider가 연결되면, THE Auth_System SHALL 기존 비밀번호 로그인 기능을 유지한다.
4. IF 계정에 이미 동일한 OAuth_Provider가 연결되어 있으면, THEN THE Auth_System SHALL 중복 연결을 생성하지 않고 "이미 연결된 계정입니다" 메시지를 표시한다.
5. THE Auth_System SHALL 로그인 화면에서의 자동 연결을 허용하지 않고, 반드시 Account_Settings_Page를 통한 수동 연결만 허용한다.

### Requirement 5: Account_Settings_Page 구현

**User Story:** As a 로그인한 사용자, I want 내 계정에 연결된 소셜 계정 목록을 확인하고 관리하고 싶다, so that 로그인 수단을 직접 제어할 수 있다.

#### Acceptance Criteria

1. THE Account_Settings_Page SHALL 현재 사용자에게 연결된 모든 Linked_Account 목록을 프로바이더 이름 및 연결 상태와 함께 표시한다.
2. THE Account_Settings_Page SHALL 아직 연결되지 않은 OAuth_Provider에 대해 "연결하기" 버튼을 표시한다.
3. WHEN 사용자가 "연결하기" 버튼을 클릭하면, THE Auth_System SHALL 해당 OAuth_Provider의 인증 플로우를 시작하고 성공 시 Linked_Account로 추가한다.
4. THE Account_Settings_Page SHALL 연결된 Linked_Account에 대해 "연결 해제" 버튼을 표시한다.
5. WHEN 사용자가 Linked_Account의 "연결 해제" 버튼을 클릭하면, THE Auth_System SHALL 해당 프로바이더 연결을 Accounts_Collection에서 제거한다.
6. IF 사용자가 마지막 남은 로그인 수단(Linked_Account 또는 Credentials_Provider)의 연결을 해제하려고 하면, THEN THE Auth_System SHALL 연결 해제를 거부하고 "최소 하나의 로그인 수단이 필요합니다" 메시지를 표시한다.
7. IF Linked_Account 연결 해제 중 오류가 발생하면, THEN THE Auth_System SHALL 오류 메시지를 표시하고 기존 연결 상태를 유지한다.
8. IF Primary_Account가 소셜 계정인 사용자가 Credentials_Provider 로그인을 추가(연결)하고자 할 경우, THE Account_Settings_Page SHALL 비밀번호 설정 폼을 제공하고, 입력된 비밀번호를 해시하여 Users_Collection에 저장함으로써 Credentials_Provider 로그인을 활성화한다.

### Requirement 6: 계정 연동 API 엔드포인트

**User Story:** As a 프론트엔드 개발자, I want 계정 연동 상태를 조회하고 관리할 수 있는 API가 필요하다, so that Account_Settings_Page에서 계정 관리 기능을 구현할 수 있다.

#### Acceptance Criteria

1. WHEN 인증된 사용자가 연결된 계정 목록 조회 API를 호출하면, THE Auth_System SHALL 해당 사용자의 모든 Linked_Account 정보(프로바이더 이름, 연결 일시)를 반환한다.
2. WHEN 인증된 사용자가 계정 연결 해제 API를 호출하면, THE Auth_System SHALL 지정된 프로바이더의 연결 정보를 Accounts_Collection에서 제거한다.
3. IF 인증되지 않은 사용자가 계정 연동 API를 호출하면, THEN THE Auth_System SHALL 401 Unauthorized 응답을 반환한다.
4. IF 존재하지 않는 프로바이더의 연결 해제를 요청하면, THEN THE Auth_System SHALL 404 Not Found 응답을 반환한다.
5. IF 마지막 로그인 수단의 연결 해제를 요청하면, THEN THE Auth_System SHALL 400 Bad Request 응답과 함께 사유를 반환한다.

### Requirement 7: 소셜 로그인 프로필 정보 동기화

**User Story:** As a 소셜 로그인 사용자, I want 소셜 계정의 프로필 정보가 서비스에 반영되길 원한다, so that 별도로 프로필을 설정하지 않아도 된다.

#### Acceptance Criteria

1. WHEN 사용자가 소셜 계정으로 최초 가입하면, THE Auth_System SHALL OAuth_Provider가 제공하는 이름과 프로필 이미지를 Users_Collection에 저장한다.
2. WHEN 이미 프로필 정보가 존재하는 사용자가 새 OAuth_Provider를 연결하면, THE Auth_System SHALL 기존 프로필 정보를 유지하고 변경하지 않는다.
3. THE Auth_System SHALL 사용자의 provider 필드에 Primary_Account의 프로바이더 이름을 저장한다.

### Requirement 8: Account_Linking 시 보안 처리

**User Story:** As a 사용자, I want 내 계정이 무단으로 다른 소셜 계정에 연결되지 않길 원한다, so that 계정 보안이 유지된다.

#### Acceptance Criteria

1. THE Auth_System SHALL 로그인 시점에서의 자동 Account_Linking을 수행하지 않으며, Auth.js의 기본 보안 정책(OAuthAccountNotLinked 에러)을 준수한다.
2. WHEN Account_Settings_Page에서 수동으로 계정을 연결할 때, THE Auth_System SHALL 현재 로그인된 세션이 유효한 경우에만 연결을 허용한다.
3. IF OAuth_Provider가 이메일 검증 상태(email_verified)를 false로 반환하면, THEN THE Auth_System SHALL 해당 프로바이더의 계정 연결을 거부한다.
4. THE Auth_System SHALL Account_Linking 이벤트(연결, 해제)를 서버 로그에 기록한다.

### Requirement 9: 기존 OAuth 프로바이더 설정 정비

**User Story:** As a 개발자, I want 기존 Google, Kakao, Naver OAuth 프로바이더가 Account_Linking과 호환되도록 정비하고 싶다, so that 모든 프로바이더에서 일관된 계정 연동 경험을 제공할 수 있다.

#### Acceptance Criteria

1. THE Auth_System SHALL Google, Kakao, Naver, X(Twitter) 모든 OAuth_Provider에 대해 동일한 Account_Linking 로직을 적용한다.
2. WHEN 기존 소셜 로그인 사용자가 로그인하면, THE Auth_System SHALL Accounts_Collection에 해당 프로바이더 연결 정보가 존재하는지 확인하고, 없으면 자동으로 생성한다.
3. THE Auth_System SHALL 기존 Users_Collection의 provider 필드와 Accounts_Collection의 데이터 정합성을 유지한다.

### Requirement 10: 로그인 오류 페이지 개선

**User Story:** As a 사용자, I want OAuth 로그인 실패 시 명확한 안내를 받고 싶다, so that 문제를 이해하고 대안을 찾을 수 있다.

#### Acceptance Criteria

1. WHEN OAuth 인증 과정에서 오류가 발생하면, THE Auth_System SHALL 오류 유형에 따른 구체적인 메시지를 오류 페이지(`/auth/error`)에 표시한다.
2. THE Auth_System SHALL 오류 페이지에서 Sign_In_Page로 돌아가는 링크를 제공한다.
3. WHEN "OAuthAccountNotLinked" 오류가 발생하면, THE Auth_System SHALL "이미 다른 로그인 방식으로 가입된 이메일입니다. 기존 방식으로 로그인한 후 계정 설정에서 소셜 계정을 연결해주세요." 메시지를 표시한다.
