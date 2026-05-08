# Requirements Document

## Introduction

Not a Trip 플랫폼의 API 보안 및 남용 방지 시스템을 구축합니다. 현재 체크인, 댓글, 신고, 업로드 API에 레이트 리밋, 스팸 방지, 콘텐츠 모더레이션, 입력 sanitization 등의 보안 조치가 없어 남용에 취약합니다. 이 기능은 IP 기반/유저 기반 레이트 리밋, 연속 제출 제한, NSFW 이미지 감지, 업로드 abuse 방어, 인증 보안 강화, XSS/인젝션 방어를 포함합니다.

## Glossary

- **Rate_Limiter**: API 요청 빈도를 제한하는 미들웨어 모듈
- **Spam_Guard**: 동일 사용자의 연속적인 콘텐츠 제출을 감지하고 차단하는 모듈
- **Content_Moderator**: 업로드된 이미지의 NSFW 콘텐츠를 감지하는 모듈
- **Upload_Guard**: 동일 이미지 반복 업로드 및 업로드 남용을 방어하는 모듈
- **Auth_Security**: 세션 관리 및 비정상 로그인 감지를 담당하는 모듈
- **Input_Sanitizer**: 사용자 입력에서 XSS/인젝션 공격 벡터를 제거하는 모듈
- **Sliding_Window**: 시간 윈도우 내 요청 수를 추적하는 레이트 리밋 알고리즘
- **Fingerprint**: 이미지 파일의 고유 해시값 (SHA-256 기반)

## Requirements

### Requirement 1: API 레이트 리밋

**User Story:** As a 플랫폼 운영자, I want API 요청 빈도를 제한하고 싶다, so that DDoS 공격과 API 남용으로부터 서비스를 보호할 수 있다.

#### Acceptance Criteria

1. WHEN 동일 IP에서 1분 내 60회 이상의 API 요청이 발생하면, THE Rate_Limiter SHALL 해당 IP의 요청을 429 상태 코드와 함께 거부한다
2. WHEN 인증된 동일 사용자가 1분 내 30회 이상의 쓰기 API 요청(POST/PUT/DELETE)을 보내면, THE Rate_Limiter SHALL 해당 사용자의 쓰기 요청을 429 상태 코드와 함께 거부한다
3. WHEN 요청이 레이트 리밋에 의해 거부되면, THE Rate_Limiter SHALL 응답 헤더에 Retry-After 값(초 단위)을 포함한다
4. WHEN 레이트 리밋 윈도우가 만료되면, THE Rate_Limiter SHALL 해당 IP 또는 사용자의 요청 카운터를 초기화한다
5. THE Rate_Limiter SHALL Sliding_Window 알고리즘을 사용하여 요청 빈도를 추적한다
6. WHILE 레이트 리밋이 적용되는 동안, THE Rate_Limiter SHALL 응답 헤더에 X-RateLimit-Remaining과 X-RateLimit-Reset 값을 포함한다

### Requirement 2: 스팸 방지 (연속 제출 제한)

**User Story:** As a 플랫폼 운영자, I want 체크인과 댓글의 연속 제출을 제한하고 싶다, so that 스팸 콘텐츠로 인한 서비스 품질 저하를 방지할 수 있다.

#### Acceptance Criteria

1. WHEN 동일 사용자가 5분 내에 동일 스팟에 2회 이상 체크인을 시도하면, THE Spam_Guard SHALL 해당 요청을 거부하고 남은 대기 시간을 응답에 포함한다
2. WHEN 동일 사용자가 30초 내에 댓글을 2회 이상 작성하려 하면, THE Spam_Guard SHALL 해당 요청을 거부하고 남은 대기 시간을 응답에 포함한다
3. WHEN 동일 사용자가 10분 내에 신고를 3회 이상 제출하려 하면, THE Spam_Guard SHALL 해당 요청을 거부하고 남은 대기 시간을 응답에 포함한다
4. WHEN 동일 사용자가 1시간 내에 게시글을 10개 이상 작성하려 하면, THE Spam_Guard SHALL 해당 요청을 거부하고 남은 대기 시간을 응답에 포함한다
5. IF 스팸 방지 규칙에 의해 요청이 거부되면, THEN THE Spam_Guard SHALL 429 상태 코드와 구체적인 거부 사유를 응답 본문에 포함한다

### Requirement 3: 이미지 콘텐츠 모더레이션

**User Story:** As a 플랫폼 운영자, I want 업로드된 이미지에서 NSFW 콘텐츠를 감지하고 싶다, so that 부적절한 콘텐츠가 플랫폼에 게시되는 것을 방지할 수 있다.

