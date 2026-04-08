import { create } from "zustand";

export interface CallEstimate {
  id: string;
  title: string;
  description: string;
  low: number;
  high: number;
  mid: number;
  timeline: string;
  calledAt: string;
  duration: string;
  status: "processing" | "ready";
}

const MOCK_HISTORY: CallEstimate[] = [
  {
    id: "ce1",
    title: "Kitchen Remodel — 200 sq ft",
    description: "Full gut reno, cabinets, quartz countertops, backsplash, new fixtures",
    low: 28000,
    high: 38000,
    mid: 32500,
    timeline: "6-8 weeks",
    calledAt: "Today, 2:15 PM",
    duration: "1:42",
    status: "ready",
  },
  {
    id: "ce2",
    title: "Roof Replacement — 2,400 sq ft",
    description: "Tear-off one layer, 30-year architectural, new ridge vent, ice shield",
    low: 11000,
    high: 16500,
    mid: 14200,
    timeline: "3-5 days",
    calledAt: "Yesterday, 10:30 AM",
    duration: "0:58",
    status: "ready",
  },
  {
    id: "ce3",
    title: "Bathroom Tile — 80 sq ft",
    description: "Shower tile, floor tile, waterproofing, new vanity install",
    low: 6800,
    high: 11200,
    mid: 8900,
    timeline: "2-3 weeks",
    calledAt: "Mar 28, 4:45 PM",
    duration: "1:15",
    status: "ready",
  },
];

interface CallEstimateStore {
  estimates: CallEstimate[];
  add: (estimate: CallEstimate) => void;
  remove: (id: string) => void;
}

export const useCallEstimateStore = create<CallEstimateStore>((set) => ({
  estimates: MOCK_HISTORY,
  add: (estimate) => set((s) => ({ estimates: [estimate, ...s.estimates] })),
  remove: (id) => set((s) => ({ estimates: s.estimates.filter((e) => e.id !== id) })),
}));
