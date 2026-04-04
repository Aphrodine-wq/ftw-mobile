import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Calculator as CalcIcon,
  ClipboardList,
  ChevronRight,
  Clock,
  MapPin,
  Lightbulb,
  User,
  Briefcase,
  ListOrdered,
  FileCheck,
  X,
  Check,
  Hash,
  Building2,
  Phone,
  Mail,
  Calendar,
  Shield,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { fetchEstimates } from "@src/api/data";
import {
  mockEstimates,
  type MockEstimate,
} from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { Badge } from "@src/components/ui/badge";
// ── Types ──────────────────────────────────────────────────────────────

type TabId = "my-estimates" | "new-estimate" | "calculator";
type EstimateStatus = MockEstimate["status"];

// ── Constants ──────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "my-estimates", label: "My Estimates" },
  { id: "new-estimate", label: "New Estimate" },
  { id: "calculator", label: "Calculator" },
];

const BASE_ESTIMATES: Record<
  string,
  {
    low: number;
    high: number;
    materials: number;
    labor: number;
    timelineWeeks: [number, number];
    tips: string[];
  }
> = {
  "General Contracting": {
    low: 3000,
    high: 8000,
    materials: 0.4,
    labor: 0.45,
    timelineWeeks: [2, 12],
    tips: [
      "Get 3+ bids",
      "Check license & insurance",
      "Define scope in writing",
    ],
  },
  Plumbing: {
    low: 2000,
    high: 6000,
    materials: 0.3,
    labor: 0.55,
    timelineWeeks: [1, 6],
    tips: [
      "Camera-inspect sewer lines first",
      "Ask about warranty on parts",
      "Get permit for re-pipes",
    ],
  },
  Electrical: {
    low: 1500,
    high: 5000,
    materials: 0.25,
    labor: 0.6,
    timelineWeeks: [1, 4],
    tips: [
      "Panel upgrades need permits",
      "Ask about arc-fault breakers",
      "Get load calculation",
    ],
  },
  HVAC: {
    low: 3000,
    high: 8000,
    materials: 0.4,
    labor: 0.45,
    timelineWeeks: [1, 5],
    tips: [
      "Get Manual J calculation",
      "Check SEER rating",
      "Ask about duct sealing",
    ],
  },
  Roofing: {
    low: 4000,
    high: 9000,
    materials: 0.45,
    labor: 0.4,
    timelineWeeks: [1, 3],
    tips: [
      "Check for decking rot",
      "Ask about ice & water shield",
      "Get ventilation assessment",
    ],
  },
  Painting: {
    low: 1500,
    high: 4000,
    materials: 0.2,
    labor: 0.65,
    timelineWeeks: [1, 3],
    tips: [
      "Prep is 60% of the job",
      "Ask about paint brand",
      "Specify number of coats",
    ],
  },
  Flooring: {
    low: 2000,
    high: 6000,
    materials: 0.45,
    labor: 0.4,
    timelineWeeks: [1, 4],
    tips: [
      "Check subfloor condition",
      "Acclimate materials 48hr",
      "Ask about transitions",
    ],
  },
  Remodeling: {
    low: 5000,
    high: 9000,
    materials: 0.4,
    labor: 0.45,
    timelineWeeks: [3, 16],
    tips: [
      "Design before demo",
      "Budget 15% contingency",
      "Get everything in writing",
    ],
  },
  Concrete: {
    low: 3000,
    high: 7000,
    materials: 0.35,
    labor: 0.5,
    timelineWeeks: [1, 4],
    tips: [
      "Check soil conditions",
      "Ask about rebar spacing",
      "Plan for cure time",
    ],
  },
  Fencing: {
    low: 1500,
    high: 4000,
    materials: 0.45,
    labor: 0.4,
    timelineWeeks: [1, 3],
    tips: [
      "Check property lines first",
      "Ask about post depth",
      "Consider gate placement",
    ],
  },
};

const SIZE_MULTIPLIERS: Record<string, number> = {
  Small: 1,
  Medium: 2.5,
  Large: 6,
  Major: 15,
};

function getRegionMultiplier(zip: string): { factor: number; label: string } {
  const prefix = parseInt(zip.substring(0, 3), 10);
  if (isNaN(prefix)) return { factor: 1.0, label: "National Average" };
  if (prefix >= 100 && prefix <= 119)
    return { factor: 1.3, label: "NYC Metro" };
  if (prefix >= 200 && prefix <= 219)
    return { factor: 1.15, label: "DC Metro" };
  if (prefix >= 300 && prefix <= 399)
    return { factor: 0.92, label: "Southeast" };
  if (prefix >= 600 && prefix <= 629)
    return { factor: 1.08, label: "Chicago Metro" };
  if (prefix >= 700 && prefix <= 799) return { factor: 0.88, label: "South" };
  if (prefix >= 900 && prefix <= 961)
    return { factor: 1.25, label: "California" };
  return { factor: 1.0, label: "National Average" };
}

