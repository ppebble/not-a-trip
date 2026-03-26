interface UserInfoBannerProps {
  userInfo: {
    name: string
    email?: string
  }
}

export function UserInfoBanner({ userInfo }: UserInfoBannerProps) {
  return (
    <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
      <div className="flex items-center gap-2">
        <svg
          className="h-5 w-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="font-medium text-green-500">회원으로 등록</p>
          <p className="text-sm text-green-500/80">
            {userInfo.name}님으로 등록됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
