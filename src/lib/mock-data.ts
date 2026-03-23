// Mock data for Phase 2 screens — replace with real API calls when backend is ready

export interface MockJob {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number };
  location: string;
  status: "open" | "bidding" | "awarded" | "in_progress" | "completed" | "cancelled";
  bidCount: number;
  postedBy: string;
  postedDate: string;
  urgency: "low" | "medium" | "high";
}

export interface MockBid {
  id: string;
  jobId: string;
  amount: number;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "rejected";
  contractor: { id: string; name: string; rating: number; jobsCompleted: number };
  placedAt: string;
}

export interface MockConversation {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  avatar: string;
  role: "homeowner" | "contractor";
}

export interface MockMessage {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
}

export interface MockEstimate {
  id: string;
  title: string;
  client: string;
  total: number;
  status: "draft" | "sent" | "accepted" | "declined";
  date: string;
}

export const mockJobs: MockJob[] = [
  {
    id: "j1",
    title: "Kitchen Remodel — Full Gut",
    description: "Complete kitchen renovation including cabinets, countertops, flooring, and appliances. Roughly 200 sq ft.",
    category: "Remodeling",
    budget: { min: 25000, max: 40000 },
    location: "Austin, TX",
    status: "open",
    bidCount: 3,
    postedBy: "Sarah Mitchell",
    postedDate: "2026-03-22",
    urgency: "medium",
  },
  {
    id: "j2",
    title: "Roof Replacement — Hail Damage",
    description: "3,200 sq ft roof replacement. Insurance claim approved. Architectural shingles. Ridge vent.",
    category: "Roofing",
    budget: { min: 12000, max: 18000 },
    location: "Round Rock, TX",
    status: "open",
    bidCount: 7,
    postedBy: "Mike Chen",
    postedDate: "2026-03-21",
    urgency: "high",
  },
  {
    id: "j3",
    title: "Bathroom Tile Work",
    description: "Shower surround and floor tile in master bath. Approx 120 sq ft of porcelain tile.",
    category: "Flooring",
    budget: { min: 3000, max: 5500 },
    location: "Cedar Park, TX",
    status: "bidding",
    bidCount: 4,
    postedBy: "Lisa Torres",
    postedDate: "2026-03-20",
    urgency: "low",
  },
  {
    id: "j4",
    title: "Whole House Rewire",
    description: "1960s ranch, 1800 sq ft. Need to bring up to code. Panel upgrade included.",
    category: "Electrical",
    budget: { min: 8000, max: 14000 },
    location: "Georgetown, TX",
    status: "open",
    bidCount: 2,
    postedBy: "David Park",
    postedDate: "2026-03-23",
    urgency: "medium",
  },
  {
    id: "j5",
    title: "Fence Installation — 180 LF",
    description: "6ft cedar privacy fence, 180 linear feet. One gate. Remove old chain link.",
    category: "Fencing",
    budget: { min: 4500, max: 7000 },
    location: "Pflugerville, TX",
    status: "open",
    bidCount: 5,
    postedBy: "Amy Johnson",
    postedDate: "2026-03-22",
    urgency: "low",
  },
  {
    id: "j6",
    title: "HVAC System Replacement",
    description: "Replace 15-year-old 3-ton system. Prefer 16 SEER or higher. Ductwork in good shape.",
    category: "HVAC",
    budget: { min: 6000, max: 10000 },
    location: "Leander, TX",
    status: "in_progress",
    bidCount: 6,
    postedBy: "James Walton",
    postedDate: "2026-03-18",
    urgency: "high",
  },
];

