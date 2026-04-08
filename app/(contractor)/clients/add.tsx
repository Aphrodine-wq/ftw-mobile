import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowRight,
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
  Check,
  Import,
} from "lucide-react-native";
import * as Contacts from "expo-contacts";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { BRAND } from "@src/lib/constants";

const PROPERTY_TYPES = ["Single Family", "Multi-Family", "Condo/Townhome", "Commercial", "Other"];
const REFERRAL_SOURCES = ["Repeat Client", "Referral", "FairTradeWorker", "Google", "Social Media", "Yard Sign", "Other"];
const CONTACT_METHODS = ["Phone", "Text", "Email", "Any"];
const CLIENT_TAGS = ["Residential", "Commercial", "Investor", "Property Manager", "New Construction", "Insurance"];
const BUDGET_RANGES = ["Under $5K", "$5K - $15K", "$15K - $50K", "$50K - $100K", "$100K+"];

const STEPS = [
  { key: "contact", label: "Contact", icon: User },
  { key: "address", label: "Address", icon: MapPin },
  { key: "property", label: "Property", icon: Home },
  { key: "business", label: "Business", icon: Building2 },
  { key: "notes", label: "Finish", icon: StickyNote },
] as const;

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
      <View className="flex-row items-center bg-white border border-border rounded" style={{ borderRadius: 4 }}>
        {Icon && (
          <View className="pl-3">
            <Icon size={16} color={BRAND.colors.textMuted} />
          </View>
        )}
        <TextInput
          className={`flex-1 p-3 text-dark text-sm ${multiline ? "min-h-[80px]" : ""}`}
          style={{ borderRadius: 4, textAlignVertical: multiline ? "top" : "center" }}
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
        className="bg-white border border-border rounded p-3 flex-row items-center justify-between"
        style={{ borderRadius: 4 }}
        activeOpacity={0.7}
      >
        <Text className={`text-sm ${value ? "text-dark" : "text-text-muted"}`}>
          {value || placeholder || "Select..."}
        </Text>
        {open ? <ChevronUp size={18} color={BRAND.colors.textSecondary} /> : <ChevronDown size={18} color={BRAND.colors.textSecondary} />}
      </TouchableOpacity>
      {open && (
        <View className="bg-white border border-border rounded border-t-0" style={{ borderRadius: 4 }}>
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
  const [step, setStep] = useState(0);

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

  async function importFromContact() {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Needed", "Allow contact access in Settings to import.");
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Addresses, Contacts.Fields.Company],
      sort: Contacts.SortTypes.FirstName,
    });
    if (data.length === 0) {
      Alert.alert("No Contacts", "No contacts found on this device.");
      return;
    }

    // Show picker with first 50 contacts that have a name
    const options = data.filter((c) => c.name).slice(0, 50);
    // Use Alert with buttons for quick pick (iOS ActionSheet would be ideal but limited)
    // For now, navigate to the import screen and come back
    // Actually, let's just pick the contact inline using expo-contacts presentContactPickerAsync
    // That API doesn't exist — use a simpler approach: pick first matching contact via search
    const names = options.slice(0, 8).map((c) => c.name!);
    Alert.alert(
      "Pick a Contact",
      "Select a contact to prefill, or use the full import screen for bulk import.",
      [
        ...names.map((name) => ({
          text: name,
          onPress: () => {
            const contact = options.find((c) => c.name === name);
            if (!contact) return;
            const parts = (contact.name || "").split(" ");
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
            if (contact.emails?.[0]) setEmail(contact.emails[0].email || "");
            if (contact.phoneNumbers?.[0]) setPhone(contact.phoneNumbers[0].number || "");
            if (contact.phoneNumbers?.[1]) setAltPhone(contact.phoneNumbers[1].number || "");
            if (contact.company) setCompany(contact.company);
            const addr = contact.addresses?.[0];
            if (addr) {
              setAddress(addr.street || "");
              setCity(addr.city || "");
              setState(addr.region || "");
              setZip(addr.postalCode || "");
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        })),
        { text: "Cancel", style: "cancel" },
      ],
    );
  }

  function canProceed(): boolean {
    if (step === 0) return !!(firstName.trim() && lastName.trim() && (phone.trim() || email.trim()));
    return true; // All other steps are optional
  }

  function next() {
    if (step < STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setStep(step + 1);
    }
  }

  function back() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      router.back();
    }
  }

  function handleSave() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Client Added", `${firstName} ${lastName} has been added.`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  }

  const isLast = step === STEPS.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3 border-b border-border bg-white">
        <TouchableOpacity onPress={back} activeOpacity={0.7} className="mr-3">
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-dark">Add Client</Text>
          <Text className="text-text-muted text-xs mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View className="flex-row px-5 py-3 bg-white border-b border-border" style={{ gap: 6 }}>
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => { if (i < step) setStep(i); }}
              activeOpacity={i < step ? 0.7 : 1}
              className="flex-1 items-center"
            >
              <View
                className="w-8 h-8 items-center justify-center mb-1"
                style={{
                  borderRadius: 4,
                  backgroundColor: done ? "#059669" : active ? BRAND.colors.primary : BRAND.colors.bgSoft,
                }}
              >
                {done ? (
                  <Check size={16} color="#FFFFFF" />
                ) : (
                  <s.icon size={14} color={active ? "#FFFFFF" : BRAND.colors.textMuted} />
                )}
              </View>
              <Text
                className="font-bold"
                style={{ fontSize: 9, color: active ? BRAND.colors.primary : done ? "#059669" : BRAND.colors.textMuted }}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Progress Bar */}
      <View className="h-1 bg-gray-100" style={{ borderRadius: 99 }}>
        <View
          className="h-1 bg-brand-600"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%`, borderRadius: 99 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 1: Contact */}
          {step === 0 && (
            <View className="px-5 mt-5">
              <Text className="text-dark font-bold text-lg mb-1">Who's the client?</Text>
              <Text className="text-text-muted text-sm mb-4">Name and at least one way to reach them.</Text>

              <TouchableOpacity
                onPress={importFromContact}
                className="flex-row items-center justify-center border border-border bg-white py-3 mb-5"
                style={{ borderRadius: 4 }}
                activeOpacity={0.7}
              >
                <Import size={18} color={BRAND.colors.dark} />
                <Text className="text-dark font-bold text-sm ml-2">Import from Contacts</Text>
              </TouchableOpacity>

              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Field label="First Name *" value={firstName} onChangeText={setFirstName} placeholder="First" />
                </View>
                <View className="flex-1">
                  <Field label="Last Name *" value={lastName} onChangeText={setLastName} placeholder="Last" />
                </View>
              </View>
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="client@email.com" keyboardType="email-address" icon={Mail} />
              <Field label="Phone *" value={phone} onChangeText={setPhone} placeholder="512-555-0100" keyboardType="phone-pad" icon={Phone} />
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
          )}

          {/* Step 2: Address */}
          {step === 1 && (
            <View className="px-5 mt-5">
              <Text className="text-dark font-bold text-lg mb-1">Where's the property?</Text>
              <Text className="text-text-muted text-sm mb-5">You can skip this and add it later.</Text>

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
          )}

          {/* Step 3: Property */}
          {step === 2 && (
            <View className="px-5 mt-5">
              <Text className="text-dark font-bold text-lg mb-1">Property details</Text>
              <Text className="text-text-muted text-sm mb-5">Helps ConstructionAI give better estimates.</Text>

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
          )}

          {/* Step 4: Business */}
          {step === 3 && (
            <View className="px-5 mt-5">
              <Text className="text-dark font-bold text-lg mb-1">Business details</Text>
              <Text className="text-text-muted text-sm mb-5">How you found them and what to expect.</Text>

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

              <Text className="text-text-secondary text-sm font-bold mb-2">Client Tags</Text>
              <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                {CLIENT_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      className={`px-3 py-2 border ${active ? "bg-brand-600 border-brand-600" : "bg-white border-border"}`}
                      style={{ borderRadius: 4 }}
                      activeOpacity={0.7}
                    >
                      <Text className={`text-xs font-bold ${active ? "text-white" : "text-dark"}`}>{tag}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 5: Notes & Finish */}
          {step === 4 && (
            <View className="px-5 mt-5">
              <Text className="text-dark font-bold text-lg mb-1">Almost done</Text>
              <Text className="text-text-muted text-sm mb-5">Add notes and set preferences.</Text>

              <Field label="Internal Notes" value={notes} onChangeText={setNotes} placeholder="Project interests, scheduling preferences, special requests..." multiline />

              <View className="bg-white border border-border rounded p-4 mb-3 flex-row items-center justify-between" style={{ borderRadius: 4 }}>
                <View className="flex-1 mr-3">
                  <Text className="text-dark font-bold text-sm">Send Welcome Email</Text>
                  <Text className="text-text-muted text-xs mt-0.5">Introduce yourself and your services</Text>
                </View>
                <Switch value={sendWelcome} onValueChange={setSendWelcome} trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
              </View>
              <View className="bg-white border border-border rounded p-4 mb-3 flex-row items-center justify-between" style={{ borderRadius: 4 }}>
                <View className="flex-1 mr-3">
                  <Text className="text-dark font-bold text-sm">Add to Mailing List</Text>
                  <Text className="text-text-muted text-xs mt-0.5">Include in seasonal promotions and updates</Text>
                </View>
                <Switch value={addToMailingList} onValueChange={setAddToMailingList} trackColor={{ false: BRAND.colors.border, true: BRAND.colors.primary }} />
              </View>

              {/* Summary */}
              <View className="bg-white border border-border rounded p-4 mt-2" style={{ borderRadius: 4 }}>
                <Text className="text-dark font-bold text-sm mb-2">Summary</Text>
                <Text className="text-text-secondary text-sm">{firstName} {lastName}</Text>
                {email ? <Text className="text-text-muted text-xs">{email}</Text> : null}
                {phone ? <Text className="text-text-muted text-xs">{phone}</Text> : null}
                {address ? <Text className="text-text-muted text-xs mt-1">{address}{city ? `, ${city}` : ""}{state ? `, ${state}` : ""} {zip}</Text> : null}
                {propertyType ? <Text className="text-text-muted text-xs mt-1">{propertyType}{sqft ? ` - ${sqft} sq ft` : ""}</Text> : null}
                {selectedTags.length > 0 ? <Text className="text-text-muted text-xs mt-1">{selectedTags.join(", ")}</Text> : null}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="px-5 py-4 border-t border-border bg-white">
          <View className="flex-row" style={{ gap: 12 }}>
            {step > 0 && (
              <TouchableOpacity
                onPress={back}
                className="flex-row items-center justify-center border border-border py-3.5 px-6"
                style={{ borderRadius: 4 }}
                activeOpacity={0.7}
              >
                <ArrowLeft size={18} color={BRAND.colors.dark} />
                <Text className="text-dark font-bold text-base ml-2">Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={isLast ? handleSave : next}
              disabled={!canProceed()}
              className={`flex-1 flex-row items-center justify-center py-3.5 ${canProceed() ? "bg-brand-600" : "bg-border"}`}
              style={{ borderRadius: 4 }}
              activeOpacity={0.7}
            >
              <Text className={`font-bold text-base ${canProceed() ? "text-white" : "text-text-muted"}`}>
                {isLast ? "Add Client" : "Continue"}
              </Text>
              {!isLast && canProceed() && <ArrowRight size={18} color="#FFFFFF" className="ml-2" />}
            </TouchableOpacity>
          </View>
          {step === 0 && <Text className="text-text-muted text-xs text-center mt-2">* Name and phone or email required</Text>}
          {step > 0 && !isLast && <Text className="text-text-muted text-xs text-center mt-2">Optional — skip if you don't have this yet</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
