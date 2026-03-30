import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import {
  Home,
  Wrench,
  HardHat,
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Building2,
  FileText,
  ArrowRight,
  ArrowLeft,
} from "lucide-react-native";
import { useAuthStore } from "@src/stores/auth";
import { BRAND } from "@src/lib/constants";

type Role = "homeowner" | "contractor" | "subcontractor";

const TRADE_CATEGORIES = [
  "General Contracting",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Roofing",
  "Painting",
  "Flooring",
  "Remodeling",
  "Concrete",
  "Fencing",
  "Landscaping",
  "Drywall",
];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  icon: Icon,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  secureTextEntry?: boolean;
  icon?: any;
  autoCapitalize?: "none" | "sentences" | "words";
}) {
  return (
    <View className="mb-4">
      <Text className="text-text-secondary text-sm font-bold mb-1.5">
        {label}
      </Text>
      <View
        className="flex-row items-center bg-white border border-border"
        style={{ borderRadius: 0 }}
      >
        {Icon && (
          <View className="pl-3">
            <Icon size={16} color={BRAND.colors.textMuted} />
          </View>
        )}
        <TextInput
          className="flex-1 p-3 text-dark text-sm"
          style={{ borderRadius: 0 }}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={BRAND.colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const ROLES: { key: Role; icon: any; label: string; description: string }[] = [
  {
    key: "homeowner",
    icon: Home,
    label: "Homeowner",
    description: "Post jobs, compare bids, manage projects",
  },
  {
    key: "contractor",
    icon: Wrench,
    label: "Contractor",
    description: "Find work, send estimates, grow your business",
  },
  {
    key: "subcontractor",
    icon: HardHat,
    label: "SubContractor",
    description: "Get assigned work, track tasks, log hours",
  },
];

export default function SignupScreen() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);

  // Step 2 -- Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Step 3 -- Contractor Details
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);

  // Step 3 -- Subcontractor Details
  const [primaryTrade, setPrimaryTrade] = useState("");
  const [certifications, setCertifications] = useState("");
  const [worksWithGC, setWorksWithGC] = useState("");
  const [showTradePicker, setShowTradePicker] = useState(false);

  const { register, isLoading } = useAuthStore();

  const totalSteps =
    role === "contractor" || role === "subcontractor" ? 3 : 2;

  function toggleTrade(trade: string) {
    setSelectedTrades((prev) =>
      prev.includes(trade)
        ? prev.filter((t) => t !== trade)
        : [...prev, trade]
    );
  }

  function canProceed(): boolean {
    if (step === 1) return !!role;
    if (step === 2) return !!(name.trim() && email.trim() && password.trim());
    return true;
  }

  async function handleSignup() {
    if (!role || !name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    try {
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        location: location.trim() || undefined,
      });
    } catch (err) {
      Alert.alert(
        "Registration Failed",
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  function next() {
    if (step === 1 && role === "homeowner") setStep(2);
    else if (step < totalSteps) setStep(step + 1);
    else handleSignup();
  }

  function getStepTitle(): string {
    if (step === 1) return "Join FairTradeWorker";
    if (step === 2) return "Create Your Account";
    if (role === "contractor") return "Your Business";
    if (role === "subcontractor") return "Your Trade";
    return "";
  }

  function getStepSubtitle(): string {
    if (step === 1) return "The fair way to find and hire contractors";
    if (step === 2) return "Set up your login credentials";
    if (role === "contractor")
      return "Tell us about your contracting business";
    if (role === "subcontractor")
      return "Tell us about your trade experience";
    return "";
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="bg-dark px-6 pt-16 pb-8">
          <View className="flex-row items-center mb-6">
            <View
              className="w-12 h-12 bg-brand-600 items-center justify-center"
              style={{ borderRadius: 0 }}
            >
              <Text className="text-white text-lg font-bold">FTW</Text>
            </View>
          </View>
          <Text className="text-white text-2xl font-bold">
            {getStepTitle()}
          </Text>
          <Text className="text-white/50 text-sm mt-1">
            {getStepSubtitle()}
          </Text>

          {/* Progress bar */}
          <View className="flex-row mt-6" style={{ gap: 4 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                className="flex-1 h-1"
                style={{
                  backgroundColor:
                    i < step
                      ? BRAND.colors.primary
                      : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </View>
          <Text className="text-white/40 text-xs mt-2">
            Step {step} of {totalSteps}
          </Text>
        </View>

        <View className="px-6 pt-6 pb-8">
          {/* Step 1: Role */}
          {step === 1 && (
            <View>
              <Text className="text-dark font-bold text-lg mb-4">
                I am a...
              </Text>
              {ROLES.map((r) => {
                const active = role === r.key;
                const Icon = r.icon;
                return (
                  <TouchableOpacity
                    key={r.key}
                    onPress={() => setRole(r.key)}
                    className={`border-2 p-5 mb-3 flex-row items-center ${
                      active
                        ? "border-brand-600 bg-brand-50"
                        : "border-border bg-white"
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <View
                      className={`w-12 h-12 items-center justify-center mr-4 ${
                        active ? "bg-brand-600" : "bg-gray-100"
                      }`}
                      style={{ borderRadius: 0 }}
                    >
                      <Icon
                        size={22}
                        color={active ? "#FFFFFF" : BRAND.colors.dark}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-dark">
                        {r.label}
                      </Text>
                      <Text className="text-text-secondary text-sm mt-0.5">
                        {r.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Step 2: Account */}
          {step === 2 && (
            <View>
              <Field
                label="Full Name *"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                icon={User}
                autoCapitalize="words"
              />
              <Field
                label="Email *"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                icon={Mail}
                autoCapitalize="none"
              />
              <Field
                label="Password *"
                value={password}
                onChangeText={setPassword}
                placeholder="Min 8 characters"
                secureTextEntry
                icon={Lock}
              />
              <Field
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                placeholder="512-555-0100"
                keyboardType="phone-pad"
                icon={Phone}
              />
              <Field
                label="Location"
                value={location}
                onChangeText={setLocation}
                placeholder="City, State"
                icon={MapPin}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* Step 3: Contractor Details */}
          {step === 3 && role === "contractor" && (
            <View>
              <Field
                label="Company Name"
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Your business name"
                icon={Building2}
                autoCapitalize="words"
              />
              <Field
                label="License Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
                placeholder="e.g. R21909"
                icon={FileText}
              />
              <Field
                label="Years in Business"
                value={yearsExperience}
                onChangeText={setYearsExperience}
                placeholder="e.g. 12"
                keyboardType="numeric"
              />

              <Text className="text-text-secondary text-sm font-bold mb-2">
                Trades (select all that apply)
              </Text>
              <View
                className="flex-row flex-wrap mb-4"
                style={{ gap: 8 }}
              >
                {TRADE_CATEGORIES.map((trade) => {
                  const active = selectedTrades.includes(trade);
                  return (
                    <TouchableOpacity
                      key={trade}
                      onPress={() => toggleTrade(trade)}
                      className={`px-3 py-2 border ${
                        active
                          ? "bg-brand-600 border-brand-600"
                          : "bg-white border-border"
                      }`}
                      style={{ borderRadius: 0 }}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          active ? "text-white" : "text-dark"
                        }`}
                      >
                        {trade}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Step 3: Subcontractor Details */}
          {step === 3 && role === "subcontractor" && (
            <View>
              {/* Primary Trade Picker */}
              <View className="mb-4">
                <Text className="text-text-secondary text-sm font-bold mb-1.5">
                  Primary Trade *
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTradePicker(!showTradePicker)}
                  className="flex-row items-center justify-between bg-white border border-border p-3"
                  style={{ borderRadius: 0 }}
                >
                  <Text
                    className={
                      primaryTrade ? "text-dark text-sm" : "text-text-muted text-sm"
                    }
                  >
                    {primaryTrade || "Select your primary trade"}
                  </Text>
                  <ArrowRight
                    size={14}
                    color={BRAND.colors.textMuted}
                    style={{
                      transform: [
                        { rotate: showTradePicker ? "90deg" : "0deg" },
                      ],
                    }}
                  />
                </TouchableOpacity>
                {showTradePicker && (
                  <View
                    className="border border-t-0 border-border bg-white"
                    style={{ borderRadius: 0 }}
                  >
                    {TRADE_CATEGORIES.map((trade) => (
                      <TouchableOpacity
                        key={trade}
                        onPress={() => {
                          setPrimaryTrade(trade);
                          setShowTradePicker(false);
                        }}
                        className={`px-3 py-2.5 border-b border-border ${
                          primaryTrade === trade ? "bg-brand-50" : ""
                        }`}
                        style={{ borderRadius: 0 }}
                      >
                        <Text
                          className={`text-sm ${
                            primaryTrade === trade
                              ? "text-brand-600 font-bold"
                              : "text-dark"
                          }`}
                        >
                          {trade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <Field
                label="Years of Experience"
                value={yearsExperience}
                onChangeText={setYearsExperience}
                placeholder="e.g. 8"
                keyboardType="numeric"
              />
              <Field
                label="Certifications"
                value={certifications}
                onChangeText={setCertifications}
                placeholder="e.g. Journeyman Electrician, OSHA 30"
                icon={FileText}
                autoCapitalize="words"
              />
              <Field
                label="I work with (General Contractor)"
                value={worksWithGC}
                onChangeText={setWorksWithGC}
                placeholder="e.g. Johnson & Sons Construction"
                icon={Building2}
                autoCapitalize="words"
              />
            </View>
          )}

          {/* Navigation */}
          <View className="flex-row mt-4" style={{ gap: 12 }}>
            {step > 1 && (
              <TouchableOpacity
                onPress={() => setStep(step - 1)}
                className="flex-row items-center justify-center border border-border py-3.5 px-6"
                style={{ borderRadius: 0 }}
                activeOpacity={0.7}
              >
                <ArrowLeft size={18} color={BRAND.colors.dark} />
                <Text className="text-dark font-bold text-base ml-2">
                  Back
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={next}
              disabled={!canProceed() || isLoading}
              className={`flex-1 flex-row items-center justify-center py-3.5 ${
                canProceed() ? "bg-brand-600" : "bg-border"
              }`}
              style={{ borderRadius: 0 }}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text
                    className={`font-bold text-base ${
                      canProceed() ? "text-white" : "text-text-muted"
                    }`}
                  >
                    {step === totalSteps ? "Create Account" : "Continue"}
                  </Text>
                  {step < totalSteps && (
                    <ArrowRight
                      size={18}
                      color={
                        canProceed() ? "#FFFFFF" : BRAND.colors.textMuted
                      }
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-text-secondary">
              Already have an account?{" "}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-brand-600 font-bold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
