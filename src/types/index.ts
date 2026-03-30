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
  role: "homeowner" | "contractor" | "subcontractor";
}

export interface FairRecord {
  id: string;
  publicId: string;
  category: string;
  locationCity: string;
  scopeSummary: string;
  estimatedBudget: number;
  finalCost: number;
  budgetAccuracyPct: number;
  onBudget: boolean;
  estimatedEndDate: string;
  actualCompletionDate: string;
  onTime: boolean;
  qualityScoreAtCompletion: number;
  avgRating: number;
  reviewCount: number;
  disputeCount: number;
  homeownerConfirmed: boolean;
  confirmedAt: string | null;
  contractorName: string;
  contractorCompany: string;
  contractorRating: number;
  contractorJobsCompleted: number;
  projectTitle: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  date: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  amount: number;
  status: "pending" | "in_progress" | "completed" | "paid";
  dueDate: string;
  completedDate?: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assignee?: string;
  dueDate?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: "contract" | "permit" | "photo" | "invoice" | "change_order" | "inspection";
  date: string;
  size?: string;
}

export interface ProjectActivity {
  id: string;
  type: "milestone" | "payment" | "message" | "document" | "status" | "task";
  description: string;
  date: string;
  actor: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  status: "planning" | "active" | "completed" | "cancelled";
  budget: number;
  spent: number;
  startDate: string;
  endDate: string | null;
  contractorName: string;
  homeownerName: string;
  address: string;
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  documents: ProjectDocument[];
  activity: ProjectActivity[];
}

export interface Invoice {
  id: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  paidAt: string | null;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectCount: number;
  totalSpent: number;
}
