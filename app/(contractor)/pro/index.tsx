import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Brain,
  Mic,
  FileText,
  BarChart3,
  Users,
  Shield,
  Check,
  Zap,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";

const PLANS = [
  {
    id: "solo",
    name: "Solo",
    price: "$29",
    period: "/mo",
    description: "For independent contractors",
    features: [
      "AI-powered estimates",
      "Smart job matching",
      "Voice estimate agent",
      "Unlimited estimates",
      "PDF export",
      "Regional pricing data",
    ],
    popular: false,
  },
  {
    id: "team",
    name: "Team",
    price: "$79",
    period: "/mo",
    description: "For crews and small companies",
    features: [
      "Everything in Solo",
      "Up to 5 team members",
      "Shared project dashboard",
      "Team activity feed",
      "Crew assignment tracking",
      "Advanced analytics",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$149",
    period: "/mo",
    description: "For large operations",
    features: [
      "Everything in Team",
      "Unlimited team members",
      "API access",
      "White-label estimates",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    popular: false,
  },
];

const PRO_FEATURES = [
  { icon: Brain, title: "ConstructionAI", desc: "Full AI estimation with CSI breakdowns, line items, and regional pricing" },
  { icon: Mic, title: "Voice Estimator", desc: "Describe a job on-site and get a complete estimate hands-free" },
  { icon: FileText, title: "PDF Estimates", desc: "Professional branded estimates ready to send to clients" },
  { icon: BarChart3, title: "Analytics", desc: "Win rate tracking, revenue forecasting, and job insights" },
  { icon: Users, title: "Smart Matching", desc: "Get matched to jobs that fit your skills and service area" },
  { icon: Shield, title: "FairRecord Verified", desc: "Verified project records that build trust with new clients" },
];

export default function ProScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="bg-dark px-5 pt-4 pb-8">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">FairTradeWorker Pro</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Zap size={24} color={BRAND.colors.primary} />
            <Text className="text-white text-2xl font-bold ml-2">Upgrade Your Business</Text>
          </View>
          <Text className="text-white/60 text-base leading-5">
            AI estimation, voice tools, analytics, and everything you need to win more jobs and grow faster.
          </Text>
        </View>

        {/* Features Grid */}
        <View className="px-5 mt-6 mb-6">
          <Text className="text-dark font-bold text-lg mb-4">What you get with Pro</Text>
          <View style={{ gap: 10 }}>
            {PRO_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <View key={feat.title} className="bg-white border border-border p-4 flex-row" style={{ borderRadius: 0 }}>
                  <View className="w-10 h-10 bg-dark items-center justify-center mr-3" style={{ borderRadius: 0 }}>
                    <Icon size={20} color={BRAND.colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-dark font-bold text-sm">{feat.title}</Text>
                    <Text className="text-text-secondary text-xs mt-0.5 leading-4">{feat.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Pricing Plans */}
        <View className="px-5 mb-6">
          <Text className="text-dark font-bold text-lg mb-4">Choose your plan</Text>
          <View style={{ gap: 12 }}>
            {PLANS.map((plan) => (
              <View
                key={plan.id}
                className={`bg-white border-2 p-5 ${plan.popular ? "border-brand-600" : "border-border"}`}
                style={{ borderRadius: 0 }}
              >
                {plan.popular && (
                  <View className="bg-brand-600 self-start px-3 py-1 mb-3" style={{ borderRadius: 0 }}>
                    <Text className="text-white text-xs font-bold">MOST POPULAR</Text>
                  </View>
                )}
                <View className="flex-row items-end mb-1">
                  <Text className="text-dark text-3xl font-bold">{plan.price}</Text>
                  <Text className="text-text-muted text-sm mb-1">{plan.period}</Text>
                </View>
                <Text className="text-dark font-bold text-lg">{plan.name}</Text>
                <Text className="text-text-secondary text-sm mb-4">{plan.description}</Text>

                {plan.features.map((feat) => (
                  <View key={feat} className="flex-row items-center mb-2">
                    <Check size={16} color={BRAND.colors.primary} />
                    <Text className="text-dark text-sm ml-2">{feat}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  className={`py-3.5 items-center mt-4 ${plan.popular ? "bg-brand-600" : "bg-dark"}`}
                  style={{ borderRadius: 0 }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-base">
                    {plan.popular ? "Start Free Trial" : `Get ${plan.name}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View className="px-5 mb-6">
          <Text className="text-dark font-bold text-lg mb-4">Common Questions</Text>
          <View className="bg-white border border-border p-4 mb-2" style={{ borderRadius: 0 }}>
            <Text className="text-dark font-bold text-sm">Can I try before I buy?</Text>
            <Text className="text-text-secondary text-sm mt-1">Yes. Every Pro plan includes a 14-day free trial. Cancel anytime.</Text>
          </View>
          <View className="bg-white border border-border p-4 mb-2" style={{ borderRadius: 0 }}>
            <Text className="text-dark font-bold text-sm">What happens to my estimates if I cancel?</Text>
            <Text className="text-text-secondary text-sm mt-1">You keep everything. All saved estimates, PDFs, and client data stay in your account.</Text>
          </View>
          <View className="bg-white border border-border p-4 mb-2" style={{ borderRadius: 0 }}>
            <Text className="text-dark font-bold text-sm">Do I need Pro to use FairTradeWorker?</Text>
            <Text className="text-text-secondary text-sm mt-1">No. Job browsing, manual estimates, direct messaging, and escrow payments are all free.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
