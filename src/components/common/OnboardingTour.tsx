'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { TourStep } from '@/hooks/useOnboarding'

interface OnboardingTourProps {
  steps: TourStep[]
  isActive: boolean
  currentStep: number
  onNext: () => void
  onSkip: () => void
  onComplete: () => void
  onDismiss?: () => void
}

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

interface TooltipPosition {
  top: number
  left: number
}

const TOOLTIP_MARGIN = 12
const HIGHLIGHT_PADDING = 8

/**
 * 대상 요소의 위치를 기반으로 툴팁 위치를 계산한다.
 * 뷰포트 경계를 벗어나지 않도록 자동 조정한다.
 */
function calculateTooltipPosition(
  targetRect: TargetRect,
  placement: 'top' | 'bottom' | 'left' | 'right',
  tooltipWidth: number,
  tooltipHeight: number
): TooltipPosition {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let top = 0
  let left = 0

  switch (placement) {
    case 'bottom':
      top =
        targetRect.top + targetRect.height + HIGHLIGHT_PADDING + TOOLTIP_MARGIN
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      break
    case 'top':
      top = targetRect.top - HIGHLIGHT_PADDING - TOOLTIP_MARGIN - tooltipHeight
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left = targetRect.left - HIGHLIGHT_PADDING - TOOLTIP_MARGIN - tooltipWidth
      break
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
      left =
        targetRect.left + targetRect.width + HIGHLIGHT_PADDING + TOOLTIP_MARGIN
      break
  }

  // 뷰포트 경계 체크 — 화면 밖 벗어남 방지
  const padding = 16
  if (left < padding) left = padding
  if (left + tooltipWidth > vw - padding) left = vw - padding - tooltipWidth
  if (top < padding) top = padding
  if (top + tooltipHeight > vh - padding) top = vh - padding - tooltipHeight

  return { top, left }
}

/**
 * OnboardingTour 오버레이 컴포넌트
 *
 * 전체 화면 반투명 오버레이 위에 대상 요소를 하이라이트하고
 * 설명 툴팁을 표시하는 온보딩 가이드 투어 UI.
 *
 * @requirements 3.5, 3.6, 3.11, 3.13, 3.14
 */
export default function OnboardingTour({
  steps,
  isActive,
  currentStep,
  onNext,
  onSkip,
  onComplete,
  onDismiss,
}: OnboardingTourProps) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({
    top: 0,
    left: 0,
  })
  const tooltipRef = useRef<HTMLDivElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  // 대상 요소 위치 계산
  const updateTargetRect = useCallback(() => {
    if (!step) return
    const el = document.querySelector(step.target)
    if (!el) return

    const rect = el.getBoundingClientRect()
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
  }, [step])

  // 대상 요소 위치 추적
  useEffect(() => {
    if (!isActive || !step) return
    updateTargetRect()

    const handleResize = () => updateTargetRect()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [isActive, step, updateTargetRect])

  // 툴팁 위치 계산
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return

    const tooltipEl = tooltipRef.current
    const tooltipWidth = tooltipEl.offsetWidth
    const tooltipHeight = tooltipEl.offsetHeight
    const placement = step?.placement || 'bottom'

    const pos = calculateTooltipPosition(
      targetRect,
      placement,
      tooltipWidth,
      tooltipHeight
    )
    setTooltipPos(pos)
  }, [targetRect, step])

  // 키보드 이벤트: Escape로 투어 종료
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, onSkip])

  // 투어 활성화 시 첫 번째 버튼에 포커스
  useEffect(() => {
    if (isActive && nextButtonRef.current) {
      nextButtonRef.current.focus()
    }
  }, [isActive, currentStep])

  if (!isActive || !step) return null

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      onNext()
    }
  }

  // box-shadow 기반 하이라이트: 대상 요소 크기의 투명 박스 + 거대한 box-shadow로 나머지 어둡게
  const highlightStyle: React.CSSProperties = targetRect
    ? {
        position: 'fixed',
        top: targetRect.top - HIGHLIGHT_PADDING,
        left: targetRect.left - HIGHLIGHT_PADDING,
        width: targetRect.width + HIGHLIGHT_PADDING * 2,
        height: targetRect.height + HIGHLIGHT_PADDING * 2,
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        pointerEvents: 'none' as const,
      }
    : {}

  const tooltipId = `onboarding-tooltip-${currentStep}`

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-describedby={tooltipId}
      className="fixed inset-0 z-[9999]"
    >
      {/* 오버레이 클릭 방지 레이어 */}
      <div className="fixed inset-0" aria-hidden="true" />

      {/* 하이라이트 영역 */}
      {targetRect && <div style={highlightStyle} aria-hidden="true" />}

      {/* 툴팁 */}
      <div
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className="fixed z-[10000] w-80 max-w-[calc(100vw-32px)] rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          {step.title}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onSkip}
              className="text-sm text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              type="button"
            >
              건너뛰기
            </button>

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-gray-500 underline underline-offset-4 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                type="button"
              >
                다시 보지 않기
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* 스텝 인디케이터 */}
            <span className="text-sm text-gray-400">
              {currentStep + 1}/{steps.length}
            </span>

            <button
              ref={nextButtonRef}
              onClick={handleNext}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
              type="button"
            >
              {isLastStep ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
