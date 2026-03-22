import { useEffect, useRef } from 'react'

/**
 * useResizeObserver - 컨테이너 크기 변경 감지 훅
 *
 * ResizeObserver를 사용하여 대상 요소의 크기 변경을 감지하고,
 * requestAnimationFrame debounce를 적용하여 콜백을 실행합니다.
 * 무한 루프(ResizeLoop Error) 방지 및 메모리 누수 방지를 위해
 * cleanup 시 disconnect()를 호출합니다.
 *
 * @param ref - 관찰할 DOM 요소의 ref
 * @param callback - 크기 변경 시 실행할 콜백
 */
export function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void
) {
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(() => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null
        callback()
      })
    })

    observer.observe(element)

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      observer.disconnect()
    }
  }, [ref, callback])
}
