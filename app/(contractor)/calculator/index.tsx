import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calculator,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Lightbulb,
  DollarSign,
  Hammer,
  Package,
  TrendingUp,
} from "lucide-react-native";
import { formatCurrency } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import * as Haptics from "expo-haptics";

// ── Data ──────────────────────────────────────────────────────────────

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
    low: 3000, high: 8000, materials: 0.4, labor: 0.45, timelineWeeks: [2, 12],
    tips: ["Get 3+ bids", "Check license & insurance", "Define scope in writing"],
  },
  Plumbing: {
    low: 2000, high: 6000, materials: 0.3, labor: 0.55, timelineWeeks: [1, 6],
    tips: ["Camera-inspect sewer lines first", "Ask about warranty on parts", "Get permit for re-pipes"],
  },
  Electrical: {
    low: 1500, high: 5000, materials: 0.25, labor: 0.6, timelineWeeks: [1, 4],
    tips: ["Panel upgrades need permits", "Ask about arc-fault breakers", "Get load calculation"],
  },
  HVAC: {
    low: 3000, high: 8000, materials: 0.4, labor: 0.45, timelineWeeks: [1, 5],
    tips: ["Get Manual J calculation", "Check SEER rating", "Ask about duct sealing"],
  },
  Roofing: {
    low: 4000, high: 9000, materials: 0.45, labor: 0.4, timelineWeeks: [1, 3],
    tips: ["Check for decking rot", "Ask about ice & water shield", "Get ventilation assessment"],
  },
  Painting: {
    low: 1500, high: 4000, materials: 0.2, labor: 0.65, timelineWeeks: [1, 3],
    tips: ["Prep is 60% of the job", "Ask about paint brand", "Specify number of coats"],
  },
  Flooring: {
    low: 2000, high: 6000, materials: 0.45, labor: 0.4, timelineWeeks: [1, 4],
    tips: ["Check subfloor condition", "Acclimate materials 48hr", "Ask about transitions"],
  },
  Remodeling: {
    low: 5000, high: 9000, materials: 0.4, labor: 0.45, timelineWeeks: [3, 16],
    tips: ["Design before demo", "Budget 15% contingency", "Get everything in writing"],
  },
  Concrete: {
    low: 3000, high: 7000, materials: 0.35, labor: 0.5, timelineWeeks: [1, 4],
    tips: ["Check soil conditions", "Ask about rebar spacing", "Plan for cure time"],
  },
  Fencing: {
    low: 1500, high: 4000, materials: 0.45, labor: 0.4, timelineWeeks: [1, 3],
    tips: ["Check property lines first", "Ask about post depth", "Consider gate placement"],
  },
};

const SIZE_OPTIONS = [
  { key: "Small", mult: 1, desc: "Minor repair" },
  { key: "Medium", mult: 2.5, desc: "Standard job" },
  { key: "Large", mult: 6, desc: "Full project" },
  { key: "Major", mult: 15, desc: "Large-scale" },
];

function getRegionMultiplier(zip: string): { factor: number; label: string } {
  const prefix = parseInt(zip.substring(0, 3), 10);
  if (isNaN(prefix)) return { factor: 1.0, label: "National Average" };
  if (prefix >= 100 && prefix <= 119) return { factor: 1.3, label: "NYC Metro" };
  if (prefix >= 200 && prefix <= 219) return { factor: 1.15, label: "DC Metro" };
  if (prefix >= 300 && prefix <= 399) return { factor: 0.92, label: "Southeast" };
  if (prefix >= 600 && prefix <= 629) return { factor: 1.08, label: "Chicago Metro" };
  if (prefix >= 700 && prefix <= 799) return { factor: 0.88, label: "South" };
  if (prefix >= 900 && prefix <= 961) return { factor: 1.25, label: "California" };
  return { factor: 1.0, label: "National Average" };
}

const categories = Object.keys(BASE_ESTIMATES);

// ── Component ─────────────────────────────────────────────────────────

