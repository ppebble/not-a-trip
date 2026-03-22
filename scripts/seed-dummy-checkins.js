/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require('mongodb')

async function main() {
  const c = await MongoClient.connect('mongodb://localhost:27017/not-a-trip')
  const db = c.db()
  const col = db.collection('checkins')

  const last = await col
    .find({ id: { $regex: /^CHECKIN-\d+$/ } })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  let nextNum = 1
  if (last.length > 0) {
    const m = last[0].id.match(/CHECKIN-(\d+)/)
    if (m) nextNum = parseInt(m[1]) + 1
  }

  const photos = [
    'https://picsum.photos/seed/kamakura1/800/600',
    'https://picsum.photos/seed/kamakura2/800/600',
    'https://picsum.photos/seed/kamakura3/800/600',
    'https://picsum.photos/seed/kamakura4/800/600',
    'https://picsum.photos/seed/kamakura5/800/600',
    'https://picsum.photos/seed/kamakura6/800/600',
    'https://picsum.photos/seed/kamakura7/800/600',
    'https://picsum.photos/seed/kamakura8/800/600',
  ]
  const names = [
    '슬덩팬',
    '에노덴러버',
    '가마쿠라여행자',
    '농구소년',
    '성지순례자',
    '일본여행중',
    '애니덕후',
    '건널목사진가',
  ]
  const comments = [
    '드디어 슬램덩크 건널목 왔다!',
    '에노덴 지나가는 타이밍 맞추기 어려웠어요',
    '바다 배경이 정말 예뻐요',
    '강백호가 여기서 뛰었겠지...',
    '사람 엄청 많았지만 감동적',
    '날씨가 좋아서 사진이 잘 나왔어요',
    '슬램덩크 영화 보고 바로 왔습니다',
    null,
  ]

  const docs = photos.map((url, i) => ({
    id: 'CHECKIN-' + String(nextNum + i).padStart(3, '0'),
    spotId: 'REAL-ANI-002',
    userId: 'dummy-user-' + (i + 1),
    userName: names[i],
    photoUrl: url,
    visitedAt: new Date(2025, 0, 15 + i),
    comment: comments[i],
    likeCount: Math.floor(Math.random() * 30),
    createdAt: new Date(2025, 0, 15 + i),
    updatedAt: new Date(2025, 0, 15 + i),
  }))

  const result = await col.insertMany(docs)
  console.log(
    'Inserted ' + result.insertedCount + ' check-ins for REAL-ANI-002'
  )
  await c.close()
}

main().catch(console.error)
