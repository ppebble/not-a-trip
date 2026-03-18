# Not a Trip 아이콘 생성 프롬프트 (Gemini 복붙용)

## 워크플로우
1. 아래 프롬프트를 Gemini에 복붙하여 PNG 생성
2. PNG → WebP 변환 (PWA 아이콘 4개는 PNG 유지)
3. 해당 경로에 파일 배치
4. 코드에서 .svg/.png → .webp 확장자 일괄 변경

---

## 프롬프트 1: PWA 앱 아이콘 (PNG 유지, 4개)

```
"Not a Trip"이라는 여행 지도 앱의 앱 아이콘을 만들어줘.

브랜드 컬러는 #4164a5 (네이비 블루)이고, 앱 컨셉은 "팬들만 아는 특별한 여행지 탐색 (애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등)"이야.

아이콘 디자인: 네이비 블루(#4164a5) 배경 위에 흰색 지도 핀 안에 별(sparkle)이 들어간 미니멀 플랫 디자인. 텍스트 없음.

아래 4가지 사이즈로 각각 개별 이미지를 만들어줘:

1. 192x192px — 모서리가 둥근 앱 아이콘 스타일
2. 512x512px — 모서리가 둥근 앱 아이콘 스타일 (고해상도)
3. 192x192px — maskable 아이콘 (모서리 둥글지 않음, 핵심 요소를 캔버스 중앙 80% 영역에 배치)
4. 512x512px — maskable 아이콘 (모서리 둥글지 않음, 핵심 요소를 캔버스 중앙 80% 영역에 배치)

모두 PNG 포맷, 투명 배경 없이 #4164a5 배경으로 채워줘.
```

저장 경로:
- 1번 → `public/icons/icon-192x192.png`
- 2번 → `public/icons/icon-512x512.png`
- 3번 → `public/icons/icon-maskable-192x192.png`
- 4번 → `public/icons/icon-maskable-512x512.png`

---

## 프롬프트 2: 카테고리 아이콘 (6개)

```
여행 지도 앱 "Not a Trip"에서 사용할 카테고리 아이콘 6개를 만들어줘.

공통 스타일: 미니멀 플랫 아이콘, 투명 배경, 단색, 깔끔한 라인, 128x128px PNG. 각 아이콘은 개별 이미지로 생성.

1. 애니메이션 카테고리 — 필름 클래퍼보드 또는 애니메이션 느낌의 반짝이는 눈 모양. 색상 #FF6B6B
2. 스포츠 카테고리 — 축구공 또는 트로피 모양. 색상 #4ECDC4
3. 영화/드라마 카테고리 — 영화 카메라 또는 필름 릴 모양. 색상 #45B7D1
4. 음악/콘서트 카테고리 — 음표 또는 마이크 모양. 색상 #96CEB4
5. 게임 카테고리 — 게임 컨트롤러 모양. 색상 #DDA0DD
6. 기타 카테고리 — 일반적인 지도 핀/위치 마커 모양. 색상 #95A5A6

모두 128x128px PNG, 투명 배경.
```

저장 경로 (WebP 변환 후):
- 1번 → `public/icons/categories/animation.webp`
- 2번 → `public/icons/categories/sports.webp`
- 3번 → `public/icons/categories/movie_drama.webp`
- 4번 → `public/icons/categories/music.webp`
- 5번 → `public/icons/categories/game.webp`
- 6번 → `public/icons/categories/other.webp`

---

## 프롬프트 3: 콘텐츠 타입 아이콘 (7개)

```
여행 지도 앱에서 사용할 콘텐츠 타입 아이콘 7개를 만들어줘.

공통 스타일: 미니멀 플랫 아이콘, 투명 배경, 단색, 깔끔한 라인, 128x128px PNG. 각 아이콘은 개별 이미지로 생성.

1. 애니메이션 콘텐츠 — 만화책 또는 애니메이션 캐릭터 실루엣 모양. 색상 #FF6B6B
2. 영화 콘텐츠 — 필름 스트립 또는 시네마 스크린 모양. 색상 #45B7D1
3. 드라마 콘텐츠 — TV 화면 또는 연극 마스크 모양. 색상 #9B59B6
4. 스포츠 팀 콘텐츠 — 유니폼 저지 또는 방패/문장 모양. 색상 #4ECDC4
5. 아티스트 콘텐츠 — 마이크와 별 또는 무대 스포트라이트 모양. 색상 #96CEB4
6. 게임 콘텐츠 — 픽셀 하트 또는 조이스틱 모양. 색상 #DDA0DD
7. 기타 콘텐츠 — 태그 또는 라벨 모양. 색상 #95A5A6

모두 128x128px PNG, 투명 배경.
```

