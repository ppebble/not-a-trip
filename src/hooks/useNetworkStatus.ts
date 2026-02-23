/**
 * useNetworkStatus 훅
 * 네트워크 상태 감지 (온라인/오프라인, 연결 유형)
 *
 * - navigator.onLine 및 online/offline 이벤트 감지
 * - Network Information API 활용 (지원 브라우저)
 * - Zustand networkStore와 연동
 *
 * @requirements 2.4, 3.3
 */

import { useEffect, useCallback } from 'react'
import { useNetworkStore } from '@/stores/networkStore'

type ConnectionType = 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'

/** Network Information API 타입 (실험적 API) */
interface NetworkInformation extends EventTarget {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
}

function getConnection(): NetworkInformation | null {
  if (typeof navigator === 'undefined') return null
  const nav = navigator as NavigatorWithConnection
  return nav.connection || nav.mozConnection || nav.webkitConnection || null
}

function parseEffectiveType(type?: string): ConnectionType {
  if (!type) return 'unknown'
  const map: Record<string, ConnectionType> = {
    'slow-2g': 'slow-2g',
    '2g': '2g',
    '3g': '3g',
    '4g': '4g',
  }
  return map[type] || 'unknown'
}

export interface UseNetworkStatusReturn {
  /** 온라인 여부 */
  isOnline: boolean
  /** 연결 유형 */
  connectionType: ConnectionType | null
  /** 다운링크 속도 (Mbps) */
  downlink: number | null
  /** 왕복 시간 (ms) */
  rtt: number | null
  /** 데이터 절약 모드 */
  saveData: boolean
  /** 느린 연결 여부 (3g 이하 또는 rtt > 500ms) */
  isSlowConnection: boolean
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const store = useNetworkStore()

  const updateConnectionInfo = useCallback(() => {
    const connection = getConnection()
    if (!connection) return

    store.setConnectionInfo({
      connectionType: parseEffectiveType(connection.effectiveType),
      downlink: connection.downlink ?? null,
      rtt: connection.rtt ?? null,
      saveData: connection.saveData ?? false,
    })
  }, [store])

  useEffect(() => {
    const handleOnline = () => {
      store.setOnline(true)
      updateConnectionInfo()
    }

    const handleOffline = () => {
      store.setOnline(false)
    }

    // 초기 상태 동기화
    store.setOnline(navigator.onLine)
    updateConnectionInfo()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Network Information API change 이벤트
    const connection = getConnection()
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [store, updateConnectionInfo])

  const isSlowConnection =
    !store.isOnline ||
    store.connectionType === '2g' ||
    store.connectionType === 'slow-2g' ||
    store.connectionType === '3g' ||
    (store.rtt !== null && store.rtt > 500)

  return {
    isOnline: store.isOnline,
    connectionType: store.connectionType,
    downlink: store.downlink,
    rtt: store.rtt,
    saveData: store.saveData,
    isSlowConnection,
  }
}
