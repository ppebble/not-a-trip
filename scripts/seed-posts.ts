/**
 * 게시글 및 댓글 시드 데이터 스크립트
 * 실행: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-posts.ts
 */

import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'anime-pilgrimage'

interface Post {
  _id: ObjectId
  title: string
  content: string
  author: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

interface Comment {
  _id: ObjectId
  postId: ObjectId
  content: string
  author: string
  createdAt: Date
}

const samplePosts: Omit<Post, '_id'>[] = [
  {
    title: '도쿄 성지순례 후기 - 너의 이름은 편',
    content: `지난 주말에 도쿄에서 "너의 이름은" 성지순례를 다녀왔습니다!

스가 신사(須賀神社)의 계단은 정말 영화 그대로였어요. 아침 일찍 가서 사람이 적을 때 사진을 찍었는데, 영화 속 장면이 떠올라서 감동이었습니다.

신주쿠역 주변도 돌아다녔는데, 영화에서 본 풍경들이 실제로 있어서 신기했어요.

다음에는 히다 지역도 가보고 싶네요. 미츠하의 고향 배경이 된 곳이라고 하더라고요.

혹시 도쿄 성지순례 계획하시는 분들 있으면 질문 주세요!`,
    author: '애니덕후123',
    viewCount: 156,
    createdAt: new Date('2025-01-05T10:30:00Z'),
    updatedAt: new Date('2025-01-05T10:30:00Z'),
  },
  {
    title: '슬램덩크 성지 - 가마쿠라 고등학교 앞 건널목',
    content: `슬램덩크 팬이라면 꼭 가봐야 할 곳!

가마쿠라코코마에역 앞 건널목은 슬램덩크 오프닝에 나오는 그 장소입니다.
에노덴 전철이 지나가는 타이밍에 사진 찍으면 완벽해요.

주의사항:
- 주말에는 사람이 정말 많아요
- 차도에서 사진 찍지 마세요 (위험합니다)
- 아침 일찍 가면 한적해요

근처에 시라스동(멸치덮밥) 맛집도 많으니 점심도 해결하세요!`,
    author: '농구소년',
    viewCount: 243,
    createdAt: new Date('2025-01-04T15:20:00Z'),
    updatedAt: new Date('2025-01-04T15:20:00Z'),
  },
  {
    title: '교토 성지순례 추천 코스 공유합니다',
    content: `교토에서 애니메이션 성지순례하기 좋은 코스를 정리해봤어요.

1. 후시미이나리 신사 - 이나리, 콘콘, 사랑의 첫걸음
2. 기온 거리 - 명탐정 코난 극장판
3. 아라시야마 - 다양한 작품 배경

하루에 다 돌기는 힘들고, 2일 정도 잡으시면 여유롭게 볼 수 있어요.

특히 후시미이나리는 새벽에 가면 사람이 없어서 사진 찍기 좋습니다!`,
    author: '교토러버',
    viewCount: 89,
    createdAt: new Date('2025-01-03T09:00:00Z'),
    updatedAt: new Date('2025-01-03T09:00:00Z'),
  },
  {
    title: '첫 성지순례 준비 중인데 조언 부탁드려요',
    content: `안녕하세요, 다음 달에 처음으로 일본 성지순례를 가려고 합니다.

가고 싶은 곳:
- 도쿄 (너의 이름은, 날씨의 아이)
- 가마쿠라 (슬램덩크)

질문:
1. 일정은 며칠 정도가 적당할까요?
2. 숙소는 어디가 좋을까요?
3. 꼭 챙겨야 할 준비물이 있을까요?

경험 있으신 분들 조언 부탁드립니다!`,
    author: '성지순례초보',
    viewCount: 67,
    createdAt: new Date('2025-01-06T14:45:00Z'),
    updatedAt: new Date('2025-01-06T14:45:00Z'),
  },
  {
    title: '스즈메의 문단속 성지 - 규슈 여행기',
    content: `스즈메의 문단속 성지순례로 규슈를 다녀왔습니다!

영화 초반부 배경인 미야자키현부터 시작해서 여러 지역을 돌았어요.

하이라이트:
- 폐교 장면의 모델이 된 학교
- 스즈메가 달리던 해안도로
- 페리 장면의 항구

규슈는 도쿄보다 관광객이 적어서 여유롭게 둘러볼 수 있었어요.
렌터카 추천합니다!`,
    author: '신카이팬',
    viewCount: 112,
    createdAt: new Date('2025-01-02T11:30:00Z'),
    updatedAt: new Date('2025-01-02T11:30:00Z'),
  },
]

async function seedPosts() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('MongoDB 연결 성공')

