import { UserMenu } from './user-menu'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6 bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Trades</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
