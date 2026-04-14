# FTW Mobile v1 — App Store Roadmap

**Target: May 5, 2026**
**Today: April 14, 2026 (21 days)**

## Current State

**Working end-to-end:** Auth, messaging (STOMP), homeowner job posting, push notifications, offline caching, dashboards (mock data)

**Built but mock:** Estimates, invoices, projects, clients, reviews, records, settings, notifications, AI agent, voice agent, pro plans, referrals

**Broken/missing:** Contractor job feed ("Coming Soon"), bid accept doesn't hit API, no payment flow, no error boundaries, EAS not configured, no role switching

---

## The Rule

The marketplace loop must work: **Post job → Browse jobs → Bid → Accept bid → Chat → Pay → Done.**

Everything outside that loop ships as-is with mock fallback. No cutting features, but mock-backed screens stay mock-backed for v1 — they work, they just show placeholder data until the backend catches up.

---

## Week 1: The Loop (Apr 14–20)

The marketplace doesn't exist without this. Nothing else matters until contractors can find and bid on jobs.

### W1.1 — Contractor Job Feed (2 days)
- [ ] Remove "Coming Soon" from contractor jobs screen
- [ ] Wire `listJobs()` to real API with filters (category, location, budget)
- [ ] Subscribe to `/topic/jobs.feed` via STOMP for live updates
- [ ] Job cards: photo, title, budget range, location, bid count, urgency badge
- [ ] Pull-to-refresh + pagination
- [ ] Search bar with debounce

### W1.2 — Bid Flow (1 day)
- [ ] Job detail screen (tap from feed) — full description, photos, homeowner info
- [ ] Inline bid form: amount, message, timeline
- [ ] Submit bid hits real API (`POST /api/jobs/{id}/bids`)
- [ ] Success confirmation + navigate back to feed
- [ ] Real-time bid count update via STOMP

### W1.3 — Bid Accept (Homeowner) (1 day)
- [ ] Wire "Accept" button to real API (`POST /api/bids/{id}/accept`)
- [ ] Wire "Decline" action
- [ ] Show confirmation dialog before accept
- [ ] Update job status in UI after accept
- [ ] Push notification to contractor on bid accepted

### W1.4 — Role Switching (0.5 day)
- [ ] Add role switcher to profile/settings
- [ ] Call `/api/auth/switch-role` on toggle
- [ ] Re-route to correct dashboard on switch
- [ ] Persist active role in auth store

### W1.5 — Dashboard Real Data (0.5 day)
- [ ] Replace hardcoded stats with API calls where endpoints exist
- [ ] Homeowner dashboard: real job count, bid count from API
- [ ] Contractor dashboard: real active jobs from browse feed
- [ ] Keep mock fallback for stats that don't have endpoints yet

---

## Week 2: Money + Polish (Apr 21–27)

The loop works, now make it trustworthy. Payments are QB-based (same as web), not Stripe.

### W2.1 — QuickBooks Payment Flow (2 days)
- [ ] Verify QB OAuth deep link works on device (`ftw://quickbooks-callback`)
- [ ] Wire invoice list to real API (contractor)
- [ ] Show payment status on homeowner's accepted bids
- [ ] Payout tracking screen (contractor) — replace "Coming Soon"
- [ ] Wire QB status check on app launch for connected contractors
- [ ] Handle expired refresh tokens (re-auth prompt)

### W2.2 — Estimates with ConstructionAI (1 day)
- [ ] Wire AI agent chat to real `/api/ai/estimate` endpoint
- [ ] Wire standalone estimate generation to `/api/contractor/estimates`
- [ ] Show real estimate breakdown (CSI divisions, line items)
- [ ] PDF download/share from estimate detail

### W2.3 — Settings Persistence (1 day)
- [ ] Profile edit → real API (`PUT /api/contractor/profile`)
- [ ] License upload → real API (`POST /api/contractor/licenses`)
- [ ] Insurance upload → real API (`POST /api/contractor/insurance`)
- [ ] Notification preferences → persist to backend or AsyncStorage
- [ ] Forgot password flow (`/api/auth/forgot-password`, `/api/auth/reset-password`)

### W2.4 — Error Handling + Loading States (1 day)
- [ ] Global error boundary in root `_layout.tsx`
- [ ] Network error toast (auto-dismiss)
- [ ] Skeleton loaders on all list screens (jobs, estimates, invoices, messages)
- [ ] Empty states with illustration + CTA for: no jobs, no bids, no messages, no invoices
- [ ] Permission denial handling (location, camera, notifications)
- [ ] Deep link auth guard (redirect to login if not authenticated)

