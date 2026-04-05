import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  FileText,
  FolderOpen,
  Receipt,
  Users,
  Star,
  Bell,
  Settings,
  Award,
  ChevronRight,
  Briefcase,
  TrendingUp,
  DollarSign,
  Shield,
  MapPin,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { getInitials } from "@src/lib/utils";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { contractorStats } from "@src/lib/mock-data";

const MENU_SECTIONS = [
  {
    title: "Work",
    items: [
      { label: "Estimates", icon: FileText, route: "/(contractor)/estimates" },
      { label: "Projects", icon: FolderOpen, route: "/(contractor)/projects" },
      { label: "Invoices", icon: Receipt, route: "/(contractor)/invoices" },
      { label: "Clients", icon: Users, route: "/(contractor)/clients" },
    ],
  },
  {
    title: "Reputation",
    items: [
      { label: "FairRecord", icon: Award, route: "/(contractor)/records", accent: true },
      { label: "Reviews", icon: Star, route: "/(contractor)/reviews" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", icon: Bell, route: "/(contractor)/notifications" },
      { label: "Settings", icon: Settings, route: "/(contractor)/settings" },
    ],
  },
] as const;

export default function ContractorProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initials = user ? getInitials(user.name) : "?";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Header */}
        <View className="bg-white border border-border mx-4 mt-4 p-5">
          <View className="flex-row items-center">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" }}
              style={{ width: 80, height: 80, borderRadius: 40, marginRight: 16 }}
              contentFit="cover"
              recyclingKey="profile-avatar-full"
              transition={150}
            />
            <View className="flex-1">
              <Text className="font-bold text-dark" style={{ fontSize: 22 }}>{user?.name || "Contractor"}</Text>
              <Text className="text-text-muted mt-0.5" style={{ fontSize: 14 }}>{user?.email}</Text>
              <View className="flex-row items-center mt-1.5">
                <Shield size={12} color={BRAND.colors.primary} />
                <Text className="text-brand-600 font-bold ml-1" style={{ fontSize: 12 }}>VERIFIED CONTRACTOR</Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row mt-5 border-t border-border pt-4" style={{ gap: 8 }}>
            <View className="flex-1 bg-surface items-center py-3">
              <Star size={14} color={BRAND.colors.primary} fill={BRAND.colors.primary} />
              <Text className="font-bold text-dark mt-1" style={{ fontSize: 24 }}>{contractorStats.avgRating}</Text>
              <Text className="text-text-muted uppercase tracking-wide mt-0.5" style={{ fontSize: 10 }}>Rating</Text>
            </View>
            <View className="flex-1 bg-surface items-center py-3">
              <Briefcase size={14} color={BRAND.colors.primary} />
              <Text className="font-bold text-dark mt-1" style={{ fontSize: 24 }}>{contractorStats.completedJobs}</Text>
              <Text className="text-text-muted uppercase tracking-wide mt-0.5" style={{ fontSize: 10 }}>Jobs Done</Text>
            </View>
            <View className="flex-1 bg-surface items-center py-3">
              <TrendingUp size={14} color={BRAND.colors.primary} />
              <Text className="font-bold text-dark mt-1" style={{ fontSize: 24 }}>{contractorStats.winRate}%</Text>
              <Text className="text-text-muted uppercase tracking-wide mt-0.5" style={{ fontSize: 10 }}>Win Rate</Text>
            </View>
          </View>

          {/* Revenue Bar */}
          <View className="flex-row items-center justify-between mt-3 bg-brand-600 px-4 py-3">
            <View className="flex-row items-center">
              <DollarSign size={18} color="#FFFFFF" />
              <Text className="text-white font-bold ml-1" style={{ fontSize: 13 }}>Monthly Revenue</Text>
            </View>
            <Text className="text-white font-bold" style={{ fontSize: 18 }}>{formatCurrency(contractorStats.monthlyRevenue)}</Text>
          </View>
        </View>

        {/* Quick Info */}
        <View className="flex-row mx-4 mt-3" style={{ gap: 8 }}>
          <View className="flex-1 bg-white border border-border p-3 flex-row items-center">
            <Briefcase size={16} color={BRAND.colors.textMuted} />
            <View className="ml-2">
              <Text className="font-bold text-dark" style={{ fontSize: 16 }}>{contractorStats.activeJobs}</Text>
              <Text className="text-text-muted" style={{ fontSize: 11 }}>Active Jobs</Text>
            </View>
          </View>
          <View className="flex-1 bg-white border border-border p-3 flex-row items-center">
            <FileText size={16} color={BRAND.colors.textMuted} />
            <View className="ml-2">
              <Text className="font-bold text-dark" style={{ fontSize: 16 }}>{contractorStats.pendingBids}</Text>
              <Text className="text-text-muted" style={{ fontSize: 11 }}>Pending Bids</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} className="mx-4 mt-4">
            <Text className="text-text-muted font-bold uppercase tracking-wide mb-2 ml-1" style={{ fontSize: 11 }}>{section.title}</Text>
            <View className="bg-white border border-border overflow-hidden">
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => router.push(item.route as any)}
                  className={`flex-row items-center px-4 py-3.5 ${
                    i < section.items.length - 1 ? "border-b border-border" : ""
                  }`}
                  activeOpacity={0.7}
                >
                  <item.icon size={20} color={"accent" in item && item.accent ? BRAND.colors.primary : BRAND.colors.textSecondary} />
                  <Text className="text-dark font-medium ml-3 flex-1" style={{ fontSize: 15 }}>{item.label}</Text>
                  <ChevronRight size={16} color={BRAND.colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
