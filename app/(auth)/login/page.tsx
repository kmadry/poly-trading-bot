import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { RecoveryHandler } from '@/components/auth/recovery-handler'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RecoveryHandler />
      </Suspense>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Logowanie</CardTitle>
          <CardDescription>
            Wpisz swój email i hasło, aby się zalogować
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-4">Ładowanie...</div>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </>
  )
}
