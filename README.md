# FTW Mobile

React Native (Expo) mobile app for FairTradeWorker -- the two-sided construction marketplace. Android + iOS.

## Prerequisites

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS Simulator (Xcode) or Android emulator (Android Studio)
- Expo Go on a physical device (optional)

## Getting Started

```bash
npm install
npm start          # Expo dev server (press i for iOS, a for Android)
npm run ios        # iOS simulator directly
npm run android    # Android emulator directly
npm run web        # Web browser
npx expo lint      # ESLint
```

## Environment

Create `.env`:

```
EXPO_PUBLIC_REALTIME_URL=http://localhost:4000
EXPO_PUBLIC_POSTHOG_KEY=<your-posthog-key>
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

`EXPO_PUBLIC_REALTIME_URL` points to the ftw-realtime Elixir/Phoenix backend at `~/Projects/ftw-realtime/`. PostHog vars are optional (analytics degrades gracefully without them).

## Tech Stack

- **Expo SDK 54** + expo-router 6 (file-based routing, typed routes)
- **React Native 0.81** with New Architecture enabled
- **NativeWind v4** (Tailwind CSS for React Native)
- **Zustand 5** for state management (auth store with SecureStore persist)
- **Phoenix JS** for WebSocket real-time (job feed, chat)
- **Lucide React Native** for icons
- **react-hook-form** for form handling
- **@gorhom/bottom-sheet** for bottom sheets
- **date-fns** for date formatting
- **expo-image-picker** for avatar/photo uploads
- **expo-location** for geolocation (nearby jobs)
- **expo-notifications** for push notifications
- **PostHog** analytics (fetch-based, no SDK)

## Project Structure

```
app/                    # expo-router file-based routing
  _layout.tsx           # Root layout: auth gate, GestureHandler, NativeWind
  index.tsx             # Redirect by auth state + role
  (auth)/               # Stack: login, signup
  (contractor)/         # Bottom Tabs: Dashboard, Jobs, Messages, Profile
    clients/            #   Client list screen
    estimates/          #   Estimates list screen
    invoices/           #   Invoice list screen
    notifications/      #   Notifications screen
    projects/           #   Projects list screen
    records/            #   FairRecords screen
    reviews/            #   Reviews screen
    settings/           #   Settings screen
  (homeowner)/          # Bottom Tabs: Dashboard, My Jobs, Messages, Profile
    notifications/      #   Notifications screen
    post-job/           #   Post a new job form
    projects/           #   Projects list screen
    reviews/            #   Reviews screen
    settings/           #   Settings screen

src/
  api/                  # REST client, auth endpoints, mock-with-fallback data layer
  realtime/             # Phoenix WebSocket client + React hooks
  stores/               # Zustand (auth with SecureStore)
  types/                # TypeScript interfaces matching backend
  components/
    ui/                 # Button, Badge, Avatar, Card
    domain/             # JobCard, BidCard, ChatBubble, StatCard
  lib/                  # constants, utils, mock-data, analytics, image-picker, location, push-notifications
```

## Auth

JWT from ftw-realtime backend. Token stored in `expo-secure-store` via Zustand persist middleware. Auth gate in root layout redirects to login or role-specific dashboard.

- Email + password: functional
- Google, Apple, Phone OTP: buttons present but disabled (Phase 3)

## Backend

Elixir/Phoenix at `~/Projects/ftw-realtime/`:
- REST API: `http://localhost:4000/api/*`
- WebSocket: `ws://localhost:4000/socket` (token param)

Most screens currently use mock data with fallback from `src/api/data.ts`.
