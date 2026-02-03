import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  try {
    // Sprawdź czy zmienne środowiskowe są ustawione
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return response
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Jeśli user nie jest zalogowany i próbuje dostać się do /app - redirect do /login
    if (!user && request.nextUrl.pathname.startsWith('/app')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Jeśli user jest zalogowany i próbuje dostać się do /login lub /register - redirect do /app
    // Ale pozwól na dostęp do /reset-password/confirm (potrzebne do zmiany hasła)
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
      if (!request.nextUrl.pathname.startsWith('/reset-password')) {
        return NextResponse.redirect(new URL('/app', request.url))
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // W przypadku błędu, pozwól na kontynuację requestu
    return response
  }
}
