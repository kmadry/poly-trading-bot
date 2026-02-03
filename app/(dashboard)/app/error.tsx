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
    console.error('Dashboard error:', error)
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
            Nie udało się załadować danych z bazy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Możliwe przyczyny:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Problem z połączeniem do bazy danych</li>
              <li>Brak zmiennych środowiskowych</li>
              <li>Brak uprawnień do danych</li>
            </ul>
          </div>
          
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
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              Strona główna
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
