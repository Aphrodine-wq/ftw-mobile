# CLAUDE.md -- ftw-mobile

React Native (Expo) mobile app for FairTradeWorker marketplace. Three user roles (homeowner, contractor, subcontractor). Android + iOS.

---

## Running

```bash
npm start             # Expo dev server
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser
npx expo lint         # ESLint
```

Set `EXPO_PUBLIC_REALTIME_URL` for the Spring Boot backend (defaults to `http://localhost:4000`).
Optional: `EXPO_PUBLIC_POSTHOG_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` for analytics.

---

## Architecture

Expo SDK 54 + expo-router 6 (file-based routing, typed routes). New Architecture enabled. Three user roles with separate tab navigators + custom tab bars.

```
app/
  _layout.tsx           # Root: AuthGate component (push notification registration, role-aware notification routing), GestureHandler, NativeWind, StatusBar
  index.tsx             # Redirect based on auth state + user.role (homeowner/contractor/subcontractor)
  (auth)/               # Stack navigator
    welcome.tsx         #   3-page onboarding carousel (intro, features, role overview)
    login.tsx           #   Email/password login, disabled Google/Apple/Phone buttons
    signup.tsx          #   2-step: role picker (homeowner/contractor/subcontractor) -> details form (trade category for contractors)
  (contractor)/         # Stack with CustomTabBar: Dashboard, Jobs, Messages, Profile + FAB quick-actions
    (dashboard)/        #   Stats grid, recent jobs carousel, recent estimates list, quick actions
    (jobs)/             #   Browse/search/filter jobs by category, expandable job cards with Place Bid
    (messages)/         #   Conversation list -> inline chat view
    (profile)/          #   Avatar, stats row, menu links, logout
    ai-agent/           #   ConstructionAI chat interface (text input, AI estimate cards, mock responses)
    clients/            #   Client list, detail [id], and add new client screens
    estimates/          #   Estimates list screen
    invoices/           #   Invoice list screen
    milestones/         #   Project milestones management (milestone status, progress, payment tracking)
    notifications/      #   Notifications screen
    pro/                #   FTW Pro subscription plans (Solo $29/mo, Team $79/mo, Enterprise $149/mo)
    projects/           #   Projects list + detail [id] (milestones, tasks, documents, activity timeline)
    records/            #   FairRecords screen
    reviews/            #   Reviews screen
    settings/           #   Stack navigator with sub-screens:
      index.tsx         #     Settings menu
      profile.tsx       #     Edit profile
      security.tsx      #     Password / 2FA
      licenses.tsx      #     Contractor licenses
      insurance.tsx     #     Insurance info
      integrations.tsx  #     Third-party integrations
      notifications.tsx #     Notification preferences
      appearance.tsx    #     Theme / display settings
  (homeowner)/          # Stack with HomeownerTabBar: Dashboard, Jobs, Messages, Profile + FAB quick-actions
    (dashboard)/        #   Post Job CTA, stat cards, active jobs list, recent bids with Accept/Decline
    (jobs)/             #   Filter tabs (Active/Completed/All), expandable jobs with bid rows
    (messages)/         #   Conversation list -> inline chat view
    (profile)/          #   Avatar, stats, menu links, logout
    notifications/      #   Notifications screen
    post-job/           #   Post a new job form
    projects/           #   Projects list screen
    reviews/            #   Reviews screen
    settings/           #   Settings screen
  (subcontractor)/      # Stack with SubContractorTabBar + floating message/notification buttons
    (dashboard)/        #   Stats, open sub-jobs carousel, active work, pending bids
    (profile)/          #   Profile screen
    work/               #   Browse available sub-jobs
    my-work/            #   Active/completed assigned work with filter tabs

src/
  api/
    client.ts           # apiFetch() with Bearer token, ApiError class, all REST endpoints
    auth.ts             # loginApi, registerApi, meApi
    data.ts             # Mock-with-fallback layer: tries API first, falls back to mock data
  realtime/
    client.ts           # RealtimeClient class: STOMP/SockJS via @stomp/stompjs + sockjs-client
                        #   Subscriptions: joinJobFeed(), joinJob(), joinChat(), joinNotifications(), joinSubJobFeed()
                        #   Publishing: sendMessage(), sendTyping(), placeBid(), postJob()
    hooks.ts            # useRealtimeJobs(), useRealtimeBids(), useRealtimeChat(), useRealtimeNotifications()
  stores/
    auth.ts             # Zustand store with SecureStore persist (token, user, login, register, logout, hydrate)
                        #   Hydration: reads token from SecureStore, verifies with /api/auth/me, 3s timeout fallback
  types/
    index.ts            # AuthUser (3 roles), RealtimeUser, RealtimeJob, RealtimeBid, RealtimeMessage,
                        #   FairRecord, Notification, Review, Project (milestones/tasks/documents/activity), Invoice, Client
  components/
    ui/                 # button.tsx, badge.tsx, avatar.tsx, card.tsx
    domain/             # job-card.tsx, bid-card.tsx, chat-bubble.tsx, stat-card.tsx, ai-estimate-card.tsx
    layout/             # CustomTabBar.tsx (contractor), HomeownerTabBar.tsx, SubContractorTabBar.tsx
  lib/
    constants.ts        # BRAND object (colors, tagline), JOB_CATEGORIES (12), ESTIMATE_STATUSES, JOB_STATUSES, API_BASE
    utils.ts            # formatCurrency, formatDate, getInitials
    mock-data.ts        # Mock types + seed data for jobs, bids, conversations, estimates, projects, sub-jobs, sub-bids, AI estimates, stats
    analytics.ts        # PostHog analytics (fetch-based, no SDK). identify(), track(), screen()
    image-picker.ts     # expo-image-picker wrapper: pickImage(), uploadAvatar()
    location.ts         # expo-location wrapper: getCurrentLocation()
    push-notifications.ts # expo-notifications: registerForPushNotifications(), addNotificationResponseListener()

# Root-level Expo starter dirs (not actively used by FTW screens):
components/             # themed-text.tsx, themed-view.tsx, ui/collapsible.tsx, ui/icon-symbol.tsx (+ .ios.tsx variant)
constants/              # theme.ts (Colors light/dark, Fonts platform-select)
hooks/                  # use-color-scheme.ts (+ .web.ts variant), use-theme-color.ts
```

