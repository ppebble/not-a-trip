# PR 템플릿 작성 가이드

## 📋 PR 템플릿 구조

모든 PR은 다음 구조를 따라 작성해야 합니다:

### 1. 변경사항 요약

```markdown
## 📋 변경사항 요약

**Task [번호] "[제목]"** 완료
```

### 2. 구현된 기능

```markdown
### 🎯 구현된 기능

#### ✅ [하위 작업명]

- 구체적인 구현 내용 1
- 구체적인 구현 내용 2
- 구체적인 구현 내용 3
```

### 3. 품질 확인

```markdown
### 📊 품질 확인

- ✅ TypeScript 컴파일 성공
- ✅ Next.js 빌드 성공 ([시간])
- ✅ 모든 페이지 정적 생성 완료
- ⚠️ [경고사항] - [설명]
```

### 4. 관련 Requirements

```markdown
### 🔗 관련 Requirements

- Requirements [번호]: [설명]
- Requirements [번호]: [설명]
```

### 5. 커밋 히스토리

```markdown
### 📝 커밋 히스토리

1. `[type]: [설명]`
2. `[type]: [설명]`
3. `[type]: [설명]`
```

### 6. Issue 연결

```markdown
Closes #[이슈번호]
```

## 📝 작성 팁

### 체크리스트 사용

- ✅ 완료된 항목
- ⚠️ 주의사항이 있는 항목
- ❌ 실패한 항목

### 이모지 활용

- 📋 요약/개요
- 🎯 목표/기능
- 📊 품질/테스트
- 🔗 연결/참조
- 📝 기록/히스토리
- ✅ 성공/완료
- ⚠️ 경고/주의
- ❌ 실패/오류

### 커밋 타입

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `style:` UI/스타일 변경
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `docs:` 문서 변경
- `chore:` 기타 작업

## 🚨 필수 사항

1. **Issue 연결**: 반드시 `Closes #[번호]` 포함
2. **품질 확인**: 빌드/테스트 결과 명시
3. **Requirements 참조**: 관련 요구사항 번호 명시
4. **커밋 히스토리**: 논리적 단위로 분할된 커밋 목록
5. **구체적 설명**: 추상적이지 않은 구체적인 변경사항 기술

## 📖 예시

```markdown
## 📋 변경사항 요약

**Task 5.2.1 "SpotPin UI/UX 개선 및 에러 처리"** 완료

### 🎯 구현된 기능

#### ✅ Task 5.2.1.1: next/image 외부 이미지 도메인 설정

- `next.config.ts`에 picsum.photos, images.unsplash.com 도메인 추가
- Next.js 15 remotePatterns 설정으로 외부 이미지 최적화 지원

### 📊 품질 확인

- ✅ TypeScript 컴파일 성공
- ✅ Next.js 빌드 성공 (3.8초)
- ⚠️ 일부 ESLint 경고 (console.log) - 개발 단계에서 정상

### 🔗 관련 Requirements

- Requirements 2.2: 스팟 미리보기 필수 정보 표시

### 📝 커밋 히스토리

1. `feat: next/image 외부 이미지 도메인 설정 추가`
2. `style: spotpin 마커 ui/ux 개선`

Closes #10
```
