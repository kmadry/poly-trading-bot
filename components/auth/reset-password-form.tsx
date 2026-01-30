'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { resetPassword } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormField, FormMessage } from '@/components/ui/form'

const resetPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append('email', data.email)

    const result = await resetPassword(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Link do resetowania hasła został wysłany na podany adres email.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Powrót do logowania
          </Button>
        </Link>
      </div>
    )
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

      {error && (
        <div className="rounded-md bg-destructive/15 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Powrót do logowania
        </Link>
      </div>
    </form>
  )
}
