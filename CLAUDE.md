# CLAUDE.md -- ftw-mobile

React Native (Expo) mobile app for FairTradeWorker marketplace. Android + iOS.

---

## Running

```bash
npm start             # Expo dev server
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser
npx expo lint         # ESLint
```

Set `EXPO_PUBLIC_REALTIME_URL` for the Elixir backend (defaults to `http://localhost:4000`).
Optional: `EXPO_PUBLIC_POSTHOG_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` for analytics.

---

## Architecture

Expo SDK 54 + expo-router 6 (file-based routing, typed routes). New Architecture enabled. Two user roles with separate tab navigators.

```
app/
  _layout.tsx           # Root: auth gate (AuthGate component), GestureHandler, NativeWind, StatusBar
  index.tsx             # Redirect based on auth state + user.role
  (auth)/               # Stack navigator
    login.tsx           #   Email/password login, disabled Google/Apple/Phone buttons
    signup.tsx          #   2-step: role picker -> details form
  (contractor)/         # Bottom Tabs: Dashboard, Jobs, Messages, Profile
    (dashboard)/        #   Stats grid, recent jobs carousel, recent estimates list, quick actions
    (jobs)/             #   Browse/search/filter jobs by category, expandable job cards with Place Bid
    (messages)/         #   Conversation list -> inline chat view
    (profile)/          #   Avatar, stats row, menu (Estimates/Projects/Invoices/Clients/Reviews/Notifications/Settings), logout
    clients/            #   Client list screen (from profile menu)
    estimates/          #   Estimates list screen (from profile menu)
    invoices/           #   Invoice list screen (from profile menu)
    notifications/      #   Notifications screen (from profile menu)
    projects/           #   Projects list screen (from profile menu)
    records/            #   FairRecords screen (from profile menu)
    reviews/            #   Reviews screen (from profile menu)
    settings/           #   Settings screen (from profile menu)
  (homeowner)/          # Bottom Tabs: Dashboard, My Jobs, Messages, Profile
    (dashboard)/        #   Post Job CTA, stat cards, active jobs list, recent bids with Accept/Decline
    (jobs)/             #   Filter tabs (Active/Completed/All), expandable jobs with bid rows
    (messages)/         #   Conversation list -> inline chat view
    (profile)/          #   Avatar, stats, menu (My Projects/Reviews/Notifications/Settings), logout
    notifications/      #   Notifications screen (from profile menu)
    post-job/           #   Post a new job form
    projects/           #   Projects list screen (from profile menu)
    reviews/            #   Reviews screen (from profile menu)
    settings/           #   Settings screen (from profile menu)

src/
  api/
    client.ts           # apiFetch() with Bearer token, ApiError class, all REST endpoints (jobs, bids, estimates, invoices, projects, clients, reviews, notifications, FairRecords, verification, chat, AI, settings)
    auth.ts             # loginApi, registerApi, meApi
    data.ts             # Mock-with-fallback layer: tries API first, falls back to mock data
  realtime/
    client.ts           # RealtimeClient class: Phoenix Socket, joinJobFeed(), joinChat(), sendMessage(), sendTyping()
    hooks.ts            # useRealtimeJobs(), useRealtimeChat() React hooks
  stores/
    auth.ts             # Zustand store with SecureStore persist (token, user, login, register, logout, hydrate)
  types/
    index.ts            # RealtimeUser, RealtimeJob, RealtimeBid, RealtimeMessage, AuthResponse, AuthUser, FairRecord, Notification, Review, Project, Invoice, Client
  components/
    ui/                 # button.tsx, badge.tsx, avatar.tsx, card.tsx
    domain/             # job-card.tsx, bid-card.tsx, chat-bubble.tsx, stat-card.tsx
  lib/
    constants.ts        # BRAND object (colors, tagline), JOB_CATEGORIES, ESTIMATE_STATUSES, JOB_STATUSES, API_BASE
    utils.ts            # formatCurrency, formatDate, getInitials
    mock-data.ts        # MockJob, MockBid, MockConversation, MockMessage, MockEstimate types + seed data + stats
    analytics.ts        # PostHog analytics (fetch-based, no SDK). identify(), track(), screen()
    image-picker.ts     # expo-image-picker wrapper: pickImage(), uploadAvatar()
    location.ts         # expo-location wrapper: getCurrentLocation()
    push-notifications.ts # expo-notifications: registerForPushNotifications(), listeners

# Root-level Expo starter dirs (not actively used by FTW screens):
components/             # themed-text.tsx, themed-view.tsx, ui/collapsible.tsx, ui/icon-symbol.tsx (+ .ios.tsx variant)
constants/              # theme.ts (Colors light/dark, Fonts platform-select)
hooks/                  # use-color-scheme.ts (+ .web.ts variant), use-theme-color.ts
```