    const db = client.db(DB_NAME)
    const postsCollection = db.collection<Post>('posts')
    const commentsCollection = db.collection<Comment>('comments')

    // 기존 데이터 삭제
    await postsCollection.deleteMany({})
    await commentsCollection.deleteMany({})
    console.log('기존 데이터 삭제 완료')

    // 게시글 삽입
    const postsWithIds = samplePosts.map((post) => ({
      ...post,
      _id: new ObjectId(),
    }))

    await postsCollection.insertMany(postsWithIds)
    console.log(`${postsWithIds.length}개의 게시글 삽입 완료`)

    // 샘플 댓글 생성
    const sampleComments: Comment[] = [
      {
        _id: new ObjectId(),
        postId: postsWithIds[0]._id,
        content:
          '저도 다녀왔는데 정말 좋았어요! 스가 신사 계단에서 사진 찍으니까 영화 속 주인공이 된 기분이었습니다.',
        author: '타키군',
        createdAt: new Date('2025-01-05T12:00:00Z'),
      },
      {
        _id: new ObjectId(),
        postId: postsWithIds[0]._id,
        content: '히다 지역 추천해요! 미츠하네 집 모델이 된 신사도 있어요.',
        author: '미츠하',
        createdAt: new Date('2025-01-05T14:30:00Z'),
      },
      {
        _id: new ObjectId(),
        postId: postsWithIds[1]._id,
        content:
          '에노덴 타고 가면서 보는 바다 풍경도 최고예요! 슬램덩크 ED 생각나서 감동이었습니다.',
        author: '강백호팬',
        createdAt: new Date('2025-01-04T18:00:00Z'),
      },
      {
        _id: new ObjectId(),
        postId: postsWithIds[3]._id,
        content:
          '도쿄+가마쿠라면 4박 5일 정도 추천해요. 숙소는 신주쿠나 시부야가 이동하기 편해요!',
        author: '여행고수',
        createdAt: new Date('2025-01-06T16:00:00Z'),
      },
      {
        _id: new ObjectId(),
        postId: postsWithIds[3]._id,
        content:
          '구글맵에 성지 위치 미리 저장해두면 편해요. 그리고 편한 신발 필수!',
        author: '애니덕후123',
        createdAt: new Date('2025-01-06T17:30:00Z'),
      },
    ]

    await commentsCollection.insertMany(sampleComments)
    console.log(`${sampleComments.length}개의 댓글 삽입 완료`)

    // commentCount 업데이트
    for (const post of postsWithIds) {
      const commentCount = await commentsCollection.countDocuments({
        postId: post._id,
      })
      await postsCollection.updateOne(
        { _id: post._id },
        { $set: { commentCount } }
      )
    }
    console.log('댓글 수 업데이트 완료')

    console.log('\n✅ 시드 데이터 삽입 완료!')
    console.log(`- 게시글: ${postsWithIds.length}개`)
    console.log(`- 댓글: ${sampleComments.length}개`)
  } catch (error) {
    console.error('시드 데이터 삽입 실패:', error)
    throw error
  } finally {
    await client.close()
  }
}

seedPosts()
