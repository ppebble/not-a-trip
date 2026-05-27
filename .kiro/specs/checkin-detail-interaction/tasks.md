# Implementation Plan: Check-in Detail Interaction

## Overview

사이트 전반의 인증 카드가 동일한 상세 보기 경험을 열도록 통일한다. 기존 스팟 상세 `CheckInGallery`는 동작하지만, 갤러리 메인 피드/콘텐츠별 피드/명예의 전당은 공통 상세 모달과 연결이 빠져 있고, 상세 모달은 `checkInId` 기반 지연 로딩과 접근성 요구사항을 아직 충족하지 못한다.

## Tasks

- [x] 1. 단일 인증 상세 API 보강
  - [x] 1.1 `GET /api/checkins/[id]`에 ID 형식 검증 추가
  - [x] 1.2 존재하지 않는 인증 404 / 잘못된 ID 400 응답 정리
  - [x] 1.3 상세 응답에 `relationId`, `contentName` 등 모달에 필요한 필드 포함

- [x] 2. `CheckInDetailModal` 확장
  - [x] 2.1 `checkIn` 전체 객체 또는 `checkInId` 단독 입력 둘 다 지원
  - [x] 2.2 `checkInId` 모드에서 로딩/에러/재시도 상태 추가
  - [x] 2.3 역할/포커스 트랩/Escape/포커스 복귀 등 접근성 보강
  - [x] 2.4 관련 스팟/콘텐츠/코스 링크 표시 유지

- [x] 3. 갤러리 화면 연동
  - [x] 3.1 실시간 피드 카드 클릭/키보드 시 상세 모달 열기
  - [x] 3.2 콘텐츠별 피드 카드 클릭/키보드 시 상세 모달 열기
  - [x] 3.3 명예의 전당 체크인 카드 클릭/키보드 시 `checkInId` 기반 상세 모달 열기
  - [x] 3.4 기존 스팟 상세 `CheckInGallery` 동작 회귀 없음 확인

- [x] 4. 회귀 테스트
  - [x] 4.1 `/api/checkins/[id]` 성공/404/400 테스트 추가
  - [x] 4.2 `CheckInDetailModal` 즉시 렌더/지연 로딩/재시도/접근성 테스트 추가
  - [x] 4.3 `GalleryContent`의 피드/명예의 전당 모달 연결 테스트 추가

- [x] 5. 검증
  - [x] 5.1 대상 Jest 테스트 실행
  - [x] 5.2 `npm run type-check`

## Notes

- 프로필의 인증 갤러리와 스팟 상세 `CheckInGallery`는 기존 공통 모달 경로를 유지한다.
- 명예의 전당 체크인 카드는 전체 `CheckIn` 객체가 없으므로 `checkInId` 기반 모달 로딩이 핵심이다.
