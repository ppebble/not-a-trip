import { MongoClient, Db, Collection, Document } from 'mongodb'

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'

// URI에서 DB 이름 추출 (예: mongodb://localhost:27017/not-a-trip -> not-a-trip)
function extractDbNameFromUri(uri: string): string {
  const match = uri.match(/\/([^/?]+)(\?|$)/)
  return match ? match[1] : 'not-a-trip'
}

const MONGODB_DB = process.env.MONGODB_DB || extractDbNameFromUri(MONGODB_URI)

// Global connection cache to prevent multiple connections in development
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

/**
 * Connect to MongoDB and return the database instance
 * Uses connection caching to prevent multiple connections in development
 */
export async function connectToDatabase(): Promise<{
  client: MongoClient
  db: Db
}> {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    // Create new MongoDB client
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    // Connect to MongoDB
    await client.connect()

    // Get database instance
    const db = client.db(MONGODB_DB)

    // Cache the connection
    cachedClient = client
    cachedDb = db

    console.log('Connected to MongoDB successfully')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw new Error('Database connection failed')
  }
}

/**
 * Get a specific collection from the database
 */
export async function getCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  const { db } = await connectToDatabase()
  return db.collection<T>(collectionName)
}

/**
 * Close the MongoDB connection
 * Mainly used for cleanup in tests or application shutdown
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
    console.log('MongoDB connection closed')
  }
}

// Collection names constants
export const COLLECTIONS = {
  SPOTS: 'spots',
  FACILITIES: 'facilities',
  POSTS: 'posts',
  COMMENTS: 'comments',
  SCENES: 'scenes',
  USERS: 'users',
  USER_LIKES: 'user_likes',
  CONTENT_MASTERS: 'content_masters',
  // 인증 시스템 컬렉션 (07-pilgrimage-checkin)
  CHECKINS: 'checkins',
  BADGES: 'badges',
  USER_BADGES: 'user_badges',
  USER_STATS: 'user_stats',
  // 푸시 알림 컬렉션 (08-mobile-first-ux)
  PUSH_SUBSCRIPTIONS: 'push_subscriptions',
  // 성지 제보 시스템 컬렉션 (09-spot-report-wiki)
  SPOT_REPORTS: 'spot_reports',
  SPOT_SUPPLEMENTS: 'spot_supplements',
  SPOT_STATUS_REPORTS: 'spot_status_reports',
  // 성지순례 코스 시스템 컬렉션 (10-pilgrimage-route)
  ROUTES: 'routes',
  ROUTE_BOOKMARKS: 'route_bookmarks',
  ROUTE_COMPLETIONS: 'route_completions',
  // 편의시설 투표 컬렉션 (11-otaku-facilities)
  FACILITY_VOTES: 'facility_votes',
  // 인증 시스템 계정 연동 컬렉션 (15-oauth-integration)
  ACCOUNTS: 'accounts',
} as const

/**
 * Get the database instance directly
 * Convenience function for simpler access
 */
export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}
