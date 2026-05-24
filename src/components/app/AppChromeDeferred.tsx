'use client'

import { CourseProgressBanner } from '@/components/course/CourseProgressBanner'
import {
  SerwistRegistration,
  InstallPromptListener,
  InstallBottomSheet,
  InstallToast,
  IosPwaGuide,
} from '@/components/pwa'

export default function AppChromeDeferred() {
  return (
    <>
      <CourseProgressBanner />
      <InstallPromptListener />
      <InstallBottomSheet />
      <InstallToast />
      <IosPwaGuide />
      <SerwistRegistration />
    </>
  )
}
