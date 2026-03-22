'use client'

import { useState } from 'react'
import Image from 'next/image'

const DUMMY_PHOTOS = [
  'https://picsum.photos/seed/a1/400/400',
  'https://picsum.photos/seed/b2/400/400',
  'https://picsum.photos/seed/c3/400/400',
  'https://picsum.photos/seed/d4/400/400',
  'https://picsum.photos/seed/e5/400/400',
  'https://picsum.photos/seed/f6/400/400',
  'https://picsum.photos/seed/g7/400/400',
  'https://picsum.photos/seed/h8/400/400',
  'https://picsum.photos/seed/i9/400/400',
  'https://picsum.photos/seed/j10/400/400',
  'https://picsum.photos/seed/k11/400/400',
  'https://picsum.photos/seed/l12/400/400',
]

interface DummyItem {
  id: string
  photoUrl: string
  userName: string
  spotName: string
  likeCount: number
}

function createDummyItems(count: number): DummyItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    photoUrl: DUMMY_PHOTOS[i % DUMMY_PHOTOS.length],
    userName: `유저${i + 1}`,
    spotName: `스팟 ${i + 1}`,
    likeCount: Math.floor(Math.random() * 100),
  }))
}

const ITEM_COUNTS = [1, 2, 3, 4, 6, 8, 12]

export default function GalleryFeedTestPage() {
  const [activeCount, setActiveCount] = useState(2)
  const [searchQuery, setSearchQuery] = useState('')

  const items = createDummyItems(activeCount)
  const filtered = searchQuery
    ? items.filter(
        (item) =>
          item.spotName.includes(searchQuery) ||
          item.userName.includes(searchQuery)
      )
    : items

  return (
    <main className="min-h-screen bg-white">
      {/* 검색바 */}
      <div className="sticky top-0 z-10 border-b bg-white px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-gray-100 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-1 py-2">
        {/* 아이템 수 선택 패널 */}
        <div className="mb-3 flex flex-wrap gap-1.5 px-2">
          <span className="self-center text-xs text-gray-500">아이템 수:</span>
          {ITEM_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => setActiveCount(count)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeCount === count
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        {/* 인스타 스타일 그리드 (3열 정사각형) */}
        <div className="grid grid-cols-3 gap-0.5">
          {filtered.map((item) => (
            <div key={item.id} className="group relative aspect-square">
              <Image
                src={item.photoUrl}
                alt={`${item.userName}의 인증샷`}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 33vw, 299px"
              />
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-4 text-sm font-semibold text-white">
                  <span>❤️ {item.likeCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            {searchQuery ? '검색 결과가 없습니다' : '아이템이 없습니다'}
          </div>
        )}
      </div>
    </main>
  )
}