export default function CalculatorScreen() {
  const router = useRouter();
  const [category, setCategory] = useState("General Contracting");
  const [zip, setZip] = useState("");
  const [sizeIdx, setSizeIdx] = useState(1); // Medium default
  const [showPicker, setShowPicker] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const size = SIZE_OPTIONS[sizeIdx];
  const base = BASE_ESTIMATES[category];
  const region = getRegionMultiplier(zip);

  const result = useMemo(() => {
    const low = Math.round(base.low * size.mult * region.factor);
    const high = Math.round(base.high * size.mult * region.factor);
    const mid = Math.round((low + high) / 2);
    const materialsCost = Math.round(mid * base.materials);
    const laborCost = Math.round(mid * base.labor);
    const overheadPct = 1 - base.materials - base.labor;
    const overheadCost = Math.round(mid * overheadPct);
    const timelineLow = Math.round(base.timelineWeeks[0] * (size.mult > 1 ? Math.sqrt(size.mult) : 1));
    const timelineHigh = Math.round(base.timelineWeeks[1] * (size.mult > 1 ? Math.sqrt(size.mult) : 1));
    return { low, high, mid, materialsCost, laborCost, overheadCost, overheadPct, timelineLow, timelineHigh };
  }, [base, size.mult, region.factor]);

  const calculate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowResult(true);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <Calculator size={22} color={BRAND.colors.primary} />
        <Text className="font-bold text-dark ml-2" style={{ fontSize: 20 }}>FairPrice Calculator</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trade Category */}
        <View className="px-4 mt-4">
          <Text className="text-text-secondary font-bold uppercase tracking-wide mb-2" style={{ fontSize: 11 }}>Trade Category</Text>
          <TouchableOpacity
            onPress={() => setShowPicker(!showPicker)}
            activeOpacity={0.7}
            className="bg-white border border-border p-4 flex-row items-center justify-between"
          >
            <Text className="text-dark font-bold" style={{ fontSize: 16 }}>{category}</Text>
            {showPicker ? (
              <ChevronUp size={20} color={BRAND.colors.textSecondary} />
            ) : (
              <ChevronDown size={20} color={BRAND.colors.textSecondary} />
            )}
          </TouchableOpacity>
          {showPicker && (
            <View className="bg-white border border-border border-t-0">
              {categories.map((cat, i) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setCategory(cat); setShowPicker(false); setShowResult(false); }}
                  activeOpacity={0.7}
                  className={`px-4 py-3 ${i < categories.length - 1 ? "border-b border-border" : ""} ${cat === category ? "bg-brand-50" : ""}`}
                >
                  <Text className={`font-medium ${cat === category ? "text-brand-600 font-bold" : "text-dark"}`} style={{ fontSize: 15 }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ZIP Code */}
        <View className="px-4 mt-4">
          <Text className="text-text-secondary font-bold uppercase tracking-wide mb-2" style={{ fontSize: 11 }}>ZIP Code</Text>
          <View className="bg-white border border-border flex-row items-center px-4">
            <MapPin size={18} color={BRAND.colors.textMuted} />
            <TextInput
              className="flex-1 text-dark font-medium py-4 ml-3"
              style={{ fontSize: 16 }}
              placeholder="Enter ZIP code"
              placeholderTextColor={BRAND.colors.textMuted}
              keyboardType="numeric"
              maxLength={5}
              value={zip}
              onChangeText={(t) => { setZip(t); setShowResult(false); }}
            />
            {zip.length === 5 && (
              <Text className="text-text-muted" style={{ fontSize: 13 }}>{region.label}</Text>
            )}
          </View>
        </View>

        {/* Project Size */}
        <View className="px-4 mt-4">
          <Text className="text-text-secondary font-bold uppercase tracking-wide mb-2" style={{ fontSize: 11 }}>Project Size</Text>
          <View className="flex-row" style={{ gap: 8 }}>
            {SIZE_OPTIONS.map((s, i) => {
              const active = i === sizeIdx;
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => { setSizeIdx(i); setShowResult(false); }}
                  activeOpacity={0.7}
                  className={`flex-1 py-3 items-center border ${active ? "bg-dark border-dark" : "bg-white border-border"}`}
                >
                  <Text className={`font-bold ${active ? "text-white" : "text-dark"}`} style={{ fontSize: 14 }}>{s.key}</Text>
                  <Text className={`mt-0.5 ${active ? "text-gray-400" : "text-text-muted"}`} style={{ fontSize: 11 }}>{s.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Calculate Button */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={calculate}
            activeOpacity={0.8}
            className="bg-brand-600 py-4 flex-row items-center justify-center"
          >
            <Calculator size={20} color="#FFFFFF" />
            <Text className="text-white font-bold ml-2" style={{ fontSize: 17 }}>Calculate Estimate</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {showResult && (
          <View className="px-4 mt-5">
            {/* Price Range Header */}
            <View className="bg-white border border-border p-5">
              <Text className="text-text-muted uppercase tracking-wide font-bold mb-3" style={{ fontSize: 10 }}>Estimated Price Range</Text>
              <View className="flex-row items-end justify-between">
                <View className="items-center">
                  <Text className="text-text-muted mb-1" style={{ fontSize: 11 }}>Low</Text>
                  <Text className="text-text-secondary font-bold" style={{ fontSize: 18 }}>{formatCurrency(result.low)}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-text-muted mb-1" style={{ fontSize: 11 }}>Fair Price</Text>
                  <Text className="font-bold" style={{ fontSize: 32, color: BRAND.colors.primary }}>{formatCurrency(result.mid)}</Text>
                </View>
                <View className="items-center">
                  <Text className="text-text-muted mb-1" style={{ fontSize: 11 }}>High</Text>
                  <Text className="text-text-secondary font-bold" style={{ fontSize: 18 }}>{formatCurrency(result.high)}</Text>
                </View>
              </View>

              {/* Range Bar */}
              <View className="mt-4 h-3 bg-surface w-full" style={{ borderRadius: 99 }}>
                <View className="h-3 bg-brand-600" style={{ width: "100%", borderRadius: 99 }} />
                <View
                  className="absolute h-3 bg-dark"
                  style={{ left: "40%", width: "20%", borderRadius: 99 }}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-text-muted" style={{ fontSize: 10 }}>Budget</Text>
                <Text className="text-text-muted" style={{ fontSize: 10 }}>Premium</Text>
              </View>
            </View>

            {/* Cost Breakdown */}
            <View className="bg-white border border-border border-t-0 p-5">
              <Text className="text-dark font-bold mb-3" style={{ fontSize: 15 }}>Cost Breakdown</Text>

              <View className="flex-row items-center justify-between py-3 border-b border-border">
                <View className="flex-row items-center">
                  <Package size={16} color={BRAND.colors.textSecondary} />
                  <Text className="text-text-secondary ml-2" style={{ fontSize: 14 }}>Materials</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{formatCurrency(result.materialsCost)}</Text>
                  <View className="bg-surface ml-2 px-2 py-0.5">
                    <Text className="text-text-muted font-bold" style={{ fontSize: 11 }}>{Math.round(base.materials * 100)}%</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between py-3 border-b border-border">
                <View className="flex-row items-center">
                  <Hammer size={16} color={BRAND.colors.textSecondary} />
                  <Text className="text-text-secondary ml-2" style={{ fontSize: 14 }}>Labor</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{formatCurrency(result.laborCost)}</Text>
                  <View className="bg-surface ml-2 px-2 py-0.5">
                    <Text className="text-text-muted font-bold" style={{ fontSize: 11 }}>{Math.round(base.labor * 100)}%</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <TrendingUp size={16} color={BRAND.colors.textSecondary} />
                  <Text className="text-text-secondary ml-2" style={{ fontSize: 14 }}>Overhead & Profit</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{formatCurrency(result.overheadCost)}</Text>
                  <View className="bg-surface ml-2 px-2 py-0.5">
                    <Text className="text-text-muted font-bold" style={{ fontSize: 11 }}>{Math.round(result.overheadPct * 100)}%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Timeline + Region */}
            <View className="flex-row" style={{ gap: 0 }}>
              <View className="flex-1 bg-white border border-border border-t-0 p-4 flex-row items-center">
                <Clock size={18} color={BRAND.colors.primary} />
                <View className="ml-2">
                  <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{result.timelineLow}–{result.timelineHigh} wks</Text>
                  <Text className="text-text-muted" style={{ fontSize: 11 }}>Timeline</Text>
                </View>
              </View>
              <View className="flex-1 bg-white border border-border border-t-0 border-l-0 p-4 flex-row items-center">
                <MapPin size={18} color={BRAND.colors.primary} />
                <View className="ml-2">
                  <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{region.factor}x</Text>
                  <Text className="text-text-muted" style={{ fontSize: 11 }}>{region.label}</Text>
                </View>
              </View>
            </View>

            {/* Tips */}
            <View className="bg-white border border-border border-t-0 p-5">
              <View className="flex-row items-center mb-3">
                <Lightbulb size={16} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-2" style={{ fontSize: 15 }}>Tips for {category}</Text>
              </View>
              {base.tips.map((tip, i) => (
                <View key={i} className="flex-row items-start py-1.5">
                  <View className="w-1.5 h-1.5 bg-brand-600 mt-1.5 mr-3" />
                  <Text className="text-text-secondary flex-1" style={{ fontSize: 14 }}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
