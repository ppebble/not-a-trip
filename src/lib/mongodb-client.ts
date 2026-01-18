import { MongoClient } from 'mongodb'

const uri =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-pilgrimage'
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서는 전역 변수를 사용하여 HMR 시 연결 유지
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // 프로덕션 환경에서는 새 클라이언트 생성
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