저장 경로 (WebP 변환 후):
- 1번 → `public/icons/content-types/anime.webp`
- 2번 → `public/icons/content-types/movie.webp`
- 3번 → `public/icons/content-types/drama.webp`
- 4번 → `public/icons/content-types/sports_team.webp`
- 5번 → `public/icons/content-types/artist.webp`
- 6번 → `public/icons/content-types/game.webp`
- 7번 → `public/icons/content-types/other.webp`

---

## 프롬프트 4: 링크 타입 아이콘 (5개)

```
여행 지도 앱에서 외부 링크 유형을 나타내는 아이콘 5개를 만들어줘.

공통 스타일: 미니멀 플랫 아이콘, 투명 배경, 단색, 깔끔한 라인, 128x128px PNG. 각 아이콘은 개별 이미지로 생성.

1. 공식 홈페이지 — 지구본에 체크마크 또는 인증 뱃지 모양. 색상 #3B82F6
2. 티켓 예매 — 티켓 스텁 또는 입장권 모양 (절취선 포함). 색상 #10B981
3. 일정 확인 — 달력 페이지에 시계 또는 날짜 표시 모양. 색상 #F59E0B
4. SNS — 말풍선에 하트 또는 공유/연결 심볼 모양. 색상 #8B5CF6
5. 기타 링크 — 체인 링크 또는 박스에서 나가는 화살표 모양. 색상 #6B7280

모두 128x128px PNG, 투명 배경.
```

저장 경로 (WebP 변환 후):
- 1번 → `public/icons/link-types/official.webp`
- 2번 → `public/icons/link-types/ticket.webp`
- 3번 → `public/icons/link-types/schedule.webp`
- 4번 → `public/icons/link-types/sns.webp`
- 5번 → `public/icons/link-types/other.webp`

---

## 프롬프트 5: 출발지 아이콘 (5개)

```
여행 지도 앱에서 코스 출발지 유형을 나타내는 아이콘 5개를 만들어줘.

공통 스타일: 미니멀 플랫 아이콘, 투명 배경, 단색 #4164a5 (네이비 블루), 깔끔한 라인, 128x128px PNG. 각 아이콘은 개별 이미지로 생성.

1. 기차역 — 기차 정면 또는 철도 트랙 심볼 모양
2. 정류장 — 작은 플랫폼 또는 간소화된 정류장 표지판 모양
3. 버스 정류장 — 버스 정면 모양
4. 건물/관광지 — 건물 파사드 또는 관광 랜드마크 모양
5. 기본 출발지 — 중앙에 점이 있는 원 또는 나침반 장미 모양

모두 128x128px PNG, 투명 배경, 색상 #4164a5.
```

저장 경로 (WebP 변환 후):
- 1번 → `public/icons/start-point/station.webp`
- 2번 → `public/icons/start-point/stop.webp`
- 3번 → `public/icons/start-point/bus.webp`
- 4번 → `public/icons/start-point/building.webp`
- 5번 → `public/icons/start-point/default.webp`

---

## 프롬프트 6: 뱃지 아이콘 (5개)

```
여행 지도 앱 "Not a Trip"에서 사용할 업적 뱃지 아이콘 5개를 만들어줘.

공통 스타일: 원형 뱃지 프레임 안에 심볼이 들어간 디자인, 투명 배경, 그라데이션 허용, 256x256px PNG. 각 아이콘은 개별 이미지로 생성.

1. 첫 발자국 뱃지 (첫 인증) — 원형 뱃지 프레임 안에 황금색 발자국 또는 신발 자국. 그라데이션 #FFD700 → #FFA500
2. 탐험가 뱃지 (10곳 방문) — 원형 은색 뱃지 프레임 안에 나침반 또는 쌍안경. 그라데이션 #C0C0C0 → #A0A0A0
3. 베테랑 탐험가 뱃지 (50곳 방문) — 원형 황금 뱃지 프레임에 별이 달린 나침반 또는 쌍안경. 그라데이션 #FFD700 → #FF8C00
4. 작품 정복자 뱃지 (특정 작품 스팟 100% 완료) — 원형 황금 뱃지 프레임에 반짝이는 트로피 또는 왕관. 그라데이션 #FFD700 → #FF6347
5. 작품 탐험가 뱃지 (특정 작품 스팟 50% 완료) — 원형 브론즈 뱃지 프레임에 반쯤 채워진 별 또는 50% 진행 원. 그라데이션 #CD7F32 → #B8860B

모두 256x256px PNG, 투명 배경.
```

저장 경로 (WebP 변환 후):
- 1번 → `public/icons/badges/first-step.webp`
- 2번 → `public/icons/badges/explorer-10.webp`
- 3번 → `public/icons/badges/explorer-50.webp`
- 4번 → `public/icons/badges/content-complete.webp`
- 5번 → `public/icons/badges/content-half.webp`

