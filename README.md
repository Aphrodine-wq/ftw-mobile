# FTW Mobile

React Native (Expo) mobile app for FairTradeWorker -- the three-sided construction marketplace connecting homeowners, contractors, and subcontractors. Android + iOS.

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

`EXPO_PUBLIC_REALTIME_URL` points to the ftw-realtime Spring Boot/Kotlin backend at `~/Projects/ftw-realtime/`. PostHog vars are optional (analytics degrades gracefully without them).

## Tech Stack

- **Expo SDK 54** + expo-router 6 (file-based routing, typed routes)
- **React Native 0.81** with New Architecture enabled
- **NativeWind v4** (Tailwind CSS for React Native)
- **Zustand 5** for state management (auth store with SecureStore persist)
- **STOMP/SockJS** for WebSocket real-time (job feed, chat, notifications, sub-job feed)
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
app/                    # expo-router file-based routing (42 screens + 18 layouts)
  _layout.tsx           # Root layout: AuthGate, GestureHandler, NativeWind, push notifications
  index.tsx             # Redirect by auth state + role (homeowner/contractor/subcontractor)
  (auth)/               # Stack: welcome (onboarding carousel), login, signup (3-role picker)
  (contractor)/         # Stack + CustomTabBar: Dashboard, Jobs, Messages, Profile
    ai-agent/           #   ConstructionAI chat interface
    clients/            #   Client list, detail, add new
    estimates/          #   Estimates list
    invoices/           #   Invoice list
    milestones/         #   Project milestone management
    notifications/      #   Notifications
    pro/                #   FTW Pro subscription plans
    projects/           #   Projects list + detail (milestones, tasks, docs, activity)
    records/            #   FairRecords
    reviews/            #   Reviews
    settings/           #   Settings hub with 7 sub-screens (profile, security, licenses, insurance, integrations, notifications, appearance)
  (homeowner)/          # Stack + HomeownerTabBar: Dashboard, My Jobs, Messages, Profile
    notifications/      #   Notifications
    post-job/           #   Post a new job form
    projects/           #   Projects list
    reviews/            #   Reviews
    settings/           #   Settings
  (subcontractor)/      # Stack + SubContractorTabBar: Dashboard, Work, My Work, Profile
    work/               #   Browse available sub-jobs
    my-work/            #   Active/completed assigned work

src/
  api/                  # REST client, auth endpoints, mock-with-fallback data layer
  realtime/             # STOMP/SockJS WebSocket client + React hooks
  stores/               # Zustand (auth with SecureStore)
  types/                # TypeScript interfaces (3-role AuthUser, jobs, bids, projects, milestones, etc.)
  components/
    ui/                 # Button, Badge, Avatar, Card
    domain/             # JobCard, BidCard, ChatBubble, StatCard, AiEstimateCard
    layout/             # CustomTabBar (contractor), HomeownerTabBar, SubContractorTabBar
  lib/                  # constants, utils, mock-data, analytics, image-picker, location, push-notifications
```

## Auth

JWT from ftw-realtime backend. Token stored in `expo-secure-store` via Zustand persist middleware. Auth gate in root layout registers push notifications and handles notification tap routing. Index redirects to login or role-specific dashboard.

- Email + password: functional
- Google, Apple, Phone OTP: buttons present but disabled (Phase 3)
- Signup: 2-3 steps depending on role -- pick role -> account details -> professional details (contractors/subcontractors only)

## Backend

Spring Boot / Kotlin at `~/Projects/ftw-realtime/`:
- REST API: `http://localhost:4000/api/*`
- WebSocket: `http://localhost:4000/ws` via SockJS + STOMP protocol

Most screens currently use mock data with fallback from `src/api/data.ts`.
