# 구현 계획: SpotContentRelation 독립 엔티티 마이그레이션

## 개요

기존 `Spot.relatedContent[]` 내장 배열을 독립 `SpotContentRelation` 엔티티로 승격시키는 Phase 1 마이그레이션을 구현한다. 데이터 모델 정의 → DB 설정 → 변환 유틸리티 → 마이그레이션 스크립트 → API 확장 → 훅/UI 전환 → 검색 호환성 → CRUD 동기화 순서로 점진적으로 진행하며, 기존 `relatedContent` 필드와의 하위 호환성을 유지한다.

## Tasks

- [ ] 1. 데이터 모델 및 DB 설정
  - [ ] 1.1 SpotContentRelation 타입 및 enum 정의
    - `src/types/spot.ts`에 `RelationType`, `ConfidenceLevel`, `Officialness`, `RelationStatus` 타입 추가
    - `RELATION_TYPE_LABELS` 한글 라벨 상수 추가
    - `SpotContentRelation` 인터페이스 정의 (id, spotId, contentId, contentName, contentType, relationType, confidenceLevel, officialness, displayPriority, status, summary, startDate, endDate, sourceCount, verificationScore, createdBy, updatedBy, createdAt, updatedAt)
    - `contentImageUrl` 선택 필드 포함
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ] 1.2 DB 컬렉션 상수 및 API 경로 추가
    - `src/lib/db.ts`의 `COLLECTIONS`에 `SPOT_CONTENT_RELATIONS: 'spot_content_relations'` 추가
    - `src/lib/api-routes.ts`의 `API_ROUTES.SPOTS`에 `RELATIONS: (id: string) => /api/spots/${id}/relations`, `BY_CONTENT: '/api/spots/relations/by-content'` 추가
    - _Requirements: 2.1_

  - [ ] 1.3 MongoDB 인덱스 초기화 스크립트 작성
    - `scripts/init-relation-indexes.ts` 생성
    - `spotId` 단일 인덱스, `contentName` 단일 인덱스, `{ spotId, contentName }` 복합 유니크 인덱스, `status` 단일 인덱스 생성
    - 실행 결과 콘솔 출력
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. 변환 유틸리티 및 마이그레이션 스크립트
  - [ ] 2.1 RelatedContent → SpotContentRelation 변환 유틸리티 작성
    - `src/lib/relation-utils.ts` 신규 생성
    - `normalizeContentName(name: string): string` — contentId 생성용 정규화 함수
    - `generateContentId(spotId: string, contentName: string): string` — `{spotId}_{normalizedName}` 형식
    - `convertRelatedContentToRelation(spotId: string, content: RelatedContent, index: number): SpotContentRelation` — 변환 함수
    - `getPrimaryRelation(relations: SpotContentRelation[]): SpotContentRelation | undefined` — 대표 관계 선택 (최소 displayPriority)
    - `getContentNamesFromRelations(relations?: SpotContentRelation[], relatedContent?: RelatedContent[]): string[]` — relations 우선, relatedContent 폴백
    - `getPrimaryContentName(relations?: SpotContentRelation[], relatedContent?: RelatedContent[]): string | undefined` — 대표 작품명 추출 (폴백 포함)
    - 기본값: relationType=`scene_depicted`, confidenceLevel=`medium`, officialness=`user_submitted`, status=`active`
    - summary: year와 additionalInfo 결합 (`"{year}년 · {additionalInfo}"`)
    - _Requirements: 1.3, 3.2, 3.3, 3.4, 3.5, 6.2, 7.2, 7.3, 7.4_

  - [ ]* 2.2 변환 유틸리티 속성 테스트 — Property 1: Enum 필드 유효성 검증
    - **Property 1: Enum 필드 유효성 검증**
    - `__tests__/spot-content-relation/validation.property.test.ts` 신규 생성
    - 임의의 문자열에 대해 relationType, confidenceLevel, officialness, status 유효성 검사 함수가 허용 집합 포함 시 true, 그 외 false 반환 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 1: Enum 필드 유효성 검증`
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.7**

  - [ ]* 2.3 변환 유틸리티 속성 테스트 — Property 2: 변환 데이터 보존
    - **Property 2: RelatedContent → SpotContentRelation 변환 데이터 보존**
    - `__tests__/spot-content-relation/conversion.property.test.ts` 신규 생성
    - 유효한 RelatedContent와 spotId에 대해 변환 결과의 contentName=원본 name, contentType=원본 type, contentImageUrl=원본 imageUrl, year/additionalInfo 존재 시 summary 포함 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 2: 변환 데이터 보존`
    - **Validates: Requirements 1.3, 3.4, 3.5**

  - [ ]* 2.4 변환 유틸리티 속성 테스트 — Property 3: 마이그레이션 변환 완전성
    - **Property 3: 마이그레이션 변환 완전성**
    - `__tests__/spot-content-relation/conversion.property.test.ts`에 추가
    - relatedContent[] 배열에 대해 변환 결과 수 = 배열 길이, 각 문서의 기본값(relationType=scene_depicted, confidenceLevel=medium, officialness=user_submitted, status=active), displayPriority=배열 인덱스 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 3: 마이그레이션 변환 완전성`
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 2.5 변환 유틸리티 속성 테스트 — Property 4: contentId 형식 일관성
    - **Property 4: contentId 형식 일관성**
    - `__tests__/spot-content-relation/conversion.property.test.ts`에 추가
    - 임의의 spotId와 contentName에 대해 contentId가 `{spotId}_{normalize(contentName)}` 형식이며 동일 입력 시 동일 결과(결정적) 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 4: contentId 형식 일관성`
    - **Validates: Requirements 3.2**

  - [ ]* 2.6 변환 유틸리티 속성 테스트 — Property 5: 마이그레이션 중복 건너뛰기
    - **Property 5: 마이그레이션 중복 건너뛰기 (멱등성)**
    - `__tests__/spot-content-relation/conversion.property.test.ts`에 추가
    - relatedContent[] 배열에 동일 (spotId, contentName) 조합이 여러 번 포함 시 변환 결과에 해당 조합이 정확히 한 번만 포함 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 5: 마이그레이션 중복 건너뛰기`
    - **Validates: Requirements 3.6**

  - [ ] 2.7 마이그레이션 스크립트 작성
    - `scripts/migrate-relations.ts` 생성
    - spots 컬렉션 전체 조회 → relatedContent 존재 시 각 항목을 SpotContentRelation으로 변환
    - 중복 `(spotId, contentName)` 체크 후 건너뛰기 및 로그 기록
    - 완료 시 처리 스팟 수, 생성 관계 수, 건너뛴 중복 수 콘솔 출력
    - `convertRelatedContentToRelation` 유틸리티 재사용
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 3. 체크포인트 — 데이터 모델 및 변환 유틸리티 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Relations API 엔드포인트 구현
  - [ ] 4.1 스팟별 Relations API 구현
    - `src/app/api/spots/[id]/relations/route.ts` 신규 생성
    - `GET /api/spots/[id]/relations` — 해당 스팟의 active 상태 관계를 displayPriority 오름차순으로 반환
    - 관계 없을 시 `{ relations: [], total: 0 }` 반환
    - 존재하지 않는 스팟 ID → 404, DB 오류 → 500
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 4.2 작품별 스팟 조회 API 구현
    - `src/app/api/spots/relations/by-content/route.ts` 신규 생성
    - `GET /api/spots/relations/by-content?contentName=...` — 해당 contentName의 active 관계에서 고유 spotId 목록 반환
    - contentName 파라미터 누락 시 400
    - _Requirements: 6.1, 6.4_

  - [ ]* 4.3 API 속성 테스트 — Property 6: Active 관계 필터링 및 정렬
    - **Property 6: Active 관계 필터링 및 displayPriority 정렬**
    - `__tests__/spot-content-relation/api.property.test.ts` 신규 생성
    - 다양한 status의 관계 집합에서 active만 포함, displayPriority 오름차순 정렬 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 6: Active 관계 필터링 및 정렬`
    - **Validates: Requirements 4.1, 4.2, 5.2**

  - [ ]* 4.4 API 속성 테스트 — Property 7: 작품별 스팟 조회 정확성
    - **Property 7: 작품별 스팟 조회 정확성**
    - `__tests__/spot-content-relation/api.property.test.ts`에 추가
    - 임의의 contentName에 대해 해당 contentName + active 상태의 모든 고유 spotId 반환 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 7: 작품별 스팟 조회 정확성`
    - **Validates: Requirements 6.1, 6.4**

- [ ] 5. 스팟 상세 API 확장 및 CRUD 동기화
  - [ ] 5.1 스팟 상세 API 응답에 relations 필드 추가
    - `src/app/api/spots/[id]/route.ts` GET 수정
    - spot 조회 후 spot_content_relations에서 active 관계를 displayPriority 오름차순으로 조회
    - 응답에 기존 `relatedContent` 유지 + `relations` 필드 추가
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 5.2 스팟 등록(POST) 시 relations 동기화
    - `src/app/api/spots/route.ts` POST 수정
    - relatedContent 배열의 각 항목을 spot_content_relations에 SpotContentRelation으로 생성
    - `convertRelatedContentToRelation` 유틸리티 재사용
    - _Requirements: 10.1, 10.4_

  - [ ] 5.3 스팟 수정(PUT) 시 relations 동기화
    - `src/app/api/spots/[id]/route.ts` PUT 수정
    - relatedContent 변경 시 해당 스팟의 기존 관계 삭제 후 새 relatedContent 기반 재생성
    - _Requirements: 10.2, 10.4_

  - [ ] 5.4 스팟 삭제(DELETE) 시 relations 삭제
    - `src/app/api/spots/[id]/route.ts` DELETE 수정
    - 스팟 삭제 시 해당 스팟의 모든 SpotContentRelation 문서 함께 삭제
    - _Requirements: 10.3_

  - [ ]* 5.5 CRUD 동기화 속성 테스트 — Property 12
    - **Property 12: CRUD 동기화 일관성**
    - `__tests__/spot-content-relation/sync.property.test.ts` 신규 생성
    - 생성 시 N개 relatedContent → N개 관계 생성, 수정 시 기존 삭제 후 재생성, 삭제 시 모든 관계 제거 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 12: CRUD 동기화 일관성`
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 6. 체크포인트 — API 및 CRUD 동기화 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. React Query 훅 및 SpotDetailData 확장
  - [ ] 7.1 SpotDetailData에 relations 필드 추가
    - `src/hooks/useSpots.ts`의 `SpotDetailData` 인터페이스에 `relations?: SpotContentRelation[]` 필드 추가
    - import 경로 추가
    - _Requirements: 5.1_

  - [ ] 7.2 useSpotRelations 훅 생성
    - `src/hooks/useSpotRelations.ts` 신규 생성
    - `useSpotRelations(spotId)` — `GET /api/spots/[id]/relations` 호출
    - `useSpotsByContent(contentName)` — `GET /api/spots/relations/by-content?contentName=...` 호출
    - React Query 키 팩토리 패턴 적용
    - _Requirements: 4.1, 6.1, 6.4_

