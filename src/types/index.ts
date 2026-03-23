// Types matching the Elixir backend serializers

export interface RealtimeUser {
  id: string;
  name: string;
  role: "homeowner" | "contractor";
  location: string;
  rating: number | null;
}

export interface RealtimeJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  location: string;
  status:
    | "open"
    | "bidding"
    | "awarded"
    | "in_progress"
    | "completed"
    | "disputed"
    | "cancelled";
  bid_count: number;
  homeowner: RealtimeUser;
  posted_at: string;
}

export interface RealtimeBid {
  id: string;
  job_id: string;
  amount: number;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "rejected";
  contractor: RealtimeUser;
  placed_at: string;
}

export interface RealtimeMessage {
  id: string;
  conversation_id: string;
  body: string;
  sender: RealtimeUser;
  sent_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "homeowner" | "contractor";
}
