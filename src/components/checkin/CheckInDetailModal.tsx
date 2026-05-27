'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckIn } from '@/types'
import { AppIcon } from '@/components/common/AppIcon'
import { ComparisonViewer } from './ComparisonViewer'

interface CheckInDetailModalProps {
  checkIn?: CheckIn
  checkInId?: string
  onClose: () => void
}

interface CourseInfo {
  id: string
  name: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function CheckInDetailModal({
  checkIn,
  checkInId,
  onClose,
}: CheckInDetailModalProps) {
  const [resolvedCheckIn, setResolvedCheckIn] = useState<CheckIn | null>(
    checkIn ?? null
  )
  const [isLoading, setIsLoading] = useState(!checkIn && !!checkInId)
  const [error, setError] = useState<string | null>(null)
  const [spotName, setSpotName] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseInfo[]>([])
  const [chipsReady, setChipsReady] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)

  const activeCheckIn = resolvedCheckIn ?? checkIn ?? null

  const formatDate = useMemo(
    () => (date: Date) =>
      new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  )

  useEffect(() => {
    setResolvedCheckIn(checkIn ?? null)
    setIsLoading(!checkIn && !!checkInId)
    setError(null)
  }, [checkIn, checkInId])

  useEffect(() => {
    if (!checkInId || checkIn) return

    let cancelled = false

    const fetchCheckIn = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/checkins/${checkInId}`)
        const body = await response.json()

        if (!response.ok) {
          throw new Error(
            body?.error || '인증 상세 정보를 불러오지 못했습니다.'
          )
        }

        if (!cancelled) {
          setResolvedCheckIn(body)
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : '인증 상세 정보를 불러오지 못했습니다.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchCheckIn()

    return () => {
      cancelled = true
    }
  }, [checkIn, checkInId, retryKey])

  useEffect(() => {
    if (!activeCheckIn?.spotId) return

    let cancelled = false

    const fetchRelatedInfo = async () => {
      setChipsReady(false)
      setSpotName(null)
      setCourses([])

      try {
        const [spotRes, coursesRes] = await Promise.allSettled([
          fetch(`/api/spots/${activeCheckIn.spotId}`),
          fetch(`/api/spots/${activeCheckIn.spotId}/courses`),
        ])

        if (cancelled) return

        if (spotRes.status === 'fulfilled' && spotRes.value.ok) {
          const spotData = await spotRes.value.json()
          if (!cancelled) setSpotName(spotData.name ?? null)
        }

        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          const coursesData = await coursesRes.value.json()
          if (!cancelled) setCourses(coursesData.courses ?? [])
        }
      } catch {
        // graceful degradation
      } finally {
        if (!cancelled) setChipsReady(true)
      }
    }

    fetchRelatedInfo()

    return () => {
      cancelled = true
    }
  }, [activeCheckIn?.spotId])

  useEffect(() => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement | null

    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    return () => {
      window.clearTimeout(timer)
      lastFocusedElementRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )

      if (focusableElements.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement as HTMLElement | null

      if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const chipClass =
    'inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100'

  const hasChips = spotName || activeCheckIn?.contentName
  const hasCourses = courses.length > 0

  const handleRetry = () => {
    setResolvedCheckIn(null)
    setError(null)
    setIsLoading(true)
    setRetryKey((current) => current + 1)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-surface"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="인증 상세 보기"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            {activeCheckIn?.userImage ? (
              <Image
                src={activeCheckIn.userImage}
                alt={activeCheckIn.userName}
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
              {activeCheckIn ? (
                <>
                  <p className="font-medium">{activeCheckIn.userName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(activeCheckIn.visitedAt)}
                  </p>
                </>
              ) : (
                <>
                  <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
                  <div className="mt-2 h-4 w-20 animate-pulse rounded bg-neutral-100" />
                </>
              )}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="인증 상세 닫기"
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

        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="aspect-video animate-pulse rounded-lg bg-neutral-100" />
              <p className="text-center text-sm text-neutral-500">
                인증 정보를 불러오는 중입니다…
              </p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          ) : activeCheckIn?.sceneImageUrl ? (
            <ComparisonViewer
              sceneImageUrl={activeCheckIn.sceneImageUrl}
              userPhotoUrl={activeCheckIn.photoUrl}
            />
          ) : activeCheckIn ? (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={activeCheckIn.photoUrl}
                alt="인증 사진"
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        {activeCheckIn?.comment && !isLoading && !error && (
          <div className="border-t px-4 py-3">
            <p className="text-gray-700">{activeCheckIn.comment}</p>
          </div>
        )}

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
            <span className="text-sm">{activeCheckIn?.likeCount ?? 0}</span>
          </div>
        </div>

        {!isLoading &&
          !error &&
          chipsReady &&
          activeCheckIn &&
          (hasChips || hasCourses) && (
            <div className="border-t px-4 py-3">
              {hasChips && (
                <div className="flex flex-wrap gap-2">
                  {spotName && (
                    <Link
                      href={`/spots/${activeCheckIn.spotId}`}
                      className={chipClass}
                      onClick={(e) => e.stopPropagation()}
                    >
                      📍 {spotName}
                    </Link>
                  )}

                  {activeCheckIn.contentName && (
                    <Link
                      href={`/contents/${encodeURIComponent(activeCheckIn.contentName)}`}
                      className={chipClass}
                      onClick={(e) => e.stopPropagation()}
                    >
                      🎬 {activeCheckIn.contentName}
                    </Link>
                  )}
                </div>
              )}

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
