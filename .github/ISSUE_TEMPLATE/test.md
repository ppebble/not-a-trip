---
name: '🧪 Test'
about: 단위 테스트, 통합 테스트, Property-Based Test 작업
title: '[Test] Task X.X - 테스트 이름'
labels: 'test'
---

## 🏷️ Type

- [ ] **Unit Test**: 단위 테스트
- [ ] **Integration Test**: 통합 테스트
- [ ] **Property-Based Test**: 속성 기반 테스트
- [ ] **E2E Test**: End-to-End 테스트

---

## 🎯 테스트 목적

> 무엇을 검증하는 테스트인지 간단히 설명하세요.

<!-- 예시:
- 사용자 로그인 기능의 정상 동작 검증
- API 응답 데이터의 형식 검증
- 컴포넌트 렌더링 시 필수 요소 포함 여부 검증
-->

---

## 📋 테스트 범위

> 테스트할 내용을 체크리스트로 작성하세요.

- [ ] 정상 케이스 테스트
- [ ] 에러 케이스 테스트
- [ ] 엣지 케이스 테스트
- [ ] 경계값 테스트

---

## ✅ 검증 기준

> 테스트가 통과해야 하는 조건을 명시하세요.

**Given** 특정 조건이 주어졌을 때  
**When** 특정 동작을 수행하면  
**Then** 기대하는 결과가 나와야 한다

---

## 📌 관련 정보

- **Task 번호**: Task X.X
- **Property 번호**: Property X (PBT인 경우)
- **Requirements**: X.X
- **테스트 파일**: `src/path/to/test.test.ts`

---

> 💡 **브랜치 규칙:** `test/{이슈번호}--{테스트-이름}--add`  
> 💡 **커밋 prefix:** `test: 테스트 설명`
