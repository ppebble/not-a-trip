'use client'

import { useEffect, useState } from 'react'

/**
 * 디바이스 WebGL/GPU 능력 감지 훅
 *
 * SSR 시 안전한 기본값을 반환하고, 클라이언트 마운트 후
 * WebGL 컨텍스트 및 GPU 렌더러 정보를 감지한다.
 * 감지 결과는 sessionStorage에 캐싱하여 반복 감지를 방지한다.
 *
 * Requirements: 5.1, 5.2, 5.6
 */

const STORAGE_KEY = 'device-capability'

const LOW_END_GPU_KEYWORDS = [
  'swiftshader',
  'llvmpipe',
  'software',
  'microsoft basic render',
]

export interface DeviceCapability {
  webglSupported: boolean
  gpuTier: 'high' | 'low'
  isHighEnd: boolean
  isReady: boolean
}

const SSR_DEFAULT: DeviceCapability = {
  webglSupported: false,
  gpuTier: 'low',
  isHighEnd: false,
  isReady: false,
}

interface CachedResult {
  webglSupported: boolean
  gpuRenderer: string
  gpuTier: 'high' | 'low'
}

function detectCapability(): CachedResult {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) {
      return { webglSupported: false, gpuRenderer: '', gpuTier: 'low' }
    }

    const webglGl = gl as WebGLRenderingContext
    const debugInfo = webglGl.getExtension('WEBGL_debug_renderer_info')
    let gpuRenderer = ''
    let gpuTier: 'high' | 'low' = 'low'

    if (debugInfo) {
      gpuRenderer =
        webglGl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      const rendererLower = gpuRenderer.toLowerCase()
      const isLowEnd = LOW_END_GPU_KEYWORDS.some((keyword) =>
        rendererLower.includes(keyword)
      )
      gpuTier = isLowEnd ? 'low' : 'high'
    }

    // WebGL 컨텍스트 정리
    const loseContext = webglGl.getExtension('WEBGL_lose_context')
    if (loseContext) {
      loseContext.loseContext()
    }

    return { webglSupported: true, gpuRenderer, gpuTier }
  } catch {
    return { webglSupported: false, gpuRenderer: '', gpuTier: 'low' }
  }
}

function getCachedResult(): CachedResult | null {
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (!cached) return null
    return JSON.parse(cached) as CachedResult
  } catch {
    return null
  }
}

function setCachedResult(result: CachedResult): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  } catch {
    // sessionStorage 접근 실패 시 무시
  }
}

export function useDeviceCapability(): DeviceCapability {
  const [capability, setCapability] = useState<DeviceCapability>(SSR_DEFAULT)

  useEffect(() => {
    const cached = getCachedResult()

    if (cached) {
      setCapability({
        webglSupported: cached.webglSupported,
        gpuTier: cached.gpuTier,
        isHighEnd: cached.webglSupported && cached.gpuTier === 'high',
        isReady: true,
      })
      return
    }

    const result = detectCapability()
    setCachedResult(result)

    setCapability({
      webglSupported: result.webglSupported,
      gpuTier: result.gpuTier,
      isHighEnd: result.webglSupported && result.gpuTier === 'high',
      isReady: true,
    })
  }, [])

  return capability
}
