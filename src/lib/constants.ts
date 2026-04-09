export const BRAND = {
  name: "FairTradeWorker",
  tagline: "The fair way to find and hire contractors",
  description:
    "Two-sided marketplace connecting homeowners with verified contractors. No lead fees. Fair pricing. Transparent estimates.",
  colors: {
    primary: "#C41E3A",
    primaryHover: "#A5182F",
    dark: "#0F1419",
    bgSoft: "#F5F3F0",
    bgCard: "#FFFFFF",
    textPrimary: "#111318",
    textSecondary: "#2D3239",
    textMuted: "#5C6370",
    border: "#C8C3BC",
    primaryLight: "#FDF2F3",
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

export const AI_STREAM_BASE =
  process.env.EXPO_PUBLIC_AI_STREAM_URL || API_BASE.replace(":4000", ":8000");
