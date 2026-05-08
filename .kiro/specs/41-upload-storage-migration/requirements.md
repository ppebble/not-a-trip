# Requirements Document

## Introduction

현재 `src/app/api/upload/route.ts`는 `public/uploads` 로컬 파일시스템에 이미지를 저장하는 단일 서버 개발용 구조입니다. 이를 S3 호환 오브젝트 스토리지(Cloudflare R2)로 전환하여 CDN 기반 이미지 서빙, 자동 썸네일 생성, WebP 변환, 용량 제한 정책을 적용합니다. 기존 로컬 이미지의 마이그레이션 스크립트도 포함합니다.

## Glossary

- **Upload_Service**: 이미지 업로드 요청을 처리하고 오브젝트 스토리지에 저장하는 API 서비스
- **Storage_Client**: S3 호환 API를 통해 Cloudflare R2 버킷과 통신하는 클라이언트 모듈
- **Thumbnail_Generator**: 업로드된 원본 이미지로부터 지정된 크기의 썸네일을 생성하는 모듈
- **Image_Converter**: 이미지를 WebP 포맷으로 변환하는 모듈
- **Rate_Limiter**: 사용자별 일일 업로드 용량을 추적하고 제한하는 모듈
- **Migration_Script**: 기존 `public/uploads` 디렉토리의 로컬 이미지를 오브젝트 스토리지로 이전하는 스크립트
- **CDN_URL**: Cloudflare R2 퍼블릭 버킷 또는 커스텀 도메인을 통해 제공되는 이미지 접근 URL
- **Original_Image**: 업로드된 원본 크기의 이미지 (WebP 변환 후)
- **Pin_Thumbnail**: 지도 마커 표시용 64×64px 썸네일
- **Card_Thumbnail**: 카드 UI 표시용 256×256px 썸네일

## Requirements

### Requirement 1: S3 호환 오브젝트 스토리지 업로드

**User Story:** As a 개발자, I want 이미지를 S3 호환 오브젝트 스토리지에 저장하고 싶다, so that 단일 서버 의존성을 제거하고 확장 가능한 스토리지를 사용할 수 있다.

#### Acceptance Criteria

1. WHEN 이미지 업로드 요청이 수신되면, THE Upload_Service SHALL Storage_Client를 통해 Cloudflare R2 버킷에 이미지를 저장한다
2. WHEN 이미지 저장이 완료되면, THE Upload_Service SHALL CDN_URL 형식의 이미지 접근 경로를 응답으로 반환한다
3. THE Storage_Client SHALL AWS S3 호환 SDK(@aws-sdk/client-s3)를 사용하여 R2 버킷과 통신한다
4. WHEN 스토리지 연결에 실패하면, THE Upload_Service SHALL 에러 코드와 설명 메시지를 포함한 응답을 반환한다
5. THE Upload_Service SHALL 업로드된 파일을 `uploads/{year}/{month}/{timestamp}-{randomId}` 경로 구조로 저장한다

### Requirement 2: 자동 썸네일 생성

**User Story:** As a 사용자, I want 업로드한 이미지의 썸네일이 자동으로 생성되길 원한다, so that 지도 핀과 카드 UI에서 최적화된 이미지를 볼 수 있다.

#### Acceptance Criteria

1. WHEN 이미지 업로드가 완료되면, THE Thumbnail_Generator SHALL Pin_Thumbnail(64×64px)을 생성한다
2. WHEN 이미지 업로드가 완료되면, THE Thumbnail_Generator SHALL Card_Thumbnail(256×256px)을 생성한다
3. WHEN 이미지 업로드가 완료되면, THE Thumbnail_Generator SHALL Original_Image를 별도로 저장한다
4. THE Thumbnail_Generator SHALL 원본 이미지의 비율을 유지하면서 지정된 크기에 맞게 크롭한다
5. THE Upload_Service SHALL 응답에 Original_Image, Pin_Thumbnail, Card_Thumbnail 각각의 CDN_URL을 포함한다
6. IF Thumbnail_Generator가 썸네일 생성에 실패하면, THEN THE Upload_Service SHALL Original_Image URL만 반환하고 에러를 로깅한다

### Requirement 3: WebP 자동 변환

**User Story:** As a 개발자, I want 업로드된 이미지가 자동으로 WebP 포맷으로 변환되길 원한다, so that 이미지 용량을 줄이고 로딩 속도를 개선할 수 있다.

#### Acceptance Criteria

1. WHEN JPEG, PNG, GIF 포맷의 이미지가 업로드되면, THE Image_Converter SHALL 해당 이미지를 WebP 포맷으로 변환한다
2. WHEN WebP 포맷의 이미지가 업로드되면, THE Image_Converter SHALL 추가 변환 없이 원본을 그대로 사용한다
3. THE Image_Converter SHALL WebP 변환 시 품질을 80으로 설정한다
4. THE Thumbnail_Generator SHALL 썸네일도 WebP 포맷으로 생성한다
5. IF Image_Converter가 변환에 실패하면, THEN THE Upload_Service SHALL 원본 포맷 그대로 저장하고 에러를 로깅한다

