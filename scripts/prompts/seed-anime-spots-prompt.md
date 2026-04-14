# 애니메이션 성지순례 스팟 데이터 대량 추가 프롬프트

## 목표

`scripts/seed-real-spots.ts` 파일의 `ANIMATION_SPOTS` 배열에 고전 인기작 및 최신 트렌드 애니메이션 성지순례 스팟 데이터를 추가한다.
기존 REAL-ANI-001 ~ REAL-ANI-011까지 11개가 존재하므로, REAL-ANI-012부터 시작한다.

## 기존 스팟 목록 (중복 방지)

이미 존재하는 스팟이므로 절대 중복 추가하지 마세요:
- REAL-ANI-001: 스가 신사 (너의 이름은)
- REAL-ANI-002: 가마쿠라코코마에역 건널목 (슬램덩크)
- REAL-ANI-003: 지우펀 (센과 치히로의 행방불명)
- REAL-ANI-004: 이와토비 고등학교 모델 (Free!)
- REAL-ANI-005: 와시노미야 신사 (러키☆스타)
- REAL-ANI-006: 오아라이 마을 (걸즈 앤 판처)
- REAL-ANI-007: 히다 후루카와 (너의 이름은)
- REAL-ANI-008: 도쿄 타워 (도쿄 구울)
- REAL-ANI-009: 에노시마 (청춘 돼지 시리즈)
- REAL-ANI-010: 아키하바라 (슈타인즈 게이트)
- REAL-ANI-011: 나라 공원 (스즈메의 문단속)

## 추가할 작품 목록 (고전 인기작 + 최신 트렌드)

아래 작품들의 실제 성지순례 명소를 웹 검색으로 확인하여 추가해주세요:

### 고전 인기작
- 에반게리온 → 하코네 유모토 (제3신도쿄시 모델)
- 귀멸의 칼날 → 메이지무라 박물관 (나비저택 모델, 아이치현 이누야마)
- 진격의 거인 → 히타시 오야마댐 (작가 고향, 에렌/미카사/아르민 동상)
- 원피스 → 구마모토현 루피 동상 (작가 고향, 밀짚모자 해적단 동상 10개)
- 이니셜D → 하루나산/아키나산 (군마현, 토게 레이싱 성지)
- 은혼 → 가부키초 (신주쿠, 가부키초가 모델)
- 나루토 → 자연휴양림 나루토 소용돌이 (도쿠시마현 나루토시)
- 드래곤볼 → 카린탑 모델 쿠알라룸푸르 타워 또는 도쿄 스카이트리

### 최신 트렌드
- 주술회전 → 시부야 스크램블 교차로 (시부야 사변)
- 최애의 아이 (오시노코) → 시부야109 / 돔 투어 관련 장소
- 유루캠 → 모토스코 캠프장 (후지산 뷰, 야마나시현)
- 체인소맨 → 시부야/신주쿠 일대
- 보치 더 록! → 시모키타자와 (라이브하우스 거리)
- 프리렌 → 독일 뉘른베르크/로텐부르크 (중세 유럽풍 배경)
- 블루 록 → 사이타마 스타디움 2002

## 데이터 형식 (반드시 이 형식을 따를 것)

```typescript
{
  id: 'REAL-ANI-0XX',  // 012부터 순차 증가
  name: '장소명 (작품명)',  // 한국어
  description: '2~3문장의 구체적인 설명. 왜 이 장소가 성지순례 명소인지, 작품과의 관계, 방문 포인트 등을 포함.',
  photos: ['https://picsum.photos/seed/{고유시드}/800/600'],  // picsum 플레이스홀더
  address: '실제 주소 (한국어)',
  coordinates: { lat: XX.XXXX, lng: XXX.XXXX },  // 소수점 4자리 이상, 웹 검색으로 검증된 실제 좌표
  category: 'animation',
  relatedContent: [
    {
      name: '작품명 (원제)',
      type: 'anime',  // ContentType: 'anime' | 'movie' | 'drama' 등
      year: XXXX,
      // imageUrl은 나중에 별도로 추가할 예정이므로 포함하지 않음
    },
  ],
  authorName: 'System',
  isGuestSpot: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

## 중요 규칙

1. **좌표 정확성**: 모든 좌표는 반드시 웹 검색(Google Maps 등)으로 검증된 실제 값을 사용할 것. AI가 임의로 생성한 좌표 절대 금지.
2. **주소 정확성**: 실제 존재하는 주소를 한국어로 작성할 것.
3. **description**: 해당 장소가 왜 성지순례 명소인지, 작품과의 구체적 관계를 2~3문장으로 설명.
4. **relatedContent**: 해당 장소와 관련된 작품을 정확한 이름(원제 포함)과 방영 연도로 기재.
5. **photos**: `https://picsum.photos/seed/{장소영문명}/800/600` 형식의 플레이스홀더 사용.
6. **ID**: REAL-ANI-012부터 순차 증가.
7. **중복 금지**: 위 기존 스팟 목록과 중복되는 장소는 추가하지 말 것.

## 작업 방법

1. `scripts/seed-real-spots.ts` 파일을 열어 `ANIMATION_SPOTS` 배열의 마지막 항목(REAL-ANI-011) 뒤에 새 스팟들을 추가한다.
2. 최소 10개 이상의 새 스팟을 추가한다.
3. 추가 후 TypeScript 문법 오류가 없는지 확인한다.
4. 파일 하단의 `ALL_REAL_SPOTS` 배열에 `ANIMATION_SPOTS`가 이미 포함되어 있으므로 별도 수정 불필요.

## 실행 방법

데이터 추가 후 아래 명령어로 MongoDB에 삽입:
```bash
npx tsx scripts/seed-real-spots.ts --append
```

## Scene 데이터 (별도 작업)

작품 속 장면 이미지(Scene)는 별도 컬렉션에 저장되며, 이번 작업에서는 포함하지 않는다.
Scene 데이터는 추후 별도 시드 스크립트로 추가할 예정.

Scene 데이터 구조 참고:
```typescript
interface Scene {
  id: string
  spotId: string        // 'REAL-ANI-0XX' 형태로 스팟과 연결
  imageUrl: string      // 작품 속 장면 이미지 URL
  animeTitle: string    // 작품명
  episodeInfo?: string  // '1화', '오프닝' 등
  description?: string  // 장면 설명
  likeCount: number     // 0으로 초기화
  createdAt: Date
}
```
