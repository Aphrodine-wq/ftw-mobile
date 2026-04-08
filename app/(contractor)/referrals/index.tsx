import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Gift,
  Users,
  Home,
  Copy,
  Share2,
  Send,
  DollarSign,
  Trophy,
  Star,
  ChevronRight,
  Hammer,
  Clock,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { BRAND } from "@src/lib/constants";
import { useToast } from "@src/components/ui/toast";

const REFERRAL_CODE = "MARCUS-FTW";
const REFERRAL_LINK = "https://fairtradeworker.com/join?ref=MARCUS-FTW";

// Mock referral data
const CONTRACTOR_REFERRALS = [
  { id: "r1", name: "Jake Wilson", trade: "Electrician", status: "active", reward: "+1 wk Pro" },
  { id: "r2", name: "Carlos Ramirez", trade: "Plumbing", status: "active", reward: "+1 wk Pro" },
  { id: "r3", name: "Tony Blake", trade: "Drywall", status: "pending", reward: "" },
];

const HOMEOWNER_REFERRALS = [
  { id: "h1", name: "Sarah Mitchell", status: "posted_job", reward: "Priority bid" },
  { id: "h2", name: "David Chen", status: "signed_up", reward: "" },
];

const REWARD_TIERS = [
  { count: 3, label: "3 Referrals", reward: "1 Month FTW Pro Free", icon: Star, unlocked: false },
  { count: 5, label: "5 Referrals", reward: "2 Months FTW Pro Free", icon: DollarSign, unlocked: false },
  { count: 10, label: "10 Referrals", reward: "Founding Contractor Badge + 3 Months Pro", icon: Trophy, unlocked: false },
  { count: 25, label: "25 Referrals", reward: "6 Months FTW Pro + Priority Job Feed", icon: Gift, unlocked: false },
];

