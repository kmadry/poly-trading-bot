import { getUser } from '@/lib/auth/get-user'
import { LogOut, User } from 'lucide-react'
import { logout } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'

export async function UserMenu() {
  const user = await getUser()

  if (!user) return null

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{user.email}</span>
      </div>
      
      <form action={logout}>
        <Button variant="outline" size="sm">
          <LogOut className="h-4 w-4" />
          Wyloguj
        </Button>
      </form>
    </div>
  )
}