#### Acceptance Criteria

1. WHEN 이미지가 업로드되면, THE Content_Moderator SHALL 해당 이미지에 대해 NSFW 감지 분석을 수행한다
2. WHEN NSFW 감지 점수가 임계값(0.7) 이상이면, THE Content_Moderator SHALL 해당 이미지 업로드를 거부하고 사유를 응답에 포함한다
3. IF NSFW 감지 서비스가 응답하지 않으면, THEN THE Content_Moderator SHALL 이미지 업로드를 허용하되 관리자 검토 대기 상태로 표시한다
4. WHEN NSFW 감지 분석이 완료되면, THE Content_Moderator SHALL 분석 결과(점수, 카테고리)를 로그에 기록한다
5. THE Content_Moderator SHALL 분석 처리 시간이 5초를 초과하지 않도록 타임아웃을 설정한다

### Requirement 4: 업로드 Abuse 방어

**User Story:** As a 플랫폼 운영자, I want 동일 이미지 반복 업로드와 업로드 남용을 차단하고 싶다, so that 스토리지 낭비와 시스템 부하를 방지할 수 있다.

#### Acceptance Criteria

1. WHEN 이미지가 업로드되면, THE Upload_Guard SHALL 해당 이미지의 SHA-256 Fingerprint를 계산한다
2. WHEN 동일 사용자가 동일 Fingerprint의 이미지를 24시간 내에 재업로드하면, THE Upload_Guard SHALL 기존 이미지 URL을 반환하고 중복 저장을 방지한다
3. WHEN 동일 사용자가 1시간 내에 20개 이상의 이미지를 업로드하면, THE Upload_Guard SHALL 해당 사용자의 업로드 요청을 거부한다
4. WHEN 업로드 요청이 인증되지 않은 사용자로부터 발생하면, THE Upload_Guard SHALL 해당 요청을 401 상태 코드와 함께 거부한다
5. THE Upload_Guard SHALL 업로드된 이미지의 Fingerprint와 메타데이터(사용자 ID, 업로드 시각)를 데이터베이스에 저장한다

### Requirement 5: 인증 보안 강화

**User Story:** As a 플랫폼 운영자, I want 세션 관리를 강화하고 비정상 로그인을 감지하고 싶다, so that 계정 탈취와 무단 접근을 방지할 수 있다.

#### Acceptance Criteria

1. THE Auth_Security SHALL JWT 토큰의 만료 시간을 24시간으로 설정한다
2. WHEN 사용자가 30일 이상 비활성 상태이면, THE Auth_Security SHALL 다음 접근 시 재인증을 요구한다
3. WHEN 동일 계정에서 5분 내에 5회 이상 로그인 실패가 발생하면, THE Auth_Security SHALL 해당 계정의 로그인을 15분간 차단한다
4. WHEN 로그인 차단이 발생하면, THE Auth_Security SHALL 차단 사유와 해제 예정 시각을 응답에 포함한다
5. WHEN 새로운 기기 또는 IP에서 로그인이 성공하면, THE Auth_Security SHALL 해당 이벤트를 보안 로그에 기록한다
6. IF 동일 계정이 3개 이상의 서로 다른 IP에서 동시에 활성 세션을 유지하면, THEN THE Auth_Security SHALL 해당 상황을 보안 로그에 경고로 기록한다

### Requirement 6: XSS/인젝션 방어

**User Story:** As a 플랫폼 운영자, I want 사용자 입력에서 악성 코드를 제거하고 싶다, so that XSS 공격과 인젝션 공격으로부터 사용자를 보호할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자 입력이 API에 전달되면, THE Input_Sanitizer SHALL HTML 태그와 스크립트 코드를 제거한다
2. WHEN 사용자 입력에 MongoDB 쿼리 연산자($로 시작하는 키)가 포함되면, THE Input_Sanitizer SHALL 해당 연산자를 제거하거나 이스케이프 처리한다
3. THE Input_Sanitizer SHALL 체크인 댓글, 게시글 제목, 게시글 본문, 신고 설명 필드에 sanitization을 적용한다
4. WHEN sanitization이 적용된 후, THE Input_Sanitizer SHALL 원본 텍스트의 의미를 보존하면서 안전한 문자열을 반환한다
5. THE Input_Sanitizer SHALL URL 필드에 대해 허용된 프로토콜(http, https)만 통과시키고 javascript: 프로토콜을 차단한다
6. WHEN sanitization에 의해 입력이 변경되면, THE Input_Sanitizer SHALL 변경 사실을 서버 로그에 기록한다

