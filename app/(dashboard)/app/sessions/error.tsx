'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Market Sessions error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle>Wystąpił błąd</CardTitle>
          <CardDescription>
            Nie udało się załadować danych sesji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Możliwe przyczyny:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Problem z połączeniem do bazy danych</li>
              <li>Brak uprawnień do tabeli market_sessions</li>
              <li>Brak skonfigurowanego RLS policy</li>
            </ul>
          </div>
          
          {error.message && (
            <div className="text-xs bg-muted p-2 rounded font-mono">
              {error.message}
            </div>
          )}

          {error.digest && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Error ID: {error.digest}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Spróbuj ponownie
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/app'}
              className="flex-1"
            >
              Wróć do Trades
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
