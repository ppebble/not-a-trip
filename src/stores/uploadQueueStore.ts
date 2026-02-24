/**
 * uploadQueueStore
 * 업로드 큐 관리 (추가, 제거, 상태 업데이트, 재시도)
 * - 지수 백오프 재시도 로직
 * - 전체 진행률 계산
 *
 * @requirements 3.3
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/** 업로드 아이템 상태 */
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error'

/** 업로드 큐 아이템 */
export interface UploadItem {
  /** 고유 ID */
  id: string
  /** 업로드할 파일 */
  file: File
  /** 업로드 상태 */
  status: UploadStatus
  /** 진행률 (0 ~ 100) */
  progress: number
  /** 에러 메시지 */
  errorMessage?: string
  /** 재시도 횟수 */
  retryCount: number
  /** 최대 재시도 횟수 */
  maxRetries: number
  /** 생성 시간 */
  createdAt: number
  /** 관련 메타데이터 (spotId 등) */
  metadata?: Record<string, unknown>
}

/** 재시도 지수 백오프 설정 */
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  delays: [1000, 2000, 4000] as readonly number[],
} as const

interface UploadQueueState {
  /** 업로드 큐 */
  queue: UploadItem[]
  /** 현재 업로드 중인 아이템 ID */
  currentUploadId: string | null
  /** 업로드 일시정지 여부 */
  isPaused: boolean
}

interface UploadQueueActions {
  /** 큐에 파일 추가, 생성된 아이템 ID 반환 */
  addToQueue: (file: File, metadata?: Record<string, unknown>) => string
  /** 큐에서 아이템 제거 */
  removeFromQueue: (id: string) => void
  /** 완료된 아이템 모두 제거 */
  clearCompleted: () => void
  /** 아이템 상태 업데이트 */
  updateStatus: (id: string, status: UploadStatus, progress?: number) => void
  /** 에러 상태 설정 */
  setError: (id: string, errorMessage: string) => void
  /** 재시도 횟수 증가 */
  incrementRetry: (id: string) => void
  /** 현재 업로드 ID 설정 */
  setCurrentUploadId: (id: string | null) => void
  /** 일시정지 토글 */
  setPaused: (paused: boolean) => void
  /** 전체 큐 초기화 */
  resetQueue: () => void
}

type UploadQueueStore = UploadQueueState & UploadQueueActions

/** 고유 ID 생성 */
function generateId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const initialState: UploadQueueState = {
  queue: [],
  currentUploadId: null,
  isPaused: false,
}

export const useUploadQueueStore = create<UploadQueueStore>()(
  devtools(
    (set) => ({
      ...initialState,

      addToQueue: (file, metadata) => {
        const id = generateId()
        const item: UploadItem = {
          id,
          file,
          status: 'pending',
          progress: 0,
          retryCount: 0,
          maxRetries: RETRY_CONFIG.maxRetries,
          createdAt: Date.now(),
          metadata,
        }
        set(
          (state) => ({ queue: [...state.queue, item] }),
          false,
          'uploadQueue/addToQueue'
        )
        return id
      },

      removeFromQueue: (id) =>
        set(
          (state) => ({
            queue: state.queue.filter((item) => item.id !== id),
            currentUploadId:
              state.currentUploadId === id ? null : state.currentUploadId,
          }),
          false,
          'uploadQueue/removeFromQueue'
        ),

      clearCompleted: () =>
        set(
          (state) => ({
            queue: state.queue.filter((item) => item.status !== 'completed'),
          }),
          false,
          'uploadQueue/clearCompleted'
        ),

      updateStatus: (id, status, progress) =>
        set(
          (state) => ({
            queue: state.queue.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status,
                    ...(progress !== undefined && { progress }),
                  }
                : item
            ),
          }),
          false,
          'uploadQueue/updateStatus'
        ),

      setError: (id, errorMessage) =>
        set(
          (state) => ({
            queue: state.queue.map((item) =>
              item.id === id
                ? { ...item, status: 'error' as const, errorMessage }
                : item
            ),
          }),
          false,
          'uploadQueue/setError'
        ),

      incrementRetry: (id) =>
        set(
          (state) => ({
            queue: state.queue.map((item) =>
              item.id === id
                ? {
                    ...item,
                    retryCount: item.retryCount + 1,
                    status: 'pending' as const,
                    errorMessage: undefined,
                  }
                : item
            ),
          }),
          false,
          'uploadQueue/incrementRetry'
        ),

      setCurrentUploadId: (id) =>
        set({ currentUploadId: id }, false, 'uploadQueue/setCurrentUploadId'),

      setPaused: (paused) =>
        set({ isPaused: paused }, false, 'uploadQueue/setPaused'),

      resetQueue: () => set(initialState, false, 'uploadQueue/resetQueue'),
    }),
    { name: 'upload-queue-store' }
  )
)

// Selectors

/** 다음 업로드 대기 아이템 */
export const useNextPendingItem = () =>
  useUploadQueueStore((state) =>
    state.queue.find((item) => item.status === 'pending')
  )

/** 전체 진행률 (0 ~ 100) */
export const useTotalProgress = () =>
  useUploadQueueStore((state) => {
    const items = state.queue.filter((item) => item.status !== 'completed')
    if (items.length === 0) return 100
    const total = items.reduce((sum, item) => sum + item.progress, 0)
    return Math.round(total / items.length)
  })

/** 업로드 중인 아이템 수 */
export const useActiveUploadCount = () =>
  useUploadQueueStore(
    (state) => state.queue.filter((item) => item.status === 'uploading').length
  )

/** 대기 중인 아이템 수 */
export const usePendingCount = () =>
  useUploadQueueStore(
    (state) => state.queue.filter((item) => item.status === 'pending').length
  )

/** 에러 아이템 수 */
export const useErrorCount = () =>
  useUploadQueueStore(
    (state) => state.queue.filter((item) => item.status === 'error').length
  )

/** 큐가 비어있는지 여부 */
export const useIsQueueEmpty = () =>
  useUploadQueueStore((state) => state.queue.length === 0)

/** 업로드 일시정지 여부 */
export const useIsUploadPaused = () =>
  useUploadQueueStore((state) => state.isPaused)

/**
 * 지수 백오프 딜레이 계산
 * @param retryCount 현재 재시도 횟수
 * @returns 대기 시간 (ms)
 */
export function getRetryDelay(retryCount: number): number {
  if (retryCount >= RETRY_CONFIG.delays.length) {
    return RETRY_CONFIG.delays[RETRY_CONFIG.delays.length - 1]
  }
  return RETRY_CONFIG.delays[retryCount]
}