export default function ReferralsScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<"contractors" | "homeowners">("contractors");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteType, setInviteType] = useState<"contractor" | "homeowner">("contractor");

  const proWeeksEarned = CONTRACTOR_REFERRALS.filter((r) => r.status === "active").length;
  const totalActive = CONTRACTOR_REFERRALS.filter((r) => r.status === "active").length +
    HOMEOWNER_REFERRALS.filter((r) => r.status === "posted_job").length;
  const totalReferrals = CONTRACTOR_REFERRALS.length + HOMEOWNER_REFERRALS.length;

  const copyCode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toast("success", "Copied", "Referral code copied to clipboard");
  }, [toast]);

  const shareLink = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Share.share({
      message: `Join FairTradeWorker — the fair way to find and hire contractors. No lead fees. Use my code ${REFERRAL_CODE} to sign up: ${REFERRAL_LINK}`,
    });
  }, []);

  const sendInvite = useCallback(() => {
    if (!inviteEmail.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    toast("success", "Invite Sent", `Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
  }, [inviteEmail, toast]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border bg-white">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-dark font-bold" style={{ fontSize: 18 }}>Referrals</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero Stats */}
        <View className="mx-4 mt-4 bg-white border border-border p-5">
          <Text className="text-dark font-bold mb-4" style={{ fontSize: 22 }}>Build the market. Get rewarded.</Text>
          <Text className="text-text-secondary mb-5" style={{ fontSize: 14, lineHeight: 22 }}>
            Every contractor, sub, or homeowner you bring in makes the platform more valuable — and puts money back in your pocket.
          </Text>

          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1 bg-surface p-4 items-center" style={{ borderRadius: 4 }}>
              <Text className="font-bold" style={{ fontSize: 28, color: BRAND.colors.primary }}>{totalReferrals}</Text>
              <Text className="text-text-muted text-xs font-bold mt-1">Total Referred</Text>
            </View>
            <View className="flex-1 bg-surface p-4 items-center" style={{ borderRadius: 4 }}>
              <Text className="font-bold" style={{ fontSize: 28, color: "#059669" }}>{totalActive}</Text>
              <Text className="text-text-muted text-xs font-bold mt-1">Active</Text>
            </View>
            <View className="flex-1 bg-surface p-4 items-center" style={{ borderRadius: 4 }}>
              <Text className="font-bold" style={{ fontSize: 28, color: BRAND.colors.dark }}>{proWeeksEarned}wk</Text>
              <Text className="text-text-muted text-xs font-bold mt-1">Pro Earned</Text>
            </View>
          </View>
        </View>

        {/* Reward Structure */}
        <View className="mx-4 mt-4">
          <Text className="text-dark font-bold mb-3" style={{ fontSize: 17 }}>How It Works</Text>

          <View className="bg-white border border-border" style={{ borderRadius: 4 }}>
            {/* Contractor/Sub Rewards */}
            <View className="p-4 border-b border-border">
              <View className="flex-row items-center mb-2">
                <Hammer size={16} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-2" style={{ fontSize: 15 }}>Invite a Contractor or Sub</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Check size={12} color="#059669" />
                <Text className="text-text-secondary text-sm ml-2">They sign up and complete their profile</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Check size={12} color="#059669" />
                <Text className="text-text-secondary text-sm ml-2">You get <Text className="text-dark font-bold">1 free week of FTW Pro</Text></Text>
              </View>
              <View className="flex-row items-center">
                <Check size={12} color="#059669" />
                <Text className="text-text-secondary text-sm ml-2">They get <Text className="text-dark font-bold">1 free week of FTW Pro</Text></Text>
              </View>
            </View>

            {/* Homeowner Rewards */}
            <View className="p-4">
              <View className="flex-row items-center mb-2">
                <Home size={16} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-2" style={{ fontSize: 15 }}>Invite a Homeowner</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Check size={12} color="#059669" />
                <Text className="text-text-secondary text-sm ml-2">They post their first job</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <Check size={12} color="#059669" />
                <Text className="text-text-secondary text-sm ml-2">You get <Text className="text-dark font-bold">priority bid placement on their job</Text></Text>
              </View>
              <View className="flex-row items-center">
                <Check size={12} color="#059669" />
                <Text className="text-text-secondary text-sm ml-2">They get <Text className="text-dark font-bold">first project fee waived</Text></Text>
              </View>
            </View>
          </View>
        </View>

        {/* Milestone Rewards */}
        <View className="mx-4 mt-4">
          <Text className="text-dark font-bold mb-3" style={{ fontSize: 17 }}>Milestone Rewards</Text>
          <View style={{ gap: 8 }}>
            {REWARD_TIERS.map((tier) => {
              const progress = Math.min(totalReferrals / tier.count, 1);
              const unlocked = totalReferrals >= tier.count;
              const Icon = tier.icon;
              return (
                <View key={tier.count} className={`bg-white border p-4 flex-row items-center ${unlocked ? "border-green-300" : "border-border"}`} style={{ borderRadius: 4 }}>
                  <View
                    className="w-10 h-10 items-center justify-center mr-3"
                    style={{ borderRadius: 4, backgroundColor: unlocked ? "#059669" : BRAND.colors.bgSoft }}
                  >
                    {unlocked ? (
                      <Check size={20} color="#FFFFFF" />
                    ) : (
                      <Icon size={18} color={BRAND.colors.textMuted} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold ${unlocked ? "text-dark" : "text-text-secondary"}`} style={{ fontSize: 14 }}>{tier.label}</Text>
                    <Text className="text-text-muted text-xs mt-0.5">{tier.reward}</Text>
                  </View>
                  {!unlocked && (
                    <View className="items-end">
                      <Text className="text-text-muted font-bold" style={{ fontSize: 11 }}>{totalReferrals}/{tier.count}</Text>
                      <View className="w-16 h-1.5 bg-gray-100 mt-1" style={{ borderRadius: 99 }}>
                        <View className="h-1.5 bg-brand-600" style={{ width: `${progress * 100}%`, borderRadius: 99 }} />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Your Code + Share */}
        <View className="mx-4 mt-4 bg-white border border-border p-5">
          <Text className="text-dark font-bold mb-3" style={{ fontSize: 17 }}>Your Referral Code</Text>

          <View className="flex-row items-center bg-surface border border-border p-4 mb-4" style={{ borderRadius: 4 }}>
            <Text className="flex-1 text-dark font-bold tracking-widest" style={{ fontSize: 20 }}>{REFERRAL_CODE}</Text>
            <TouchableOpacity onPress={copyCode} activeOpacity={0.7}>
              <Copy size={20} color={BRAND.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={shareLink}
              className="bg-brand-600 py-3.5 flex-row items-center justify-center"
              style={{ borderRadius: 4 }}
              activeOpacity={0.8}
            >
              <Share2 size={18} color="#FFFFFF" />
              <Text className="text-white font-bold ml-2" style={{ fontSize: 15 }}>Share Invite Link</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Send Direct Invite */}
        <View className="mx-4 mt-4 bg-white border border-border p-5">
          <Text className="text-dark font-bold mb-3" style={{ fontSize: 17 }}>Send a Direct Invite</Text>

          {/* Type toggle */}
          <View className="flex-row mb-3" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setInviteType("contractor")}
              className={`flex-1 py-2.5 items-center border ${inviteType === "contractor" ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
              style={{ borderRadius: 4 }}
              activeOpacity={0.7}
            >
              <Text className={`font-bold text-sm ${inviteType === "contractor" ? "text-white" : "text-dark"}`}>Contractor / Sub</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setInviteType("homeowner")}
              className={`flex-1 py-2.5 items-center border ${inviteType === "homeowner" ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
              style={{ borderRadius: 4 }}
              activeOpacity={0.7}
            >
              <Text className={`font-bold text-sm ${inviteType === "homeowner" ? "text-white" : "text-dark"}`}>Homeowner</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="flex-1 flex-row items-center bg-surface border border-border px-3 py-3" style={{ borderRadius: 4 }}>
              <Send size={16} color={BRAND.colors.textMuted} />
              <TextInput
                className="flex-1 ml-2 text-dark text-sm"
                placeholder={inviteType === "contractor" ? "contractor@email.com" : "homeowner@email.com"}
                placeholderTextColor={BRAND.colors.textMuted}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              onPress={sendInvite}
              className={`py-3 px-5 ${inviteEmail.trim() ? "bg-brand-600" : "bg-border"}`}
              style={{ borderRadius: 4 }}
              activeOpacity={0.7}
            >
              <Text className={`font-bold text-sm ${inviteEmail.trim() ? "text-white" : "text-text-muted"}`}>Send</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-text-muted text-xs mt-2">
            {inviteType === "contractor"
              ? "They'll get an invite to join as a contractor or sub with a free week of Pro."
              : "They'll get an invite to post their first job with no platform fee."}
          </Text>
        </View>

        {/* Referral History */}
        <View className="mx-4 mt-4">
          <Text className="text-dark font-bold mb-3" style={{ fontSize: 17 }}>Your Referrals</Text>

          {/* Tab toggle */}
          <View className="flex-row mb-3" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setTab("contractors")}
              className={`flex-1 py-2.5 items-center border ${tab === "contractors" ? "bg-dark border-dark" : "bg-white border-border"}`}
              style={{ borderRadius: 4 }}
              activeOpacity={0.7}
            >
              <Text className={`font-bold text-sm ${tab === "contractors" ? "text-white" : "text-dark"}`}>
                Contractors ({CONTRACTOR_REFERRALS.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTab("homeowners")}
              className={`flex-1 py-2.5 items-center border ${tab === "homeowners" ? "bg-dark border-dark" : "bg-white border-border"}`}
              style={{ borderRadius: 4 }}
              activeOpacity={0.7}
            >
              <Text className={`font-bold text-sm ${tab === "homeowners" ? "text-white" : "text-dark"}`}>
                Homeowners ({HOMEOWNER_REFERRALS.length})
              </Text>
            </TouchableOpacity>
          </View>

          {tab === "contractors" ? (
            <View style={{ gap: 8 }}>
              {CONTRACTOR_REFERRALS.map((ref) => (
                <View key={ref.id} className="bg-white border border-border p-4 flex-row items-center" style={{ borderRadius: 4 }}>
                  <View className="w-10 h-10 items-center justify-center mr-3" style={{ borderRadius: 20, backgroundColor: BRAND.colors.bgSoft }}>
                    <Users size={18} color={BRAND.colors.textMuted} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{ref.name}</Text>
                    <Text className="text-text-muted text-xs mt-0.5">{ref.trade}</Text>
                  </View>
                  <View className="items-end">
                    {ref.status === "active" ? (
                      <>
                        <View className="bg-green-50 px-2 py-0.5" style={{ borderRadius: 2 }}>
                          <Text className="text-green-700 font-bold" style={{ fontSize: 10 }}>ACTIVE</Text>
                        </View>
                        <Text className="text-dark font-bold text-sm mt-1">{ref.reward}</Text>
                      </>
                    ) : (
                      <View className="flex-row items-center">
                        <Clock size={12} color={BRAND.colors.textMuted} />
                        <Text className="text-text-muted font-bold ml-1" style={{ fontSize: 11 }}>Pending</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {HOMEOWNER_REFERRALS.map((ref) => (
                <View key={ref.id} className="bg-white border border-border p-4 flex-row items-center" style={{ borderRadius: 4 }}>
                  <View className="w-10 h-10 items-center justify-center mr-3" style={{ borderRadius: 20, backgroundColor: BRAND.colors.bgSoft }}>
                    <Home size={18} color={BRAND.colors.textMuted} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{ref.name}</Text>
                    <Text className="text-text-muted text-xs mt-0.5">
                      {ref.status === "posted_job" ? "Posted a job" : "Signed up"}
                    </Text>
                  </View>
                  <View className="items-end">
                    {ref.status === "posted_job" ? (
                      <>
                        <View className="bg-green-50 px-2 py-0.5" style={{ borderRadius: 2 }}>
                          <Text className="text-green-700 font-bold" style={{ fontSize: 10 }}>EARNED</Text>
                        </View>
                        <Text className="text-dark font-bold text-sm mt-1">{ref.reward}</Text>
                      </>
                    ) : (
                      <View className="flex-row items-center">
                        <Clock size={12} color={BRAND.colors.textMuted} />
                        <Text className="text-text-muted font-bold ml-1" style={{ fontSize: 11 }}>Awaiting job</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
