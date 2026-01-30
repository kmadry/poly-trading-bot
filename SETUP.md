# 🚀 Setup Guide - Poly Trading Bot

Ten przewodnik pomoże Ci skonfigurować projekt krok po kroku.

## Wymagania wstępne

- Node.js 18+ i npm
- Konto na [Supabase](https://supabase.com)
- Konto na [Vercel](https://vercel.com) (opcjonalne, do deploymentu)

## Krok 1: Konfiguracja Supabase

### 1.1 Utworzenie projektu Supabase

1. Zaloguj się na [supabase.com](https://supabase.com)
2. Kliknij **"New Project"**
3. Wybierz organizację (lub stwórz nową)
4. Podaj:
   - **Name**: poly-trading-bot (lub dowolną nazwę)
   - **Database Password**: silne hasło (zapisz je!)
   - **Region**: wybierz najbliższy region
5. Kliknij **"Create new project"**
6. Poczekaj ok. 2 minuty na uruchomienie projektu

### 1.2 Pobranie kluczy API

1. Po uruchomieniu projektu przejdź do **Settings → API**
2. Znajdź sekcję **Project API keys**
3. Skopiuj:
   - **Project URL** (np. `https://xxxxx.supabase.co`)
   - **anon public** key (długi string zaczynający się od `eyJ...`)

### 1.3 Konfiguracja Authentication

1. Przejdź do **Authentication → Providers**
2. Upewnij się, że **Email** provider jest włączony
3. Przejdź do **Authentication → URL Configuration**
4. W **Site URL** wpisz:
   - Dla lokalnego developmentu: `http://localhost:3000`
   - Po deploymencie dodasz tutaj URL Vercel

## Krok 2: Konfiguracja Lokalna

### 2.1 Instalacja zależności

```bash
npm install
```

### 2.2 Konfiguracja zmiennych środowiskowych

1. Skopiuj przykładowy plik `.env`:

```bash
cp .env.local.example .env.local
```

2. Otwórz `.env.local` i wklej swoje dane z Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2.3 Uruchomienie projektu

```bash
npm run dev
```

Aplikacja będzie dostępna pod [http://localhost:3000](http://localhost:3000)

## Krok 3: Testowanie

### 3.1 Rejestracja

1. Otwórz [http://localhost:3000](http://localhost:3000)
2. Zostaniesz przekierowany na `/login`
3. Kliknij **"Zarejestruj się"**
4. Wprowadź email i hasło
5. Po rejestracji zostaniesz automatycznie zalogowany

### 3.2 Weryfikacja w Supabase

1. Przejdź do Supabase Dashboard → **Authentication → Users**
2. Powinieneś zobaczyć swojego nowo utworzonego użytkownika

### 3.3 Testowanie dashboardu

1. Po zalogowaniu zostaniesz przekierowany do `/app`
2. Sprawdź nawigację po różnych sekcjach:
   - Dashboard
   - Trading
   - Analytics
   - Settings
3. Kliknij **"Wyloguj"** w prawym górnym rogu

## Krok 4: Deployment na Vercel

### 4.1 Push do GitHub

Jeśli nie utworzyłeś jeszcze repozytorium:

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

### 4.2 Deployment

1. Zaloguj się na [vercel.com](https://vercel.com)
2. Kliknij **"Add New..."** → **"Project"**
3. Zaimportuj repozytorium `poly-trading-bot`
4. Skonfiguruj zmienne środowiskowe:
   - Kliknij **"Environment Variables"**
   - Dodaj wszystkie zmienne z `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SITE_URL` - zostaw puste, uzupełnisz po deploymencie
5. Kliknij **"Deploy"**

### 4.3 Finalizacja konfiguracji

Po zakończeniu deploymentu:

1. Skopiuj URL aplikacji (np. `https://poly-trading-bot.vercel.app`)
2. Wróć do **Vercel Dashboard → Settings → Environment Variables**
3. Edytuj `NEXT_PUBLIC_SITE_URL` i wklej URL aplikacji
4. Kliknij **"Save"**
5. Przejdź do **Deployments** i kliknij **"Redeploy"**

### 4.4 Aktualizacja Supabase

1. Wróć do Supabase Dashboard
2. Przejdź do **Authentication → URL Configuration**
3. W **Site URL** zmień na URL Vercel
4. W **Redirect URLs** dodaj:
   - `https://twoja-app.vercel.app/**`
   - `https://twoja-app.vercel.app/auth/callback`

## Krok 5: Weryfikacja produkcji

1. Otwórz swoją aplikację na Vercel
2. Przetestuj rejestrację i logowanie
3. Sprawdź wszystkie funkcjonalności

## Troubleshooting

### Problem: "Invalid API key"

- Sprawdź czy w `.env.local` są poprawne klucze z Supabase
- Upewnij się, że używasz **anon public** key, nie service_role

### Problem: "Redirect loop"

- Sprawdź middleware configuration
- Upewnij się, że Redirect URLs w Supabase są poprawnie skonfigurowane

### Problem: "Cannot connect to Supabase"

- Sprawdź czy Project URL jest poprawny
- Upewnij się, że projekt Supabase jest aktywny (nie jest paused)

### Problem: Build fails na Vercel

- Sprawdź logi buildu w Vercel Dashboard
- Upewnij się, że wszystkie zmienne środowiskowe są ustawione

## Następne kroki

Po skonfigurowaniu podstawowej aplikacji możesz:

1. Dodać integrację z Polymarket API
2. Zaimplementować logikę tradingu
3. Dodać real-time updates (Supabase Realtime)
4. Utworzyć tabele w bazie danych dla historii transakcji
5. Dodać zaawansowaną analitykę

## Potrzebujesz pomocy?

Jeśli masz problemy z konfiguracją:
- Sprawdź [Dokumentację Supabase](https://supabase.com/docs)
- Sprawdź [Dokumentację Next.js](https://nextjs.org/docs)
- Sprawdź [Dokumentację Vercel](https://vercel.com/docs)
