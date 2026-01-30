# Poly Trading Bot

Profesjonalna aplikacja Next.js 14+ z systemem autoryzacji Supabase i dashboardem.

## 📚 Dokumentacja

- **[QUICKSTART.md](./QUICKSTART.md)** - Szybki start (5 minut)
- **[SETUP.md](./SETUP.md)** - Pełny przewodnik konfiguracji
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architektura techniczna

## 🚀 Stack Technologiczny

- **Framework**: Next.js 14+ (App Router, React Server Components)
- **Język**: TypeScript
- **Autoryzacja**: Supabase Auth (SSR)
- **Styling**: Tailwind CSS + shadcn/ui
- **Formularze**: React Hook Form + Zod
- **Ikony**: Lucide Icons
- **Hosting**: Vercel (frontend + server functions)

## 📁 Struktura Projektu

```
/app
├── (auth)/              # Strony autoryzacji (login, register, reset-password)
│   ├── login/
│   ├── register/
│   └── reset-password/
├── (dashboard)/         # Chroniony dashboard
│   └── app/
│       ├── page.tsx     # Główny dashboard
│       ├── trading/     # Strona tradingu
│       ├── analytics/   # Analityka
│       └── settings/    # Ustawienia
├── layout.tsx           # Root layout
└── page.tsx             # Redirect logic

/components
├── ui/                  # shadcn/ui komponenty
├── auth/                # Formularze autoryzacji
├── layout/              # Layout dashboardu (sidebar, header)
└── shared/              # Komponenty współdzielone

/lib
├── supabase/            # Klienty Supabase (browser, server, middleware)
├── auth/                # Utility funkcje auth
└── utils.ts             # Helper functions

/actions
└── auth-actions.ts      # Server Actions (login, register, logout)

/types
└── auth.ts              # TypeScript typy
```

## 🛠️ Instalacja i Konfiguracja

### 1. Klonowanie i instalacja zależności

```bash
git clone https://github.com/kmadry/poly-trading-bot.git
cd poly-trading-bot
npm install
```

### 2. Konfiguracja Supabase

1. Utwórz nowy projekt na [supabase.com](https://supabase.com)
2. Przejdź do **Settings → API**
3. Skopiuj `Project URL` i `anon public` key

### 3. Zmienne środowiskowe

Utwórz plik `.env.local` w głównym katalogu:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Uruchomienie w trybie deweloperskim

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem [http://localhost:3000](http://localhost:3000)

## 🔐 Autoryzacja

Aplikacja wykorzystuje Supabase Auth z następującymi funkcjami:

- **Rejestracja** - `/register`
- **Logowanie** - `/login`
- **Reset hasła** - `/reset-password`
- **Middleware** - automatyczna ochrona tras `/app/*`
- **SSR Sessions** - sesje działają po stronie serwera

## 🎨 Komponenty UI

Projekt wykorzystuje komponenty z **shadcn/ui**:

- Button
- Input
- Label
- Card
- Form components

Wszystkie komponenty są w pełni dostosowywalne przez Tailwind CSS.

## 📦 Deployment na Vercel

### 1. Push do GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy na Vercel

1. Zaloguj się na [vercel.com](https://vercel.com)
2. Kliknij **"Add New Project"**
3. Zaimportuj swoje repozytorium
4. Dodaj zmienne środowiskowe:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (będzie to URL Twojej aplikacji na Vercel)
5. Kliknij **"Deploy"**

### 3. Aktualizacja Supabase Redirect URLs

Po deploymencie na Vercel:

1. Przejdź do Supabase Dashboard → **Authentication → URL Configuration**
2. Dodaj URL Vercel do **Site URL**
3. Dodaj `https://your-app.vercel.app/**` do **Redirect URLs**

## 🏗️ Architektura

### Warstwa routingu

- **App Router** - Next.js 14+ routing z grupami (`(auth)`, `(dashboard)`)
- **Middleware** - ochrona tras przed nieautoryzowanym dostępem

### Warstwa danych

- **Server Components** - pobieranie danych po stronie serwera
- **Server Actions** - operacje mutujące (login, logout, etc.)
- **Supabase SSR Client** - sesje działają w Server Components

### Warstwa UI

- **shadcn/ui** - spójny system designu
- **Tailwind CSS** - utility-first styling
- **Lucide Icons** - nowoczesne ikony

## 📝 Skrypty NPM

```bash
npm run dev      # Uruchomienie w trybie deweloperskim
npm run build    # Build produkcyjny
npm run start    # Uruchomienie produkcyjnej wersji
npm run lint     # Linting kodu
```

## 🔒 Bezpieczeństwo

- Wszystkie operacje auth przez Server Actions
- Middleware chroni trasy `/app/*`
- SSR sessions - brak expozycji tokenów w przeglądarce
- TypeScript - type safety na każdym poziomie

## 🚧 Roadmap

- [ ] Integracja z Polymarket API
- [ ] Bot trading logic
- [ ] Real-time updates (Supabase Realtime)
- [ ] Advanced analytics
- [ ] Portfolio management
- [ ] Multi-user support

## 📄 Licencja

MIT

## 👨‍💻 Autor

Krystian Madry
