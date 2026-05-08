# RelationEvidence 설계 문서

## 개요

이 문서는 `spot_content_relations`에 **증거 데이터(Evidence)**를 연결하는 3단계 확장 설계를 기술한다.

현재 상태:
- 1단계 완료: `spots.description`을 장소 자체 설명으로 분리
- 2단계 완료: `spot_content_relations.summary`에 작품별 한 줄 설명 추가, UI에서 진입 컨텍스트 기반 표시
- **3단계 (이 문서)**: 관계를 뒷받침하는 구체적 증거를 독립 엔티티로 관리

## 문제 정의

현재 `summary` 필드는 "이 작품이 이 장소와 왜 관련 있는지"를 한 줄로 설명한다. 하지만 사용자가 실제로 알고 싶은 것은:

- 정확히 몇 화 몇 분에 등장하는가
- 실제 장소와 작품 장면이 얼마나 일치하는가 (비교 사진)
- 공식 이벤트/콜라보인가, 팬 추정인가
- 어떤 각도에서 촬영하면 작품과 같은 구도가 나오는가

이 정보들은 단일 텍스트 필드로는 표현할 수 없으며, 구조화된 증거 데이터가 필요하다.

## 데이터 모델

### relation_evidences 컬렉션

```typescript
interface RelationEvidence {
  /** 고유 ID (EVD-{relationId}-{순번}) */
  id: string
  /** 연결된 relation ID (spot_content_relations.id) */
  relationId: string
  /** 증거 유형 */
  evidenceType: EvidenceType
  /** 증거 제목 ("1화 오프닝 해변 장면") */
  title: string
  /** 상세 설명 (선택) */
  description?: string
  /** 이미지 URL (장면 캡처, 비교 사진 등) */
  imageUrl?: string
  /** 비교 사진 URL (실제 장소 사진, evidenceType이 comparison_photo일 때) */
  comparisonImageUrl?: string
  /** 출처 URL (공식 링크, 뉴스 기사 등) */
  sourceUrl?: string
  /** 화수/챕터 정보 ("1화 00:32", "3권 45페이지") */
  episodeInfo?: string
  /** 촬영 팁 (선택, "오후 4시경 역광이 작품과 유사") */
  photographyTip?: string
  /** 검증 상태 */
  verificationStatus: 'verified' | 'pending' | 'rejected'
  /** 제출자 ID */
  submittedBy: string
  /** 제출자 이름 */
  submittedByName: string
  /** 좋아요 수 (유용한 증거 투표) */
  likeCount: number
  /** 생성일 */
  createdAt: Date
  /** 수정일 */
  updatedAt: Date
}
```

### EvidenceType (증거 유형)

```typescript
type EvidenceType =
  | 'scene_image'         // 작품 속 장면 캡처
  | 'comparison_photo'    // 실제 장소 vs 작품 비교 사진
  | 'official_link'       // 공식 발표/이벤트/콜라보 링크
  | 'episode_reference'   // 화수/챕터 참조 (텍스트 기반)
  | 'photography_guide'   // 촬영 가이드 (각도, 시간대 등)
  | 'fan_submission'      // 팬 제보 (기타)
```

### 유형별 필수/선택 필드

| 유형 | title | imageUrl | comparisonImageUrl | sourceUrl | episodeInfo | photographyTip |
|------|-------|----------|-------------------|-----------|-------------|----------------|
| scene_image | ✅ | ✅ | - | - | ✅ (권장) | - |
| comparison_photo | ✅ | ✅ (작품) | ✅ (실제) | - | ✅ (권장) | ✅ (권장) |
| official_link | ✅ | - | - | ✅ | - | - |
| episode_reference | ✅ | - | - | - | ✅ | - |
| photography_guide | ✅ | ✅ | - | - | - | ✅ |
| fan_submission | ✅ | - (선택) | - | - (선택) | - | - |

## API 설계

### 증거 목록 조회

```
GET /api/relations/{relationId}/evidences
```

Query params:
- `type`: EvidenceType 필터 (선택)
- `status`: verificationStatus 필터 (기본: verified)
- `limit`: 최대 개수 (기본: 10)
- `sortBy`: latest | popular (기본: popular)

Response:
```json
{
  "evidences": [RelationEvidence],
  "total": 5
}
```

### 증거 제출

```
POST /api/relations/{relationId}/evidences
```

