# Vercel Deployment Setup

## Wymagane zmienne środowiskowe na Vercel

Aby aplikacja działała poprawnie na Vercel, musisz ustawić następujące zmienne środowiskowe w ustawieniach projektu:

### W Vercel Dashboard → Settings → Environment Variables dodaj:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Wartość: `https://rmvtjlrcrrjzzjhugkuh.supabase.co`
   - Environment: Production, Preview, Development

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Wartość: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdnRqbHJjcnJqenpqaHVna3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NjE5MzIsImV4cCI6MjA4MTEzNzkzMn0.kY09Hw-VGtuUFvNzKjQmAgX5OKXOFfSpqsPH0SMzsFk`
   - Environment: Production, Preview, Development

3. **NEXT_PUBLIC_SITE_URL** (opcjonalne, ale zalecane)
   - Wartość dla Production: `https://twoja-domena.vercel.app`
   - Wartość dla Preview: `https://${VERCEL_URL}`
   - Wartość dla Development: `http://localhost:3000`

## Kroki deployment:

1. Push kod do GitHub/GitLab
2. Połącz repo z Vercel
3. Dodaj zmienne środowiskowe w Vercel Dashboard
4. Zrób redeploy projektu

## Troubleshooting:

### Error 500: MIDDLEWARE_INVOCATION_FAILED
- Sprawdź czy wszystkie zmienne środowiskowe są ustawione
- Sprawdź logi w Vercel Dashboard → Deployments → [wybierz deployment] → Function Logs
- Upewnij się, że używasz Node.js 18.x lub nowszego

### Supabase Connection Issues
- Sprawdź czy URL i Anon Key są poprawne
- Sprawdź czy Supabase projekt jest aktywny
- Sprawdź Row Level Security (RLS) policies w Supabase

## Po deployment:

1. Dodaj domenę Vercel do Supabase Redirect URLs:
   - Supabase Dashboard → Authentication → URL Configuration
   - Site URL: `https://twoja-domena.vercel.app`
   - Redirect URLs: Dodaj `https://twoja-domena.vercel.app/**`
