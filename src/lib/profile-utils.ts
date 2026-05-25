export function formatJoinDate(createdAt: string): string {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}년 ${month}월 가입`
}

export function isProfileOwner(
  sessionUserId: string | null | undefined,
  profileUserId: string | null | undefined
): boolean {
  return !!sessionUserId && !!profileUserId && sessionUserId === profileUserId
}
