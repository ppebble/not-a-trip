# Implementation Plan: Not a Trip Rebrand

## Overview

기존 "애니메이션 성지순례 맵" 플랫폼을 "Not a Trip"으로 리브랜딩하고, 다양한 카테고리의 특별한 여행지를 지원하도록 확장합니다. 사용자가 직접 스팟을 등록/수정/삭제할 수 있는 기능을 추가합니다.

## Tasks

- [x] 1. 데이터 모델 및 타입 확장
  - [x] 1.1 SpotCategory 및 ContentType 타입 정의
    - `src/types/index.ts`에 SpotCategory, ContentType 타입 추가
    - CATEGORY_CONFIG 상수 정의 (아이콘, 색상, 라벨)
    - _Requirements: 2.1, 3.1_
  - [x] 1.2 Spot 모델 확장
    - `category` 필드 추가
    - `relatedMedia` → `relatedContent` 필드명 변경
    - `authorId`, `authorName` 필드 추가 (회원 전용)
    - _Requirements: 3.1, 3.2, 4.8_
  - [x] 1.3 RelatedContent 인터페이스 정의
    - name, type, year, additionalInfo 필드 정의
    - ContentType 타입 적용
    - _Requirements: 3.3_

- [x] 2. 브랜딩 및 UI 업데이트
  - [x] 2.1 헤더 컴포넌트 업데이트
    - 사이트명 "Not a Trip"으로 변경
    - "스팟 등록" 버튼/링크 추가
    - 네비게이션 항목 업데이트 (홈, 커뮤니티, 스팟 등록, 로그인/프로필)
    - _Requirements: 1.1, 7.1, 7.2, 7.3_
  - [x] 2.2 메타데이터 업데이트
    - 페이지 타이틀 및 메타 설명 변경
    - `src/app/layout.tsx` 수정
    - _Requirements: 1.2_
  - [x] 2.3 UI 텍스트 업데이트
    - "성지순례" → "특별한 여행지" 용어 변경
    - 관련 컴포넌트 텍스트 수정
    - _Requirements: 1.3_

- [ ] 3. Checkpoint - 브랜딩 업데이트 확인
  - 헤더 및 메타데이터 변경 확인
  - 사용자 피드백 수렴

- [x] 4. 카테고리 시스템 구현
  - [x] 4.1 CategoryFilter 컴포넌트 구현
    - `src/components/map/CategoryFilter.tsx` 생성
    - 카테고리별 체크박스/버튼 UI
    - 선택된 카테고리 상태 관리
    - _Requirements: 2.2_
  - [x] 4.2 SpotPin 카테고리 표시 업데이트
    - 카테고리별 색상/아이콘 적용
    - `src/components/map/SpotPin.tsx` 수정
    - _Requirements: 2.4_
  - [x] 4.3 스팟 API 카테고리 필터링 추가
    - `GET /api/spots?category=animation,sports` 지원
    - `src/app/api/spots/route.ts` 수정
    - _Requirements: 2.2_
  - [ ]\* 4.4 카테고리 필터 정확성 속성 테스트
    - **Property 2: 카테고리 필터 정확성**
    - _For any_ 카테고리 필터 적용 시, 반환되는 모든 스팟은 선택된 카테고리에 속해야 함
    - **Validates: Requirements 2.2**
  - [x] 4.5 메인 페이지에 카테고리 필터 통합
    - `src/app/page.tsx`에 CategoryFilter 추가
    - 필터 상태에 따른 스팟 표시
    - _Requirements: 2.2_

