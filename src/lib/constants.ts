export const BRAND = {
  name: "FairTradeWorker",
  tagline: "The fair way to find and hire contractors",
  description:
    "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
  colors: {
    primary: "#059669",
    primaryHover: "#047857",
    dark: "#0F1419",
    bgSoft: "#F7F8FA",
    bgCard: "#FFFFFF",
    textPrimary: "#111318",
    textSecondary: "#4B5563",
    textMuted: "#9CA3AF",
    border: "#E5E7EB",
  },
} as const;

export const JOB_CATEGORIES = [
  "General Contracting",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Roofing",
  "Painting",
  "Flooring",
  "Landscaping",
  "Remodeling",
  "Concrete",
  "Fencing",
  "Drywall",
] as const;

export const ESTIMATE_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "expired",
] as const;

export const JOB_STATUSES = [
  "open",
  "bidding",
  "awarded",
  "in_progress",
  "completed",
  "disputed",
  "cancelled",
] as const;

export const API_BASE =
  process.env.EXPO_PUBLIC_REALTIME_URL || "http://localhost:4000";
