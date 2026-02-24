/**
 * bottomSheetStore - Bottom Sheet 상태 관리
 *
 * 열림/닫힘 상태, 높이 상태 (collapsed/half/full), 현재 스팟 ID 관리
 *
 * @requirements 1.2, 1.3
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type BottomSheetHeight = 'collapsed' | 'half' | 'full'

interface BottomSheetStore {
  /** 열림 여부 */
  isOpen: boolean
  /** 현재 높이 상태 */
  heightState: BottomSheetHeight
  /** 현재 스팟 ID */
  spotId: string | null

  /** Bottom Sheet 열기 (스팟 ID와 함께) */
  open: (spotId: string) => void
  /** Bottom Sheet 닫기 */
  close: () => void
  /** 높이 상태 변경 */
  setHeightState: (height: BottomSheetHeight) => void
  /** 위로 스와이프 (collapsed → half → full) */
  expandUp: () => void
  /** 아래로 스와이프 (full → half → collapsed → close) */
  collapseDown: () => void
  /** 전체 상태 리셋 */
  reset: () => void
}

/** 높이 상태 순서 (위로 확장) */
const HEIGHT_ORDER: BottomSheetHeight[] = ['collapsed', 'half', 'full']

export const useBottomSheetStore = create<BottomSheetStore>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      heightState: 'collapsed',
      spotId: null,

      open: (spotId) =>
        set(
          { isOpen: true, heightState: 'collapsed', spotId },
          false,
          'bottomSheet/open'
        ),

      close: () =>
        set(
          { isOpen: false, heightState: 'collapsed', spotId: null },
          false,
          'bottomSheet/close'
        ),

      setHeightState: (height) =>
        set({ heightState: height }, false, 'bottomSheet/setHeightState'),

      expandUp: () => {
        const { heightState } = get()
        const currentIndex = HEIGHT_ORDER.indexOf(heightState)
        if (currentIndex < HEIGHT_ORDER.length - 1) {
          set(
            { heightState: HEIGHT_ORDER[currentIndex + 1] },
            false,
            'bottomSheet/expandUp'
          )
        }
      },

      collapseDown: () => {
        const { heightState } = get()
        const currentIndex = HEIGHT_ORDER.indexOf(heightState)
        if (currentIndex > 0) {
          set(
            { heightState: HEIGHT_ORDER[currentIndex - 1] },
            false,
            'bottomSheet/collapseDown'
          )
        } else {
          // collapsed 상태에서 아래로 스와이프하면 닫기
          set(
            { isOpen: false, heightState: 'collapsed', spotId: null },
            false,
            'bottomSheet/close'
          )
        }
      },

      reset: () =>
        set(
          { isOpen: false, heightState: 'collapsed', spotId: null },
          false,
          'bottomSheet/reset'
        ),
    }),
    { name: 'bottom-sheet-store' }
  )
)

// Selectors
export const useIsBottomSheetOpen = () =>
  useBottomSheetStore((state) => state.isOpen)
export const useBottomSheetHeight = () =>
  useBottomSheetStore((state) => state.heightState)
export const useBottomSheetSpotId = () =>
  useBottomSheetStore((state) => state.spotId)