Body:
```json
{
  "evidenceType": "scene_image",
  "title": "1화 오프닝 해변 달리기 장면",
  "description": "강백호가 해변을 달리는 오프닝 장면의 배경",
  "imageUrl": "https://...",
  "episodeInfo": "1화 00:32"
}
```

- 인증 필수 (로그인 사용자만)
- 제출 시 `verificationStatus: 'pending'`으로 생성
- 관리자 승인 후 `verified`로 변경

### 증거 승인/반려 (관리자)

```
PATCH /api/admin/evidences/{evidenceId}
```

Body:
```json
{
  "verificationStatus": "verified" | "rejected",
  "rejectionReason": "저작권 문제" // rejected일 때만
}
```

### 증거 좋아요

```
POST /api/relations/{relationId}/evidences/{evidenceId}/like
DELETE /api/relations/{relationId}/evidences/{evidenceId}/like
```

## UI 설계

### 스팟 상세 페이지 — RelationCard 확장

현재:
```
[슬램덩크 (スラムダンク)]  애니메이션
장면 등장
에노시마 해변이 오프닝 장면의 배경으로 등장합니다.
→ 작품별 스팟 보기
```

3단계 이후:
```
[슬램덩크 (スラムダンク)]  애니메이션
장면 등장
에노시마 해변이 오프닝 장면의 배경으로 등장합니다.

📸 근거 (2건)  [모두 보기 >]
┌─────────────────────────────────────────┐
│ [장면 캡처]                              │
│ 1화 오프닝 00:32 — 해변 달리기 장면       │
│ [이미지 썸네일]                           │
│ 👍 12                                    │
├─────────────────────────────────────────┤
│ [비교 사진]                              │
│ 실제 에노시마 해변 vs 오프닝 장면         │
│ [작품 이미지] ↔ [실제 사진]              │
│ 💡 오후 4시경 역광이 작품과 유사          │
│ 👍 8                                     │
└─────────────────────────────────────────┘

→ 작품별 스팟 보기
```

### 증거 제출 폼

스팟 상세 페이지의 "관련 콘텐츠" 섹션 하단에 "증거 추가" 버튼:

```
[+ 이 관계에 대한 증거 추가]

┌─────────────────────────────────────────┐
│ 증거 유형: [장면 캡처 ▼]                 │
│                                          │
│ 제목: [1화 오프닝 해변 장면          ]   │
│ 화수 정보: [1화 00:32               ]   │
│ 이미지: [파일 선택] 또는 [URL 입력]      │
│ 설명 (선택): [                      ]   │
│                                          │
│ [제출하기]                               │
└─────────────────────────────────────────┘
```

### 비교 사진 뷰어

`comparison_photo` 유형일 때 슬라이더 UI:

```
┌──────────────────────────────────────┐
│  [작품 장면]  ←──슬라이더──→  [실제 사진]  │
│                                      │
│  💡 촬영 팁: 오후 4시경 역광이 유사   │
└──────────────────────────────────────┘
```

사용자가 슬라이더를 좌우로 드래그하면 작품 장면과 실제 사진이 오버레이되어 비교 가능.

### 관리자 대시보드 — 증거 검수

```
/admin/evidences

[대기 중] 탭 | [승인됨] 탭 | [반려됨] 탭

┌─────────────────────────────────────────┐
│ 제출자: @user123 | 2024-03-15           │
│ 스팟: 에노시마 → 슬램덩크 (スラムダンク)  │
│ 유형: 장면 캡처                          │
│ 제목: 1화 오프닝 해변 장면               │
│ [이미지 미리보기]                        │
│                                          │
│ [✅ 승인] [❌ 반려] [🔍 상세 보기]       │
└─────────────────────────────────────────┘
```

## 인덱스 설계

```javascript
// relation_evidences 컬렉션 인덱스
db.relation_evidences.createIndex(
  { relationId: 1, verificationStatus: 1, likeCount: -1 },
  { name: 'idx_relation_status_popular' }
)

db.relation_evidences.createIndex(
  { verificationStatus: 1, createdAt: -1 },
  { name: 'idx_status_latest' }  // 관리자 검수용
)

db.relation_evidences.createIndex(
  { submittedBy: 1, createdAt: -1 },
  { name: 'idx_user_submissions' }
)
```

## 커뮤니티 기여 흐름