- [-] 5. 스팟 등록 페이지 구현 (회원 전용)
  - [x] 5.1 스팟 등록 페이지 생성
    - `src/app/spots/register/page.tsx` 생성
    - 기본 폼 레이아웃 구현
    - 비로그인 시 로그인 페이지로 리다이렉트
    - _Requirements: 4.1, 4.8_
  - [x] 5.2 스팟 등록 폼 구현
    - 필수 필드: 이름, 설명, 주소, 카테고리
    - 선택 필드: 사진 (최대 5장), 관련 콘텐츠
    - 로그인 사용자 정보 자동 설정 (authorId, authorName)
    - _Requirements: 4.2, 4.3_
  - [x] 5.3 AddressSearch 컴포넌트 구현
    - `src/components/spot/AddressSearch.tsx` 생성
    - 주소 검색/자동완성 기능
    - 선택 시 좌표 자동 설정
    - _Requirements: 4.4, 4.5_
  - [x] 5.4 LocationPicker 컴포넌트 구현
    - `src/components/spot/LocationPicker.tsx` 생성
    - 지도 클릭으로 위치 선택
    - 마커 드래그 기능
    - 역지오코딩 주소 제안
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 5.5 RelatedContentForm 컴포넌트 구현
    - `src/components/spot/RelatedContentForm.tsx` 생성
    - 관련 콘텐츠 추가/삭제 UI
    - 콘텐츠 타입 선택
    - _Requirements: 4.3_
  - [x] 5.6 스팟 등록 API 구현
    - `POST /api/spots` 구현
    - 필수 필드 유효성 검사
    - 인증된 사용자만 등록 가능 (세션 검증)
    - authorId, authorName 자동 설정
    - _Requirements: 4.2, 4.6, 4.8_
  - [ ]\* 5.7 스팟 등록 필수 필드 검증 속성 테스트
    - **Property 4: 스팟 등록 필수 필드 검증**
    - _For any_ 스팟 등록 요청에서, 이름, 설명, 주소, 좌표, 카테고리가 없으면 등록이 거부되어야 함
    - **Validates: Requirements 4.2, 4.6**
  - [ ]\* 5.8 스팟 등록 인증 검증 속성 테스트
    - **Property 7: 스팟 등록 인증 검증**
    - _For any_ 스팟 등록 요청에서, 인증되지 않은 사용자는 등록이 거부되어야 함
    - **Validates: Requirements 4.8**
  - [x] 5.9 useSpotRegistration 훅 구현
    - `src/hooks/useSpotRegistration.ts` 생성
    - 스팟 등록 mutation
    - 폼 상태 관리
    - _Requirements: 4.7_

- [x] 6. Checkpoint - 스팟 등록 기능 확인
  - 스팟 등록 폼 동작 확인
  - 비로그인 시 리다이렉트 확인
  - 회원 등록 테스트
  - 사용자 피드백 수렴

- [x] 7. 스팟 수정/삭제 기능 구현 (회원 전용)
  - [x] 7.1 스팟 수정 페이지 구현
    - `src/app/spots/[id]/edit/page.tsx` 생성
    - 기존 데이터 로드 및 수정 폼
    - 본인 스팟만 수정 가능
    - _Requirements: 6.1_
  - [x] 7.2 스팟 수정 API 구현
    - `PUT /api/spots/[id]` 구현
    - 인증된 사용자만 수정 가능
    - 본인 스팟 여부 검증 (authorId === userId)
    - _Requirements: 6.2_
  - [x] 7.3 스팟 삭제 API 구현
    - `DELETE /api/spots/[id]` 구현
    - 인증된 사용자만 삭제 가능
    - 본인 스팟 여부 검증
    - 연관 데이터 (scenes, posts) 처리
    - _Requirements: 6.4_
  - [ ]\* 7.4 스팟 수정 권한 검증 속성 테스트
    - **Property 5: 스팟 수정 권한 검증**
    - _For any_ 스팟 수정 요청에서, 인증된 사용자만 본인 스팟을 수정할 수 있어야 함
    - **Validates: Requirements 6.2**
  - [ ]\* 7.5 스팟 삭제 무결성 속성 테스트
    - **Property 6: 스팟 삭제 무결성**
    - _For any_ 스팟 삭제 시, 해당 스팟과 연관된 모든 데이터가 함께 삭제되어야 함
    - **Validates: Requirements 6.4**
  - [x] 7.6 스팟 상세 페이지에 수정/삭제 버튼 추가
    - 본인 스팟인 경우에만 버튼 표시
    - _Requirements: 6.1, 6.5_

