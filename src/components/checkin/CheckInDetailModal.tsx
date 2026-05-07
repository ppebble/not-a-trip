'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckIn } from '@/types'
import { AppIcon } from '@/components/common/AppIcon'
import { ComparisonViewer } from './ComparisonViewer'

interface CheckInDetailModalProps {
  checkIn: CheckIn
  onClose: () => void
}

interface CourseInfo {
  id: string
  name: string
}

/**
 * 인증 상세 모달
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
export function CheckInDetailModal({
  checkIn,
  onClose,
}: CheckInDetailModalProps) {
  const [spotName, setSpotName] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [chipsReady, setChipsReady] = useState(false)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 스팟 이름 + 코스 목록 병렬 조회
  useEffect(() => {
    if (!checkIn.spotId) return

    let cancelled = false

    const fetchRelatedInfo = async () => {
      try {
        const [spotRes, coursesRes] = await Promise.allSettled([
          fetch(`/api/spots/${checkIn.spotId}`),
          fetch(`/api/spots/${checkIn.spotId}/courses`),
        ])

        if (cancelled) return

        // 스팟 이름
        if (spotRes.status === 'fulfilled' && spotRes.value.ok) {
          const spotData = await spotRes.value.json()
          if (!cancelled) setSpotName(spotData.name ?? null)
        }

        // 코스 목록
        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          const coursesData = await coursesRes.value.json()
          if (!cancelled) setCourses(coursesData.courses ?? [])
        }
      } catch {
        // graceful degradation: 에러 시 칩 영역 숨김
      } finally {
        if (!cancelled) setChipsReady(true)
      }
    }

    fetchRelatedInfo()

    return () => {
      cancelled = true
    }
  }, [checkIn.spotId])

  const chipClass =
    'inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100'

  const hasChips = spotName || checkIn.contentName
  const hasCourses = courses.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            {checkIn.userImage ? (
              <Image
                src={checkIn.userImage}
                alt={checkIn.userName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary-50">
                <AppIcon name="profile-front" size={36} />
              </div>
            )}
            <div>
              <p className="font-medium">{checkIn.userName}</p>
              <p className="text-sm text-gray-500">
                {formatDate(checkIn.visitedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 이미지 */}
        <div className="p-4">
          {checkIn.sceneImageUrl ? (
            <ComparisonViewer
              sceneImageUrl={checkIn.sceneImageUrl}
              userPhotoUrl={checkIn.photoUrl}
            />
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={checkIn.photoUrl}
                alt="인증샷"
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* 코멘트 */}
        {checkIn.comment && (
          <div className="border-t px-4 py-3">
            <p className="text-gray-700">{checkIn.comment}</p>
          </div>
        )}

        {/* 좋아요 */}
        <div className="border-t px-4 py-3">
          <div className="flex items-center gap-1 text-gray-500">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm">{checkIn.likeCount}</span>
          </div>
        </div>

        {/* 관련 정보 칩 섹션 — 로딩 완료 후 표시 */}
        {chipsReady && (hasChips || hasCourses) && (
          <div className="border-t px-4 py-3">
            {/* 스팟 / 작품 칩 */}
            {hasChips && (
              <div className="flex flex-wrap gap-2">
                {/* 스팟 칩 */}
                {spotName && (
                  <Link
                    href={`/spots/${checkIn.spotId}`}
                    className={chipClass}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📍 {spotName}
                  </Link>
                )}

                {/* 작품 칩 */}
                {checkIn.contentName && (
                  <Link
                    href={`/contents/${encodeURIComponent(checkIn.contentName)}`}
                    className={chipClass}
                    onClick={(e) => e.stopPropagation()}
                  >
                    🎬 {checkIn.contentName}
                  </Link>
                )}
              </div>
            )}

            {/* 코스 섹션 */}
            {hasCourses && (
              <div className={hasChips ? 'mt-2' : ''}>
                <p className="mb-1 text-xs text-gray-500">
                  이 스팟이 포함된 코스
                </p>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/routes/${course.id}`}
                      className={chipClass}
                      onClick={(e) => e.stopPropagation()}
                    >
                      🗺️ {course.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
