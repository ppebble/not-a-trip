# 애니메이션 스팟 이미지 추가 프롬프트

## 목표

MongoDB의 `spots` 컬렉션에 있는 애니메이션 스팟(REAL-ANI-001 ~ REAL-ANI-025)에 두 종류의 이미지를 추가한다:

1. **현실 사진** → `spots` 컬렉션의 `photos[]` 배열 업데이트
2. **작품 속 장면** → `scenes` 컬렉션에 새 문서 삽입

## 현재 스팟 목록 (REAL-ANI-001 ~ REAL-ANI-025)

| ID | 스팟명 | 작품명 |
|----|--------|--------|
| REAL-ANI-001 | 스가 신사 | 너의 이름은 |
| REAL-ANI-002 | 가마쿠라코코마에역 건널목 | 슬램덩크 |
| REAL-ANI-003 | 지우펀 | 센과 치히로의 행방불명 |
| REAL-ANI-004 | 이와토비 고등학교 모델 | Free! |
| REAL-ANI-005 | 와시노미야 신사 | 러키☆스타 |
| REAL-ANI-006 | 오아라이 마을 | 걸즈 앤 판처 |
| REAL-ANI-007 | 히다 후루카와 | 너의 이름은 |
| REAL-ANI-008 | 도쿄 타워 | 도쿄 구울 |
| REAL-ANI-009 | 에노시마 | 청춘 돼지 시리즈 |
| REAL-ANI-010 | 아키하바라 | 슈타인즈 게이트 |
| REAL-ANI-011 | 나라 공원 | 스즈메의 문단속 |
| REAL-ANI-012 | 하코네 유모토 | 에반게리온 |
| REAL-ANI-013 | 메이지무라 박물관 | 귀멸의 칼날 |
| REAL-ANI-014 | 히타시 오야마댐 | 진격의 거인 |
| REAL-ANI-015 | 구마모토현 루피 동상 | 원피스 |
| REAL-ANI-016 | 하루나산 | 이니셜D |
| REAL-ANI-017 | 가부키초 | 은혼 |
| REAL-ANI-018 | 나루토 소용돌이 | 나루토 |
| REAL-ANI-019 | 쿠알라룸푸르 타워 | 드래곤볼 |
| REAL-ANI-020 | 시부야 스크램블 교차로 | 주술회전 |
| REAL-ANI-021 | 시부야109 | 최애의 아이 |
| REAL-ANI-022 | 모토스코 캠프장 | 유루캠△ |
| REAL-ANI-023 | 시모키타자와 | 봇치 더 록! |
| REAL-ANI-024 | 뉘른베르크 | 프리렌 |
| REAL-ANI-025 | 사이타마 스타디움 2002 | 블루 록 |

## 작업 1: 현실 사진 (spots.photos[])

각 스팟의 `photos` 배열에 해당 장소의 실제 사진 URL을 추가한다.

### 이미지 소스
- Unsplash, Pexels, Wikimedia Commons 등 무료/CC 라이선스 이미지 사용
- 웹 검색으로 각 장소의 실제 사진 URL을 찾아서 사용
- 찾을 수 없는 경우 `https://picsum.photos/seed/{스팟영문명}/800/600` 플레이스홀더 사용

### MongoDB 업데이트 방법
```javascript
// 예시: REAL-ANI-001 스가 신사의 photos 업데이트
db.spots.updateOne(
  { id: 'REAL-ANI-001' },
  { $set: { photos: ['실제_이미지_URL'] } }
)
```

### 스크립트 작성 요구사항
`scripts/update-spot-images.ts` 파일을 생성하여 모든 스팟의 photos를 일괄 업데이트하는 스크립트를 작성해줘.

```typescript
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'not-a-trip'

// 각 스팟별 실제 사진 URL 매핑
const SPOT_PHOTOS: Record<string, string[]> = {
  'REAL-ANI-001': ['실제_스가신사_사진_URL'],
  'REAL-ANI-002': ['실제_가마쿠라_건널목_사진_URL'],
  // ... 25개 전부
}

async function updateSpotPhotos() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)
  const spots = db.collection('spots')

  for (const [spotId, photos] of Object.entries(SPOT_PHOTOS)) {
    await spots.updateOne(
      { id: spotId },
      { $set: { photos } }
    )
    console.log(`✅ ${spotId} photos 업데이트 완료`)
  }

  await client.close()
}

updateSpotPhotos()
```

