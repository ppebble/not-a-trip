/**
 * useBackgroundUpload 훅
 * 백그라운드 업로드 큐 관리
 * - uploadQueueStore 연동
 * - 네트워크 상태에 따른 업로드 일시정지/재개
 * - 업로드 완료 콜백
 *
 * @requirements 3.3
 */

import { useCallback, useEffect, useRef } from 'react'
import {
  useUploadQueueStore,
  getRetryDelay,
  type UploadItem,
} from '@/stores/uploadQueueStore'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

/** 업로드 함수 타입 (실제 API 호출) */
export type UploadFn = (
  file: File,
  onProgress: (progress: number) => void,
  metadata?: Record<string, unknown>
) => Promise<unknown>

interface UseBackgroundUploadOptions {
  /** 실제 업로드를 수행하는 함수 */
  uploadFn: UploadFn
  /** 업로드 완료 콜백 */
  onComplete?: (item: UploadItem, result: unknown) => void
  /** 업로드 실패 콜백 (최대 재시도 초과) */
  onFailed?: (item: UploadItem, error: Error) => void
  /** 자동 시작 여부 (기본: true) */
  autoStart?: boolean
}

interface UseBackgroundUploadReturn {
  /** 파일을 큐에 추가 */
  enqueue: (file: File, metadata?: Record<string, unknown>) => string
  /** 업로드 일시정지 */
  pause: () => void
  /** 업로드 재개 */
  resume: () => void
  /** 특정 아이템 재시도 */
  retry: (id: string) => void
  /** 특정 아이템 취소 */
  cancel: (id: string) => void
  /** 완료된 아이템 정리 */
  clearCompleted: () => void
  /** 큐 상태 */
  queue: UploadItem[]
  /** 일시정지 여부 */
  isPaused: boolean
  /** 현재 업로드 중인 아이템 ID */
  currentUploadId: string | null
}

export function useBackgroundUpload(
  options: UseBackgroundUploadOptions
): UseBackgroundUploadReturn {
  const { uploadFn, onComplete, onFailed, autoStart = true } = options
  const { isOnline } = useNetworkStatus()

  const store = useUploadQueueStore()
  const isProcessingRef = useRef(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 안정적인 참조를 위한 ref
  const uploadFnRef = useRef(uploadFn)
  const onCompleteRef = useRef(onComplete)
  const onFailedRef = useRef(onFailed)
  uploadFnRef.current = uploadFn
  onCompleteRef.current = onComplete
  onFailedRef.current = onFailed

  /** 단일 아이템 업로드 처리 */
  const processItem = useCallback(async (item: UploadItem) => {
    const { updateStatus, setError, incrementRetry, setCurrentUploadId } =
      useUploadQueueStore.getState()

    setCurrentUploadId(item.id)
    updateStatus(item.id, 'uploading', 0)

    try {
      const result = await uploadFnRef.current(
        item.file,
        (progress) => updateStatus(item.id, 'uploading', progress),
        item.metadata
      )

      updateStatus(item.id, 'completed', 100)
      setCurrentUploadId(null)
      onCompleteRef.current?.(item, result)
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('업로드에 실패했습니다')

      if (item.retryCount < item.maxRetries) {
        // 재시도 가능: 지수 백오프 후 재시도
        setError(item.id, error.message)
        const delay = getRetryDelay(item.retryCount)

        retryTimerRef.current = setTimeout(() => {
          const { queue } = useUploadQueueStore.getState()
          const current = queue.find((q) => q.id === item.id)
          if (current && current.status === 'error') {
            incrementRetry(item.id)
          }
        }, delay)
      } else {
        // 최대 재시도 초과
        setError(item.id, error.message)
        setCurrentUploadId(null)
        onFailedRef.current?.(item, error)
      }
    }
  }, [])

  /** 큐 처리 루프 */
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      while (true) {
        const { queue, isPaused } = useUploadQueueStore.getState()

        // 일시정지 또는 오프라인이면 중단
        if (isPaused || !navigator.onLine) break

        const nextItem = queue.find((item) => item.status === 'pending')
        if (!nextItem) break

        await processItem(nextItem)
      }
    } finally {
      isProcessingRef.current = false
    }
  }, [processItem])

  // 네트워크 상태 변화에 따른 일시정지/재개
  useEffect(() => {
    if (!isOnline) {
      store.setPaused(true)
    } else if (store.isPaused) {
      store.setPaused(false)
    }
  }, [isOnline, store])

  // 큐 변경 또는 일시정지 해제 시 처리 시작
  useEffect(() => {
    if (!autoStart) return
    if (store.isPaused) return

    const hasPending = store.queue.some((item) => item.status === 'pending')
    if (hasPending && !isProcessingRef.current) {
      processQueue()
    }
  }, [store.queue, store.isPaused, autoStart, processQueue])

  // 클린업
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
      }
    }
  }, [])

  const enqueue = useCallback(
    (file: File, metadata?: Record<string, unknown>) => {
      return store.addToQueue(file, metadata)
    },
    [store]
  )

  const pause = useCallback(() => store.setPaused(true), [store])
  const resume = useCallback(() => store.setPaused(false), [store])

  const retry = useCallback(
    (id: string) => {
      store.incrementRetry(id)
    },
    [store]
  )

  const cancel = useCallback(
    (id: string) => {
      store.removeFromQueue(id)
    },
    [store]
  )

  return {
    enqueue,
    pause,
    resume,
    retry,
    cancel,
    clearCompleted: store.clearCompleted,
    queue: store.queue,
    isPaused: store.isPaused,
    currentUploadId: store.currentUploadId,
  }
}