```
사용자 → 증거 제출 (pending)
         ↓
관리자 → 검수 (verified / rejected)
         ↓
verified → 스팟 상세 페이지에 표시
         → relation의 sourceCount 증가
         → relation의 verificationScore 재계산
```

### verificationScore 계산 로직

```typescript
function calculateVerificationScore(relation: SpotContentRelation): number {
  const evidences = await getVerifiedEvidences(relation.id)
  
  let score = 0
  for (const evidence of evidences) {
    switch (evidence.evidenceType) {
      case 'official_link': score += 30; break      // 공식 출처 = 높은 점수
      case 'scene_image': score += 20; break        // 장면 캡처 = 중간 점수
      case 'comparison_photo': score += 25; break   // 비교 사진 = 중간~높음
      case 'episode_reference': score += 15; break  // 화수 참조 = 기본
      case 'photography_guide': score += 10; break  // 촬영 가이드 = 보조
      case 'fan_submission': score += 5; break      // 팬 제보 = 최소
    }
    // 좋아요 보너스 (최대 +10)
    score += Math.min(evidence.likeCount, 10)
  }
  
  return Math.min(score, 100) // 최대 100점
}
```

## 기존 Scene 시스템과의 관계

현재 `scenes` 컬렉션에 장면 이미지가 저장되어 있다. 장기적으로:

- `scenes`는 **스팟 단위**의 장면 갤러리 (어떤 작품인지 불명확할 수 있음)
- `relation_evidences`는 **관계 단위**의 증거 (특정 작품과의 연결을 증명)

마이그레이션 전략:
1. 기존 `scenes`는 그대로 유지 (하위 호환)
2. 새로 제출되는 장면 이미지는 `relation_evidences`로 저장
3. 장기적으로 기존 `scenes`를 `relation_evidences`로 이관 (contentName 매칭 기반)

## 구현 우선순위

### Phase 3-A: 읽기 전용 (관리자 직접 입력)

- `relation_evidences` 컬렉션 생성 + 인덱스
- `GET /api/relations/{relationId}/evidences` API
- `RelationCard`에 증거 목록 표시 UI
- 관리자가 DB에 직접 증거 데이터 입력 (시드 스크립트)

### Phase 3-B: 사용자 제출

- `POST /api/relations/{relationId}/evidences` API
- 증거 제출 폼 UI
- 이미지 업로드 (기존 `/api/upload` 활용)
- 제출 후 "검수 대기 중" 안내

### Phase 3-C: 관리자 검수

- `PATCH /api/admin/evidences/{id}` API
- 관리자 대시보드 증거 검수 탭
- 승인/반려 + 반려 사유 입력
- 승인 시 `verificationScore` 자동 재계산

### Phase 3-D: 비교 사진 뷰어 + 좋아요

- 비교 사진 슬라이더 UI
- 증거 좋아요 API + UI
- 인기 증거 우선 정렬

## 도입 시점 판단 기준

다음 조건 중 2개 이상 충족 시 3단계 착수 권장:

1. **월간 활성 사용자(MAU) 100명 이상** — 커뮤니티 기여가 의미 있는 규모
2. **등록된 스팟 50개 이상** — 증거 데이터를 채울 대상이 충분
3. **사용자 피드백에서 "왜 이 장소가 관련 있는지 모르겠다" 반복** — 증거 필요성 확인
4. **관리자 검수 인력 확보** — 최소 1명이 주 1회 검수 가능

## 리스크

| 리스크 | 영향 | 완화 방안 |
|--------|------|-----------|
| 저작권 이미지 업로드 | 법적 문제 | 업로드 시 저작권 동의 체크, 신고 기능, 관리자 검수 |
| 스팸/저품질 제출 | UX 저하 | pending 상태 기본, 관리자 승인 필수 |
| 관리자 검수 부담 | 병목 | 좋아요 기반 자동 승격 (likeCount ≥ 5 → auto-verify) |
| 증거 없는 관계 | 빈 상태 | summary만 표시, 증거 섹션은 1건 이상일 때만 노출 |

## 참고 문서

- `docs/spot-content-relation-architecture.md` — 전체 아키텍처 초안
- `src/types/spot.ts` — SpotContentRelation 타입 정의
- `scripts/migrate-spot-descriptions.ts` — 2단계 마이그레이션 스크립트
