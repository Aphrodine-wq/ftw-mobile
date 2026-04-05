import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Brain,
  Mic,
  FileText,
  BarChart3,
  Shield,
  Check,
  Calculator,
  Star,
  Crown,
  X,
  ChevronDown,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type BillingCycle = "monthly" | "annual";

const PLANS = [
  {
    id: "solo",
    name: "Solo",
    monthlyPrice: 29,
    annualPrice: 24,
    tagline: "Independent contractors",
    features: [
      "ConstructionAI estimates",
      "Call Agent for estimates",
      "FairPrice calculator",
      "Unlimited estimates",
      "PDF export",
      "Regional pricing data",
    ],
    highlighted: false,
  },
  {
    id: "team",
    name: "Team",
    monthlyPrice: 79,
    annualPrice: 66,
    tagline: "Crews & small companies",
    features: [
      "Everything in Solo",
      "Up to 5 team members",
      "Shared project dashboard",
      "Team activity feed",
      "Crew assignment tracking",
      "Advanced analytics",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 149,
    annualPrice: 124,
    tagline: "Large operations",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "API access",
      "White-label estimates",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    highlighted: false,
  },
];

const TOOLS = [
  { icon: Brain, label: "ConstructionAI", sub: "AI Estimation" },
  { icon: Mic, label: "Call Agent", sub: "Call for Estimates" },
  { icon: Calculator, label: "Calculator", sub: "Instant Pricing" },
  { icon: FileText, label: "PDF Export", sub: "Client-Ready" },
  { icon: BarChart3, label: "Analytics", sub: "Performance" },
  { icon: Shield, label: "FairRecord", sub: "Verified Trust" },
];

const TESTIMONIALS = [
  { name: "Marcus J.", trade: "GC, Austin TX", quote: "Call Agent saved me 2 hours a day. I describe the job on-site and send the estimate before I leave." },
  { name: "Sarah L.", trade: "Electrician, Dallas TX", quote: "The AI gets within 5% of my manual bids. Win rate went from 40% to 68% in two months." },
  { name: "David R.", trade: "Plumber, Houston TX", quote: "Team plan paid for itself the first week. My crew finally stays on the same page." },
];

const CARD_WIDTH = SCREEN_WIDTH - 48;

export default function ProScreen() {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingCycle>("annual");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const setBillingMonthly = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBilling("monthly");
  }, []);

  const setBillingAnnual = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBilling("annual");
  }, []);

  const onTestimonialScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
    setActiveTestimonial(idx);
  }, []);

  const toggleFaq = useCallback((idx: number) => {
    setExpandedFaq((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Minimal Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Crown size={18} color={BRAND.colors.primary} />
          <Text className="text-dark font-bold ml-1.5" style={{ fontSize: 16 }}>PRO</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        <View className="px-6 pt-4 pb-8">
          <Text className="text-dark font-bold" style={{ fontSize: 34, lineHeight: 40 }}>
            The tools your{"\n"}competition{"\n"}doesn't have.
          </Text>
          <Text className="text-text-muted mt-3" style={{ fontSize: 16, lineHeight: 24 }}>
            AI estimation. Call-in estimates. Analytics. Everything a contractor needs to win more and waste less.
          </Text>
        </View>

        {/* Tools Grid */}
        <View
          className="flex-row flex-wrap justify-center px-4 mb-8"
          style={{ gap: 10 }}
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <View key={tool.label} className="bg-white border border-border p-3 items-center" style={{ width: (SCREEN_WIDTH - 52) / 3 }}>
                <View className="w-12 h-12 bg-brand-50 items-center justify-center mb-2">
                  <Icon size={22} color={BRAND.colors.primary} />
                </View>
                <Text className="text-dark font-bold text-center" style={{ fontSize: 12 }}>{tool.label}</Text>
                <Text className="text-text-muted text-center mt-0.5" style={{ fontSize: 10 }}>{tool.sub}</Text>
              </View>
            );
          })}
        </View>

        {/* Billing Toggle */}
        <View className="px-6 mb-5">
          <Text className="text-dark font-bold mb-4" style={{ fontSize: 22 }}>Pick your plan</Text>
          <View className="flex-row bg-surface p-1">
            <Pressable
              onPress={setBillingMonthly}
              className={`flex-1 py-3 items-center ${billing === "monthly" ? "bg-white" : ""}`}
              style={billing === "monthly" ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 } : undefined}
            >
              <Text className={`font-bold ${billing === "monthly" ? "text-dark" : "text-text-muted"}`} style={{ fontSize: 14 }}>Monthly</Text>
            </Pressable>
            <Pressable
              onPress={setBillingAnnual}
              className={`flex-1 py-3 items-center flex-row justify-center ${billing === "annual" ? "bg-white" : ""}`}
              style={billing === "annual" ? { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 } : undefined}
            >
              <Text className={`font-bold ${billing === "annual" ? "text-dark" : "text-text-muted"}`} style={{ fontSize: 14 }}>Annual</Text>
              <View className="bg-brand-600 ml-2 px-1.5 py-0.5">
                <Text className="text-white font-bold" style={{ fontSize: 9 }}>-17%</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Plans */}
        <View className="px-6" style={{ gap: 16 }}>
          {PLANS.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            const monthly = billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            const savings = billing === "annual" ? (plan.monthlyPrice - plan.annualPrice) * 12 : 0;

            return (
              <View key={plan.id} className={`border-2 ${plan.highlighted ? "border-brand-600" : "border-border"}`}>
                {plan.highlighted && (
                  <View className="bg-brand-600 py-2 items-center">
                    <Text className="text-white font-bold uppercase tracking-wider" style={{ fontSize: 11 }}>Most Popular</Text>
                  </View>
                )}

                <View className="p-5">
                  {/* Plan name + price */}
                  <View className="flex-row items-start justify-between mb-1">
                    <View>
                      <Text className="text-dark font-bold" style={{ fontSize: 22 }}>{plan.name}</Text>
                      <Text className="text-text-muted" style={{ fontSize: 13 }}>{plan.tagline}</Text>
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-end">
                        <Text className="text-dark font-bold" style={{ fontSize: 32 }}>${price}</Text>
                        <Text className="text-text-muted mb-1 ml-0.5" style={{ fontSize: 14 }}>/mo</Text>
                      </View>
                      {savings > 0 && (
                        <Text className="text-brand-600 font-bold" style={{ fontSize: 12 }}>Save ${savings}/yr</Text>
                      )}
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="h-px bg-border my-4" />

                  {/* Features */}
                  {plan.features.map((feat) => (
                    <View key={feat} className="flex-row items-center mb-3">
                      <View className="w-5 h-5 bg-brand-50 items-center justify-center mr-3">
                        <Check size={12} color={BRAND.colors.primary} strokeWidth={3} />
                      </View>
                      <Text className="text-dark" style={{ fontSize: 14 }}>{feat}</Text>
                    </View>
                  ))}

                  {/* CTA */}
                  <TouchableOpacity
                    className={`py-4 items-center mt-3 ${plan.highlighted ? "bg-brand-600" : "border-2 border-border"}`}
                    activeOpacity={0.8}
                  >
                    <Text className={`font-bold ${plan.highlighted ? "text-white" : "text-dark"}`} style={{ fontSize: 16 }}>
                      {plan.id === "enterprise" ? "Contact Sales" : "Start Free Trial"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Testimonials */}
        <View className="mt-10 mb-2">
          <Text className="text-dark font-bold px-6 mb-4" style={{ fontSize: 22 }}>From the field</Text>
          <FlatList
            data={TESTIMONIALS}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onTestimonialScroll}
            scrollEventThrottle={32}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item: t }) => (
              <View className="bg-surface p-5" style={{ width: CARD_WIDTH }}>
                <View className="flex-row mb-3">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={16} color={BRAND.colors.primary} fill={BRAND.colors.primary} style={{ marginRight: 2 }} />
                  ))}
                </View>
                <Text className="text-dark" style={{ fontSize: 15, lineHeight: 22 }}>"{t.quote}"</Text>
                <View className="h-px bg-border my-4" />
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-brand-50 items-center justify-center mr-3">
                    <Text className="text-brand-600 font-bold" style={{ fontSize: 16 }}>{t.name[0]}</Text>
                  </View>
                  <View>
                    <Text className="text-dark font-bold" style={{ fontSize: 14 }}>{t.name}</Text>
                    <Text className="text-text-muted" style={{ fontSize: 12 }}>{t.trade}</Text>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.name}
          />
          {/* Dots */}
          <View className="flex-row items-center justify-center mt-4" style={{ gap: 6 }}>
            {TESTIMONIALS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeTestimonial ? 20 : 6,
                  height: 6,
                  backgroundColor: i === activeTestimonial ? BRAND.colors.primary : BRAND.colors.border,
                }}
              />
            ))}
          </View>
        </View>

        {/* What's Free */}
        <View className="mx-6 mt-8 bg-surface p-5">
          <Text className="text-dark font-bold mb-1" style={{ fontSize: 16 }}>Already free for everyone</Text>
          <Text className="text-text-muted mb-4" style={{ fontSize: 13 }}>You don't need Pro to use FairTradeWorker.</Text>
          {["Browse & bid on jobs", "Direct messaging", "Escrow payments", "Manual estimates"].map((feat) => (
            <View key={feat} className="flex-row items-center mb-2">
              <Check size={14} color={BRAND.colors.textMuted} />
              <Text className="text-text-secondary ml-2" style={{ fontSize: 13 }}>{feat}</Text>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View className="px-6 mt-8">
          <Text className="text-dark font-bold mb-4" style={{ fontSize: 22 }}>Questions</Text>
          {[
            { q: "Can I try before I buy?", a: "Every Pro plan includes a 14-day free trial. No card required. Cancel anytime." },
            { q: "What if I cancel?", a: "You keep everything. All estimates, PDFs, client data, and FairRecords stay in your account." },
            { q: "Can I switch plans?", a: "Upgrade or downgrade anytime. We prorate the difference if you switch mid-cycle." },
            { q: "Is my data secure?", a: "All data is encrypted at rest and in transit. We never sell your information. Your client data is yours." },
          ].map((faq, i) => (
            <Pressable
              key={faq.q}
              onPress={() => toggleFaq(i)}
              className={`bg-white border border-border mb-2 ${expandedFaq === i ? "" : ""}`}
            >
              <View className="flex-row items-center justify-between p-4">
                <Text className="text-dark font-bold flex-1 mr-3" style={{ fontSize: 14 }}>{faq.q}</Text>
                <ChevronDown
                  size={18}
                  color={BRAND.colors.textMuted}
                  style={{ transform: [{ rotate: expandedFaq === i ? "180deg" : "0deg" }] }}
                />
              </View>
              {expandedFaq === i && (
                <View className="px-4 pb-4">
                  <Text className="text-text-muted" style={{ fontSize: 13, lineHeight: 20 }}>{faq.a}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Final CTA */}
        <View className="mx-6 mt-8">
          <View className="bg-brand-50 border-2 border-brand-600 p-6">
            <Text className="text-dark font-bold text-center" style={{ fontSize: 22 }}>Ready to win more?</Text>
            <Text className="text-text-muted text-center mt-2 mb-5" style={{ fontSize: 14 }}>14 days free. No card required.</Text>
            <TouchableOpacity className="bg-brand-600 py-4 items-center" activeOpacity={0.8}>
              <Text className="text-white font-bold" style={{ fontSize: 17 }}>Start Your Free Trial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
