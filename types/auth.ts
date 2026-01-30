import { User } from '@supabase/supabase-js'

export type AuthUser = User

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface ResetPasswordFormData {
  email: string
}