---

## Auth

JWT from ftw-realtime backend. Stored in `expo-secure-store` via Zustand persist middleware.

- Email + password: works now
- Google/Apple Sign-In: buttons present, disabled until backend endpoints exist (Phase 3)
- Phone OTP: same (Phase 3)
- Signup is 2-step: pick role (homeowner/contractor) -> enter name, email, password, location

Auth store auto-hydrates on app launch -- reads token from SecureStore, verifies with `/api/auth/me`. Root `_layout.tsx` contains an `AuthGate` component that redirects based on `isAuthenticated` and `user.role`.

---

## Styling

NativeWind v4 (Tailwind for React Native). Config in `tailwind.config.js`. Content paths scan `app/`, `src/`, and root `components/`.

| Token | Value |
|-------|-------|
| `brand-600` | `#C41E3A` (primary crimson) |
| `brand-50` | `#FDF2F3` (light tint) |
| `dark` | `#0F1419` |
| `surface` | `#FDFBF8` |
| `card` | `#FFFFFF` |
| `text-primary` | `#111318` |
| `text-secondary` | `#4B5563` |
| `text-muted` | `#9CA3AF` |
| `border` | `#E5E1DB` |

Full brand color ramp: 50-950 in `tailwind.config.js`.

No gradients. No emojis as design elements. Lucide icons only. System fonts (SF Pro on iOS, Roboto on Android).

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo` ~54, `expo-router` ~6 | Framework + file-based routing |
| `nativewind` ^4, `tailwindcss` ^3 | Styling |
| `zustand` ^5 | State management |
| `expo-secure-store` ^55 | JWT token storage |
| `phoenix` ^1.8 | WebSocket client for ftw-realtime |
| `lucide-react-native` | Icons |
| `react-hook-form` ^7 | Form handling |
| `@gorhom/bottom-sheet` ^5 | Bottom sheets |
| `date-fns` ^4 | Date utilities |
| `expo-haptics` | Haptic feedback |
| `expo-image` | Optimized image component |
| `expo-image-picker` ~17 | Photo selection / avatar upload |
| `expo-location` ~19 | Device geolocation |
| `expo-notifications` ~0.32 | Push notifications |
| `expo-device` ~8 | Device info (push token registration) |
| `react-native-reanimated` ~4 | Animations |
| `react-native-gesture-handler` ~2 | Gesture support |
| `react-native-svg` ^15 | SVG rendering (icons) |

---

## Backend

Elixir/Phoenix at `~/Projects/ftw-realtime/`. JWT auth, WebSocket channels, REST API.

- WebSocket: `ws://localhost:4000/socket` with `{ token }` param
- REST: `http://localhost:4000/api/*`
- See ftw-realtime CLAUDE.md for full API docs

The `src/api/data.ts` layer tries each API endpoint first, then falls back to mock data from `src/lib/mock-data.ts`. This means screens work offline with mocked content.

---

## API Client Coverage

`src/api/client.ts` has typed functions for all planned endpoints:

- **Auth**: login, register, me
- **Jobs**: list, get, post, placeBid, acceptBid
- **Estimates**: list
- **Invoices**: list
- **Projects**: list
- **Clients**: list
- **Reviews**: list
- **Notifications**: list, markRead, markAllRead
- **FairRecords**: list by contractor, get public record
- **Verification**: getStatus, submitStep
- **Chat**: listMessages, sendMessage
- **AI**: getAIEstimate
- **Settings**: get, update

Most of these return mock data because backend endpoints do not exist yet.

---

## Key Constraints

- Homeowners CANNOT browse contractors. Post job -> get bids -> review bids only.
- Most features use mock data -- backend endpoints do not exist yet for estimates, projects, invoices, clients, reviews, settings, FairRecords, verification, AI, analytics.
- One repo per deployable. This is the mobile app only.
- System fonts only (SF Pro on iOS, Roboto on Android).
- App scheme: `ftw` (deep linking).
- Bundle ID: `com.fairtradeworker.app` (both iOS and Android).
