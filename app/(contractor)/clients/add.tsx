import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Home,
  Calendar,
  Ruler,
  Tag,
  DollarSign,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";

const PROPERTY_TYPES = ["Single Family", "Multi-Family", "Condo/Townhome", "Commercial", "Other"];
const REFERRAL_SOURCES = ["Repeat Client", "Referral", "FairTradeWorker", "Google", "Social Media", "Yard Sign", "Other"];
const CONTACT_METHODS = ["Phone", "Text", "Email", "Any"];
const CLIENT_TAGS = ["Residential", "Commercial", "Investor", "Property Manager", "New Construction", "Insurance"];
const BUDGET_RANGES = ["Under $5K", "$5K - $15K", "$15K - $50K", "$50K - $100K", "$100K+"];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  multiline?: boolean;
  icon?: any;
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-sm font-bold mb-1.5">{label}</Text>
      <View className="flex-row items-center bg-white border border-border" style={{ borderRadius: 0 }}>
        {Icon && (
          <View className="pl-3">
            <Icon size={16} color={BRAND.colors.textMuted} />
          </View>
        )}
        <TextInput
          className={`flex-1 p-3 text-dark text-sm ${multiline ? "min-h-[80px]" : ""}`}
          style={{ borderRadius: 0, textAlignVertical: multiline ? "top" : "center" }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={BRAND.colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

function Picker({
  label,
  value,
  options,
  open,
  setOpen,
  onSelect,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-sm font-bold mb-1.5">{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        className="bg-white border border-border p-3 flex-row items-center justify-between"
        style={{ borderRadius: 0 }}
        activeOpacity={0.7}
      >
        <Text className={`text-sm ${value ? "text-dark" : "text-text-muted"}`}>
          {value || placeholder || "Select..."}
        </Text>
        {open ? <ChevronUp size={18} color={BRAND.colors.textSecondary} /> : <ChevronDown size={18} color={BRAND.colors.textSecondary} />}
      </TouchableOpacity>
      {open && (
        <View className="bg-white border border-border border-t-0" style={{ borderRadius: 0 }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => { onSelect(opt); setOpen(false); }}
              className={`p-3 border-b border-border ${opt === value ? "bg-brand-50" : ""}`}
              activeOpacity={0.7}
            >
              <Text className={`text-sm ${opt === value ? "text-brand-600 font-bold" : "text-dark"}`}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function AddClientScreen() {
  const router = useRouter();

  // Contact
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [preferredContact, setPreferredContact] = useState("Any");
  const [showContactPicker, setShowContactPicker] = useState(false);

  // Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // Property
  const [propertyType, setPropertyType] = useState("");
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [yearBuilt, setYearBuilt] = useState("");
  const [sqft, setSqft] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [lotSize, setLotSize] = useState("");

  // Business
  const [company, setCompany] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [showReferralPicker, setShowReferralPicker] = useState(false);
  const [budgetRange, setBudgetRange] = useState("");
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Notes & Options
  const [notes, setNotes] = useState("");
  const [sendWelcome, setSendWelcome] = useState(true);
  const [addToMailingList, setAddToMailingList] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Required", "First and last name are required.");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      Alert.alert("Required", "At least a phone number or email is required.");
      return;
    }
    Alert.alert("Client Added", `${firstName} ${lastName} has been added.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-row items-center px-5 pt-4 pb-3 border-b border-border bg-white">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">Add Client</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Contact Information ── */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center mb-3">
            <User size={18} color={BRAND.colors.dark} />
            <Text className="text-dark font-bold text-lg ml-2">Contact Information</Text>
          </View>
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1">
              <Field label="First Name *" value={firstName} onChangeText={setFirstName} placeholder="First" />
            </View>
            <View className="flex-1">
              <Field label="Last Name *" value={lastName} onChangeText={setLastName} placeholder="Last" />
            </View>
          </View>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="client@email.com" keyboardType="email-address" icon={Mail} />
          <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="512-555-0100" keyboardType="phone-pad" icon={Phone} />
          <Field label="Alt Phone" value={altPhone} onChangeText={setAltPhone} placeholder="Optional" keyboardType="phone-pad" icon={Phone} />
          <Picker
            label="Preferred Contact Method"
            value={preferredContact}
            options={CONTACT_METHODS}
            open={showContactPicker}
            setOpen={setShowContactPicker}
            onSelect={setPreferredContact}
          />
        </View>

        {/* ── Property Address ── */}
        <View className="px-5 mt-2">
          <View className="flex-row items-center mb-3">
            <MapPin size={18} color={BRAND.colors.dark} />
            <Text className="text-dark font-bold text-lg ml-2">Property Address</Text>
          </View>
          <Field label="Street Address" value={address} onChangeText={setAddress} placeholder="1234 Main St" />
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1">
              <Field label="City" value={city} onChangeText={setCity} placeholder="Austin" />
            </View>
            <View style={{ width: 80 }}>
              <Field label="State" value={state} onChangeText={setState} placeholder="TX" />
            </View>
            <View style={{ width: 100 }}>
              <Field label="ZIP" value={zip} onChangeText={setZip} placeholder="78745" keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* ── Property Details ── */}
        <View className="px-5 mt-2">
          <View className="flex-row items-center mb-3">
            <Home size={18} color={BRAND.colors.dark} />
            <Text className="text-dark font-bold text-lg ml-2">Property Details</Text>
          </View>
          <Picker
            label="Property Type"
            value={propertyType}
            options={PROPERTY_TYPES}
            open={showPropertyPicker}
            setOpen={setShowPropertyPicker}
            onSelect={setPropertyType}
            placeholder="Select type..."
          />
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1">
              <Field label="Year Built" value={yearBuilt} onChangeText={setYearBuilt} placeholder="2005" keyboardType="numeric" icon={Calendar} />
            </View>
            <View className="flex-1">
              <Field label="Sq Footage" value={sqft} onChangeText={setSqft} placeholder="2,400" keyboardType="numeric" icon={Ruler} />
            </View>
          </View>
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1">
              <Field label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} placeholder="4" keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Field label="Bathrooms" value={bathrooms} onChangeText={setBathrooms} placeholder="2.5" keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Field label="Lot Size (ac)" value={lotSize} onChangeText={setLotSize} placeholder="0.25" keyboardType="numeric" />
            </View>
          </View>
        </View>

        {/* ── Business Details ── */}
        <View className="px-5 mt-2">
          <View className="flex-row items-center mb-3">
            <Building2 size={18} color={BRAND.colors.dark} />
            <Text className="text-dark font-bold text-lg ml-2">Business Details</Text>
          </View>
          <Field label="Company (optional)" value={company} onChangeText={setCompany} placeholder="Business or property mgmt" />
          <Picker
            label="How did they find you?"
            value={referralSource}
            options={REFERRAL_SOURCES}
            open={showReferralPicker}
            setOpen={setShowReferralPicker}
            onSelect={setReferralSource}
            placeholder="Select source..."
          />
          <Picker
            label="Expected Budget Range"
            value={budgetRange}
            options={BUDGET_RANGES}
            open={showBudgetPicker}
            setOpen={setShowBudgetPicker}
            onSelect={setBudgetRange}
            placeholder="Select range..."
          />

          {/* Tags */}
          <Text className="text-text-secondary text-sm font-bold mb-2">Client Tags</Text>
          <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
            {CLIENT_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  className={`px-3 py-2 border ${active ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                  style={{ borderRadius: 0 }}
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-bold ${active ? "text-white" : "text-dark"}`}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Notes ── */}
        <View className="px-5 mt-2">
          <View className="flex-row items-center mb-3">
            <StickyNote size={18} color={BRAND.colors.dark} />
            <Text className="text-dark font-bold text-lg ml-2">Notes</Text>
          </View>
          <Field label="Internal Notes" value={notes} onChangeText={setNotes} placeholder="Anything you want to remember about this client — project interests, scheduling preferences, special requests..." multiline />
        </View>

        {/* ── Options ── */}
        <View className="px-5 mt-2">
          <View className="bg-white border border-border p-4 mb-3 flex-row items-center justify-between" style={{ borderRadius: 0 }}>
            <View className="flex-1 mr-3">
              <Text className="text-dark font-bold text-sm">Send Welcome Email</Text>
              <Text className="text-text-muted text-xs mt-0.5">Introduce yourself and your services</Text>
            </View>
            <Switch value={sendWelcome} onValueChange={setSendWelcome} trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
          </View>
          <View className="bg-white border border-border p-4 mb-3 flex-row items-center justify-between" style={{ borderRadius: 0 }}>
            <View className="flex-1 mr-3">
              <Text className="text-dark font-bold text-sm">Add to Mailing List</Text>
              <Text className="text-text-muted text-xs mt-0.5">Include in seasonal promotions and updates</Text>
            </View>
            <Switch value={addToMailingList} onValueChange={setAddToMailingList} trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
          </View>
        </View>

        {/* ── Save ── */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={handleSave}
            className="bg-brand-600 py-4 items-center"
            style={{ borderRadius: 0 }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Add Client</Text>
          </TouchableOpacity>
          <Text className="text-text-muted text-xs text-center mt-2">* Required fields</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
