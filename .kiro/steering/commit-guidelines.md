---
inclusion: always
---

# 커밋 메시지 작성 필수 가이드라인

## 🚨 모든 커밋 시 반드시 준수해야 할 규칙

### 커밋 메시지 형식 (필수)

**🚨 기본 원칙: 한 줄로 작성**

```
<type>: <description>
```

**Body는 특별한 경우에만 사용** (일반적으로 한 줄로 충분)

### Type 종류 (필수 선택)

- `feat:` - 새로운 기능 추가
- `fix:` - 버그 수정
- `style:` - UI/스타일 변경
- `refactor:` - 코드 리팩토링
- `test:` - 테스트 추가/수정
- `docs:` - 문서 변경
- `chore:` - 빌드, 설정 등

### Description 작성 규칙 (필수)

- **한글로 작성** (영어 파일명/기술용어 제외)
- **50자 이내**
- **첫 글자 소문자**
- **마침표 없음**
- **명령형으로 작성** ("추가한다" ❌, "추가" ✅)
- **한 줄로 완결** (Body 없이 한 줄로 의미 전달)

### 🚨 여러 기능 = 여러 커밋 (필수)

**하나의 커밋에 여러 기능을 포함하지 마세요!**

```bash
# ❌ 잘못된 예시 (여러 기능을 하나의 커밋에)
chore: kiro steering 시스템 설정 및 커밋 가이드라인 강화

- .kiro/steering/commit-guidelines.md 추가
- .kiro/steering/task-execution-rules.md 추가
- .kiro/settings/kiro.json 추가
- git-workflow.md 수정

# ✅ 올바른 예시 (기능별로 분할)
chore: 커밋 메시지 필수 가이드라인 추가
chore: task 실행 필수 프로세스 가이드라인 추가
chore: kiro 설정 파일 추가
chore: git workflow 커밋 규칙 개선
```

### Body 작성 규칙 (특별한 경우에만)

**일반적으로 Body는 사용하지 않습니다. 한 줄로 충분합니다.**

Body가 필요한 특별한 경우:

- 복잡한 버그 수정의 상세 설명
- Breaking Change 설명
- 특별한 주의사항이 있는 경우

```bash
# 특별한 경우에만 Body 사용
fix: useSpotDetail API 응답 처리 수정

기존 data.spot 접근을 data 직접 접근으로 변경
coordinates undefined 에러 해결
```

## 📝 커밋 메시지 예시

### ✅ 올바른 예시 (한 줄 커밋)

```bash
feat: spot detail 페이지 구현
fix: useSpotDetail API 응답 처리 수정
style: spotpin 마커 ui/ux 개선
test: spot 데이터 직렬화 속성 테스트 추가
chore: 커밋 메시지 필수 가이드라인 추가
chore: task 실행 필수 프로세스 가이드라인 추가
```

### ❌ 잘못된 예시

```bash
feat: SpotDetail 페이지 구현  # 첫 글자 대문자 ❌
Fix: 버그 수정              # 타입 대문자 ❌
feat: 기능을 추가했습니다.    # 과거형 ❌
update: 스타일 변경         # 잘못된 타입 ❌

# 여러 기능을 하나의 커밋에 포함 ❌
chore: kiro 설정 및 가이드라인 추가
- 여러 파일 추가
- 여러 기능 구현
- 여러 설정 변경
```

## 🔄 논리적 커밋 분할 전략 (필수)

### 🚨 핵심 원칙: 하나의 커밋 = 하나의 기능

**여러 기능을 구현했다면 반드시 여러 커밋으로 분할하세요!**

### 올바른 분할 예시

```bash
# ✅ 기능별 분할 (권장)
git add src/components/SpotPin.tsx
git commit -m "feat: spotpin 컴포넌트 기본 구현"

git add src/components/SpotPin.css
git commit -m "style: spotpin 마커 스타일링 추가"

git add src/components/SpotPin.tsx
git commit -m "feat: spotpin 클릭 이벤트 핸들링 구현"

# ✅ 파일별 분할 (여러 독립적 파일)
git add .kiro/steering/commit-guidelines.md
git commit -m "chore: 커밋 메시지 필수 가이드라인 추가"

git add .kiro/steering/task-execution-rules.md
git commit -m "chore: task 실행 필수 프로세스 가이드라인 추가"

git add .kiro/settings/kiro.json
git commit -m "chore: kiro 설정 파일 추가"
```

### 잘못된 분할 예시

```bash
# ❌ 여러 기능을 하나의 커밋에 (금지)
git add .
git commit -m "chore: kiro 시스템 전체 설정

- 커밋 가이드라인 추가
- task 실행 규칙 추가
- 설정 파일들 추가
- 기존 파일 수정"
```

### 커밋 크기 가이드

- **이상적**: 100-300줄
- **최대**: 500줄
- **500줄 초과**: 여러 커밋으로 분할 필수

## 📋 Requirements 참조 (선택사항)

**한 줄 커밋에서는 Requirements를 커밋 메시지에 포함하지 않습니다.**
대신 PR 설명에서 Requirements를 참조하세요.

```bash
# ✅ 한 줄 커밋 (Requirements 없음)
feat: 스팟 미리보기 팝업 구현

# PR 설명에서 Requirements 참조
# "Requirements 2.2, 2.3, 2.4 대응"
```

## ⚠️ 커밋 전 체크리스트

1. **타입 확인**: feat, fix, style, test, docs, chore 중 선택
2. **한글 작성**: 모든 설명은 한글로 (기술용어 제외)
3. **길이 확인**: description 50자 이내
4. **형식 확인**: 첫 글자 소문자, 마침표 없음
5. **한 줄 완결**: Body 없이 한 줄로 의미 전달
6. **기능 분할**: 여러 기능이면 여러 커밋으로 분할
7. **논리적 단위**: 하나의 커밋 = 하나의 논리적 변경사항

**🚨 여러 기능을 하나의 커밋에 포함하면 작업이 거부될 수 있습니다.**
