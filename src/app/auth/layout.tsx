export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 인증 페이지는 헤더 없이 전체 화면 사용
  return <div className="-mt-14">{children}</div>
}
