'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { getSafeImageSrc } from '@/lib/safe-image-src'
import Link from 'next/link'
import { CheckIn, CheckInComment, CheckInLikeStatus } from '@/types'
import { AppIcon } from '@/components/common/AppIcon'
import { API_ROUTES } from '@/lib/api-routes'
import { getDeviceId } from '@/lib/device-id'
import { ComparisonViewer } from './ComparisonViewer'

interface CheckInDetailModalProps {
  checkIn?: CheckIn
  checkInId?: string
  onClose: () => void
  onCheckInUpdated?: (checkIn: CheckIn, liked?: boolean) => void
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

function getDeviceHeaders(): HeadersInit {
  const deviceId = getDeviceId()
  return deviceId ? { 'X-Device-Id': deviceId } : {}
}

export function CheckInDetailModal({
  checkIn,
  checkInId,
  onClose,
  onCheckInUpdated,
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
  const [liked, setLiked] = useState(false)
  const [likeStatusReady, setLikeStatusReady] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)
  const [likeError, setLikeError] = useState<string | null>(null)
  const [comments, setComments] = useState<CheckInComment[]>([])
  const [commentsReady, setCommentsReady] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [commentSubmitError, setCommentSubmitError] = useState<string | null>(
    null
  )
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
    if (!activeCheckIn?.id) return

    let cancelled = false

    const fetchLikeStatus = async () => {
      setLikeStatusReady(false)
      setLikeError(null)

      try {
        const response = await fetch(
          API_ROUTES.CHECKINS.LIKE(activeCheckIn.id),
          {
            headers: getDeviceHeaders(),
          }
        )
        const body: CheckInLikeStatus & { error?: string } =
          await response.json()

        if (!response.ok) {
          throw new Error(body.error || '좋아요 상태를 불러오지 못했습니다.')
        }

        if (!cancelled) {
          setLiked(body.liked)
          setResolvedCheckIn((current) => {
            const target = current ?? activeCheckIn
            return { ...target, likeCount: body.likeCount }
          })
        }
      } catch (statusError) {
        if (!cancelled) {
          setLikeError(
            statusError instanceof Error
              ? statusError.message
              : '좋아요 상태를 불러오지 못했습니다.'
          )
        }
      } finally {
        if (!cancelled) setLikeStatusReady(true)
      }
    }

    fetchLikeStatus()

    return () => {
      cancelled = true
    }
    // activeCheckIn includes local like count updates; id is the only fetch key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCheckIn?.id])

  const fetchComments = async (checkInIdToLoad: string) => {
    setCommentsReady(false)
    setCommentsError(null)

    try {
      const response = await fetch(
        API_ROUTES.CHECKINS.COMMENTS(checkInIdToLoad)
      )
      const body: { comments?: CheckInComment[]; error?: string } =
        await response.json()

      if (!response.ok) {
        throw new Error(body.error || '댓글을 불러오지 못했습니다.')
      }

      setComments(body.comments ?? [])
    } catch (commentError) {
      setCommentsError(
        commentError instanceof Error
          ? commentError.message
          : '댓글을 불러오지 못했습니다.'
      )
    } finally {
      setCommentsReady(true)
    }
  }

  useEffect(() => {
    if (!activeCheckIn?.id) return

    let cancelled = false

    const loadComments = async () => {
      setCommentsReady(false)
      setCommentsError(null)

      try {
        const response = await fetch(
          API_ROUTES.CHECKINS.COMMENTS(activeCheckIn.id)
        )
        const body: { comments?: CheckInComment[]; error?: string } =
          await response.json()

        if (!response.ok) {
          throw new Error(body.error || '댓글을 불러오지 못했습니다.')
        }

        if (!cancelled) setComments(body.comments ?? [])
      } catch (commentError) {
        if (!cancelled) {
          setCommentsError(
            commentError instanceof Error
              ? commentError.message
              : '댓글을 불러오지 못했습니다.'
          )
        }
      } finally {
        if (!cancelled) setCommentsReady(true)
      }
    }

    loadComments()

    return () => {
      cancelled = true
    }
  }, [activeCheckIn?.id])

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

  const updateActiveCheckIn = (
    patch: Partial<CheckIn>,
    nextLiked?: boolean
  ) => {
    const target = activeCheckIn
    if (!target) return

    const updated = { ...target, ...patch }
    setResolvedCheckIn(updated)
    onCheckInUpdated?.(updated, nextLiked)
  }

  const handleToggleLike = async () => {
    if (!activeCheckIn || isTogglingLike) return

    const lastConfirmedCount = activeCheckIn.likeCount
    setIsTogglingLike(true)
    setLikeError(null)

    try {
      const response = await fetch(API_ROUTES.CHECKINS.LIKE(activeCheckIn.id), {
        method: 'POST',
        headers: getDeviceHeaders(),
      })
      const body: CheckInLikeStatus & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(body.error || '좋아요를 반영하지 못했습니다.')
      }

      setLiked(body.liked)
      updateActiveCheckIn({ likeCount: body.likeCount }, body.liked)
    } catch (toggleError) {
      updateActiveCheckIn({ likeCount: lastConfirmedCount })
      setLikeError(
        toggleError instanceof Error
          ? toggleError.message
          : '좋아요를 반영하지 못했습니다.'
      )
    } finally {
      setIsTogglingLike(false)
    }
  }