## 작업 2: 작품 속 장면 (scenes 컬렉션)

각 스팟에 대해 해당 작품에서 그 장소가 등장하는 장면 이미지를 `scenes` 컬렉션에 삽입한다.

### Scene 데이터 구조
```typescript
interface Scene {
  id: string          // 'SCENE-ANI-001-01' 형태 (스팟ID + 순번)
  spotId: string      // 'REAL-ANI-001' (spots 컬렉션의 id와 매칭)
  imageUrl: string    // 작품 속 장면 이미지 URL
  animeTitle: string  // 작품명 (한국어)
  episodeInfo?: string // '1화', '오프닝', '엔딩' 등
  description?: string // 장면 설명 (한국어)
  likeCount: number   // 0으로 초기화
  createdAt: Date
}
```

### 이미지 소스
- 각 작품에서 해당 장소가 등장하는 장면의 스크린샷/캡처 이미지를 웹 검색으로 찾기
- 찾을 수 없는 경우 `https://picsum.photos/seed/{작품영문명}-scene/800/600` 플레이스홀더 사용

### 스크립트 작성 요구사항
`scripts/seed-scene-images.ts` 파일을 생성하여 scenes 컬렉션에 일괄 삽입하는 스크립트를 작성해줘.

```typescript
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'not-a-trip'

interface SeedScene {
  id: string
  spotId: string
  imageUrl: string
  animeTitle: string
  episodeInfo?: string
  description?: string
  likeCount: number
  createdAt: Date
}

const SCENES: SeedScene[] = [
  {
    id: 'SCENE-ANI-001-01',
    spotId: 'REAL-ANI-001',
    imageUrl: '작품_장면_이미지_URL',
    animeTitle: '너의 이름은',
    episodeInfo: '클라이맥스',
    description: '타키와 미츠하가 스가 신사 계단에서 재회하는 장면',
    likeCount: 0,
    createdAt: new Date(),
  },
  // ... 각 스팟당 최소 1개씩
]

async function seedScenes() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db(MONGODB_DB)
  const scenes = db.collection('scenes')

  // 기존 시드 데이터 중복 방지
  const existingIds = await scenes.distinct('id')
  const newScenes = SCENES.filter(s => !existingIds.includes(s.id))

  if (newScenes.length > 0) {
    const result = await scenes.insertMany(newScenes)
    console.log(`✅ ${result.insertedCount}개 장면 데이터 추가 완료`)
  } else {
    console.log('추가할 새 장면이 없습니다.')
  }

  await client.close()
}

seedScenes()
```

## 각 스팟별 이미지 검색 가이드

아래 키워드로 웹 검색하여 적절한 이미지를 찾아줘:

