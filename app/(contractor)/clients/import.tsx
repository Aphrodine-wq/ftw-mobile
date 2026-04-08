import { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Check,
  CheckSquare,
  Square,
  Users,
  Phone,
  Mail,
} from "lucide-react-native";
import * as Contacts from "expo-contacts";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";
import { getInitials } from "@src/lib/utils";

interface DeviceContact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function ImportContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped: DeviceContact[] = data
        .filter((c) => c.name && (c.phoneNumbers?.length || c.emails?.length))
        .map((c) => ({
          id: c.id!,
          name: c.name!,
          phone: c.phoneNumbers?.[0]?.number || "",
          email: c.emails?.[0]?.email || "",
        }));

      setContacts(mapped);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [contacts, search]);

  const toggle = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  }, [filtered, selected.size]);

  const handleImport = useCallback(() => {
    const count = selected.size;
    if (count === 0) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Import Clients",
      `Add ${count} contact${count > 1 ? "s" : ""} as clients?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            // TODO: Wire to actual client creation API
            Alert.alert(
              "Imported",
              `${count} client${count > 1 ? "s" : ""} added successfully.`,
              [{ text: "OK", onPress: () => router.back() }],
            );
          },
        },
      ],
    );
  }, [selected.size, router]);

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  const renderContact = useCallback(
    ({ item }: { item: DeviceContact }) => {
      const isSelected = selected.has(item.id);
      return (
        <TouchableOpacity
          onPress={() => toggle(item.id)}
          className={`mx-4 mb-2 flex-row items-center p-4 border ${isSelected ? "border-brand-600 bg-brand-50" : "border-border bg-white"}`}
          style={{ borderRadius: 4 }}
          activeOpacity={0.7}
        >
          {isSelected ? (
            <CheckSquare size={22} color={BRAND.colors.primary} />
          ) : (
            <Square size={22} color={BRAND.colors.border} />
          )}

          <View className="w-10 h-10 items-center justify-center ml-3 mr-3" style={{ borderRadius: 20, backgroundColor: isSelected ? BRAND.colors.primary : BRAND.colors.bgSoft }}>
            <Text className="font-bold" style={{ fontSize: 13, color: isSelected ? "#FFFFFF" : BRAND.colors.textMuted }}>
              {getInitials(item.name)}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{item.name}</Text>
            <View className="flex-row items-center mt-0.5">
              {item.phone ? (
                <View className="flex-row items-center mr-4">
                  <Phone size={10} color={BRAND.colors.textMuted} />
                  <Text className="text-text-muted text-xs ml-1">{item.phone}</Text>
                </View>
              ) : null}
              {item.email ? (
                <View className="flex-row items-center">
                  <Mail size={10} color={BRAND.colors.textMuted} />
                  <Text className="text-text-muted text-xs ml-1" numberOfLines={1}>{item.email}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [selected, toggle],
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3 border-b border-border bg-white">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-dark font-bold" style={{ fontSize: 20 }}>Import from Contacts</Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {contacts.length} contacts with phone or email
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BRAND.colors.primary} />
          <Text className="text-text-muted mt-3">Loading contacts...</Text>
        </View>
      ) : permissionDenied ? (
        <View className="flex-1 items-center justify-center px-8">
          <Users size={48} color={BRAND.colors.textMuted} />
          <Text className="text-dark font-bold text-lg text-center mt-4">Contact Access Needed</Text>
          <Text className="text-text-secondary text-center mt-2" style={{ lineHeight: 22 }}>
            Open Settings and allow FairTradeWorker to access your contacts to import clients.
          </Text>
        </View>
      ) : (
        <>
          {/* Search + Select All */}
          <View className="px-4 py-3 bg-white border-b border-border">
            <View className="flex-row items-center bg-surface border border-border px-3 py-2.5 mb-3" style={{ borderRadius: 4 }}>
              <Search size={16} color={BRAND.colors.textMuted} />
              <TextInput
                className="flex-1 ml-2 text-dark text-sm"
                placeholder="Search contacts..."
                placeholderTextColor={BRAND.colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity onPress={selectAll} className="flex-row items-center" activeOpacity={0.7}>
              {allSelected ? (
                <CheckSquare size={18} color={BRAND.colors.primary} />
              ) : (
                <Square size={18} color={BRAND.colors.textMuted} />
              )}
              <Text className="text-text-secondary font-bold text-sm ml-2">
                {allSelected ? "Deselect All" : "Select All"} ({filtered.length})
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderContact}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
            removeClippedSubviews
            initialNumToRender={20}
            maxToRenderPerBatch={15}
            windowSize={10}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-text-muted">No contacts match your search</Text>
              </View>
            }
          />

          {/* Bottom Import Bar */}
          {selected.size > 0 && (
            <View className="absolute bottom-0 left-0 right-0 px-5 py-4 border-t border-border bg-white">
              <TouchableOpacity
                onPress={handleImport}
                className="bg-brand-600 py-4 items-center flex-row justify-center"
                style={{ borderRadius: 4 }}
                activeOpacity={0.8}
              >
                <Check size={20} color="#FFFFFF" />
                <Text className="text-white font-bold text-base ml-2">
                  Import {selected.size} Client{selected.size > 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