- [ ] 8. UI 컴포넌트 전환
  - [ ] 8.1 RelatedContentSection 관계 기반 렌더링 전환
    - `src/components/spot/RelatedContentSection.tsx` 수정
    - props에 `relations: SpotContentRelation[]` 추가, 기존 `contents` 폴백용 유지
    - relations 우선 렌더링: 대표 관계 최대 3개 카드 → "더보기 (+N)" → 나머지 펼침
    - 각 카드에 작품명, 작품 타입 라벨, 관계 유형 한글 라벨(`RELATION_TYPE_LABELS`), summary 표시
    - 각 카드에 `/contents/{encodedContentName}` 링크 포함
    - relations 비어있고 contents도 비어있으면 섹션 숨김
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ] 8.2 SameContentSpots 관계 기반 조회 전환
    - `src/components/spot/SameContentSpots.tsx` 수정
    - props에 `relations: SpotContentRelation[]` 추가, 기존 `relatedContent` 폴백용 유지
    - 대표 관계(displayPriority 최소)의 contentName 기준으로 by-content API 호출
    - relations 없으면 기존 relatedContent[0].name 폴백
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 8.3 SpotDetailClient 데이터 전달 경로 변경
    - `src/components/spot/SpotDetailClient.tsx` 수정
    - `spot.relations`를 RelatedContentSection, SameContentSpots, RelatedRoutes에 전달
    - ShareButton의 공유 텍스트에 `getPrimaryContentName(spot.relations, spot.relatedContent)` 사용
    - RelatedRoutes에 `getContentNamesFromRelations(spot.relations, spot.relatedContent)` 전달
    - SameContentSpots/RelatedRoutes 렌더링 조건을 relations 또는 relatedContent 존재 시로 변경
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 8.4 share-utils 관계 기반 대표 작품명 전환
    - `src/lib/share-utils.ts` 수정
    - `formatSpotShareText` 시그니처 확장 또는 SpotDetailClient에서 호출 시 `getPrimaryContentName` 결과 전달
    - _Requirements: 7.2, 7.4_

  - [ ]* 8.5 유틸리티 속성 테스트 — Property 8: 대표 관계 선택
    - **Property 8: 대표 관계 선택 (최소 displayPriority)**
    - `__tests__/spot-content-relation/utils.property.test.ts` 신규 생성
    - 비어있지 않은 관계 목록에서 getPrimaryRelation이 displayPriority 최소 관계 반환 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 8: 대표 관계 선택`
    - **Validates: Requirements 6.2, 7.2**

  - [ ]* 8.6 유틸리티 속성 테스트 — Property 9: relations 부재 시 폴백
    - **Property 9: relations 부재 시 relatedContent 폴백**
    - `__tests__/spot-content-relation/utils.property.test.ts`에 추가
    - relations 비어있거나 undefined 시 relatedContent에서 데이터 추출, relations 존재 시 relations에서 추출 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 9: relations 부재 시 폴백`
    - **Validates: Requirements 7.3, 7.4**

  - [ ]* 8.7 UI 속성 테스트 — Property 10: 관계 카드 필수 정보 포함
    - **Property 10: 관계 카드 필수 정보 포함**
    - `__tests__/spot-content-relation/ui.property.test.ts` 신규 생성
    - 임의의 SpotContentRelation에 대해 렌더링 결과에 contentName, contentType 한글 라벨, relationType 한글 라벨 포함, summary 존재 시 포함, `/contents/{encodedContentName}` 링크 포함 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 10: 관계 카드 필수 정보 포함`
    - **Validates: Requirements 8.3, 8.4, 8.5, 8.7**

- [ ] 9. 검색 필터 호환성
  - [ ] 9.1 스팟 검색 API에 relations 기반 검색 추가
    - `src/app/api/spots/route.ts` GET 수정
    - 검색어 입력 시 spot_content_relations에서 contentName 부분 일치하는 spotId 목록 조회
    - 기존 relatedContent.name 검색 결과와 합산(union), 중복 spotId 제거
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 9.2 검색 속성 테스트 — Property 11: 검색 결과 합산 및 중복 제거
    - **Property 11: 검색 결과 합산 및 중복 제거**
    - `__tests__/spot-content-relation/search.property.test.ts` 신규 생성
    - 임의의 검색어에 대해 relations + relatedContent 매칭 결과의 합집합이며 중복 spotId 없음 검증
    - fast-check 100회 이상, 태그: `Feature: 30-spot-content-relation, Property 11: 검색 합산 및 중복 제거`
    - **Validates: Requirements 9.1, 9.2, 9.3**

- [ ] 10. 최종 체크포인트 — 전체 기능 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적 가능
- 체크포인트에서 증분 검증 수행
- 속성 테스트는 설계 문서의 Correctness Properties를 검증
- 과도기 동안 `relatedContent` 필드와 `relations` 필드를 병행 반환하여 하위 호환성 유지
- 마이그레이션 스크립트는 멱등성을 보장하여 안전하게 재실행 가능
