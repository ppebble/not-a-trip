import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function AccountSettingsPage() {
  const session = await auth()

  if (session?.user?.id) {
    redirect(`/profile/${session.user.id}?section=management`)
  }

  redirect('/auth/signin?callbackUrl=/settings/account')
}
