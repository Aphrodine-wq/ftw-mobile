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
  thumbnail: string;
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
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
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
    thumbnail: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=400&h=300&fit=crop",
  },
  {
    id: "j3",
    title: "Master Bathroom Renovation",
    description: "Shower surround and floor tile in master bath. Approx 120 sq ft of porcelain tile.",
    category: "Flooring",
    budget: { min: 3000, max: 5500 },
    location: "Cedar Park, TX",
    status: "bidding",
    bidCount: 4,
    postedBy: "Lisa Torres",
    postedDate: "2026-03-20",
    urgency: "low",
    thumbnail: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
  },
  {
    id: "j4",
    title: "Deck Build — Composite",
    description: "400 sq ft composite deck with railing. Attached to house, needs ledger board and footings.",
    category: "General Contracting",
    budget: { min: 8000, max: 14000 },
    location: "Georgetown, TX",
    status: "open",
    bidCount: 2,
    postedBy: "David Park",
    postedDate: "2026-03-23",
    urgency: "medium",
    thumbnail: "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=400&h=300&fit=crop",
  },
  {
    id: "j5",
    title: "Fence Install — 180 LF Cedar",
    description: "6ft cedar privacy fence, 180 linear feet. One gate. Remove old chain link.",
    category: "Fencing",
    budget: { min: 4500, max: 7000 },
    location: "Pflugerville, TX",
    status: "open",
    bidCount: 5,
    postedBy: "Amy Johnson",
    postedDate: "2026-03-22",
    urgency: "low",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
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
    thumbnail: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop",
  },
  {
    id: "j7",
    title: "Interior Painting — 4BR",
    description: "Full interior repaint. 4 bedrooms, 2 baths, living area, hallways. Walls and trim.",
    category: "Painting",
    budget: { min: 3500, max: 5500 },
    location: "Austin, TX",
    status: "open",
    bidCount: 4,
    postedBy: "Karen White",
    postedDate: "2026-03-24",
    urgency: "low",
    thumbnail: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop",
  },
  {
    id: "j8",
    title: "Electrical Panel Upgrade",
    description: "200A panel upgrade from Federal Pacific. New grounding, whole-house surge protector.",
    category: "Electrical",
    budget: { min: 3800, max: 5500 },
    location: "Round Rock, TX",
    status: "open",
    bidCount: 3,
    postedBy: "David Park",
    postedDate: "2026-03-23",
    urgency: "medium",
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
  },
  {
    id: "j9",
    title: "Concrete Driveway — 800 SF",
    description: "Remove and replace cracked 800 sq ft driveway. Broom finish, expansion joints.",
    category: "Concrete",
    budget: { min: 5000, max: 8000 },
    location: "Cedar Park, TX",
    status: "open",
    bidCount: 2,
    postedBy: "Tom Rivera",
    postedDate: "2026-03-25",
    urgency: "medium",
    thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
  {
    id: "j10",
    title: "Window Replacement — 12 Units",
    description: "Replace 12 single-pane windows with double-pane low-E vinyl. Various sizes.",
    category: "General Contracting",
    budget: { min: 7000, max: 12000 },
    location: "Pflugerville, TX",
    status: "bidding",
    bidCount: 5,
    postedBy: "Nancy Adams",
    postedDate: "2026-03-24",
    urgency: "low",
    thumbnail: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&h=300&fit=crop",
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

export const mockFairRecords = [
  {
    id: "fr1",
    publicId: "FR-A3X9K2",
    category: "Painting",
    locationCity: "Austin",
    scopeSummary: "Full interior painting — 4 bedrooms, 2 bathrooms, living area, hallways.",
    estimatedBudget: 4200,
    finalCost: 4200,
    budgetAccuracyPct: 100,
    onBudget: true,
    estimatedEndDate: "2026-01-20",
    actualCompletionDate: "2026-01-18",
    onTime: true,
    qualityScoreAtCompletion: 94,
    avgRating: 4.9,
    reviewCount: 127,
    disputeCount: 0,
    homeownerConfirmed: true,
    confirmedAt: "2026-01-19T14:30:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 127,
    projectTitle: "Interior Painting",
  },
  {
    id: "fr2",
    publicId: "FR-B7M4P1",
    category: "Remodeling",
    locationCity: "Austin",
    scopeSummary: "Complete kitchen remodel — new cabinets, quartz countertops, backsplash, plumbing, electrical.",
    estimatedBudget: 38500,
    finalCost: 36800,
    budgetAccuracyPct: 95.6,
    onBudget: true,
    estimatedEndDate: "2026-02-28",
    actualCompletionDate: "2026-03-02",
    onTime: false,
    qualityScoreAtCompletion: 92,
    avgRating: 4.9,
    reviewCount: 128,
    disputeCount: 0,
    homeownerConfirmed: true,
    confirmedAt: "2026-03-03T10:15:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 128,
    projectTitle: "Kitchen Remodel",
  },
  {
    id: "fr3",
    publicId: "FR-C2J8N5",
    category: "Electrical",
    locationCity: "Round Rock",
    scopeSummary: "200A panel upgrade — replaced Federal Pacific with Square D. New grounding, surge protector.",
    estimatedBudget: 4800,
    finalCost: 5100,
    budgetAccuracyPct: 93.8,
    onBudget: true,
    estimatedEndDate: "2026-01-15",
    actualCompletionDate: "2026-01-14",
    onTime: true,
    qualityScoreAtCompletion: 91,
    avgRating: 4.8,
    reviewCount: 125,
    disputeCount: 0,
    homeownerConfirmed: true,
    confirmedAt: "2026-01-15T09:00:00Z",
    contractorName: "Marcus Johnson",
    contractorCompany: "Johnson & Sons Construction",
    contractorRating: 4.9,
    contractorJobsCompleted: 125,
    projectTitle: "Electrical Panel Upgrade",
  },
];

export const mockReviews = [
  { id: "r1", rating: 5, comment: "Incredible work on the kitchen remodel. On time, on budget, clean job site every day.", reviewerName: "Sarah Mitchell", date: "2026-03-15" },
  { id: "r2", rating: 5, comment: "Marcus and his team were professional from start to finish. Highly recommend.", reviewerName: "Mike Chen", date: "2026-03-10" },
  { id: "r3", rating: 4, comment: "Great electrical work. Minor scheduling hiccup but communicated well.", reviewerName: "David Park", date: "2026-02-28" },
  { id: "r4", rating: 5, comment: "Best painting crew we've ever hired. Meticulous prep work.", reviewerName: "Lisa Torres", date: "2026-02-15" },
  { id: "r5", rating: 5, comment: "The roof looks amazing. Insurance process was seamless.", reviewerName: "Amy Johnson", date: "2026-01-20" },
];

export const mockNotifications = [
  { id: "n1", type: "bid_received", title: "New Bid Received", body: "Marcus Johnson bid $32,500 on Kitchen Remodel", read: false, createdAt: "2026-03-25T10:30:00Z" },
  { id: "n2", type: "message", title: "New Message", body: "Sarah Mitchell sent you a message", read: false, createdAt: "2026-03-25T09:15:00Z" },
  { id: "n3", type: "bid_accepted", title: "Bid Accepted", body: "Your bid on Roof Replacement was accepted", read: true, createdAt: "2026-03-24T16:00:00Z" },
  { id: "n4", type: "payment", title: "Payment Received", body: "$14,200 received for Roof Replacement", read: true, createdAt: "2026-03-24T14:30:00Z" },
  { id: "n5", type: "review", title: "New Review", body: "Mike Chen left you a 5-star review", read: true, createdAt: "2026-03-23T11:00:00Z" },
];

export const mockProjects = [
  { id: "p1", name: "Kitchen Remodel", status: "active" as const, budget: 38500, spent: 25000, startDate: "2026-02-15", endDate: null, contractorName: "Marcus Johnson", homeownerName: "Sarah Mitchell" },
  { id: "p2", name: "Roof Replacement", status: "active" as const, budget: 14200, spent: 7100, startDate: "2026-03-10", endDate: null, contractorName: "Marcus Johnson", homeownerName: "Mike Chen" },
  { id: "p3", name: "Interior Painting", status: "completed" as const, budget: 4200, spent: 4200, startDate: "2026-01-10", endDate: "2026-01-18", contractorName: "Marcus Johnson", homeownerName: "Lisa Torres" },
];

export const mockClients = [
  { id: "cl1", name: "Sarah Mitchell", email: "sarah@example.com", phone: "512-555-0101", projectCount: 2, totalSpent: 63500 },
  { id: "cl2", name: "Mike Chen", email: "mike@example.com", phone: "512-555-0102", projectCount: 1, totalSpent: 14200 },
  { id: "cl3", name: "Lisa Torres", email: "lisa@example.com", phone: "512-555-0103", projectCount: 1, totalSpent: 4200 },
  { id: "cl4", name: "David Park", email: "david@example.com", phone: "512-555-0104", projectCount: 1, totalSpent: 8500 },
];

export const mockInvoices = [
  { id: "inv1", amount: 7700, status: "paid" as const, dueDate: "2026-02-20", paidAt: "2026-02-22", description: "Kitchen Remodel — Milestone: Rough-In" },
  { id: "inv2", amount: 7700, status: "sent" as const, dueDate: "2026-03-25", paidAt: null, description: "Kitchen Remodel — Milestone: Cabinets" },
  { id: "inv3", amount: 14200, status: "paid" as const, dueDate: "2026-03-15", paidAt: "2026-03-14", description: "Roof Replacement — Full Payment" },
  { id: "inv4", amount: 4200, status: "paid" as const, dueDate: "2026-01-20", paidAt: "2026-01-18", description: "Interior Painting — Full Payment" },
];
