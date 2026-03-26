/**
 * PostHog analytics for FTW Mobile.
 * Uses fetch-based approach to POST events to PostHog's /capture endpoint.
 * No heavy SDK dependency required.
 */

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let distinctId: string | null = null;

/**
 * Identify the current user for all subsequent events.
 */
export function identify(
  userId: string,
  properties?: Record<string, any>
): void {
  distinctId = userId;

  if (!POSTHOG_KEY) return;

  fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      distinct_id: userId,
      event: "$identify",
      properties: {
        $set: properties || {},
      },
    }),
  }).catch(() => {});
}

/**
 * Track an event with optional properties.
 */
export function track(
  event: string,
  properties?: Record<string, any>
): void {
  if (!POSTHOG_KEY || !distinctId) return;

  fetch(`${POSTHOG_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      distinct_id: distinctId,
      event,
      properties: {
        ...properties,
        $lib: "ftw-mobile",
      },
    }),
  }).catch(() => {});
}

/**
 * Reset identity (on logout).
 */
export function reset(): void {
  distinctId = null;
}
