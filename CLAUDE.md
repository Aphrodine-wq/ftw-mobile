# CLAUDE.md — ftw-mobile

React Native (Expo) mobile app for FairTradeWorker marketplace. Android + iOS.

---

## Running

```bash
npm start             # Expo dev server
npm run ios           # iOS simulator
npm run android       # Android emulator
npx expo lint         # ESLint
```

Set `EXPO_PUBLIC_REALTIME_URL` for the Elixir backend (defaults to `http://localhost:4000`).

---

## Architecture

Expo SDK 54 + expo-router 6 (file-based routing). Two user roles with separate tab navigators.

```
app/
  _layout.tsx           # Root: auth gate, GestureHandler, NativeWind
  index.tsx             # Redirect based on auth state + role
  (auth)/               # Login, Signup (Stack)
  (contractor)/         # Bottom Tabs: Dashboard, Jobs, Messages, Profile
    (dashboard)/        #   Stats, schedule, revenue
    (jobs)/             #   Browse jobs, bid
    (messages)/         #   Chat with homeowners
    (profile)/          #   Estimates, projects, invoices, clients, reviews, notifications, settings
  (homeowner)/          # Bottom Tabs: Dashboard, Jobs, Messages, Profile
    (dashboard)/        #   Post jobs, active summary
    (jobs)/             #   View bids on posted jobs
    (messages)/         #   Chat with contractors
    (profile)/          #   Projects, reviews, notifications, settings

src/
  api/                  # REST client + endpoint modules
  realtime/             # Phoenix WebSocket client + hooks (Phase 2)
  stores/               # Zustand (auth, notifications)
  types/                # TypeScript interfaces matching backend
  components/
    ui/                 # Button, Card, Badge, Input, etc.
    layout/             # TabBar, Header, SafeArea
    domain/             # JobCard, BidSheet, ChatBubble, etc.
  lib/                  # constants, utils
  hooks/                # use-keyboard, use-push-notifications
```

---

## Auth

JWT from ftw-realtime backend. Stored in `expo-secure-store` via Zustand persist.

- Email + password: works now
- Google/Apple Sign-In: buttons present, disabled until backend endpoints exist (Phase 3)
- Phone OTP: same (Phase 3)

Auth store auto-hydrates on app launch — reads token from SecureStore, verifies with `/api/auth/me`.

---

## Styling

NativeWind v4 (Tailwind for React Native). Config in `tailwind.config.js`.

| Token | Value |
|-------|-------|
| `brand-600` | `#059669` (primary green) |
| `dark` | `#0F1419` |
| `surface` | `#F7F8FA` |
| `text-primary` | `#111318` |
| `text-secondary` | `#4B5563` |
| `text-muted` | `#9CA3AF` |
| `border` | `#E5E7EB` |

No gradients. No emojis as design elements. Lucide icons only.

---

## Backend

Elixir/Phoenix at `~/Projects/ftw-realtime/`. JWT auth, WebSocket channels, REST API.

- WebSocket: `ws://localhost:4000/socket` with `{ token }` param
- REST: `http://localhost:4000/api/*`
- See ftw-realtime CLAUDE.md for full API docs

---

## Key Constraints

- Homeowners CANNOT browse contractors. Post job -> get bids -> review bids only.
- Many features (estimates, projects, invoices, clients, reviews, settings) use mock data — backend endpoints don't exist yet.
- One repo per deployable. This is the mobile app only.
- SF Pro on iOS, Roboto on Android (system fonts).