Screen count: 42 screens + 18 layout files = 60 total .tsx files in app/.

---

## Auth

JWT from ftw-realtime backend. Stored in `expo-secure-store` via Zustand persist middleware.

- Email + password: works now
- Google/Apple Sign-In: buttons present, disabled until backend endpoints exist (Phase 3)
- Phone OTP: same (Phase 3)
- Signup is 2-3 steps depending on role: pick role (homeowner/contractor/subcontractor) -> account details (name, email, password, phone, location) -> professional details for contractors (company, license, experience, trades) and subcontractors (primary trade, certs, GC affiliations). Homeowners skip step 3.

Auth store auto-hydrates on app launch -- reads token from SecureStore, verifies with `/api/auth/me` (3-second timeout, clears auth on failure). Root `_layout.tsx` contains an `AuthGate` component that registers push notifications and handles notification tap routing. `index.tsx` redirects based on `isAuthenticated` and `user.role` to the appropriate role dashboard.

---

## Styling

NativeWind v4 (Tailwind for React Native). Config in `tailwind.config.js`. Content paths scan `app/`, `src/`, and root `components/`.

| Token | Value |
|-------|-------|
| `brand-600` | `#C41E3A` (primary crimson) |
| `brand-50` | `#FDF2F3` (light tint) |
| `dark` | `#0F1419` |
| `surface` | `#F5F3F0` |
| `card` | `#FFFFFF` |
| `text-primary` | `#111318` |
| `text-secondary` | `#2D3239` |
| `text-muted` | `#5C6370` |
| `border` | `#C8C3BC` |

Full brand color ramp: 50-950 in `tailwind.config.js`. Custom gray ramp (warm tones, 50-900).

No gradients. No emojis as design elements. Lucide icons only. System fonts (SF Pro on iOS, Roboto on Android). borderRadius: 0 throughout.

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo` ~54, `expo-router` ~6 | Framework + file-based routing |
| `nativewind` ^4, `tailwindcss` ^3 | Styling |
| `zustand` ^5 | State management |
| `expo-secure-store` ~15 | JWT token storage |
| `@stomp/stompjs` ^7 | STOMP WebSocket client |
| `sockjs-client` ^1 | SockJS transport for STOMP |
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

Spring Boot / Kotlin at `~/Projects/ftw-realtime/`. JWT auth, STOMP WebSocket, REST API.

- WebSocket: `http://localhost:4000/ws` via SockJS + STOMP protocol
  - Subscribe topics: `/topic/jobs.feed`, `/topic/job.{id}`, `/topic/chat.{id}`, `/topic/user.{id}`, `/topic/sub-jobs.feed`
  - Publish destinations: `/app/jobs.feed.post`, `/app/job.{id}.bid`, `/app/chat.{id}.send`, `/app/chat.{id}.typing`
- REST: `http://localhost:4000/api/*`
- See ftw-realtime CLAUDE.md for full API docs

The `src/api/data.ts` layer tries each API endpoint first, then falls back to mock data from `src/lib/mock-data.ts`. This means screens work offline with mocked content.

---

## API Client Coverage

`src/api/client.ts` has typed functions for all planned endpoints:

- **Auth**: login, register, me
- **Jobs**: list, get, post, placeBid, acceptBid
- **Push Tokens**: registerPushToken, unregisterPushToken
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

## EAS Build

EAS config in `eas.json`. Three profiles:

- **development**: Dev client, internal distribution, iOS simulator
- **preview**: Internal distribution, APK for Android, real device for iOS
- **production**: Auto-increment version, bundle ID `com.fairtradeworker.app`

---

## Key Constraints

- Homeowners CANNOT browse contractors. Post job -> get bids -> review bids only.
- Most features use mock data -- backend endpoints do not exist yet for estimates, projects, invoices, clients, reviews, settings, FairRecords, verification, AI, analytics.
- One repo per deployable. This is the mobile app only.
- System fonts only (SF Pro on iOS, Roboto on Android).
- App scheme: `ftw` (deep linking).
- Bundle ID: `com.fairtradeworker.app` (both iOS and Android).
- borderRadius: 0 on all UI elements.
