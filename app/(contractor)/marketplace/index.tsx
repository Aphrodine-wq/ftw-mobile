import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Users,
  Home,
  Hammer,
  ArrowDown,
  Share2,
  TrendingUp,
  Shield,
  DollarSign,
  Zap,
  Target,
  Gift,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MarketplaceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-dark font-bold" style={{ fontSize: 16 }}>FairTradeWorker</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Section 1 — The Problem */}
        <View className="px-6 pt-8 pb-10 items-center">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-3 text-center" style={{ fontSize: 11 }}>The Challenge</Text>
          <Text className="text-dark font-bold text-center" style={{ fontSize: 32, lineHeight: 38 }}>
            Homeowners won't come{"\n"}until you're here.
          </Text>
          <Text className="text-text-secondary mt-4 text-center" style={{ fontSize: 16, lineHeight: 24 }}>
            A marketplace needs both sides. Homeowners need to see real contractors before they'll post a job. Contractors need to see real jobs before they'll sign up.
          </Text>
          <Text className="text-dark font-bold mt-4 text-center" style={{ fontSize: 16, lineHeight: 24 }}>
            Someone has to go first. We're asking you.
          </Text>
        </View>

        {/* Section 2 — The Flywheel */}
        <View className="bg-surface py-8">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-5 px-6 text-center" style={{ fontSize: 11 }}>The Flywheel</Text>

          {/* Step 1 */}
          <View className="px-6 mb-2">
            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-brand-50 items-center justify-center mr-3">
                  <Hammer size={22} color={BRAND.colors.primary} />
                </View>
                <View>
                  <Text className="text-text-muted font-bold uppercase tracking-wider" style={{ fontSize: 9 }}>Step 1 — Now</Text>
                  <Text className="text-dark font-bold" style={{ fontSize: 18 }}>You join. You invite.</Text>
                </View>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
                Every contractor and sub you bring raises the trust level of the entire platform. Homeowners see a deep bench of verified pros — and that's when they start posting.
              </Text>
            </View>
          </View>

          <View className="items-center py-1">
            <ArrowDown size={20} color={BRAND.colors.border} />
          </View>

          {/* Step 2 */}
          <View className="px-6 mb-2">
            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-brand-50 items-center justify-center mr-3">
                  <Home size={22} color={BRAND.colors.primary} />
                </View>
                <View>
                  <Text className="text-text-muted font-bold uppercase tracking-wider" style={{ fontSize: 9 }}>Step 2 — Coming</Text>
                  <Text className="text-dark font-bold" style={{ fontSize: 18 }}>Homeowners post jobs.</Text>
                </View>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
                Real homeowners, real budgets, real projects in your area. They come because the contractor roster is deep enough to give them real options.
              </Text>
            </View>
          </View>

          <View className="items-center py-1">
            <ArrowDown size={20} color={BRAND.colors.border} />
          </View>

          {/* Step 3 */}
          <View className="px-6">
            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-brand-50 items-center justify-center mr-3">
                  <DollarSign size={22} color={BRAND.colors.primary} />
                </View>
                <View>
                  <Text className="text-text-muted font-bold uppercase tracking-wider" style={{ fontSize: 9 }}>Step 3 — The Payoff</Text>
                  <Text className="text-dark font-bold" style={{ fontSize: 18 }}>You bid. You win. You build.</Text>
                </View>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 21 }}>
                Fair pricing, escrow-protected payments, milestone-based releases. No chasing invoices. No lowball race to the bottom. FairTrade means fair for everyone.
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3 — Progress */}
        <View className="px-6 py-8">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-2 text-center" style={{ fontSize: 11 }}>Your Area</Text>
          <Text className="text-dark font-bold mb-5 text-center" style={{ fontSize: 24 }}>We're getting there.</Text>

          <View className="bg-white border border-border p-5 mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Hammer size={16} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-2" style={{ fontSize: 15 }}>Contractors</Text>
              </View>
              <Text className="text-dark font-bold" style={{ fontSize: 15 }}>3<Text className="text-text-muted font-normal"> / 50</Text></Text>
            </View>
            <View className="bg-surface h-4 w-full">
              <View className="h-4 bg-brand-600" style={{ width: "6%" }} />
            </View>
          </View>

          <View className="bg-white border border-border p-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Users size={16} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-2" style={{ fontSize: 15 }}>Subcontractors</Text>
              </View>
              <Text className="text-dark font-bold" style={{ fontSize: 15 }}>5<Text className="text-text-muted font-normal"> / 150</Text></Text>
            </View>
            <View className="bg-surface h-4 w-full">
              <View className="h-4 bg-brand-600" style={{ width: "3%" }} />
            </View>
          </View>

          <Text className="text-text-muted text-center mt-4" style={{ fontSize: 13 }}>
            Your job feed goes live when both targets are hit.
          </Text>
        </View>

        {/* Section 4 — What's in it for you */}
        <View className="bg-surface py-8">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-2 px-6 text-center" style={{ fontSize: 11 }}>Why Bother</Text>
          <Text className="text-dark font-bold mb-5 px-6 text-center" style={{ fontSize: 24 }}>Because it pays off.</Text>

          <View className="px-6" style={{ gap: 2 }}>
            <View className="bg-white border border-border p-5 flex-row">
              <View className="w-12 h-12 bg-brand-50 items-center justify-center mr-4">
                <Target size={24} color={BRAND.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>First movers get first dibs</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 20 }}>
                  Early contractors show up at the top of the feed. When homeowners start posting, you're the first name they see.
                </Text>
              </View>
            </View>

            <View className="bg-white border border-border p-5 flex-row">
              <View className="w-12 h-12 bg-brand-50 items-center justify-center mr-4">
                <Shield size={24} color={BRAND.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>You choose who's in</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 20 }}>
                  Invite the contractors and subs you respect. The quality of this market is literally in your hands right now.
                </Text>
              </View>
            </View>

            <View className="bg-white border border-border p-5 flex-row">
              <View className="w-12 h-12 bg-brand-50 items-center justify-center mr-4">
                <Zap size={24} color={BRAND.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>Your subs, on the platform</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 20 }}>
                  When the subs you already trust are here, you can subcontract through FTW — escrow protection, milestone tracking, no more chasing payments.
                </Text>
              </View>
            </View>

            <View className="bg-white border border-border p-5 flex-row">
              <View className="w-12 h-12 bg-brand-50 items-center justify-center mr-4">
                <Gift size={24} color={BRAND.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>Referral rewards coming</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 20 }}>
                  We're building a referral program that rewards contractors who helped build the market. Details coming soon — but get your invites in now.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 5 — CTA */}
        <View className="px-6 py-10">
          <Text className="text-dark font-bold text-center" style={{ fontSize: 26, lineHeight: 32 }}>
            This market is yours{"\n"}to build.
          </Text>
          <Text className="text-text-muted text-center mt-3 mb-6" style={{ fontSize: 15, lineHeight: 22 }}>
            Every invite gets us closer. Every contractor who joins makes the platform more valuable for everyone — including you.
          </Text>

          <TouchableOpacity className="bg-brand-600 py-4 items-center mb-3" activeOpacity={0.8}>
            <Text className="text-white font-bold" style={{ fontSize: 17 }}>Invite a Contractor or Sub</Text>
          </TouchableOpacity>

          <TouchableOpacity className="border-2 border-border py-4 flex-row items-center justify-center" activeOpacity={0.7}>
            <Share2 size={18} color={BRAND.colors.textPrimary} />
            <Text className="text-dark font-bold ml-2" style={{ fontSize: 17 }}>Share Your Invite Link</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
