import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  FolderOpen,
  DollarSign,
  Edit3,
  ChevronRight,
} from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { mockClients, mockProjects, mockEstimates, mockInvoices } from "@src/lib/mock-data";
import { formatCurrency, getInitials } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const client = mockClients.find((c) => c.id === id);
  if (!client) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <Text className="text-text-muted text-base">Client not found</Text>
      </SafeAreaView>
    );
  }

  // Mock linked data
  const clientProjects = mockProjects.filter((p) =>
    p.homeownerName.toLowerCase().includes(client.name.split(" ")[0].toLowerCase()),
  );
  const clientEstimates = mockEstimates.filter((e) =>
    e.client.toLowerCase().includes(client.name.split(" ")[0].toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-border px-5 pt-4 pb-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-dark flex-1">Client</Text>
          <TouchableOpacity activeOpacity={0.7} className="bg-gray-100 p-2" style={{ borderRadius: 0 }}>
            <Edit3 size={18} color={BRAND.colors.dark} />
          </TouchableOpacity>
        </View>

        {/* Client Card */}
        <View className="flex-row items-center">
          <View className="w-16 h-16 bg-dark items-center justify-center mr-4" style={{ borderRadius: 0 }}>
            <Text className="text-white font-bold text-xl">{getInitials(client.name)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-dark font-bold text-xl">{client.name}</Text>
            <Text className="text-text-secondary text-sm mt-0.5">
              {client.projectCount} {client.projectCount === 1 ? "project" : "projects"} — {formatCurrency(client.totalSpent)} total
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Quick Actions */}
        <View className="flex-row px-5 mt-4" style={{ gap: 8 }}>
          <TouchableOpacity
            className="flex-1 bg-white border border-border py-3 items-center flex-row justify-center"
            style={{ borderRadius: 0 }}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(`tel:${client.phone}`)}
          >
            <Phone size={16} color={BRAND.colors.primary} />
            <Text className="text-dark font-bold text-sm ml-2">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white border border-border py-3 items-center flex-row justify-center"
            style={{ borderRadius: 0 }}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(`mailto:${client.email}`)}
          >
            <Mail size={16} color={BRAND.colors.primary} />
            <Text className="text-dark font-bold text-sm ml-2">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white border border-border py-3 items-center flex-row justify-center"
            style={{ borderRadius: 0 }}
            activeOpacity={0.7}
          >
            <MessageCircle size={16} color={BRAND.colors.primary} />
            <Text className="text-dark font-bold text-sm ml-2">Message</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Details */}
        <View className="mx-5 mt-4 bg-white border border-border" style={{ borderRadius: 0 }}>
          <View className="px-4 pt-3 pb-2">
            <Text className="text-dark font-bold text-base">Contact</Text>
          </View>
          <View className="px-4 py-3 border-t border-border flex-row items-center">
            <Mail size={16} color={BRAND.colors.textMuted} />
            <Text className="text-dark text-sm ml-3">{client.email}</Text>
          </View>
          <View className="px-4 py-3 border-t border-border flex-row items-center">
            <Phone size={16} color={BRAND.colors.textMuted} />
            <Text className="text-dark text-sm ml-3">{client.phone}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-5 mt-4" style={{ gap: 8 }}>
          <View className="flex-1 bg-white border border-border p-4" style={{ borderRadius: 0 }}>
            <FolderOpen size={18} color={BRAND.colors.primary} />
            <Text className="text-2xl font-bold text-dark mt-2">{client.projectCount}</Text>
            <Text className="text-text-muted text-xs mt-0.5">Projects</Text>
          </View>
          <View className="flex-1 bg-white border border-border p-4" style={{ borderRadius: 0 }}>
            <DollarSign size={18} color={BRAND.colors.primary} />
            <Text className="text-2xl font-bold text-dark mt-2">{formatCurrency(client.totalSpent)}</Text>
            <Text className="text-text-muted text-xs mt-0.5">Total Revenue</Text>
          </View>
        </View>

        {/* Projects */}
        {clientProjects.length > 0 && (
          <View className="mx-5 mt-4">
            <Text className="text-dark font-bold text-base mb-2">Projects</Text>
            {clientProjects.map((proj) => {
              const pct = proj.budget > 0 ? Math.round((proj.spent / proj.budget) * 100) : 0;
              return (
                <TouchableOpacity
                  key={proj.id}
                  className="bg-white border border-border p-4 mb-2 flex-row items-center"
                  style={{ borderRadius: 0 }}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/(contractor)/projects/${proj.id}` as any)}
                >
                  <View className="flex-1">
                    <Text className="text-dark font-bold text-sm">{proj.name}</Text>
                    <Text className="text-text-muted text-xs mt-0.5">
                      {formatCurrency(proj.spent)} / {formatCurrency(proj.budget)} — {pct}%
                    </Text>
                  </View>
                  <ChevronRight size={16} color={BRAND.colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Estimates */}
        {clientEstimates.length > 0 && (
          <View className="mx-5 mt-4">
            <Text className="text-dark font-bold text-base mb-2">Estimates</Text>
            {clientEstimates.map((est) => (
              <View
                key={est.id}
                className="bg-white border border-border p-4 mb-2 flex-row items-center"
                style={{ borderRadius: 0 }}
              >
                <View className="flex-1">
                  <Text className="text-dark font-bold text-sm">{est.title}</Text>
                  <Text className="text-text-muted text-xs mt-0.5 capitalize">{est.status}</Text>
                </View>
                <Text className="text-dark font-bold text-sm">{formatCurrency(est.total)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
