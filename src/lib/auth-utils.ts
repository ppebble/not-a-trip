import { Session } from 'next-auth'
import { UserRole } from '@/types'

/**
 * 사용자가 관리자인지 확인
 * @param session NextAuth 세션
 * @returns 관리자 여부
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin'
}

/**
 * 스팟 수정 권한 확인
 * - 관리자: 모든 스팟 수정 가능
 * - 일반 사용자: 본인 스팟만 수정 가능
 * @param session NextAuth 세션
 * @param spotAuthorId 스팟 작성자 ID
 * @returns 수정 권한 여부
 */
export function canEditSpot(
  session: Session | null,
  spotAuthorId?: string
): boolean {
  if (!session?.user) return false
  if (isAdmin(session)) return true
  return spotAuthorId === session.user.id
}

/**
 * 스팟 삭제 권한 확인
 * - 관리자: 모든 스팟 삭제 가능
 * - 일반 사용자: 본인 스팟만 삭제 가능
 * @param session NextAuth 세션
 * @param spotAuthorId 스팟 작성자 ID
 * @returns 삭제 권한 여부
 */
export function canDeleteSpot(
  session: Session | null,
  spotAuthorId?: string
): boolean {
  if (!session?.user) return false
  if (isAdmin(session)) return true
  return spotAuthorId === session.user.id
}

/**
 * 사용자 역할 가져오기
 * @param session NextAuth 세션
 * @returns 사용자 역할 (기본값: 'user')
 */
export function getUserRole(session: Session | null): UserRole {
  return session?.user?.role || 'user'
}
