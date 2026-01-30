# ⚡ Quick Start - 5 minut do działającej aplikacji

## 1. Zainstaluj zależności

```bash
npm install
```

## 2. Stwórz projekt Supabase

1. Wejdź na https://supabase.com i załóż konto
2. Utwórz nowy projekt
3. Skopiuj `Project URL` i `anon public key` z Settings → API

## 3. Skonfiguruj zmienne środowiskowe

Utwórz plik `.env.local`:

```bash
cp .env.local.example .env.local
```

Edytuj `.env.local` i wklej swoje dane:

```env
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Uruchom aplikację

```bash
npm run dev
```

Otwórz http://localhost:3000 w przeglądarce.

## 5. Zarejestruj się

1. Kliknij "Zarejestruj się"
2. Wprowadź email i hasło
3. Gotowe! Jesteś w dashboardzie

## Troubleshooting

**Problem: "Invalid API key"**
→ Sprawdź czy skopiowałeś poprawne klucze z Supabase

**Problem: "Cannot connect"**
→ Upewnij się, że projekt Supabase jest aktywny

**Problem: Build error**
→ Usuń `node_modules` i `.next`, następnie `npm install` ponownie

## Następne kroki

- Przeczytaj [SETUP.md](./SETUP.md) dla pełnej konfiguracji
- Przeczytaj [ARCHITECTURE.md](./ARCHITECTURE.md) aby zrozumieć architekturę
- Rozpocznij development!