| 스팟 | 현실 사진 검색 키워드 | 작품 장면 검색 키워드 | 장면 설명 |
|------|----------------------|---------------------|----------|
| REAL-ANI-001 | suga shrine stairs yotsuya tokyo | your name kimi no na wa stairs scene | 타키와 미츠하가 계단에서 재회하는 장면 |
| REAL-ANI-002 | kamakura kokomae crossing enoden | slam dunk opening crossing scene | 오프닝에서 사쿠라기가 건널목 앞에 서있는 장면 |
| REAL-ANI-003 | jiufen old street lanterns taiwan | spirited away bathhouse scene | 치히로가 유바바의 목욕탕을 올려다보는 장면 |
| REAL-ANI-004 | iwami high school tottori | free! iwatobi swim club school | 이와토비 수영부가 학교 앞에 모여있는 장면 |
| REAL-ANI-005 | washinomiya shrine saitama | lucky star shrine scene | 코나타 일행이 신사에서 참배하는 장면 |
| REAL-ANI-006 | oarai town ibaraki | girls und panzer oarai scene | 전차가 오아라이 마을을 달리는 장면 |
| REAL-ANI-007 | hida furukawa gifu station | your name itomori town scene | 미츠하가 히다 후루카와역에서 내리는 장면 |
| REAL-ANI-008 | tokyo tower night | tokyo ghoul tokyo tower scene | 카네키가 도쿄 타워를 배경으로 서있는 장면 |
| REAL-ANI-009 | enoshima island kanagawa | bunny girl senpai enoshima scene | 사쿠타와 마이가 에노시마를 걷는 장면 |
| REAL-ANI-010 | akihabara electric town | steins gate akihabara scene | 오카베가 아키하바라 라디오 회관 앞에 서있는 장면 |
| REAL-ANI-011 | nara park deer | suzume no tojimari nara scene | 스즈메가 나라 공원을 방문하는 장면 |
| REAL-ANI-012 | hakone yumoto station | evangelion tokyo-3 hakone scene | 에바 초호기가 하코네(제3신도쿄시)에서 출격하는 장면 |
| REAL-ANI-013 | meiji mura museum inuyama | demon slayer butterfly mansion scene | 시노부의 나비저택 외관 장면 |
| REAL-ANI-014 | oyama dam hita oita | attack on titan wall scene | 에렌이 벽을 올려다보는 장면 |
| REAL-ANI-015 | one piece luffy statue kumamoto | one piece luffy scene | 루피가 모험을 떠나는 장면 |
| REAL-ANI-016 | mount haruna gunma | initial d akina downhill scene | 타쿠미가 하치로쿠로 아키나산을 내려가는 장면 |
| REAL-ANI-017 | kabukicho shinjuku night | gintama kabukicho scene | 긴토키가 가부키초를 걷는 장면 |
| REAL-ANI-018 | naruto whirlpool tokushima | naruto uzumaki scene | 나루토가 소용돌이 마크를 보여주는 장면 |
| REAL-ANI-019 | kuala lumpur tower | dragon ball karin tower scene | 손오공이 카린탑을 올라가는 장면 |
| REAL-ANI-020 | shibuya scramble crossing | jujutsu kaisen shibuya incident scene | 고죠 사토루가 시부야 교차로에 등장하는 장면 |
| REAL-ANI-021 | shibuya 109 building | oshi no ko shibuya scene | 아이가 시부야를 걷는 장면 |
| REAL-ANI-022 | lake motosu campground fuji | yuru camp mount fuji scene | 린이 모토스코 캠프장에서 후지산을 바라보는 장면 |
| REAL-ANI-023 | shimokitazawa live house | bocchi the rock shimokitazawa scene | 봇치가 시모키타자와 라이브하우스에서 연주하는 장면 |
| REAL-ANI-024 | nuremberg old town germany | frieren medieval town scene | 프리렌 일행이 중세 마을을 걷는 장면 |
| REAL-ANI-025 | saitama stadium 2002 | blue lock stadium scene | 블루 록 선수들이 경기장에서 뛰는 장면 |

## 중요 규칙

1. **이미지 URL**: 웹에서 직접 접근 가능한 URL이어야 함 (hotlink 가능한 소스)
2. **저작권**: Unsplash, Pexels, Wikimedia Commons 등 무료 라이선스 이미지 우선 사용
3. **작품 장면**: 공식 스크린샷이나 팬 사이트의 장면 캡처 이미지 사용. 찾기 어려우면 picsum 플레이스홀더 사용
4. **Scene ID 형식**: `SCENE-ANI-{스팟번호}-{순번}` (예: SCENE-ANI-001-01)
5. **spotId 매칭**: Scene의 spotId는 반드시 spots 컬렉션의 id와 정확히 일치해야 함
6. **한국어**: animeTitle, description은 한국어로 작성

## 실행 방법

```bash
# 1. 스팟 사진 업데이트
npx tsx scripts/update-spot-images.ts

# 2. 작품 장면 삽입
npx tsx scripts/seed-scene-images.ts
```

## 참고: relatedContent.imageUrl

`relatedContent[].imageUrl` 필드는 갤러리/작품별 항목의 썸네일로 사용된다.
이 값은 Scene의 imageUrl과 동일한 이미지를 사용하여 일관성을 맞춰야 한다.

```javascript
// 예시: relatedContent에도 imageUrl 추가
db.spots.updateOne(
  { id: 'REAL-ANI-001' },
  {
    $set: {
      'relatedContent.0.imageUrl': '작품_장면_이미지_URL'
    }
  }
)
```

스팟 사진 업데이트 스크립트에서 relatedContent.imageUrl도 함께 업데이트해줘.
Scene의 imageUrl과 동일한 값을 사용하면 된다.