### Requirement 4: 업로드 용량 제한

**User Story:** As a 서비스 운영자, I want 사용자별 업로드 용량을 제한하고 싶다, so that 스토리지 비용을 관리하고 악용을 방지할 수 있다.

#### Acceptance Criteria

1. WHEN 단일 파일 크기가 10MB를 초과하면, THE Upload_Service SHALL 업로드를 거부하고 파일 크기 초과 에러를 반환한다
2. WHEN 사용자의 일일 업로드 총량이 50MB를 초과하면, THE Rate_Limiter SHALL 업로드를 거부하고 일일 한도 초과 에러를 반환한다
3. THE Rate_Limiter SHALL 사용자별 일일 업로드 용량을 MongoDB에 기록한다
4. THE Rate_Limiter SHALL 매일 자정(UTC+9 기준)에 사용자별 일일 사용량을 초기화한다
5. WHEN 인증되지 않은 사용자가 업로드를 시도하면, THE Upload_Service SHALL 인증 필요 에러를 반환한다

### Requirement 5: 파일 형식 검증

**User Story:** As a 서비스 운영자, I want 허용된 이미지 형식만 업로드 가능하게 하고 싶다, so that 보안 위험을 줄이고 일관된 이미지 처리를 보장할 수 있다.

#### Acceptance Criteria

1. THE Upload_Service SHALL JPEG, PNG, GIF, WebP 형식의 파일만 허용한다
2. WHEN 허용되지 않은 파일 형식이 업로드되면, THE Upload_Service SHALL 지원하지 않는 형식임을 명시한 에러를 반환한다
3. THE Upload_Service SHALL 파일의 MIME 타입과 매직 바이트를 모두 검증한다
4. IF 파일 확장자와 실제 MIME 타입이 불일치하면, THEN THE Upload_Service SHALL 업로드를 거부하고 형식 불일치 에러를 반환한다

### Requirement 6: CDN URL 반환 구조

**User Story:** As a 프론트엔드 개발자, I want 업로드 응답에서 용도별 CDN URL을 받고 싶다, so that 각 UI 컴포넌트에 적합한 크기의 이미지를 사용할 수 있다.

#### Acceptance Criteria

1. WHEN 업로드가 성공하면, THE Upload_Service SHALL 다음 구조의 JSON 응답을 반환한다: `{ original: CDN_URL, pin: CDN_URL, card: CDN_URL }`
2. THE Upload_Service SHALL 모든 CDN_URL을 절대 경로(https://)로 반환한다
3. WHEN 기존 코드에서 `/uploads/` 상대 경로를 참조하면, THE Upload_Service SHALL 해당 경로를 CDN_URL로 대체할 수 있는 유틸리티 함수를 제공한다

### Requirement 7: 기존 로컬 이미지 마이그레이션

**User Story:** As a 개발자, I want 기존 `public/uploads`의 이미지를 오브젝트 스토리지로 이전하고 싶다, so that 모든 이미지가 동일한 CDN 경로로 서빙될 수 있다.

#### Acceptance Criteria

1. THE Migration_Script SHALL `public/uploads` 디렉토리의 모든 이미지 파일을 R2 버킷으로 업로드한다
2. WHEN 마이그레이션이 실행되면, THE Migration_Script SHALL 각 파일에 대해 WebP 변환과 썸네일 생성을 수행한다
3. WHEN 마이그레이션이 완료되면, THE Migration_Script SHALL 기존 로컬 경로와 새 CDN_URL의 매핑 테이블을 JSON 파일로 출력한다
4. THE Migration_Script SHALL MongoDB의 Spot 문서에서 이미지 경로를 새 CDN_URL로 업데이트한다
5. IF 개별 파일 마이그레이션이 실패하면, THEN THE Migration_Script SHALL 해당 파일을 건너뛰고 실패 목록을 별도로 기록한다
6. THE Migration_Script SHALL 실행 진행률을 콘솔에 표시한다

### Requirement 8: 환경 설정

**User Story:** As a 개발자, I want 스토리지 설정을 환경 변수로 관리하고 싶다, so that 환경별로 다른 스토리지를 사용할 수 있다.

#### Acceptance Criteria

1. THE Storage_Client SHALL 다음 환경 변수를 사용한다: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
2. IF 필수 환경 변수가 설정되지 않은 상태에서 업로드가 시도되면, THEN THE Upload_Service SHALL 스토리지 미설정 에러를 반환한다
3. THE Upload_Service SHALL `.env.example` 파일에 필요한 환경 변수 목록과 설명을 포함한다
