# Session Workflow

## Default process

1. 관련 `requirements.md` 확인
2. 있으면 `design.md` 확인
3. `tasks.md`를 현재 구현 상태에 맞게 작성 또는 보정
4. task 체크리스트 기준으로 구현
5. 관련 테스트 우선 실행
6. `npm run type-check`
7. 필요하면 `npm run build`
8. Git flow 정리

## Reference documents

### Git / PR / commit references

- PR 템플릿
  - `.github/PULL_REQUEST_TEMPLATE.md`
- 브랜치명 / PR 흐름 규칙
  - `docs/git-workflow.md`
- 커밋 타입 규칙
  - `docs/commit-convention.md`
- commitlint 설정
  - `commitlint.config.mjs`
- commit-msg 훅
  - `.husky/commit-msg`
- pre-commit / lint-staged 동작은 commit 시 자동 실행되므로 커밋 전 변경 범위를 다시 확인
- `.git` 하위에 템플릿 파일이 추가되면 그 경로도 같이 참고

### Spec / task authoring references

- requirements + design + tasks까지 갖춘 가장 좋은 참고 예시
  - `.kiro/specs/39-landing-social-proof-real-data/requirements.md`
  - `.kiro/specs/39-landing-social-proof-real-data/design.md`
  - `.kiro/specs/39-landing-social-proof-real-data/tasks.md`
- requirements → tasks 중심으로 정리된 최근 예시
  - `.kiro/specs/42-security-abuse-prevention/requirements.md`
  - `.kiro/specs/42-security-abuse-prevention/tasks.md`
  - `.kiro/specs/43-observability-ops-tools/requirements.md`
  - `.kiro/specs/43-observability-ops-tools/tasks.md`
  - `.kiro/specs/44-deployment-readiness/requirements.md`
  - `.kiro/specs/44-deployment-readiness/tasks.md`

### Session continuation references

- 기존 장기 handoff 문서
  - `docs/agent-session-handoff.md`
- specs 41~44 작업 히스토리/계획
  - `docs/2026-05-24-specs-41-44-task-plan.md`
- spec 43 운영 런북
  - `docs/2026-05-25-spec43-ops-runbook.md`
- spec 감사 메모
  - `docs/2026-05-26-kiro-spec-audit.md`

## Git flow

1. 이슈 생성
2. 이슈 번호 기반 브랜치 생성
   - 예: `enhancement/{issue}--{slug}`
3. 구현 및 검증
4. commit
5. PR 생성
6. merge
7. `develop` 동기화
8. 로컬/원격 브랜치 삭제

## Git / PR references

- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/commit-convention.md`
- `docs/git-workflow.md`
- `commitlint.config.mjs`
- `.husky/commit-msg`

## Commit guidance

- 저장소 commit type 규칙 준수
- Lore trailer 포함
- 커밋 메시지 본문 한 줄 길이 주의
- 실제 검사는 `commitlint` + husky 훅에서 다시 수행됨

## Verification preference

- 변경한 범위의 테스트 먼저
- 그 다음 type-check
- 마지막으로 build

## Session hygiene

- 세션이 길어지면 handoff 문서를 먼저 갱신
- 다음 세션은 이 디렉터리 문서부터 읽고 시작

## If a new spec must be written

1. 먼저 비슷한 기존 spec를 고른다
   - full set 참고는 `39`
   - requirements/tasks 최근 예시는 `42`, `43`, `44`
2. 최소한 `requirements.md`부터 작성
3. 복잡한 기능이면 `design.md`까지 작성
4. 구현 직전 `tasks.md`를 작성해서 체크리스트를 고정
5. 이후 구현은 task 문서 체크 순서대로 진행
