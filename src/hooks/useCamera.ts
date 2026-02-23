/**
 * useCamera 훅
 * 카메라 접근 및 사진 촬영
 *
 * - navigator.mediaDevices.getUserMedia 래핑
 * - 전면/후면 카메라 전환
 * - 사진 촬영 (canvas 캡처)
 * - 에러 핸들링
 * - 컴포넌트 언마운트 시 미디어 스트림 트랙 명시적 종료 (track.stop())
 * - useEffect cleanup에서 모든 트랙 정리
 *
 * @requirements 3.1, 3.4
 */

import { useState, useRef, useCallback, useEffect } from 'react'

export interface CameraError {
  code:
    | 'NOT_ALLOWED'
    | 'NOT_FOUND'
    | 'NOT_READABLE'
    | 'OVERCONSTRAINED'
    | 'NOT_SUPPORTED'
    | 'UNKNOWN'
  message: string
}

export interface CameraState {
  /** 카메라 활성화 여부 */
  isCameraActive: boolean
  /** 카메라 스트림 */
  stream: MediaStream | null
  /** 카메라 오류 */
  error: CameraError | null
  /** 전면/후면 카메라 */
  facingMode: 'user' | 'environment'
}

export interface UseCameraOptions {
  /** 선호 카메라 방향 (기본: 후면) */
  facingMode?: 'user' | 'environment'
  /** 해상도 */
  resolution?: { width: number; height: number }
}

export interface UseCameraReturn {
  /** 비디오 요소 ref */
  videoRef: React.RefObject<HTMLVideoElement | null>
  /** 카메라 상태 */
  state: CameraState
  /** 카메라 시작 */
  startCamera: () => Promise<void>
  /** 카메라 중지 */
  stopCamera: () => void
  /** 카메라 전환 (전면/후면) */
  switchCamera: () => Promise<void>
  /** 사진 촬영 */
  capturePhoto: () => Promise<Blob | null>
}

function mapMediaError(error: unknown): CameraError {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return {
          code: 'NOT_ALLOWED',
          message:
            '카메라 접근 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.',
        }
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return {
          code: 'NOT_FOUND',
          message: '카메라를 찾을 수 없습니다.',
        }
      case 'NotReadableError':
      case 'TrackStartError':
        return {
          code: 'NOT_READABLE',
          message: '카메라가 다른 앱에서 사용 중입니다.',
        }
      case 'OverconstrainedError':
        return {
          code: 'OVERCONSTRAINED',
          message: '요청한 카메라 설정을 지원하지 않습니다.',
        }
    }
  }
  return {
    code: 'UNKNOWN',
    message: '카메라 접근 중 알 수 없는 오류가 발생했습니다.',
  }
}

/** 스트림의 모든 트랙을 명시적으로 종료 */
function stopAllTracks(stream: MediaStream | null) {
  if (!stream) return
  stream.getTracks().forEach((track) => track.stop())
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode: initialFacingMode = 'environment', resolution } = options

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [state, setState] = useState<CameraState>({
    isCameraActive: false,
    stream: null,
    error: null,
    facingMode: initialFacingMode,
  })

  const stopCamera = useCallback(() => {
    stopAllTracks(streamRef.current)
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setState((prev) => ({
      ...prev,
      isCameraActive: false,
      stream: null,
      error: null,
    }))
  }, [])

  const startCamera = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setState((prev) => ({
        ...prev,
        error: {
          code: 'NOT_SUPPORTED',
          message: '이 브라우저에서는 카메라를 지원하지 않습니다.',
        },
      }))
      return
    }

    // 기존 스트림 정리
    stopAllTracks(streamRef.current)

    setState((prev) => ({ ...prev, error: null }))

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: state.facingMode,
          ...(resolution && {
            width: { ideal: resolution.width },
            height: { ideal: resolution.height },
          }),
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setState((prev) => ({
        ...prev,
        isCameraActive: true,
        stream,
        error: null,
      }))
    } catch (error) {
      const cameraError = mapMediaError(error)
      setState((prev) => ({
        ...prev,
        isCameraActive: false,
        stream: null,
        error: cameraError,
      }))
    }
  }, [state.facingMode, resolution])

  const switchCamera = useCallback(async () => {
    const newFacingMode = state.facingMode === 'user' ? 'environment' : 'user'

    setState((prev) => ({ ...prev, facingMode: newFacingMode }))

    // 카메라가 활성화 상태면 새 방향으로 재시작
    if (state.isCameraActive) {
      stopAllTracks(streamRef.current)
      streamRef.current = null

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: newFacingMode,
            ...(resolution && {
              width: { ideal: resolution.width },
              height: { ideal: resolution.height },
            }),
          },
          audio: false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setState((prev) => ({
          ...prev,
          facingMode: newFacingMode,
          stream,
          error: null,
        }))
      } catch (error) {
        const cameraError = mapMediaError(error)
        setState((prev) => ({
          ...prev,
          isCameraActive: false,
          stream: null,
          error: cameraError,
        }))
      }
    }
  }, [state.facingMode, state.isCameraActive, resolution])

  const capturePhoto = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current
    if (!video || !state.isCameraActive) return null

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0)

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
    })
  }, [state.isCameraActive])

  // 언마운트 시 미디어 스트림 트랙 명시적 종료
  useEffect(() => {
    return () => {
      stopAllTracks(streamRef.current)
      streamRef.current = null
    }
  }, [])

  return {
    videoRef,
    state,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
  }
}
