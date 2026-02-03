'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RecoveryHandler() {
  const router = useRouter()

  useEffect(() => {
    // Sprawdź czy w URL jest type=recovery (w hash fragment)
    const hash = window.location.hash
    
    if (hash && hash.includes('type=recovery')) {
      // Przekieruj na stronę zmiany hasła
      router.push('/reset-password/confirm')
    }
  }, [router])

  return null // Ten komponent nic nie renderuje
}
