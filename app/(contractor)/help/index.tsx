import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  type ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";
import {
  ArrowLeft,
  Brain,
  Phone,
  FileText,
  Users,
  Shield,
  DollarSign,
  Send,
  ChevronRight,
  Home,
  Calculator,
  Crown,
  CheckCircle,
  ArrowRight,
  Clock,
  BarChart3,
  Gift,
  MessageCircle,
  Star,
  Zap,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { BRAND } from "@src/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ──────────────────────────────────────────────
// Each illustration is static layout + entering animations only.
// No useEffect, no useSharedValue, no hooks-in-loops.
// ──────────────────────────────────────────────

function EstimateIllustration() {
  return (
    <View className="items-center px-8">
      {/* Chat bubble */}
      <Animated.View
        entering={FadeInDown.duration(150).delay(100)}
        className="w-full bg-brand-50 border border-brand-600 p-3 mb-2"
        style={{ borderRadius: 4 }}
      >
        <Text className="text-dark text-sm">
          "Kitchen remodel, 200 sq ft, quartz counters, new cabinets..."
        </Text>
      </Animated.View>

      {/* AI response */}
      <Animated.View
        entering={FadeInUp.duration(150).delay(300)}
        className="w-full bg-white border border-border overflow-hidden"
        style={{ borderRadius: 4 }}
      >
        <View style={{ height: 3, backgroundColor: BRAND.colors.primary }} />
        <View className="p-4">
          <View className="flex-row items-center mb-3">
            <Brain size={14} color={BRAND.colors.primary} />
            <Text className="text-text-muted font-bold uppercase tracking-wider ml-2" style={{ fontSize: 9 }}>
              ConstructionAI Estimate
            </Text>
            <View className="ml-auto bg-brand-50 px-2 py-0.5">
              <Text className="text-brand-600 font-bold" style={{ fontSize: 9 }}>94%</Text>
            </View>
          </View>

          <Animated.View entering={FadeIn.duration(150).delay(500)} className="flex-row">
            <View className="flex-1 items-center py-2">
              <Text className="text-text-muted" style={{ fontSize: 10 }}>Low</Text>
              <Text className="text-dark font-bold" style={{ fontSize: 16 }}>$28,000</Text>
            </View>
            <View className="flex-1 items-center py-2 border-x border-border">
              <Text className="text-text-muted" style={{ fontSize: 10 }}>Fair Price</Text>
              <Text className="font-bold" style={{ fontSize: 20, color: BRAND.colors.primary }}>$32,500</Text>
            </View>
            <View className="flex-1 items-center py-2">
              <Text className="text-text-muted" style={{ fontSize: 10 }}>High</Text>
              <Text className="text-dark font-bold" style={{ fontSize: 16 }}>$38,000</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(150).delay(650)} className="flex-row mt-3" style={{ gap: 8 }}>
            <View className="flex-1 bg-brand-600 py-2 items-center" style={{ borderRadius: 4 }}>
              <Text className="text-white font-bold" style={{ fontSize: 11 }}>Send to Client</Text>
            </View>
            <View className="flex-1 border border-border py-2 items-center" style={{ borderRadius: 4 }}>
              <Text className="text-dark font-bold" style={{ fontSize: 11 }}>Export PDF</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

function CallAgentIllustration() {
  return (
    <View className="items-center px-8">
      <Animated.View entering={FadeIn.duration(150).delay(100)} className="items-center mb-5">
        <View className="w-20 h-20 items-center justify-center mb-3" style={{ borderRadius: 40, backgroundColor: BRAND.colors.primary }}>
          <Phone size={32} color="#FFFFFF" />
        </View>
        <View className="flex-row items-center bg-surface px-4 py-2" style={{ borderRadius: 4 }}>
          <View className="w-2 h-2 bg-red-500 mr-2" style={{ borderRadius: 1 }} />
          <Text className="text-dark font-bold" style={{ fontSize: 18 }}>1:42</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(150).delay(300)} className="w-full" style={{ gap: 6 }}>
        {[
          { time: "0:00", text: "I'm looking at a kitchen, about 200 square feet..." },
          { time: "0:32", text: "They want quartz countertops, new cabinet faces..." },
          { time: "1:15", text: "Existing plumbing is good, just moving the sink..." },
        ].map((line, i) => (
          <Animated.View
            key={i}
            entering={FadeInDown.duration(150).delay(400 + i * 150)}
            className="flex-row items-start"
          >
            <Text className="text-text-muted font-bold mr-2" style={{ fontSize: 10, width: 28 }}>{line.time}</Text>
            <Text className="text-text-secondary flex-1" style={{ fontSize: 12, lineHeight: 17 }}>{line.text}</Text>
          </Animated.View>
        ))}
      </Animated.View>
    </View>
  );
}

function JobFlowIllustration() {
  const steps = [
    { icon: Home, label: "Homeowner posts a job", sub: "Describes work needed", color: "#3B82F6" },
    { icon: Send, label: "You submit your bid", sub: "AI-backed estimate attached", color: BRAND.colors.primary },
    { icon: CheckCircle, label: "They pick you", sub: "Based on merit, not ad spend", color: "#059669" },
    { icon: DollarSign, label: "Get paid fair", sub: "Transparent escrow payments", color: "#D97706" },
  ];

  return (
    <View className="px-8">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <Animated.View key={i} entering={FadeInDown.duration(150).delay(100 + i * 150)}>
            <View className="flex-row items-center">
              <View className="w-10 h-10 items-center justify-center mr-3" style={{ borderRadius: 4, backgroundColor: s.color }}>
                <Icon size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 14 }}>{s.label}</Text>
                <Text className="text-text-muted" style={{ fontSize: 11 }}>{s.sub}</Text>
              </View>
              <View className="bg-surface w-6 h-6 items-center justify-center" style={{ borderRadius: 3 }}>
                <Text className="text-text-muted font-bold" style={{ fontSize: 11 }}>{i + 1}</Text>
              </View>
            </View>
            {i < steps.length - 1 && (
              <View className="ml-5 border-l-2 border-border h-3" />
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

function FairRecordIllustration() {
  const metrics = [
    { label: "On-Time Completion", pct: 95, color: "#059669" },
    { label: "Budget Accuracy", pct: 88, color: "#3B82F6" },
    { label: "Client Satisfaction", pct: 92, color: BRAND.colors.primary },
  ];

  return (
    <View className="px-8">
      <Animated.View
        entering={FadeIn.duration(150).delay(100)}
        className="bg-white border border-border p-4"
        style={{ borderRadius: 4 }}
      >
        <View className="flex-row items-center mb-4">
          <Shield size={18} color={BRAND.colors.primary} />
          <Text className="text-dark font-bold ml-2" style={{ fontSize: 15 }}>Marcus Johnson</Text>
          <View className="ml-auto bg-green-50 px-2 py-0.5" style={{ borderRadius: 2 }}>
            <Text className="text-green-700 font-bold" style={{ fontSize: 9 }}>VERIFIED</Text>
          </View>
        </View>

        {metrics.map((m, i) => (
          <Animated.View key={i} entering={FadeInDown.duration(150).delay(250 + i * 150)} className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-text-secondary" style={{ fontSize: 12 }}>{m.label}</Text>
              <Text className="text-dark font-bold" style={{ fontSize: 12 }}>{m.pct}%</Text>
            </View>
            <View className="h-2 bg-gray-100 w-full" style={{ borderRadius: 99 }}>
              <View className="h-2" style={{ width: `${m.pct}%`, backgroundColor: m.color, borderRadius: 99 }} />
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeIn.duration(150).delay(700)} className="flex-row items-center mt-1">
          <View className="flex-1 items-center border-r border-border py-1">
            <Text className="text-dark font-bold" style={{ fontSize: 16 }}>47</Text>
            <Text className="text-text-muted" style={{ fontSize: 10 }}>Jobs Done</Text>
          </View>
          <View className="flex-1 items-center border-r border-border py-1">
            <Text className="text-dark font-bold" style={{ fontSize: 16 }}>4.9</Text>
            <Text className="text-text-muted" style={{ fontSize: 10 }}>Rating</Text>
          </View>
          <View className="flex-1 items-center py-1">
            <Text className="text-dark font-bold" style={{ fontSize: 16 }}>3yr</Text>
            <Text className="text-text-muted" style={{ fontSize: 10 }}>On Platform</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function ClientsIllustration() {
  const clients = [
    { name: "Sarah Mitchell", project: "Kitchen Remodel", amount: "$32,500", status: "active" },
    { name: "David Chen", project: "Deck Build — 400 sq ft", amount: "$18,600", status: "active" },
    { name: "Lisa Thompson", project: "Bathroom Tile", amount: "$8,900", status: "completed" },
  ];

  return (
    <View className="px-8">
      {clients.map((c, i) => (
        <Animated.View
          key={i}
          entering={FadeInDown.duration(150).delay(100 + i * 150)}
          className="bg-white border border-border p-3 flex-row items-center mb-2"
          style={{ borderRadius: 4 }}
        >
          <View className="w-10 h-10 items-center justify-center mr-3" style={{ borderRadius: 20, backgroundColor: BRAND.colors.bgSoft }}>
            <Text className="text-text-muted font-bold" style={{ fontSize: 14 }}>{c.name[0]}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-dark font-bold" style={{ fontSize: 13 }}>{c.name}</Text>
            <Text className="text-text-muted" style={{ fontSize: 11 }}>{c.project}</Text>
          </View>
          <View className="items-end">
            <Text className="text-dark font-bold" style={{ fontSize: 13 }}>{c.amount}</Text>
            <View
              className="px-1.5 py-0.5 mt-0.5"
              style={{ borderRadius: 2, backgroundColor: c.status === "active" ? "#ECFDF5" : "#F3F4F6" }}
            >
              <Text
                className="font-bold uppercase"
                style={{ fontSize: 8, color: c.status === "active" ? "#059669" : "#6B7280" }}
              >
                {c.status}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}

      <Animated.View
        entering={FadeIn.duration(150).delay(600)}
        className="flex-row mt-2"
        style={{ gap: 8 }}
      >
        <View className="flex-1 bg-surface p-3 items-center" style={{ borderRadius: 4 }}>
          <Text className="text-dark font-bold" style={{ fontSize: 16 }}>$60K</Text>
          <Text className="text-text-muted" style={{ fontSize: 10 }}>Total Revenue</Text>
        </View>
        <View className="flex-1 bg-surface p-3 items-center" style={{ borderRadius: 4 }}>
          <Text className="text-dark font-bold" style={{ fontSize: 16 }}>3</Text>
          <Text className="text-text-muted" style={{ fontSize: 10 }}>Active Clients</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function ProToolsIllustration() {
  const tools = [
    { icon: Brain, label: "AI Estimates", desc: "Detailed in seconds" },
    { icon: Phone, label: "Call Agent", desc: "Talk, don't type" },
    { icon: Calculator, label: "FairPrice", desc: "Instant pricing" },
    { icon: FileText, label: "PDF Export", desc: "Client-ready docs" },
    { icon: BarChart3, label: "Analytics", desc: "Track performance" },
    { icon: Shield, label: "FairRecord", desc: "Verified trust" },
  ];

  return (
    <View className="px-8">
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {tools.map((t, i) => {
          const Icon = t.icon;
          return (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(150).delay(100 + i * 100)}
              className="bg-white border border-border p-3"
              style={{ width: (SCREEN_WIDTH - 80) / 2, borderRadius: 4 }}
            >
              <View className="flex-row items-center mb-1.5">
                <View className="w-8 h-8 bg-brand-50 items-center justify-center mr-2" style={{ borderRadius: 4 }}>
                  <Icon size={16} color={BRAND.colors.primary} />
                </View>
                <Text className="text-dark font-bold" style={{ fontSize: 13 }}>{t.label}</Text>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 11 }}>{t.desc}</Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

function ReferralIllustration() {
  return (
    <View className="px-8">
      <Animated.View entering={FadeIn.duration(150).delay(100)} className="bg-white border border-border p-4" style={{ borderRadius: 4 }}>
        {/* You invite */}
        <Animated.View entering={FadeInDown.duration(150).delay(150)} className="flex-row items-center mb-3">
          <View className="w-10 h-10 items-center justify-center mr-3" style={{ borderRadius: 4, backgroundColor: BRAND.colors.primary }}>
            <Users size={18} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-dark font-bold" style={{ fontSize: 14 }}>You invite a contractor</Text>
            <Text className="text-text-muted" style={{ fontSize: 11 }}>Share your code or send a link</Text>
          </View>
        </Animated.View>

        <View className="ml-5 border-l-2 border-border h-2 mb-2" />

        {/* They join */}
        <Animated.View entering={FadeInDown.duration(150).delay(350)} className="flex-row items-center mb-3">
          <View className="w-10 h-10 items-center justify-center mr-3" style={{ borderRadius: 4, backgroundColor: "#3B82F6" }}>
            <CheckCircle size={18} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-dark font-bold" style={{ fontSize: 14 }}>They complete their profile</Text>
            <Text className="text-text-muted" style={{ fontSize: 11 }}>Sign up and verify their trade</Text>
          </View>
        </Animated.View>

        <View className="ml-5 border-l-2 border-border h-2 mb-2" />

        {/* Both earn */}
        <Animated.View entering={FadeInDown.duration(150).delay(550)} className="flex-row items-center">
          <View className="w-10 h-10 items-center justify-center mr-3" style={{ borderRadius: 4, backgroundColor: "#059669" }}>
            <Crown size={18} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <Text className="text-dark font-bold" style={{ fontSize: 14 }}>Both earn 1 week of Pro</Text>
            <Text className="text-text-muted" style={{ fontSize: 11 }}>AI estimates, call agent, analytics</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Homeowner variant */}
      <Animated.View entering={FadeInUp.duration(150).delay(700)} className="bg-surface p-3 mt-2 flex-row items-center" style={{ borderRadius: 4 }}>
        <Home size={16} color={BRAND.colors.textMuted} />
        <Text className="text-text-secondary ml-2 flex-1" style={{ fontSize: 12 }}>
          Invite homeowners too — get priority placement on their first job.
        </Text>
      </Animated.View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Help pages
// ──────────────────────────────────────────────

interface HelpPage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  illustration: React.ComponentType;
  action?: { label: string; route: string };
}

const HELP_PAGES: HelpPage[] = [
  {
    id: "estimates",
    title: "AI-Powered Estimates",
    subtitle: "CONSTRUCTIONAI",
    description: "Describe any job in plain English. ConstructionAI generates a detailed estimate with cost breakdown, materials, labor, and timeline — trained on 600K+ real construction projects.",
    illustration: EstimateIllustration,
    action: { label: "Try ConstructionAI", route: "/(contractor)/ai-agent" },
  },
  {
    id: "call-agent",
    title: "Call In Your Estimates",
    subtitle: "CALL AGENT",
    description: "On-site and can't type? Call the AI agent, describe the job out loud, and get a full estimate generated from your conversation. No time limit.",
    illustration: CallAgentIllustration,
    action: { label: "Try Call Agent", route: "/(contractor)/voice-agent" },
  },
  {
    id: "job-flow",
    title: "How Jobs Work",
    subtitle: "THE MARKETPLACE",
    description: "Homeowners post jobs. You bid with AI-backed estimates. They pick the best contractor — not the one who paid the most for leads. Your work wins, not your wallet.",
    illustration: JobFlowIllustration,
  },
  {
    id: "fairrecord",
    title: "Your FairRecord",
    subtitle: "VERIFIED TRUST",
    description: "Every completed job builds your verified track record. On-time rates, budget accuracy, client satisfaction — all transparent. The better your record, the more work you win.",
    illustration: FairRecordIllustration,
    action: { label: "View Your FairRecord", route: "/(contractor)/records" },
  },
  {
    id: "clients",
    title: "Client Management",
    subtitle: "YOUR BUSINESS",
    description: "Track every client, project, and dollar in one place. Import from contacts, manage estimates, send invoices, and build lasting relationships.",
    illustration: ClientsIllustration,
    action: { label: "Manage Clients", route: "/(contractor)/clients" },
  },
  {
    id: "pro-tools",
    title: "Pro Tools",
    subtitle: "FTW PRO",
    description: "AI estimation, call-in estimates, FairPrice calculator, PDF export, analytics, and a verified FairRecord. Everything a contractor needs to win more and waste less.",
    illustration: ProToolsIllustration,
    action: { label: "See Pro Plans", route: "/(contractor)/pro" },
  },
  {
    id: "referrals",
    title: "Grow the Market",
    subtitle: "REFERRALS",
    description: "Invite contractors, subs, and homeowners. Both sides earn free Pro time. The more people on the platform, the more jobs flow to everyone.",
    illustration: ReferralIllustration,
    action: { label: "Start Referring", route: "/(contractor)/referrals" },
  },
];

// ──────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────

export default function HelpScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCurrentPage(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const page = HELP_PAGES[currentPage];
  const isLast = currentPage === HELP_PAGES.length - 1;

  const goNext = useCallback(() => {
    if (currentPage < HELP_PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    }
  }, [currentPage]);

  const renderPage = useCallback(
    ({ item }: { item: HelpPage }) => {
      const Illustration = item.illustration;
      return (
        <View style={{ width: SCREEN_WIDTH }} className="justify-center pt-4">
          <Illustration />
        </View>
      );
    },
    [],
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-dark font-bold" style={{ fontSize: 16 }}>How It Works</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text className="text-text-muted font-bold" style={{ fontSize: 14 }}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Page dots */}
      <View className="flex-row justify-center py-2" style={{ gap: 6 }}>
        {HELP_PAGES.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => flatListRef.current?.scrollToIndex({ index: i, animated: true })}
            activeOpacity={0.7}
          >
            <View
              style={{
                width: currentPage === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentPage === i ? BRAND.colors.primary : BRAND.colors.border,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Illustration area */}
      <View style={{ height: 310 }}>
        <FlatList
          ref={flatListRef}
          data={HELP_PAGES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={renderPage}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          removeClippedSubviews={false}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
      </View>

      {/* Text content */}
      <View className="flex-1 px-6 pt-3">
        <Text className="font-bold uppercase tracking-widest mb-2" style={{ fontSize: 11, color: BRAND.colors.primary }}>
          {page.subtitle}
        </Text>
        <Text className="text-dark font-bold mb-2" style={{ fontSize: 24, lineHeight: 30 }}>
          {page.title}
        </Text>
        <Text className="text-text-secondary" style={{ fontSize: 14, lineHeight: 22 }}>
          {page.description}
        </Text>
      </View>

      {/* Bottom actions */}
      <View className="px-6 pb-6" style={{ gap: 10 }}>
        {page.action && (
          <TouchableOpacity
            onPress={() => router.push(page.action!.route as any)}
            className="bg-brand-600 py-4 items-center flex-row justify-center"
            style={{ borderRadius: 4 }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold" style={{ fontSize: 16 }}>{page.action.label}</Text>
          </TouchableOpacity>
        )}

        {!isLast ? (
          <TouchableOpacity
            onPress={goNext}
            className="border border-border py-4 items-center flex-row justify-center"
            style={{ borderRadius: 4 }}
            activeOpacity={0.7}
          >
            <Text className="text-dark font-bold" style={{ fontSize: 16 }}>Next</Text>
            <ChevronRight size={18} color={BRAND.colors.dark} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => router.back()}
            className="border border-border py-4 items-center"
            style={{ borderRadius: 4 }}
            activeOpacity={0.7}
          >
            <Text className="text-dark font-bold" style={{ fontSize: 16 }}>Back to Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
