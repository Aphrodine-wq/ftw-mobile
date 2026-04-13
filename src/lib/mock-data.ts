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
  contractor: { id: string; name: string; rating: number; jobsCompleted: number; avatar: string };
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
    budget: { min: 2500000, max: 4000000 },
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
    budget: { min: 1200000, max: 1800000 },
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
    budget: { min: 300000, max: 550000 },
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
    budget: { min: 800000, max: 1400000 },
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
    budget: { min: 450000, max: 700000 },
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
    budget: { min: 600000, max: 1000000 },
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
    budget: { min: 350000, max: 550000 },
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
    budget: { min: 380000, max: 550000 },
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
    budget: { min: 500000, max: 800000 },
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
    budget: { min: 700000, max: 1200000 },
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
    amount: 3250000,
    message: "20 years experience in kitchen remodels. We handle everything including permits and inspections.",
    timeline: "6-8 weeks",
    status: "pending",
    contractor: { id: "c1", name: "Marcus Johnson", rating: 4.9, jobsCompleted: 127, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    placedAt: "2026-03-22T14:30:00Z",
  },
  {
    id: "b2",
    jobId: "j1",
    amount: 2890000,
    message: "Licensed GC, fully insured. Can start within 2 weeks. References available.",
    timeline: "5-7 weeks",
    status: "pending",
    contractor: { id: "c2", name: "Rivera Construction", rating: 4.7, jobsCompleted: 89, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face" },
    placedAt: "2026-03-22T16:00:00Z",
  },
  {
    id: "b3",
    jobId: "j1",
    amount: 3600000,
    message: "Premium materials, lifetime warranty on labor. We use only licensed subs.",
    timeline: "8-10 weeks",
    status: "pending",
    contractor: { id: "c3", name: "Apex Builders", rating: 5.0, jobsCompleted: 203, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" },
    placedAt: "2026-03-23T09:00:00Z",
  },
  {
    id: "b4",
    jobId: "j2",
    amount: 1420000,
    message: "Insurance restoration specialist. We handle the adjuster meeting.",
    timeline: "3-5 days",
    status: "pending",
    contractor: { id: "c4", name: "Texas Roof Pros", rating: 4.8, jobsCompleted: 312, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
    placedAt: "2026-03-21T11:00:00Z",
  },
];

export const mockConversations: MockConversation[] = [
  { id: "conv1", name: "Sarah Mitchell", lastMessage: "When can you start on the kitchen?", lastMessageTime: "2:30 PM", unread: 2, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", role: "homeowner" },
  { id: "conv2", name: "Marcus Johnson", lastMessage: "I've sent over the updated estimate", lastMessageTime: "11:15 AM", unread: 0, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", role: "contractor" },
  { id: "conv3", name: "Mike Chen", lastMessage: "The insurance adjuster is coming Thursday", lastMessageTime: "Yesterday", unread: 1, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face", role: "homeowner" },
  { id: "conv4", name: "Rivera Construction", lastMessage: "Materials are ordered, arriving Monday", lastMessageTime: "Yesterday", unread: 0, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face", role: "contractor" },
  { id: "conv5", name: "Lisa Torres", lastMessage: "Can you send photos of similar work?", lastMessageTime: "Mar 20", unread: 0, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", role: "homeowner" },
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
  { id: "e1", title: "Kitchen Remodel — Mitchell", client: "Sarah Mitchell", total: 3250000, status: "sent", date: "2026-03-22" },
  { id: "e2", title: "Roof Replacement — Chen", client: "Mike Chen", total: 1420000, status: "accepted", date: "2026-03-21" },
  { id: "e3", title: "Bathroom Tile — Torres", client: "Lisa Torres", total: 480000, status: "draft", date: "2026-03-20" },
  { id: "e4", title: "Fence Install — Johnson", client: "Amy Johnson", total: 590000, status: "sent", date: "2026-03-19" },
  { id: "e5", title: "HVAC Replace — Walton", client: "James Walton", total: 850000, status: "accepted", date: "2026-03-18" },
];

export const contractorStats = {
  activeJobs: 3,
  pendingBids: 5,
  monthlyRevenue: 4725000,
  winRate: 68,
  avgRating: 4.9,
  completedJobs: 127,
};

export const homeownerStats = {
  activeJobs: 2,
  pendingBids: 8,
  totalSpent: 6240000,
  projectsCompleted: 4,
};

export const mockFairRecords = [
  {
    id: "fr1",
    publicId: "FR-A3X9K2",
    category: "Painting",
    locationCity: "Austin",
    scopeSummary: "Full interior painting — 4 bedrooms, 2 bathrooms, living area, hallways.",
    estimatedBudget: 420000,
    finalCost: 420000,
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
    estimatedBudget: 3850000,
    finalCost: 3680000,
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
    estimatedBudget: 480000,
    finalCost: 510000,
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
  {
    id: "p1",
    name: "Kitchen Remodel",
    description: "Full gut kitchen reno — cabinets, quartz countertops, backsplash, fixtures. 200 sq ft.",
    thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    category: "Remodeling",
    status: "active" as const,
    budget: 3850000,
    spent: 2500000,
    startDate: "2026-02-15",
    endDate: null,
    contractorName: "Marcus Johnson",
    homeownerName: "Sarah Mitchell",
    address: "4210 Elm Creek Dr, Austin, TX 78745",
    milestones: [
      { id: "m1", title: "Demo & Rough-In", amount: 770000, status: "paid" as const, dueDate: "2026-02-22", completedDate: "2026-02-20" },
      { id: "m2", title: "Cabinets & Plumbing", amount: 1155000, status: "paid" as const, dueDate: "2026-03-08", completedDate: "2026-03-06" },
      { id: "m3", title: "Countertops & Backsplash", amount: 962500, status: "in_progress" as const, dueDate: "2026-04-02" },
      { id: "m4", title: "Appliances & Trim", amount: 577500, status: "pending" as const, dueDate: "2026-04-15" },
      { id: "m5", title: "Final Inspection & Punch List", amount: 385000, status: "pending" as const, dueDate: "2026-04-22" },
    ],
    tasks: [
      { id: "t1", title: "Install countertop templating", status: "done" as const, assignee: "Marcus", dueDate: "2026-03-28" },
      { id: "t2", title: "Countertop fabrication & install", status: "in_progress" as const, assignee: "Stone Works Co", dueDate: "2026-04-02" },
      { id: "t3", title: "Backsplash tile layout", status: "in_progress" as const, assignee: "Marcus", dueDate: "2026-04-04" },
      { id: "t4", title: "Grout & seal backsplash", status: "todo" as const, assignee: "Marcus", dueDate: "2026-04-06" },
      { id: "t5", title: "Under-cabinet lighting wiring", status: "todo" as const, assignee: "Jake (electrical)", dueDate: "2026-04-08" },
      { id: "t6", title: "Appliance delivery coordination", status: "todo" as const, assignee: "Marcus", dueDate: "2026-04-12" },
      { id: "t7", title: "Final plumbing connections", status: "todo" as const, assignee: "Marcus", dueDate: "2026-04-14" },
      { id: "t8", title: "Touch-up paint & caulk", status: "todo" as const, assignee: "Marcus", dueDate: "2026-04-18" },
    ],
    documents: [
      { id: "d1", name: "Signed Contract", type: "contract" as const, date: "2026-02-12", size: "245 KB" },
      { id: "d2", name: "Building Permit #BP-2026-4421", type: "permit" as const, date: "2026-02-14", size: "1.2 MB" },
      { id: "d3", name: "Demo Complete Photos", type: "photo" as const, date: "2026-02-20", size: "8.4 MB" },
      { id: "d4", name: "Invoice — Demo & Rough-In", type: "invoice" as const, date: "2026-02-22", size: "98 KB" },
      { id: "d5", name: "Cabinet Install Photos", type: "photo" as const, date: "2026-03-06", size: "12.1 MB" },
      { id: "d6", name: "Invoice — Cabinets & Plumbing", type: "invoice" as const, date: "2026-03-08", size: "102 KB" },
      { id: "d7", name: "Change Order — Upgraded Faucet", type: "change_order" as const, date: "2026-03-15", size: "67 KB" },
      { id: "d8", name: "Countertop Template Measurements", type: "photo" as const, date: "2026-03-28", size: "3.2 MB" },
    ],
    activity: [
      { id: "a1", type: "task" as const, description: "Countertop templating completed", date: "2026-03-28T16:00:00Z", actor: "Marcus Johnson" },
      { id: "a2", type: "document" as const, description: "Uploaded countertop template measurements", date: "2026-03-28T15:30:00Z", actor: "Marcus Johnson" },
      { id: "a3", type: "document" as const, description: "Change order approved — upgraded faucet (+$380)", date: "2026-03-15T10:00:00Z", actor: "Sarah Mitchell" },
      { id: "a4", type: "payment" as const, description: "Payment received — Cabinets & Plumbing ($11,550)", date: "2026-03-08T14:00:00Z", actor: "Sarah Mitchell" },
      { id: "a5", type: "milestone" as const, description: "Milestone completed — Cabinets & Plumbing", date: "2026-03-06T17:00:00Z", actor: "Marcus Johnson" },
      { id: "a6", type: "message" as const, description: "Sent progress photos to homeowner", date: "2026-03-04T11:00:00Z", actor: "Marcus Johnson" },
      { id: "a7", type: "payment" as const, description: "Payment received — Demo & Rough-In ($7,700)", date: "2026-02-22T09:00:00Z", actor: "Sarah Mitchell" },
      { id: "a8", type: "milestone" as const, description: "Milestone completed — Demo & Rough-In", date: "2026-02-20T16:00:00Z", actor: "Marcus Johnson" },
      { id: "a9", type: "status" as const, description: "Project started", date: "2026-02-15T08:00:00Z", actor: "Marcus Johnson" },
    ],
  },
  {
    id: "p2",
    name: "Roof Replacement",
    description: "3,200 sq ft tear-off & replace. Architectural shingles, ridge vent. Insurance claim.",
    thumbnail: "https://images.unsplash.com/photo-1632759145351-1d592919f522?w=400&h=300&fit=crop",
    category: "Roofing",
    status: "active" as const,
    budget: 1420000,
    spent: 710000,
    startDate: "2026-03-10",
    endDate: null,
    contractorName: "Marcus Johnson",
    homeownerName: "Mike Chen",
    address: "891 Limestone Trail, Round Rock, TX 78665",
    milestones: [
      { id: "m6", title: "Tear-Off & Decking Repair", amount: 426000, status: "paid" as const, dueDate: "2026-03-14", completedDate: "2026-03-13" },
      { id: "m7", title: "Underlayment & Shingles", amount: 568000, status: "in_progress" as const, dueDate: "2026-03-22" },
      { id: "m8", title: "Flashings, Ridge & Cleanup", amount: 284000, status: "pending" as const, dueDate: "2026-03-28" },
      { id: "m9", title: "Final Inspection", amount: 142000, status: "pending" as const, dueDate: "2026-04-02" },
    ],
    tasks: [
      { id: "t9", title: "Old shingle tear-off", status: "done" as const, assignee: "Crew", dueDate: "2026-03-11" },
      { id: "t10", title: "Decking inspection & repair", status: "done" as const, assignee: "Marcus", dueDate: "2026-03-12" },
      { id: "t11", title: "Ice & water shield install", status: "done" as const, assignee: "Crew", dueDate: "2026-03-13" },
      { id: "t12", title: "Synthetic underlayment", status: "in_progress" as const, assignee: "Crew", dueDate: "2026-03-18" },
      { id: "t13", title: "Shingle installation", status: "in_progress" as const, assignee: "Crew", dueDate: "2026-03-20" },
      { id: "t14", title: "Pipe boots & wall flashings", status: "todo" as const, assignee: "Marcus", dueDate: "2026-03-24" },
      { id: "t15", title: "Ridge cap & vent install", status: "todo" as const, assignee: "Crew", dueDate: "2026-03-26" },
      { id: "t16", title: "Gutter cleaning & debris haul", status: "todo" as const, assignee: "Crew", dueDate: "2026-03-27" },
    ],
    documents: [
      { id: "d9", name: "Insurance Approval Letter", type: "permit" as const, date: "2026-03-05", size: "340 KB" },
      { id: "d10", name: "Signed Contract", type: "contract" as const, date: "2026-03-08", size: "198 KB" },
      { id: "d11", name: "Tear-Off Progress Photos", type: "photo" as const, date: "2026-03-11", size: "15.6 MB" },
      { id: "d12", name: "Decking Repair Report", type: "inspection" as const, date: "2026-03-12", size: "1.8 MB" },
      { id: "d13", name: "Invoice — Tear-Off & Decking", type: "invoice" as const, date: "2026-03-14", size: "95 KB" },
    ],
    activity: [
      { id: "a10", type: "task" as const, description: "Underlayment install started", date: "2026-03-18T08:00:00Z", actor: "Marcus Johnson" },
      { id: "a11", type: "payment" as const, description: "Payment received — Tear-Off & Decking ($4,260)", date: "2026-03-14T10:00:00Z", actor: "Mike Chen" },
      { id: "a12", type: "milestone" as const, description: "Milestone completed — Tear-Off & Decking Repair", date: "2026-03-13T17:00:00Z", actor: "Marcus Johnson" },
      { id: "a13", type: "document" as const, description: "Uploaded decking repair inspection report", date: "2026-03-12T14:00:00Z", actor: "Marcus Johnson" },
      { id: "a14", type: "status" as const, description: "Project started", date: "2026-03-10T07:00:00Z", actor: "Marcus Johnson" },
    ],
  },
  {
    id: "p3",
    name: "Interior Painting",
    description: "4BR/2BA full repaint — walls and trim. Sherwin-Williams Emerald. Two coats.",
    thumbnail: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop",
    category: "Painting",
    status: "completed" as const,
    budget: 420000,
    spent: 420000,
    startDate: "2026-01-10",
    endDate: "2026-01-18",
    contractorName: "Marcus Johnson",
    homeownerName: "Lisa Torres",
    address: "1502 Pecan Valley Ct, Cedar Park, TX 78613",
    milestones: [
      { id: "m10", title: "Prep & Prime", amount: 126000, status: "paid" as const, dueDate: "2026-01-13", completedDate: "2026-01-12" },
      { id: "m11", title: "Walls — First Coat", amount: 126000, status: "paid" as const, dueDate: "2026-01-15", completedDate: "2026-01-14" },
      { id: "m12", title: "Walls — Second Coat & Trim", amount: 126000, status: "paid" as const, dueDate: "2026-01-17", completedDate: "2026-01-17" },
      { id: "m13", title: "Touch-Up & Walkthrough", amount: 42000, status: "paid" as const, dueDate: "2026-01-18", completedDate: "2026-01-18" },
    ],
    tasks: [
      { id: "t17", title: "Furniture protection & masking", status: "done" as const, assignee: "Crew", dueDate: "2026-01-10" },
      { id: "t18", title: "Patch holes & sand", status: "done" as const, assignee: "Marcus", dueDate: "2026-01-11" },
      { id: "t19", title: "Prime all surfaces", status: "done" as const, assignee: "Crew", dueDate: "2026-01-12" },
      { id: "t20", title: "First coat — all rooms", status: "done" as const, assignee: "Crew", dueDate: "2026-01-14" },
      { id: "t21", title: "Second coat & trim", status: "done" as const, assignee: "Crew", dueDate: "2026-01-17" },
      { id: "t22", title: "Touch-up & cleanup", status: "done" as const, assignee: "Crew", dueDate: "2026-01-18" },
    ],
    documents: [
      { id: "d14", name: "Signed Contract", type: "contract" as const, date: "2026-01-08", size: "156 KB" },
      { id: "d15", name: "Color Selections", type: "photo" as const, date: "2026-01-09", size: "2.1 MB" },
      { id: "d16", name: "Before Photos", type: "photo" as const, date: "2026-01-10", size: "9.8 MB" },
      { id: "d17", name: "After Photos", type: "photo" as const, date: "2026-01-18", size: "11.3 MB" },
      { id: "d18", name: "Final Invoice", type: "invoice" as const, date: "2026-01-18", size: "88 KB" },
    ],
    activity: [
      { id: "a15", type: "status" as const, description: "Project completed", date: "2026-01-18T16:00:00Z", actor: "Marcus Johnson" },
      { id: "a16", type: "payment" as const, description: "Final payment received ($420)", date: "2026-01-18T14:00:00Z", actor: "Lisa Torres" },
      { id: "a17", type: "milestone" as const, description: "All milestones completed", date: "2026-01-18T12:00:00Z", actor: "Marcus Johnson" },
      { id: "a18", type: "document" as const, description: "Uploaded after photos", date: "2026-01-18T11:00:00Z", actor: "Marcus Johnson" },
      { id: "a19", type: "status" as const, description: "Project started", date: "2026-01-10T08:00:00Z", actor: "Marcus Johnson" },
    ],
  },
];

export const mockClients = [
  { id: "cl1", name: "Sarah Mitchell", email: "sarah@example.com", phone: "512-555-0101", projectCount: 2, totalSpent: 6350000, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", lastProject: "Kitchen Remodel", status: "active" as const },
  { id: "cl2", name: "Mike Chen", email: "mike@example.com", phone: "512-555-0102", projectCount: 1, totalSpent: 1420000, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face", lastProject: "Roof Replacement", status: "completed" as const },
  { id: "cl3", name: "Lisa Torres", email: "lisa@example.com", phone: "512-555-0103", projectCount: 1, totalSpent: 420000, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", lastProject: "Interior Painting", status: "completed" as const },
  { id: "cl4", name: "David Park", email: "david@example.com", phone: "512-555-0104", projectCount: 1, totalSpent: 850000, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face", lastProject: "Bathroom Reno", status: "active" as const },
];

export const mockInvoices = [
  { id: "inv1", amount: 770000, status: "paid" as const, dueDate: "2026-02-20", paidAt: "2026-02-22", description: "Kitchen Remodel — Milestone: Rough-In" },
  { id: "inv2", amount: 770000, status: "sent" as const, dueDate: "2026-03-25", paidAt: null, description: "Kitchen Remodel — Milestone: Cabinets" },
  { id: "inv3", amount: 1420000, status: "paid" as const, dueDate: "2026-03-15", paidAt: "2026-03-14", description: "Roof Replacement — Full Payment" },
  { id: "inv4", amount: 420000, status: "paid" as const, dueDate: "2026-01-20", paidAt: "2026-01-18", description: "Interior Painting — Full Payment" },
];

// ── Payouts ──────────────────────────────────────────────────────────

export const mockPayouts = [
  { id: "pay1", subJobId: "sub1", amount: 770000, platformFee: 38500, netAmount: 731500, status: "completed" as const, processedAt: "2026-02-23", createdAt: "2026-02-22" },
  { id: "pay2", subJobId: "sub2", amount: 1420000, platformFee: 71000, netAmount: 1349000, status: "completed" as const, processedAt: "2026-03-15", createdAt: "2026-03-14" },
  { id: "pay3", subJobId: "sub3", amount: 420000, platformFee: 21000, netAmount: 399000, status: "processing" as const, processedAt: undefined, createdAt: "2026-04-10" },
  { id: "pay4", subJobId: "sub4", amount: 850000, platformFee: 42500, netAmount: 807500, status: "pending" as const, processedAt: undefined, createdAt: "2026-04-12" },
];

// ── ConstructionAI Estimation ──────────────────────────────────────────

export interface AiEstimateResult {
  id: string;
  jobTitle: string;
  estimateMin: number;
  estimateMax: number;
  estimateMid: number;
  confidence: number;
  laborHours: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  subtotal: number;
  overheadPercent: number;
  profitPercent: number;
  contingencyPct: number;
  total: number;
  breakdown: { division: string; item: string; cost: number }[];
  lineItems: { description: string; quantity: number; unit: string; unitCost: number; total: number }[];
  exclusions: string[];
  notes: string[];
  timelineWeeks: number;
  regionFactor: number;
  modelVersion: string;
}

export const mockAiEstimate: AiEstimateResult = {
  id: "ai-est-1",
  jobTitle: "Kitchen Remodel — Full Gut",
  estimateMin: 2850000,
  estimateMax: 4200000,
  estimateMid: 3420000,
  confidence: 0.82,
  laborHours: 320,
  laborCost: 1680000,
  materialCost: 1240000,
  equipmentCost: 180000,
  subtotal: 3100000,
  overheadPercent: 0.08,
  profitPercent: 0.10,
  contingencyPct: 0.05,
  total: 3420000,
  breakdown: [
    { division: "02 Existing Conditions", item: "Demolition & haul-off", cost: 320000 },
    { division: "06 Wood/Plastics", item: "Cabinets & countertops", cost: 980000 },
    { division: "07 Thermal/Moisture", item: "Waterproofing & insulation", cost: 120000 },
    { division: "09 Finishes", item: "Tile, backsplash, paint", cost: 460000 },
    { division: "22 Plumbing", item: "Fixtures & rough-in", cost: 380000 },
    { division: "26 Electrical", item: "Wiring, panels, fixtures", cost: 420000 },
    { division: "11 Equipment", item: "Appliance installation", cost: 240000 },
    { division: "01 General", item: "Permits, cleanup, dumpster", cost: 180000 },
  ],
  lineItems: [
    { description: "Cabinet demolition & disposal", quantity: 1, unit: "LS", unitCost: 180000, total: 180000 },
    { description: "Flooring removal", quantity: 200, unit: "SF", unitCost: 350, total: 70000 },
    { description: "Dumpster rental (20yd)", quantity: 1, unit: "EA", unitCost: 70000, total: 70000 },
    { description: "Custom cabinets — base & wall", quantity: 18, unit: "LF", unitCost: 28000, total: 504000 },
    { description: "Quartz countertops — fabricated", quantity: 45, unit: "SF", unitCost: 8500, total: 382500 },
    { description: "Undermount sink + faucet", quantity: 1, unit: "EA", unitCost: 65000, total: 65000 },
    { description: "Subway tile backsplash", quantity: 32, unit: "SF", unitCost: 1800, total: 57600 },
    { description: "LVP flooring install", quantity: 200, unit: "SF", unitCost: 850, total: 170000 },
    { description: "Interior paint — walls & ceiling", quantity: 1, unit: "LS", unitCost: 180000, total: 180000 },
    { description: "Rough plumbing — relocate drain", quantity: 1, unit: "LS", unitCost: 220000, total: 220000 },
    { description: "Electrical — 20A circuits + GFCI", quantity: 4, unit: "EA", unitCost: 45000, total: 180000 },
    { description: "Recessed lighting install", quantity: 8, unit: "EA", unitCost: 17500, total: 140000 },
    { description: "Appliance hookup (gas + electric)", quantity: 4, unit: "EA", unitCost: 25000, total: 100000 },
    { description: "Permits & inspections", quantity: 1, unit: "LS", unitCost: 120000, total: 120000 },
  ],
  exclusions: [
    "Structural modifications or load-bearing wall removal",
    "Asbestos or lead paint abatement",
    "Appliance purchasing (installation only)",
    "HVAC modifications beyond kitchen scope",
  ],
  notes: [
    "Estimate assumes standard cabinet grade. Upgrade to semi-custom adds ~15%.",
    "Timeline may extend 1-2 weeks if permit review is delayed.",
    "Price includes builder-grade appliance hookup only.",
  ],
  timelineWeeks: 8,
  regionFactor: 0.92,
  modelVersion: "v4",
};

// ── Subcontractor Mock Data ──────────────────────────────────────────────────

export type SubJobStatus = "open" | "in_progress" | "completed" | "cancelled";
export type SubPaymentPath = "contractor_escrow" | "passthrough_escrow";

export interface SubJob {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  deadline: string;
  location: string;
  status: SubJobStatus;
  bidCount: number;
  paymentPath: SubPaymentPath;
  urgency: "low" | "medium" | "high";
  contractorName: string;
  contractorRating: number;
  projectName: string;
  milestoneLabel: string;
}

export interface SubBid {
  id: string;
  subJobId: string;
  amount: number;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  subContractorName: string;
}

export const mockSubJobs: SubJob[] = [
  { id: "sj1", title: "Quartz Countertop Install", description: "Fabricate and install 45 SF quartz countertops with undermount sink cutout. Template already done.", category: "Countertops", skills: ["Stone fabrication", "Templating", "Sink cutouts"], budgetMin: 450000, budgetMax: 600000, deadline: "2026-04-05", location: "Austin, TX", status: "open", bidCount: 2, paymentPath: "contractor_escrow", urgency: "medium", contractorName: "Marcus Johnson", contractorRating: 4.9, projectName: "Kitchen Remodel", milestoneLabel: "Countertops & Backsplash" },
  { id: "sj2", title: "Tile Backsplash + LVP Flooring", description: "Install 32 SF subway tile backsplash and 200 SF LVP flooring in kitchen. Materials on site.", category: "Flooring", skills: ["Tile setting", "LVP install", "Grout & seal"], budgetMin: 500000, budgetMax: 700000, deadline: "2026-04-10", location: "Austin, TX", status: "open", bidCount: 1, paymentPath: "passthrough_escrow", urgency: "low", contractorName: "Marcus Johnson", contractorRating: 4.9, projectName: "Kitchen Remodel", milestoneLabel: "Countertops & Backsplash" },
  { id: "sj3", title: "Seamless Gutter Install", description: "Install 180 LF seamless aluminum gutters with downspouts. Old gutters removed.", category: "Roofing", skills: ["Gutter fabrication", "Fascia repair"], budgetMin: 280000, budgetMax: 380000, deadline: "2026-03-30", location: "Round Rock, TX", status: "open", bidCount: 3, paymentPath: "contractor_escrow", urgency: "high", contractorName: "James Mitchell", contractorRating: 4.7, projectName: "Roof Replacement", milestoneLabel: "Flashings, Ridge & Cleanup" },
  { id: "sj4", title: "Bathroom Plumbing Rough-In", description: "Rough-in plumbing for master bath remodel. Relocate drain, supply lines, and vent stack.", category: "Plumbing", skills: ["Rough plumbing", "Drain relocation", "Venting"], budgetMin: 320000, budgetMax: 450000, deadline: "2026-04-08", location: "Cedar Park, TX", status: "in_progress", bidCount: 2, paymentPath: "passthrough_escrow", urgency: "medium", contractorName: "Marcus Johnson", contractorRating: 4.9, projectName: "Bathroom Reno", milestoneLabel: "Plumbing Rough-In" },
  { id: "sj5", title: "Flashing & Ridge Cap", description: "Install pipe boots, wall flashings, and ridge cap on 3200 SF roof. Shingles already done.", category: "Roofing", skills: ["Flashing", "Ridge vent", "Waterproofing"], budgetMin: 180000, budgetMax: 260000, deadline: "2026-03-28", location: "Round Rock, TX", status: "open", bidCount: 0, paymentPath: "contractor_escrow", urgency: "high", contractorName: "James Mitchell", contractorRating: 4.7, projectName: "Roof Replacement", milestoneLabel: "Flashings, Ridge & Cleanup" },
];

export const mockSubBids: SubBid[] = [
  { id: "sb1", subJobId: "sj1", amount: 520000, message: "15 years in stone. Can start Monday.", timeline: "3-4 days", status: "pending", subContractorName: "Jake Wilson" },
  { id: "sb2", subJobId: "sj2", amount: 580000, message: "Tile and flooring crew available next week.", timeline: "4-5 days", status: "pending", subContractorName: "Jake Wilson" },
  { id: "sb3", subJobId: "sj4", amount: 380000, message: "Licensed plumber, 20 years experience.", timeline: "2-3 days", status: "accepted", subContractorName: "Jake Wilson" },
];

export const subContractorStats = {
  activeSubJobs: 1,
  pendingBids: 2,
  monthlyRevenue: 1840000,
  winRate: 74,
  avgRating: 4.8,
  completedSubJobs: 43,
};
