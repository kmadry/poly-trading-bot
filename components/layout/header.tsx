import { UserMenu } from './user-menu'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  )
}