---

## 프롬프트 7: 푸시 알림 아이콘 (4개)

```
여행 지도 앱 "Not a Trip"에서 푸시 알림에 사용할 작은 아이콘 4개를 만들어줘.

공통 스타일: 미니멀하고 작은 사이즈에서도 알아볼 수 있는 심플한 디자인, 투명 배경, 96x96px PNG. 각 아이콘은 개별 이미지로 생성.

1. 뱃지 획득 알림 — 황금색 메달 또는 리본 모양
2. 스팟 승인 알림 — 지도 핀 안에 초록색 체크마크 모양
3. 답글 알림 — 파란색 말풍선에 곡선 답장 화살표 모양
4. 새 인증샷 알림 — 카메라에 작은 지도 핀 또는 위치 점 모양

모두 96x96px PNG, 투명 배경.
```

저장 경로 (WebP 변환 후):
- 1번 → `public/icons/badge-default.webp`
- 2번 → `public/icons/spot-approved.webp`
- 3번 → `public/icons/comment-reply.webp`
- 4번 → `public/icons/new-checkin.webp`

---

## 파일 배치 요약

```
public/icons/
├── icon-192x192.png              ← PWA (PNG 유지)
├── icon-512x512.png              ← PWA (PNG 유지)
├── icon-maskable-192x192.png     ← PWA maskable (PNG 유지)
├── icon-maskable-512x512.png     ← PWA maskable (PNG 유지)
├── badge-default.webp            ← 푸시: 뱃지 기본
├── spot-approved.webp            ← 푸시: 스팟 승인
├── comment-reply.webp            ← 푸시: 답글
├── new-checkin.webp              ← 푸시: 새 인증샷
├── badges/
│   ├── first-step.webp
│   ├── explorer-10.webp
│   ├── explorer-50.webp
│   ├── content-complete.webp
│   └── content-half.webp
├── categories/
│   ├── animation.webp
│   ├── sports.webp
│   ├── movie_drama.webp
│   ├── music.webp
│   ├── game.webp
│   └── other.webp
├── content-types/
│   ├── anime.webp
│   ├── movie.webp
│   ├── drama.webp
│   ├── sports_team.webp
│   ├── artist.webp
│   ├── game.webp
│   └── other.webp
├── link-types/
│   ├── official.webp
│   ├── ticket.webp
│   ├── schedule.webp
│   ├── sns.webp
│   └── other.webp
└── start-point/
    ├── station.webp
    ├── stop.webp
    ├── bus.webp
    ├── building.webp
    └── default.webp
```

총 36개 파일 (PNG 4개 + WebP 32개)

---

## 코드 변경 대상 (아이콘 배치 후 일괄 변경)

### .svg → .webp 변경 대상

| 파일 | 변경 내용 |
|---|---|
| `src/types/spot.ts` | LINK_TYPE_CONFIG, CONTENT_TYPE_CONFIG, CATEGORY_CONFIG의 icon 경로 `.svg` → `.webp` |
| `src/types/checkin.ts` | BADGE_DEFINITIONS의 iconUrl `.svg` → `.webp` |
| `src/components/common/ContentTypeIcon.tsx` | CONTENT_TYPE_ICON_PATH, CATEGORY_ICON_PATH, LINK_TYPE_ICON_PATH `.svg` → `.webp` |
| `src/components/map/SpotPin.tsx` | getCategoryIconPath 내 `.svg` → `.webp` |
| `src/components/route/RouteFormContent.tsx` | getPlaceIconPath 내 `.svg` → `.webp` |

### .png → .webp 변경 대상

| 파일 | 변경 내용 |
|---|---|
| `src/lib/push-notifications.ts` | `badge-default.png`, `spot-approved.png`, `comment-reply.png`, `new-checkin.png` → `.webp` |

### 변경하지 않는 파일 (PWA 아이콘은 PNG 유지)

| 파일 | 이유 |
|---|---|
| `public/manifest.json` | PWA 아이콘은 PNG 호환성 필요 |
| `public/sw.js` | `icon-192x192.png` 참조 유지 |
| `src/app/layout.tsx` | apple-touch-icon PNG 유지 |
| `src/app/api/push/send/route.ts` | 푸시 icon/badge는 PWA 아이콘(PNG) 참조 유지 |

### 삭제 대상 (기존 SVG 파일)

```
public/icons/categories/*.svg     (6개)
public/icons/content-types/*.svg  (7개)
public/icons/link-types/*.svg     (5개)
public/icons/start-point/*.svg    (5개)
```
