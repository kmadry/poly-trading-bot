'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormField, FormMessage } from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć minimum 6 znaków'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    const errorParam = searchParams.get('error_description')
    
    if (message) {
      setSuccessMessage(message)
    }
    
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam)
      if (decodedError.includes('expired')) {
        setError('Link resetujący wygasł. Poproś o nowy link.')
      } else if (decodedError.includes('invalid')) {
        setError('Link resetujący jest nieprawidłowy. Poproś o nowy link.')
      } else {
        setError(decodedError)
      }
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormField>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="twoj@email.com"
          {...register('email')}
          disabled={loading}
        />
        <FormMessage>{errors.email?.message}</FormMessage>
      </FormField>

      <FormField>
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={loading}
        />
        <FormMessage>{errors.password?.message}</FormMessage>
      </FormField>

      {successMessage && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logowanie...' : 'Zaloguj się'}
      </Button>

      <div className="text-center text-sm">
        <Link
          href="/reset-password"
          className="text-muted-foreground hover:text-primary"
        >
          Zapomniałeś hasła?
        </Link>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Nie masz konta?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Zarejestruj się
        </Link>
      </div>
    </form>
  )
}
