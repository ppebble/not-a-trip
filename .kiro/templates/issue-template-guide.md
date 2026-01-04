# Issue 템플릿 작성 가이드

## 📋 Issue 제목 규칙

```
[Type] Task [번호] - [간단한 설명]
```

### Type 종류

- `[Feat]` - 새로운 기능 구현
- `[Fix]` - 버그 수정
- `[UI]` - UI/UX 개선
- `[Refactor]` - 코드 리팩토링
- `[Test]` - 테스트 추가/수정
- `[Docs]` - 문서 작업
- `[Chore]` - 기타 작업

### 예시

- `[Feat] Task 5.2 - SpotPin 컴포넌트 구현`
- `[UI] Task 5.2.1 - SpotPin UI/UX 개선 및 에러 처리`
- `[Fix] Task 3.1 - API 응답 에러 처리 개선`

## 📝 Issue 본문 구조

### 1. 작업 개요

```markdown
## 📋 작업 내용

[Task에서 수행할 작업의 전체적인 설명]

### 하위 작업

- [ ] [하위 작업 1]
- [ ] [하위 작업 2]
- [ ] [하위 작업 3]
```

### 2. 요구사항 참조

```markdown
### 🔗 Requirements

- [번호]: [설명]
- [번호]: [설명]
```

### 3. 구현 세부사항 (선택사항)

```markdown
### 🛠 구현 세부사항

- [구체적인 구현 방법이나 제약사항]
- [고려해야 할 기술적 요소]
```

### 4. 완료 조건

```markdown
### ✅ 완료 조건

- [ ] [조건 1]
- [ ] [조건 2]
- [ ] [조건 3]
```

## 📖 Issue 작성 예시

```markdown
## 📋 작업 내용

SpotPin 컴포넌트의 UI/UX 개선 및 에러 처리

### 하위 작업

- [ ] 5.2.1.1 next/image 외부 이미지 도메인 설정
- [ ] 5.2.1.2 SpotPin 마커 UI 개선
- [ ] 5.2.1.3 메인 페이지 레이아웃 및 스타일 개선

### 🔗 Requirements

- 2.2: 스팟 미리보기 필수 정보 표시
- 1.2, 2.1: 스팟 핀 표시 및 클릭 이벤트
- 1.4, 7.1: 네이비 테마 및 반응형 디자인

### 🛠 구현 세부사항

- next.config.ts에 외부 이미지 도메인 추가 필요
- 마커 디자인 및 호버 효과 개선
- 반응형 레이아웃 점검 및 개선

### ✅ 완료 조건

- [ ] 외부 이미지 도메인 설정 완료
- [ ] 마커 UI 개선 완료
- [ ] 메인 페이지 레이아웃 개선 완료
- [ ] TypeScript 컴파일 성공
- [ ] Next.js 빌드 성공
```

## 🚨 필수 사항

1. **Task 번호**: 반드시 specs의 Task 번호와 일치
2. **Requirements 참조**: 관련 요구사항 번호 명시
3. **하위 작업**: 큰 작업은 하위 작업으로 분할
4. **완료 조건**: 명확한 완료 기준 제시
5. **라벨 설정**: GitHub에서 적절한 라벨 추가

## 📌 라벨 가이드

### 우선순위

- `priority: high` - 높은 우선순위
- `priority: medium` - 중간 우선순위
- `priority: low` - 낮은 우선순위

### 작업 유형

- `type: feature` - 새로운 기능
- `type: bug` - 버그 수정
- `type: enhancement` - 기능 개선
- `type: documentation` - 문서 작업

### 상태

- `status: in-progress` - 진행 중
- `status: review` - 리뷰 대기
- `status: blocked` - 블로킹됨