  const handleSubmitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (!activeCheckIn || isSubmittingComment) return

    const trimmedComment = newComment.trim()
    if (!trimmedComment) {
      setCommentSubmitError('댓글 내용을 입력하세요.')
      return
    }

    setIsSubmittingComment(true)
    setCommentSubmitError(null)

    try {
      const response = await fetch(
        API_ROUTES.CHECKINS.COMMENTS(activeCheckIn.id),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: trimmedComment }),
        }
      )
      const body: CheckInComment & { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(body.error || '댓글을 등록하지 못했습니다.')
      }

      setComments((current) => [...current, body])
      setNewComment('')
    } catch (submitError) {
      setCommentSubmitError(
        submitError instanceof Error
          ? submitError.message
          : '댓글을 등록하지 못했습니다.'
      )
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!activeCheckIn) return

    setCommentSubmitError(null)

    try {
      const response = await fetch(
        API_ROUTES.CHECKINS.COMMENT_DETAIL(activeCheckIn.id, commentId),
        { method: 'DELETE' }
      )
      const body: { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error(body.error || '댓글을 삭제하지 못했습니다.')
      }

      setComments((current) =>
        current.filter((comment) => comment.id !== commentId)
      )
    } catch (deleteError) {
      setCommentSubmitError(
        deleteError instanceof Error
          ? deleteError.message
          : '댓글을 삭제하지 못했습니다.'
      )
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 p-4"
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
                src={getSafeImageSrc(activeCheckIn.userImage)}
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
                src={getSafeImageSrc(activeCheckIn.photoUrl)}
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
            <p className="mb-1 text-xs font-medium text-gray-500">
              업로더 캡션
            </p>
            <p className="text-gray-700">{activeCheckIn.comment}</p>
          </div>
        )}

        <div className="border-t px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={!activeCheckIn || isTogglingLike || !likeStatusReady}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                liked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={liked}
              aria-label={liked ? '인증 좋아요 취소' : '인증 좋아요'}
            >
              <svg
                className="h-5 w-5"
                fill={liked ? 'currentColor' : 'none'}
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
            </button>
            {isTogglingLike && (
              <span className="text-sm text-gray-500" aria-live="polite">
                좋아요 반영 중…
              </span>
            )}
            {likeError && (
              <span className="text-sm text-red-600" role="status">
                {likeError}
              </span>
            )}
          </div>
        </div>

        {!isLoading && !error && activeCheckIn && (
          <section
            className="border-t px-4 py-3"
            aria-labelledby="comments-title"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 id="comments-title" className="text-sm font-semibold">
                  댓글
                </h2>
                <p className="text-xs text-gray-500">
                  업로더 캡션과 분리된 인증 댓글입니다.
                </p>
              </div>
              {commentsError && (
                <button
                  type="button"
                  onClick={() => fetchComments(activeCheckIn.id)}
                  className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  댓글 다시 시도
                </button>
              )}
            </div>

            {!commentsReady ? (
              <p className="text-sm text-gray-500" aria-live="polite">
                댓글을 불러오는 중입니다…
              </p>
            ) : commentsError ? (
              <p className="text-sm text-red-600" role="status">
                {commentsError}
              </p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((comment) => (
                  <li key={comment.id} className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {comment.authorName}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                          {comment.content}
                        </p>
                      </div>
                      {comment.canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="shrink-0 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleSubmitComment} className="mt-4 space-y-2">
              <label
                htmlFor="checkin-comment-input"
                className="text-xs font-medium text-gray-600"
              >
                새 댓글
              </label>
              <textarea
                id="checkin-comment-input"
                value={newComment}
                onChange={(event) => {
                  setNewComment(event.target.value)
                  setCommentSubmitError(null)
                }}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="인증에 대한 댓글을 남겨보세요."
                aria-describedby={
                  commentSubmitError ? 'checkin-comment-error' : undefined
                }
              />
              {commentSubmitError && (
                <p
                  id="checkin-comment-error"
                  className="text-sm text-red-600"
                  role="status"
                >
                  {commentSubmitError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmittingComment || newComment.trim().length === 0}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmittingComment ? '댓글 등록 중…' : '댓글 등록'}
              </button>
            </form>
          </section>
        )}

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
