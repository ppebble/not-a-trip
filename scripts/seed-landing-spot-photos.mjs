import { MongoClient } from 'mongodb'

const APPLY = process.argv.includes('--apply')
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'not-a-trip'

const now = new Date()
const PHOTO_UPDATES = [
  ['REAL-MUS-001', '/uploads/scenes/REAL-MUS-001-scene-0.jpg'],
  ['REAL-MUS-002', '/uploads/scenes/REAL-MUS-002-scene-0.jpg'],
  ['REAL-MUS-003', '/uploads/scenes/REAL-MUS-003-scene-0.jpg'],
  ['REAL-MUS-004', '/uploads/scenes/REAL-MUS-004-scene-0.webp'],
  ['REAL-MUS-005', '/uploads/scenes/REAL-MUS-005-scene-0.jpg'],
  ['REAL-GAM-002', '/uploads/scenes/REAL-GAM-002-scene-0.jpg'],
  ['REAL-GAM-003', '/uploads/scenes/REAL-GAM-003-scene-0.jpg'],
]

const SHERLOCK_PHOTO =
  'https://upload.wikimedia.org/wikipedia/commons/3/33/221B_Baker_Street%2C_London_-_Sherlock_Holmes_Museum.jpg'

const sherlockSpot = {
  id: 'REAL-OTH-001',
  name: '셜록 홈즈 박물관',
  description:
    '아서 코난 도일의 셜록 홈즈와 왓슨의 주소로 알려진 221B 베이커 스트리트를 체험할 수 있는 런던의 문학 팬덤 스팟입니다. 박물관 외관과 문패 자체가 대표 인증 포인트라 랜딩의 기타 카테고리 대표 스팟으로 사용합니다.',
  photos: [SHERLOCK_PHOTO],
  address: '221B Baker Street, London NW1 6XE, United Kingdom',
  coordinates: { lat: 51.523767, lng: -0.158555 },
  category: 'other',
  relatedContent: [
    {
      name: '셜록 홈즈',
      type: 'other',
      year: 1887,
      imageUrl: SHERLOCK_PHOTO,
    },
  ],
  externalLinks: [
    {
      id: 'REAL-OTH-001-official',
      type: 'official',
      label: 'Sherlock Holmes Museum',
      url: 'https://www.sherlock-holmes.co.uk/',
    },
    {
      id: 'REAL-OTH-001-photo-source',
      type: 'other',
      label: 'Wikimedia Commons image source',
      url: 'https://commons.wikimedia.org/wiki/File:221B_Baker_Street,_London_-_Sherlock_Holmes_Museum.jpg',
    },
  ],
  authorName: 'System',
  isGuestSpot: false,
  reviewStatus: 'approved',
  sourceUrls: [
    {
      url: 'https://commons.wikimedia.org/wiki/File:221B_Baker_Street,_London_-_Sherlock_Holmes_Museum.jpg',
      label: 'Sherlock Holmes Museum exterior photo source',
      evidenceType: 'wiki',
      collectedAt: now,
      license: 'Public domain',
    },
    {
      url: 'https://www.visitlondon.com/things-to-do/place/48930-sherlock-holmes-museum',
      label:
        'Visit London listing for Sherlock Holmes Museum at 221B Baker Street',
      evidenceType: 'official_tourism',
      collectedAt: now,
    },
  ],
  updatedAt: now,
}

const sherlockContent = {
  normalizedName: '셜록 홈즈',
  displayName: '셜록 홈즈',
  type: 'other',
  year: 1887,
  spotCount: 1,
  imageUrl: SHERLOCK_PHOTO,
  thumbnailSource: 'wikimedia_commons',
  thumbnailOriginalUrl: SHERLOCK_PHOTO,
  thumbnailProvider: 'wikimedia_commons',
  thumbnailSourceTitle: '221B Baker Street, London - Sherlock Holmes Museum',
  thumbnailSourceUrl:
    'https://commons.wikimedia.org/wiki/File:221B_Baker_Street,_London_-_Sherlock_Holmes_Museum.jpg',
  updatedAt: now,
}

const sherlockRelation = {
  id: 'REL-REAL-OTH-001-01',
  spotId: 'REAL-OTH-001',
  contentId: 'OTHER_SHERLOCK_HOLMES',
  contentName: '셜록 홈즈',
  contentType: 'other',
  relationType: 'inspired_by',
  confidenceLevel: 'high',
  officialness: 'community_verified',
  displayPriority: 0,
  status: 'active',
  contentImageUrl: SHERLOCK_PHOTO,
  updatedAt: now,
}

const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
await client.connect()
const db = client.db(MONGODB_DB)

const before = await db
  .collection('spots')
  .find({ id: { $in: PHOTO_UPDATES.map(([id]) => id).concat('REAL-OTH-001') } })
  .project({ id: 1, name: 1, photos: 1, category: 1 })
  .toArray()

const operations = [
  ...PHOTO_UPDATES.map(([id, photo]) => ({
    collection: 'spots',
    filter: { id },
    update: {
      $set: {
        photos: [photo],
        updatedAt: now,
        landingPhotoReviewedAt: now,
      },
      $addToSet: {
        sourceUrls: {
          url: photo,
          label: `${id} local scene photo promoted as landing spot photo`,
          evidenceType: 'local_asset',
          collectedAt: now,
        },
      },
    },
    options: {},
  })),
  {
    collection: 'spots',
    filter: { id: sherlockSpot.id },
    update: { $set: sherlockSpot, $setOnInsert: { createdAt: now } },
    options: { upsert: true },
  },
  {
    collection: 'content_masters',
    filter: { normalizedName: sherlockContent.normalizedName, type: 'other' },
    update: { $set: sherlockContent, $setOnInsert: { createdAt: now } },
    options: { upsert: true },
  },
  {
    collection: 'spot_content_relations',
    filter: { id: sherlockRelation.id },
    update: { $set: sherlockRelation, $setOnInsert: { createdAt: now } },
    options: { upsert: true },
  },
]

if (APPLY) {
  for (const op of operations) {
    await db
      .collection(op.collection)
      .updateOne(op.filter, op.update, op.options)
  }
}

const after = await db
  .collection('spots')
  .find({ id: { $in: PHOTO_UPDATES.map(([id]) => id).concat('REAL-OTH-001') } })
  .project({ id: 1, name: 1, photos: 1, category: 1 })
  .toArray()

console.log(
  JSON.stringify(
    {
      mode: APPLY ? 'apply' : 'dry-run',
      plannedOperations: operations.length,
      before,
      after: APPLY ? after : undefined,
    },
    null,
    2
  )
)

await client.close()
