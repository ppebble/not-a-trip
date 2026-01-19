/**
 * Device ID 유틸리티
 * 비회원 사용자 식별을 위한 UUID 생성 및 관리
 */

const DEVICE_ID_KEY = 'anime-pilgrim-device-id'

/**
 * UUID v4 생성 함수
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Device ID 가져오기 (없으면 생성)
 * 클라이언트 사이드에서만 동작
 */
export function getDeviceId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY)

    if (!deviceId) {
      deviceId = generateUUID()
      localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }

    return deviceId
  } catch {
    // localStorage 접근 불가 시 (시크릿 모드 등)
    return null
  }
}

/**
 * Device ID 초기화 (테스트용)
 */
export function resetDeviceId(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(DEVICE_ID_KEY)
  } catch {
    // 무시
  }
}