// ── Helpers ────────────────────────────────────────────────────────────

function getStatusVariant(
  status: EstimateStatus,
): "neutral" | "default" | "success" | "danger" {
  switch (status) {
    case "draft":
      return "neutral";
    case "sent":
      return "default";
    case "accepted":
      return "success";
    case "declined":
      return "danger";
  }
}

function getStatusLabel(status: EstimateStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// ── Tab: My Estimates ──────────────────────────────────────────────────

function MyEstimatesTab() {
  const [estimates, setEstimates] = useState<MockEstimate[]>(mockEstimates);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchEstimates();
    setEstimates(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const totalEstimates = estimates.length;
  const pendingValue = estimates
    .filter((e) => e.status === "sent" || e.status === "draft")
    .reduce((sum, e) => sum + e.total, 0);
  const acceptedValue = estimates
    .filter((e) => e.status === "accepted")
    .reduce((sum, e) => sum + e.total, 0);

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Summary Stats */}
      <View
        className="flex-row mx-5 mt-4 bg-white border border-border rounded overflow-hidden"
        style={{ borderRadius: 4 }}
      >
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-2xl font-bold text-dark">{totalEstimates}</Text>
          <Text className="text-text-secondary text-sm mt-0.5">Total</Text>
        </View>
        <View className="flex-1 items-center py-4 border-r border-border">
          <Text className="text-2xl font-bold text-dark">
            {formatCurrency(pendingValue)}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">Pending</Text>
        </View>
        <View className="flex-1 items-center py-4">
          <Text className="text-2xl font-bold text-dark">
            {formatCurrency(acceptedValue)}
          </Text>
          <Text className="text-text-secondary text-sm mt-0.5">Accepted</Text>
        </View>
      </View>

      {/* Estimate list */}
      <View className="mt-4 pb-8">
        {estimates.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white border border-border rounded mx-5 mb-3 p-4 flex-row items-center"
            style={{ borderRadius: 4 }}
            activeOpacity={0.7}
          >
            <View
              className="w-10 h-10 bg-gray-100 items-center justify-center mr-3"
              style={{ borderRadius: 4 }}
            >
              <FileText size={20} color={BRAND.colors.textSecondary} />
            </View>
            <View className="flex-1">
              <Text className="text-dark font-semibold" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-text-secondary text-sm mt-0.5">
                {item.client}
              </Text>
            </View>
            <View className="items-end ml-3">
              <Text className="text-dark font-bold">
                {formatCurrency(item.total)}
              </Text>
              <View className="mt-1">
                <Badge
                  label={getStatusLabel(item.status)}
                  variant={getStatusVariant(item.status)}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {estimates.length === 0 && (
          <View className="items-center justify-center py-16 px-5">
            <FileText size={48} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-base mt-4">
              No estimates yet
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ── Tab: New Estimate (4-step form) ────────────────────────────────────

function NewEstimateTab() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Client", icon: User },
    { label: "Job Details", icon: Briefcase },
    { label: "Line Items", icon: ListOrdered },
    { label: "Terms", icon: FileCheck },
  ];

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("General Contracting");
  const [jobDescription, setJobDescription] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: "1", unit: "EA", unitCost: "", total: "" },
  ]);
  const [terms, setTerms] = useState(
    "Payment due within 30 days of invoice. 50% deposit required to begin work.",
  );
  const [validThrough, setValidThrough] = useState("30");

  const categories = Object.keys(BASE_ESTIMATES);

  function addLineItem() {
    setLineItems([
      ...lineItems,
      { description: "", quantity: "1", unit: "EA", unitCost: "", total: "" },
    ]);
  }

  function removeLineItem(idx: number) {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== idx));
  }

  function updateLineItem(
    idx: number,
    field: string,
    value: string,
  ) {
    const updated = [...lineItems];
    (updated[idx] as any)[field] = value;
    // Auto-calc total
    const qty = parseFloat(updated[idx].quantity) || 0;
    const cost = parseFloat(updated[idx].unitCost) || 0;
    updated[idx].total = (qty * cost).toFixed(0);
    setLineItems(updated);
  }

  const estimateTotal = lineItems.reduce(
    (s, li) => s + (parseFloat(li.total) || 0),
    0,
  );

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Live Estimate Preview */}
      <View className="mx-5 mt-3 mb-3">
        <LiveEstimatePreview
          clientName={clientName}
          clientEmail={clientEmail}
          clientPhone={clientPhone}
          jobTitle={jobTitle}
          jobCategory={jobCategory}
          jobDescription={jobDescription}
          lineItems={lineItems}
          estimateTotal={estimateTotal}
          terms={terms}
          validDays={validThrough}
        />
      </View>

      {/* Step indicator */}
      <View className="flex-row mx-5 mb-4">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setStep(i)}
              activeOpacity={0.7}
              className="flex-1 items-center"
            >
              <View
                className={`w-10 h-10 items-center justify-center border ${active ? "bg-brand-600 border-brand-600" : done ? "bg-green-600 border-green-600" : "bg-gray-100 border-border"}`}
                style={{ borderRadius: 4 }}
              >
                {done ? (
                  <Check size={18} color="#FFFFFF" />
                ) : (
                  <Icon
                    size={18}
                    color={active ? "#FFFFFF" : BRAND.colors.textMuted}
                  />
                )}
              </View>
              <Text
                className={`text-xs mt-1 ${active ? "text-dark font-semibold" : "text-text-muted"}`}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Step 0: Client */}
      {step === 0 && (
        <View className="mx-5">
          <Text className="text-dark font-bold text-lg mb-3">
            Client Information
          </Text>
          <FormField
            label="Client Name"
            value={clientName}
            onChangeText={setClientName}
            placeholder="e.g. Sarah Mitchell"
          />
          <FormField
            label="Email"
            value={clientEmail}
            onChangeText={setClientEmail}
            placeholder="client@email.com"
            keyboardType="email-address"
          />
          <FormField
            label="Phone"
            value={clientPhone}
            onChangeText={setClientPhone}
            placeholder="512-555-0100"
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            onPress={() => setStep(1)}
            activeOpacity={0.7}
            className="bg-brand-600 py-3 mt-4 items-center"
            style={{ borderRadius: 4 }}
          >
            <Text className="text-white font-semibold">
              Next: Job Details
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 1: Job Details */}
      {step === 1 && (
        <View className="mx-5">
          <Text className="text-dark font-bold text-lg mb-3">Job Details</Text>
          <FormField
            label="Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="e.g. Kitchen Remodel — Full Gut"
          />
          <Text className="text-text-secondary text-sm font-medium mb-1.5">
            Category
          </Text>
          <TouchableOpacity
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            activeOpacity={0.7}
            className="bg-white border border-border rounded p-3 mb-3 flex-row items-center justify-between"
            style={{ borderRadius: 4 }}
          >
            <Text className="text-dark">{jobCategory}</Text>
            {showCategoryPicker ? (
              <ChevronUp size={18} color={BRAND.colors.textSecondary} />
            ) : (
              <ChevronDown size={18} color={BRAND.colors.textSecondary} />
            )}
          </TouchableOpacity>
          {showCategoryPicker && (
            <View
              className="bg-white border border-border rounded mb-3"
              style={{ borderRadius: 4 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setJobCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                  activeOpacity={0.7}
                  className={`p-3 border-b border-border ${cat === jobCategory ? "bg-brand-50" : ""}`}
                >
                  <Text
                    className={`text-sm ${cat === jobCategory ? "text-brand-600 font-semibold" : "text-dark"}`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <FormField
            label="Description"
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Describe the scope of work..."
            multiline
          />
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={() => setStep(0)}
              activeOpacity={0.7}
              className="flex-1 border border-border py-3 mr-2 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-text-secondary font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep(2)}
              activeOpacity={0.7}
              className="flex-1 bg-brand-600 py-3 ml-2 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-white font-semibold">
                Next: Line Items
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 2: Line Items */}
      {step === 2 && (
        <View className="mx-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-dark font-bold text-lg">Line Items</Text>
            <TouchableOpacity onPress={addLineItem} activeOpacity={0.7}>
              <View
                className="flex-row items-center bg-brand-50 px-3 py-1.5"
                style={{ borderRadius: 4 }}
              >
                <Plus size={14} color={BRAND.colors.primary} />
                <Text
                  className="text-sm font-semibold ml-1"
                  style={{ color: BRAND.colors.primary }}
                >
                  Add
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {lineItems.map((li, idx) => (
            <View
              key={idx}
              className="bg-white border border-border rounded p-3 mb-3"
              style={{ borderRadius: 4 }}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-text-muted text-xs font-medium">
                  Item {idx + 1}
                </Text>
                {lineItems.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeLineItem(idx)}
                    activeOpacity={0.7}
                  >
                    <X size={16} color={BRAND.colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                className="border border-border p-2.5 text-dark text-sm mb-2"
                style={{ borderRadius: 4 }}
                placeholder="Description"
                placeholderTextColor={BRAND.colors.textMuted}
                value={li.description}
                onChangeText={(v) => updateLineItem(idx, "description", v)}
              />
              <View className="flex-row">
                <TextInput
                  className="flex-1 border border-border p-2.5 text-dark text-sm mr-1"
                  style={{ borderRadius: 4 }}
                  placeholder="Qty"
                  placeholderTextColor={BRAND.colors.textMuted}
                  keyboardType="numeric"
                  value={li.quantity}
                  onChangeText={(v) => updateLineItem(idx, "quantity", v)}
                />
                <TextInput
                  className="w-14 border border-border p-2.5 text-dark text-sm mr-1"
                  style={{ borderRadius: 4 }}
                  placeholder="Unit"
                  placeholderTextColor={BRAND.colors.textMuted}
                  value={li.unit}
                  onChangeText={(v) => updateLineItem(idx, "unit", v)}
                />
                <TextInput
                  className="flex-1 border border-border p-2.5 text-dark text-sm"
                  style={{ borderRadius: 4 }}
                  placeholder="Unit Cost"
                  placeholderTextColor={BRAND.colors.textMuted}
                  keyboardType="numeric"
                  value={li.unitCost}
                  onChangeText={(v) => updateLineItem(idx, "unitCost", v)}
                />
              </View>
              {li.total && parseFloat(li.total) > 0 ? (
                <Text className="text-dark font-semibold text-sm text-right mt-2">
                  {formatCurrency(parseFloat(li.total))}
                </Text>
              ) : null}
            </View>
          ))}
          <View
            className="bg-gray-50 border border-border p-3 flex-row items-center justify-between"
            style={{ borderRadius: 4 }}
          >
            <Text className="text-dark font-bold">Estimate Total</Text>
            <Text className="text-dark font-bold text-lg">
              {formatCurrency(estimateTotal)}
            </Text>
          </View>
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={() => setStep(1)}
              activeOpacity={0.7}
              className="flex-1 border border-border py-3 mr-2 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-text-secondary font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep(3)}
              activeOpacity={0.7}
              className="flex-1 bg-brand-600 py-3 ml-2 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-white font-semibold">Next: Terms</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 3: Terms */}
      {step === 3 && (
        <View className="mx-5">
          <Text className="text-dark font-bold text-lg mb-3">Terms</Text>
          <FormField
            label="Payment Terms"
            value={terms}
            onChangeText={setTerms}
            placeholder="Payment terms..."
            multiline
          />
          <FormField
            label="Valid For (days)"
            value={validThrough}
            onChangeText={setValidThrough}
            placeholder="30"
            keyboardType="numeric"
          />
          <View className="flex-row mt-4">
            <TouchableOpacity
              onPress={() => setStep(2)}
              activeOpacity={0.7}
              className="flex-1 border border-border py-3 mr-2 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-text-secondary font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 bg-brand-600 py-3 ml-2 items-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-white font-semibold">Save Estimate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View className="mb-3">
      <Text className="text-text-secondary text-sm font-medium mb-1.5">
        {label}
      </Text>
      <TextInput
        className={`bg-white border border-border rounded p-3 text-dark text-sm ${multiline ? "min-h-[80px]" : ""}`}
        style={{ borderRadius: 4, textAlignVertical: multiline ? "top" : "center" }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BRAND.colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-text-secondary text-sm">{label}</Text>
      <Text
        className={`text-dark text-sm ${bold ? "font-bold" : "font-medium"}`}
      >
        {value}
      </Text>
    </View>
  );
}

// ── Live Estimate Preview ─────────────────────────────────────────────

function LiveEstimatePreview({
  clientName,
  clientEmail,
  clientPhone,
  jobTitle,
  jobCategory,
  jobDescription,
  lineItems,
  estimateTotal,
  terms,
  validDays,
}: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  jobTitle: string;
  jobCategory: string;
  jobDescription: string;
  lineItems: { description: string; quantity: string; unit: string; unitCost: string; total: string }[];
  estimateTotal: number;
  terms: string;
  validDays: string;
}) {
  const today = new Date();
  const validDate = new Date(today);
  validDate.setDate(validDate.getDate() + (parseInt(validDays) || 30));

  const filledItems = lineItems.filter((li) => li.description && parseFloat(li.total) > 0);
  const estimateNumber = `EST-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}-001`;

  // Subtotal, tax placeholder, total
  const subtotal = estimateTotal;
  const taxRate = 0;
  const taxAmount = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + taxAmount;

  return (
    <View className="bg-white mt-4 overflow-hidden" style={{ borderRadius: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 }}>
      {/* Top accent stripe */}
      <View style={{ height: 4, backgroundColor: BRAND.colors.primary }} />

      {/* Header: Brand + Estimate badge */}
      <View className="px-5 pt-5 pb-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <View style={{ width: 28, height: 28, backgroundColor: BRAND.colors.primary, alignItems: "center", justifyContent: "center", borderRadius: 2, marginRight: 8 }}>
                <Building2 size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text className="text-base font-bold text-dark" style={{ letterSpacing: -0.3 }}>Johnson & Sons</Text>
                <Text className="text-[10px] text-text-muted" style={{ letterSpacing: 0.5 }}>CONSTRUCTION</Text>
              </View>
            </View>
            <Text className="text-[10px] text-text-secondary mt-1">License #R21909 | Bonded & Insured</Text>
          </View>
          <View style={{ backgroundColor: BRAND.colors.primary, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text className="text-white text-[10px] font-bold uppercase" style={{ letterSpacing: 1.5 }}>Estimate</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#E8E5E1", marginHorizontal: 20 }} />

      {/* Meta info row: Estimate #, Date, Valid Through */}
      <View className="flex-row px-5 py-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <Hash size={10} color={BRAND.colors.textMuted} />
            <Text className="text-[10px] text-text-muted ml-1 uppercase" style={{ letterSpacing: 0.5 }}>Estimate No.</Text>
          </View>
          <Text className="text-xs font-bold text-dark">{estimateNumber}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <Calendar size={10} color={BRAND.colors.textMuted} />
            <Text className="text-[10px] text-text-muted ml-1 uppercase" style={{ letterSpacing: 0.5 }}>Date</Text>
          </View>
          <Text className="text-xs font-bold text-dark">{formatDate(today.toISOString())}</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <Shield size={10} color={BRAND.colors.textMuted} />
            <Text className="text-[10px] text-text-muted ml-1 uppercase" style={{ letterSpacing: 0.5 }}>Valid Until</Text>
          </View>
          <Text className="text-xs font-bold text-dark">{formatDate(validDate.toISOString())}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#E8E5E1", marginHorizontal: 20 }} />

      {/* From / To cards */}
      <View className="flex-row px-5 py-4" style={{ gap: 12 }}>
        <View className="flex-1 bg-gray-50 p-3" style={{ borderRadius: 2, borderLeftWidth: 3, borderLeftColor: BRAND.colors.primary }}>
          <Text className="text-[9px] text-text-muted uppercase font-bold mb-1.5" style={{ letterSpacing: 1 }}>From</Text>
          <Text className="text-xs font-bold text-dark">Marcus Johnson</Text>
          <Text className="text-[10px] text-text-secondary mt-0.5">Johnson & Sons Construction</Text>
          <View className="flex-row items-center mt-1">
            <Phone size={8} color={BRAND.colors.textMuted} />
            <Text className="text-[10px] text-text-secondary ml-1">(512) 555-0199</Text>
          </View>
          <View className="flex-row items-center mt-0.5">
            <Mail size={8} color={BRAND.colors.textMuted} />
            <Text className="text-[10px] text-text-secondary ml-1">marcus@johnsoncons.com</Text>
          </View>
        </View>
        <View className="flex-1 bg-gray-50 p-3" style={{ borderRadius: 2, borderLeftWidth: 3, borderLeftColor: BRAND.colors.dark }}>
          <Text className="text-[9px] text-text-muted uppercase font-bold mb-1.5" style={{ letterSpacing: 1 }}>Prepared For</Text>
          <Text className="text-xs font-bold text-dark">{clientName || "Client Name"}</Text>
          {clientEmail ? (
            <View className="flex-row items-center mt-1">
              <Mail size={8} color={BRAND.colors.textMuted} />
              <Text className="text-[10px] text-text-secondary ml-1">{clientEmail}</Text>
            </View>
          ) : null}
          {clientPhone ? (
            <View className="flex-row items-center mt-0.5">
              <Phone size={8} color={BRAND.colors.textMuted} />
              <Text className="text-[10px] text-text-secondary ml-1">{clientPhone}</Text>
            </View>
          ) : null}
          {!clientEmail && !clientPhone && (
            <Text className="text-[10px] text-text-muted mt-0.5 italic">Contact details will appear here</Text>
          )}
        </View>
      </View>

      {/* Project details */}
      <View className="px-5 pb-3">
        <View className="bg-gray-50 p-3" style={{ borderRadius: 2 }}>
          <Text className="text-[9px] text-text-muted uppercase font-bold mb-1" style={{ letterSpacing: 1 }}>Project</Text>
          <Text className="text-sm font-bold text-dark">{jobTitle || "Job Title"}</Text>
          <View className="flex-row items-center mt-1">
            <View style={{ backgroundColor: `${BRAND.colors.primary}15`, paddingHorizontal: 6, paddingVertical: 1 }}>
              <Text className="text-[9px] font-bold" style={{ color: BRAND.colors.primary }}>{jobCategory}</Text>
            </View>
          </View>
          {jobDescription ? (
            <Text className="text-[10px] text-text-secondary mt-1.5 leading-3.5" numberOfLines={3}>{jobDescription}</Text>
          ) : null}
        </View>
      </View>

      {/* Line Items Table */}
      <View className="px-5 pb-3">
        {filledItems.length > 0 ? (
          <View>
            {/* Table Header */}
            <View className="flex-row py-2 px-2.5" style={{ backgroundColor: BRAND.colors.dark }}>
              <Text className="flex-1 text-white text-[9px] font-bold uppercase" style={{ letterSpacing: 0.8 }}>Description</Text>
              <Text className="w-8 text-white text-[9px] font-bold uppercase text-center" style={{ letterSpacing: 0.5 }}>Qty</Text>
              <Text className="w-10 text-white text-[9px] font-bold uppercase text-center" style={{ letterSpacing: 0.5 }}>Unit</Text>
              <Text className="w-14 text-white text-[9px] font-bold uppercase text-right" style={{ letterSpacing: 0.5 }}>Rate</Text>
              <Text className="w-16 text-white text-[9px] font-bold uppercase text-right" style={{ letterSpacing: 0.5 }}>Amount</Text>
            </View>
            {/* Rows */}
            {filledItems.map((li, i) => (
              <View
                key={i}
                className="flex-row py-2 px-2.5 items-center"
                style={{ backgroundColor: i % 2 === 0 ? "#FAFAF8" : "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F0EEEB" }}
              >
                <Text className="flex-1 text-dark text-[11px]" numberOfLines={1}>{li.description}</Text>
                <Text className="w-8 text-dark text-[11px] text-center">{li.quantity}</Text>
                <Text className="w-10 text-text-muted text-[10px] text-center">{li.unit}</Text>
                <Text className="w-14 text-dark text-[11px] text-right">{formatCurrency(parseFloat(li.unitCost) || 0)}</Text>
                <Text className="w-16 text-dark text-[11px] font-semibold text-right">{formatCurrency(parseFloat(li.total) || 0)}</Text>
              </View>
            ))}

            {/* Totals section */}
            <View style={{ borderTopWidth: 2, borderTopColor: BRAND.colors.dark }}>
              <View className="flex-row justify-between py-1.5 px-2.5">
                <Text className="text-text-secondary text-[10px]">Subtotal</Text>
                <Text className="text-dark text-[11px] font-medium">{formatCurrency(subtotal)}</Text>
              </View>
              {taxRate > 0 && (
                <View className="flex-row justify-between py-1 px-2.5">
                  <Text className="text-text-secondary text-[10px]">Tax ({(taxRate * 100).toFixed(1)}%)</Text>
                  <Text className="text-dark text-[11px] font-medium">{formatCurrency(taxAmount)}</Text>
                </View>
              )}
              <View className="flex-row justify-between items-center py-2.5 px-2.5" style={{ backgroundColor: BRAND.colors.dark }}>
                <Text className="text-white text-xs font-bold uppercase" style={{ letterSpacing: 0.5 }}>Total Due</Text>
                <Text className="text-white text-base font-bold">{formatCurrency(grandTotal)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="py-8 items-center" style={{ borderWidth: 1, borderColor: "#E8E5E1", borderStyle: "dashed" }}>
            <ListOrdered size={20} color={BRAND.colors.textMuted} />
            <Text className="text-text-muted text-xs mt-2">Add line items to see them here</Text>
          </View>
        )}
      </View>

      {/* Terms */}
      {terms ? (
        <View className="px-5 pb-3">
          <View className="p-3" style={{ backgroundColor: "#FAFAF8", borderRadius: 2, borderWidth: 1, borderColor: "#E8E5E1" }}>
            <Text className="text-[9px] text-text-muted uppercase font-bold mb-1.5" style={{ letterSpacing: 1 }}>Terms & Conditions</Text>
            <Text className="text-[10px] text-text-secondary" style={{ lineHeight: 15 }}>{terms}</Text>
          </View>
        </View>
      ) : null}

      {/* Signature section */}
      <View className="px-5 pb-4 pt-2">
        <View className="flex-row" style={{ gap: 16 }}>
          <View className="flex-1">
            <View style={{ borderBottomWidth: 1, borderBottomColor: BRAND.colors.dark, height: 32 }} />
            <Text className="text-[9px] text-text-muted mt-1.5 font-medium">Contractor Signature</Text>
            <Text className="text-[8px] text-text-muted mt-0.5">Marcus Johnson</Text>
          </View>
          <View className="flex-1">
            <View style={{ borderBottomWidth: 1, borderBottomColor: BRAND.colors.dark, height: 32 }} />
            <Text className="text-[9px] text-text-muted mt-1.5 font-medium">Client Signature</Text>
            <Text className="text-[8px] text-text-muted mt-0.5">{clientName || "Client Name"}</Text>
          </View>
          <View style={{ width: 70 }}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: BRAND.colors.dark, height: 32 }} />
            <Text className="text-[9px] text-text-muted mt-1.5 font-medium">Date</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={{ backgroundColor: "#FAFAF8", borderTopWidth: 1, borderTopColor: "#E8E5E1" }} className="px-5 py-3 flex-row items-center justify-between">
        <Text className="text-[8px] text-text-muted">This estimate is valid for {validDays || "30"} days from the date of issue.</Text>
        <View className="flex-row items-center">
          <View style={{ width: 10, height: 10, backgroundColor: BRAND.colors.primary, alignItems: "center", justifyContent: "center", borderRadius: 1, marginRight: 3 }}>
            <Building2 size={6} color="#FFFFFF" />
          </View>
          <Text className="text-[8px] text-text-muted font-bold">FairTradeWorker</Text>
        </View>
      </View>
    </View>
  );
}

// ── Tab: Calculator ────────────────────────────────────────────────────

function CalculatorTab() {
  const [category, setCategory] = useState("General Contracting");
  const [zip, setZip] = useState("");
  const [size, setSize] = useState("Medium");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const categories = Object.keys(BASE_ESTIMATES);
  const sizes = Object.keys(SIZE_MULTIPLIERS);

  const base = BASE_ESTIMATES[category];
  const sizeMult = SIZE_MULTIPLIERS[size];
  const region = getRegionMultiplier(zip);

  const low = Math.round(base.low * sizeMult * region.factor);
  const high = Math.round(base.high * sizeMult * region.factor);
  const mid = Math.round((low + high) / 2);
  const materialsCost = Math.round(mid * base.materials);
  const laborCost = Math.round(mid * base.labor);
  const overheadPct = 1 - base.materials - base.labor;
  const overheadCost = Math.round(mid * overheadPct);
  const timelineLow = Math.round(base.timelineWeeks[0] * (sizeMult > 1 ? Math.sqrt(sizeMult) : 1));
  const timelineHigh = Math.round(base.timelineWeeks[1] * (sizeMult > 1 ? Math.sqrt(sizeMult) : 1));

  function calculate() {
    setShowResult(true);
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="mx-5 mt-4">
        <View className="flex-row items-center mb-3">
          <CalcIcon size={20} color={BRAND.colors.primary} />
          <Text className="text-dark font-bold text-lg ml-2">
            FairPrice Calculator
          </Text>
        </View>

        {/* Category */}
        <Text className="text-text-secondary text-sm font-medium mb-1.5">
          Trade Category
        </Text>
        <TouchableOpacity
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          activeOpacity={0.7}
          className="bg-white border border-border rounded p-3 mb-3 flex-row items-center justify-between"
          style={{ borderRadius: 4 }}
        >
          <Text className="text-dark">{category}</Text>
          {showCategoryPicker ? (
            <ChevronUp size={18} color={BRAND.colors.textSecondary} />
          ) : (
            <ChevronDown size={18} color={BRAND.colors.textSecondary} />
          )}
        </TouchableOpacity>
        {showCategoryPicker && (
          <View
            className="bg-white border border-border rounded mb-3"
            style={{ borderRadius: 4 }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryPicker(false);
                }}
                activeOpacity={0.7}
                className={`p-3 border-b border-border ${cat === category ? "bg-brand-50" : ""}`}
              >
                <Text
                  className={`text-sm ${cat === category ? "text-brand-600 font-semibold" : "text-dark"}`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ZIP */}
        <Text className="text-text-secondary text-sm font-medium mb-1.5">
          ZIP Code
        </Text>
        <TextInput
          className="bg-white border border-border rounded p-3 text-dark text-sm mb-3"
          style={{ borderRadius: 4 }}
          placeholder="e.g. 78745"
          placeholderTextColor={BRAND.colors.textMuted}
          keyboardType="numeric"
          maxLength={5}
          value={zip}
          onChangeText={setZip}
        />

        {/* Size */}
        <Text className="text-text-secondary text-sm font-medium mb-1.5">
          Project Size
        </Text>
        <View className="flex-row mb-4">
          {sizes.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSize(s)}
              activeOpacity={0.7}
              className={`flex-1 py-2.5 items-center border ${s === size ? "bg-brand-600 border-brand-600" : "bg-white border-border"} ${s !== sizes[0] ? "ml-2" : ""}`}
              style={{ borderRadius: 4 }}
            >
              <Text
                className={`text-sm font-semibold ${s === size ? "text-white" : "text-dark"}`}
              >
                {s}
              </Text>
              <Text
                className={`text-xs ${s === size ? "text-white/70" : "text-text-muted"}`}
              >
                {SIZE_MULTIPLIERS[s]}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calculate button */}
        <TouchableOpacity
          onPress={calculate}
          activeOpacity={0.7}
          className="bg-brand-600 py-3 items-center"
          style={{ borderRadius: 4 }}
        >
          <Text className="text-white font-bold text-base">
            Calculate Estimate
          </Text>
        </TouchableOpacity>

        {/* Result */}
        {showResult && (
          <View className="mt-4">
            {/* Price range */}
            <View
              className="bg-white border border-border rounded p-4"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-text-muted text-xs mb-1">
                Estimated Price Range
              </Text>
              <View className="flex-row items-end justify-between">
                <View className="items-center">
                  <Text className="text-text-muted text-xs">Low</Text>
                  <Text className="text-text-secondary text-base font-medium">
                    {formatCurrency(low)}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-text-muted text-xs">Mid</Text>
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: BRAND.colors.primary }}
                  >
                    {formatCurrency(mid)}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-text-muted text-xs">High</Text>
                  <Text className="text-text-secondary text-base font-medium">
                    {formatCurrency(high)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Breakdown */}
            <View
              className="bg-white border border-border rounded border-t-0 p-4"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-dark font-semibold text-sm mb-2">
                Cost Breakdown
              </Text>
              <BreakdownRow
                label="Materials"
                amount={materialsCost}
                pct={Math.round(base.materials * 100)}
              />
              <BreakdownRow
                label="Labor"
                amount={laborCost}
                pct={Math.round(base.labor * 100)}
              />
              <BreakdownRow
                label="Overhead & Profit"
                amount={overheadCost}
                pct={Math.round(overheadPct * 100)}
              />
            </View>

            {/* Timeline */}
            <View
              className="bg-white border border-border rounded border-t-0 p-4 flex-row items-center"
              style={{ borderRadius: 4 }}
            >
              <Clock size={16} color={BRAND.colors.textSecondary} />
              <Text className="text-dark text-sm ml-2">
                Timeline: {timelineLow}–{timelineHigh} weeks
              </Text>
            </View>

            {/* Region */}
            <View
              className="bg-white border border-border rounded border-t-0 p-4 flex-row items-center"
              style={{ borderRadius: 4 }}
            >
              <MapPin size={16} color={BRAND.colors.textSecondary} />
              <Text className="text-dark text-sm ml-2">
                {region.label} ({region.factor}x adjustment)
              </Text>
            </View>

            {/* Tips */}
            <View
              className="bg-white border border-border rounded border-t-0 p-4"
              style={{ borderRadius: 4 }}
            >
              <View className="flex-row items-center mb-2">
                <Lightbulb size={16} color={BRAND.colors.primary} />
                <Text className="text-dark font-semibold text-sm ml-2">
                  Tips for {category}
                </Text>
              </View>
              {base.tips.map((tip, i) => (
                <View key={i} className="flex-row py-1">
                  <Text className="text-text-muted text-xs mr-1.5">--</Text>
                  <Text className="text-dark text-sm flex-1">{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function BreakdownRow({
  label,
  amount,
  pct,
}: {
  label: string;
  amount: number;
  pct: number;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="text-text-secondary text-sm">{label}</Text>
      <View className="flex-row items-center">
        <Text className="text-dark font-semibold text-sm">
          {formatCurrency(amount)}
        </Text>
        <Text className="text-text-muted text-xs ml-2">({pct}%)</Text>
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────

export default function EstimatesScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<TabId>(
    tab === "new-estimate" || tab === "calculator" ? tab : "my-estimates"
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mr-3"
          >
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-dark">Estimates</Text>
        </View>
        <TouchableOpacity
          onPress={() => setActiveTab("new-estimate")}
          className="bg-brand-600 p-2.5"
          style={{ borderRadius: 4 }}
          activeOpacity={0.7}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View className="border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
              className={`mr-5 pb-2.5 ${active ? "border-b-2 border-brand-600" : ""}`}
            >
              <Text
                className={`text-sm font-semibold ${active ? "text-brand-600" : "text-text-muted"}`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </View>

      {/* Tab content */}
      {activeTab === "my-estimates" && <MyEstimatesTab />}
      {activeTab === "new-estimate" && <NewEstimateTab />}
      {activeTab === "calculator" && <CalculatorTab />}
    </SafeAreaView>
  );
}
