/**
 * networkStore
 * 네트워크 상태 관리 (온라인/오프라인 감지)
 *
 * @requirements 2.4, 3.3
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface NetworkState {
  /** 온라인 여부 */
  isOnline: boolean
  /** 연결 유형 (wifi, cellular, etc.) */
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown' | null
  /** 다운링크 속도 (Mbps) */
  downlink: number | null
  /** 왕복 시간 (ms) */
  rtt: number | null
  /** 데이터 절약 모드 */
  saveData: boolean
}

interface NetworkStore extends NetworkState {
  setOnline: (isOnline: boolean) => void
  setConnectionInfo: (info: Partial<Omit<NetworkState, 'isOnline'>>) => void
  resetNetworkState: () => void
}

const initialState: NetworkState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  connectionType: null,
  downlink: null,
  rtt: null,
  saveData: false,
}

export const useNetworkStore = create<NetworkStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setOnline: (isOnline) =>
        set({ isOnline }, false, 'networkStore/setOnline'),

      setConnectionInfo: (info) =>
        set(
          (state) => ({ ...state, ...info }),
          false,
          'networkStore/setConnectionInfo'
        ),

      resetNetworkState: () =>
        set(initialState, false, 'networkStore/resetNetworkState'),
    }),
    { name: 'network-store' }
  )
)

// Selectors
export const useIsOnline = () => useNetworkStore((state) => state.isOnline)
export const useConnectionType = () =>
  useNetworkStore((state) => state.connectionType)
export const useSaveData = () => useNetworkStore((state) => state.saveData)
