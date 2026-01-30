import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/get-user'

export default async function Home() {
  const user = await getUser()

  if (user) {
    redirect('/app')
  } else {
    redirect('/login')
  }
}