### W2.5 — Subcontractor Polish (0.5 day)
- [ ] Wire sub-job feed to real STOMP subscription
- [ ] Verify sub-bid submission hits real API
- [ ] Sub-contractor dashboard with real data where available

### W2.6 — Notifications (0.5 day)
- [ ] Wire notification list to real API
- [ ] Mark read/unread via API
- [ ] Expand push notification tap routing (all notification types, not just bid_received/bid_accepted)
- [ ] Badge count on tab bar

---

## Week 3: Ship (Apr 28–May 4)

### W3.1 — EAS + App Store Setup (1 day)
- [ ] Apple Developer account — bundle ID, certificates, provisioning profiles
- [ ] Fill `eas.json` — appleId, ascAppId, appleTeamId
- [ ] Google Play — service account key, app listing
- [ ] Run `eas build --platform ios --profile production`
- [ ] Run `eas build --platform android --profile production`
- [ ] Fix any native build errors

### W3.2 — App Store Assets (1 day)
- [ ] App icon (1024x1024) — final version
- [ ] Screenshots (6.7" iPhone, 6.5" iPhone, iPad if supporting tablets)
- [ ] App description + keywords
- [ ] Privacy policy URL (use fairtradeworker.com/privacy)
- [ ] Support URL
- [ ] App category: Business or Lifestyle
- [ ] Age rating questionnaire

### W3.3 — Device Testing (2 days)
- [ ] Test on physical iPhone (not simulator)
- [ ] Test on physical Android device
- [ ] Full flow: signup → post job → browse → bid → accept → message → QB connect
- [ ] Test offline mode — kill network, verify cached data, reconnect
- [ ] Test push notifications on real device (APNS cert required)
- [ ] Test deep links
- [ ] Test role switching
- [ ] Performance pass — check for jank on scroll, slow transitions
- [ ] Memory check — no leaks on navigation cycles

### W3.4 — Submit (1 day)
- [ ] `eas submit --platform ios`
- [ ] `eas submit --platform android`
- [ ] Monitor App Store Connect for review status
- [ ] Respond to any reviewer questions within hours

---

## What Ships As-Is (Mock Fallback, v1.1)

These screens exist and work. They show mock data. Users can interact with them. They'll get real backend wiring in v1.1 post-launch:

- Projects/milestones (display only)
- Client list + import
- FairRecord display + share
- Reviews list
- Pro/subscription plans
- Referrals
- Voice agent / call estimates
- Calculator
- Help carousel
- Team management (settings)
- Availability calendar (settings)
- 2FA (settings)
- Google/Apple sign-in buttons (disabled, marked "Coming Soon")

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Apple review rejection | 2-3 day delay | Submit by May 1, buffer for re-review |
| QB OAuth deep link fails on device | Blocks payments | Test by end of W2.1, fallback to web QB connect |
| ConstructionAI endpoint down | No real estimates | Mock fallback already works, not a blocker |
| Push notification certs | No push on real devices | Set up APNS/FCM in W3.1, test W3.3 |
| Spring Boot backend not deployed | All API calls fail to mock | Verify Render deployment is live before W1 starts |

---

## Daily Targets

| Day | Date | Target |
|-----|------|--------|
| 1 | Apr 14 (Mon) | Job feed UI + API wiring started |
| 2 | Apr 15 (Tue) | Job feed complete with STOMP |
| 3 | Apr 16 (Wed) | Bid flow end-to-end |
| 4 | Apr 17 (Thu) | Bid accept + role switching |
| 5 | Apr 18 (Fri) | Dashboard real data + buffer |
| 6-7 | Apr 19-20 | Weekend buffer / catch up |
| 8 | Apr 21 (Mon) | QB payment flow start |
| 9 | Apr 22 (Tue) | QB payment flow complete |
| 10 | Apr 23 (Wed) | ConstructionAI wiring |
| 11 | Apr 24 (Thu) | Settings persistence |
| 12 | Apr 25 (Fri) | Error handling + loading states |
| 13-14 | Apr 26-27 | Sub polish + notifications + buffer |
| 15 | Apr 28 (Mon) | EAS setup + first build |
| 16 | Apr 29 (Tue) | App store assets + screenshots |
| 17 | Apr 30 (Wed) | Device testing day 1 |
| 18 | May 1 (Thu) | Device testing day 2 + fix |
| 19 | May 2 (Fri) | Submit to App Store |
| 20-21 | May 3-4 | Review buffer |
| **22** | **May 5 (Mon)** | **Target: Live** |