export const mockBids: MockBid[] = [
  {
    id: "b1",
    jobId: "j1",
    amount: 32500,
    message: "20 years experience in kitchen remodels. We handle everything including permits and inspections.",
    timeline: "6-8 weeks",
    status: "pending",
    contractor: { id: "c1", name: "Marcus Johnson", rating: 4.9, jobsCompleted: 127 },
    placedAt: "2026-03-22T14:30:00Z",
  },
  {
    id: "b2",
    jobId: "j1",
    amount: 28900,
    message: "Licensed GC, fully insured. Can start within 2 weeks. References available.",
    timeline: "5-7 weeks",
    status: "pending",
    contractor: { id: "c2", name: "Rivera Construction", rating: 4.7, jobsCompleted: 89 },
    placedAt: "2026-03-22T16:00:00Z",
  },
  {
    id: "b3",
    jobId: "j1",
    amount: 36000,
    message: "Premium materials, lifetime warranty on labor. We use only licensed subs.",
    timeline: "8-10 weeks",
    status: "pending",
    contractor: { id: "c3", name: "Apex Builders", rating: 5.0, jobsCompleted: 203 },
    placedAt: "2026-03-23T09:00:00Z",
  },
  {
    id: "b4",
    jobId: "j2",
    amount: 14200,
    message: "Insurance restoration specialist. We handle the adjuster meeting.",
    timeline: "3-5 days",
    status: "pending",
    contractor: { id: "c4", name: "Texas Roof Pros", rating: 4.8, jobsCompleted: 312 },
    placedAt: "2026-03-21T11:00:00Z",
  },
];

export const mockConversations: MockConversation[] = [
  { id: "conv1", name: "Sarah Mitchell", lastMessage: "When can you start on the kitchen?", lastMessageTime: "2:30 PM", unread: 2, avatar: "SM", role: "homeowner" },
  { id: "conv2", name: "Marcus Johnson", lastMessage: "I've sent over the updated estimate", lastMessageTime: "11:15 AM", unread: 0, avatar: "MJ", role: "contractor" },
  { id: "conv3", name: "Mike Chen", lastMessage: "The insurance adjuster is coming Thursday", lastMessageTime: "Yesterday", unread: 1, avatar: "MC", role: "homeowner" },
  { id: "conv4", name: "Rivera Construction", lastMessage: "Materials are ordered, arriving Monday", lastMessageTime: "Yesterday", unread: 0, avatar: "RC", role: "contractor" },
  { id: "conv5", name: "Lisa Torres", lastMessage: "Can you send photos of similar work?", lastMessageTime: "Mar 20", unread: 0, avatar: "LT", role: "homeowner" },
];

export const mockMessages: Record<string, MockMessage[]> = {
  conv1: [
    { id: "m1", text: "Hi, I saw your bid on my kitchen remodel", sender: "them", time: "2:15 PM" },
    { id: "m2", text: "Yes! I'd love to discuss the scope in more detail", sender: "me", time: "2:20 PM" },
    { id: "m3", text: "Great. Are you available to do a walkthrough this week?", sender: "them", time: "2:25 PM" },
    { id: "m4", text: "When can you start on the kitchen?", sender: "them", time: "2:30 PM" },
  ],
  conv2: [
    { id: "m5", text: "Hey Marcus, just checking on the estimate revision", sender: "me", time: "10:00 AM" },
    { id: "m6", text: "Almost done — adjusted the countertop line item", sender: "them", time: "10:45 AM" },
    { id: "m7", text: "I've sent over the updated estimate", sender: "them", time: "11:15 AM" },
  ],
};

export const mockEstimates: MockEstimate[] = [
  { id: "e1", title: "Kitchen Remodel — Mitchell", client: "Sarah Mitchell", total: 32500, status: "sent", date: "2026-03-22" },
  { id: "e2", title: "Roof Replacement — Chen", client: "Mike Chen", total: 14200, status: "accepted", date: "2026-03-21" },
  { id: "e3", title: "Bathroom Tile — Torres", client: "Lisa Torres", total: 4800, status: "draft", date: "2026-03-20" },
  { id: "e4", title: "Fence Install — Johnson", client: "Amy Johnson", total: 5900, status: "sent", date: "2026-03-19" },
  { id: "e5", title: "HVAC Replace — Walton", client: "James Walton", total: 8500, status: "accepted", date: "2026-03-18" },
];

export const contractorStats = {
  activeJobs: 3,
  pendingBids: 5,
  monthlyRevenue: 47250,
  winRate: 68,
  avgRating: 4.9,
  completedJobs: 127,
};

export const homeownerStats = {
  activeJobs: 2,
  pendingBids: 8,
  totalSpent: 62400,
  projectsCompleted: 4,
};