- [ ] 8. UI/UX 리팩토링 및 컴포넌트 통합
  - [x] 8.1 리팩토링 방침 수립
    - 전체 화면 검토 및 공통 패턴 분석
    - 재사용 가능한 컴포넌트 식별
    - 리팩토링 우선순위 결정
  - [x] 8.2 SpotForm 공통 컴포넌트 생성
    - `src/components/spot/SpotForm.tsx` 생성
    - 등록/수정 페이지에서 공유하는 폼 로직 통합
    - props로 mode (create/edit) 구분
  - [x] 8.3 AddressSearch 초기값 표시 버그 수정
    - 수정 페이지에서 기존 주소가 표시되도록 수정
    - initialValue prop 동작 확인
  - [x] 8.4 등록/수정 페이지 SpotForm 적용
    - `src/app/spots/register/page.tsx` 리팩토링
    - `src/app/spots/[id]/edit/page.tsx` 리팩토링
  - [-] 8.5 기타 공통 컴포넌트 추출 (필요시)
    - 검토 결과에 따라 추가 리팩토링

- [x] 9. 사진 업로드 기능 구현
  - [x] 9.1 ImageUpload 컴포넌트 구현
    - `src/components/spot/ImageUpload.tsx` 생성
    - 드래그 앤 드롭 지원
    - 이미지 미리보기
    - 최대 5장 제한
  - [x] 9.2 이미지 업로드 API 연동
    - 기존 `/api/upload` 활용
    - 업로드 진행률 표시
  - [x] 9.3 스팟 등록/수정 폼에 ImageUpload 통합
    - SpotForm에 사진 업로드 섹션 연동
    - 기존 사진 표시 및 삭제 기능
  - [x] 9.4 업로드된 이미지 관리
    - 이미지 순서 변경
    - 개별 이미지 삭제

- [x] 10. Checkpoint - 리팩토링 및 사진 업로드 확인
  - SpotForm 컴포넌트 동작 확인
  - 사진 업로드 기능 테스트
  - 사용자 피드백 수렴

- [ ] 11. 데이터 마이그레이션
  - [ ] 11.1 마이그레이션 스크립트 작성
    - `scripts/migrate-spots.ts` 생성
    - `relatedMedia` → `relatedContent` 변환
    - 기존 스팟에 `category: 'animation'` 기본값 설정
    - 기존 스팟에 `authorName: 'System'` 설정 (시스템 등록 스팟)
    - _Requirements: 3.4_
  - [ ]\* 11.2 마이그레이션 데이터 무결성 속성 테스트
    - **Property 3: 콘텐츠 타입 유효성 및 마이그레이션**
    - _For any_ 마이그레이션된 스팟에서, relatedContent의 모든 항목은 유효한 ContentType을 가져야 함
    - **Validates: Requirements 3.3, 3.4**
  - [ ] 11.3 마이그레이션 실행 및 검증
    - 마이그레이션 스크립트 실행
    - 데이터 무결성 확인
    - _Requirements: 3.4_

- [ ] 12. 스팟 상세 페이지 카테고리 표시
  - [ ] 12.1 스팟 상세 페이지 카테고리 UI 추가
    - 카테고리 아이콘 및 라벨 표시
    - `src/app/spots/[id]/page.tsx` 수정
    - _Requirements: 2.3_
  - [ ] 12.2 관련 콘텐츠 표시 업데이트
    - relatedContent 형식으로 표시
    - 콘텐츠 타입별 아이콘
    - _Requirements: 3.3_

- [ ] 13. Final Checkpoint - 전체 기능 완료 확인
  - 모든 테스트 통과 확인
  - 브랜딩 일관성 확인
  - 사용자 피드백 최종 수렴

## Notes

- Tasks marked with `*` are optional property-based tests
- 기존 anime-pilgrimage-map 기능과의 호환성 유지 필요
- 마이그레이션은 기존 데이터 손실 없이 진행
- 카테고리 시스템은 확장 가능하도록 설계
