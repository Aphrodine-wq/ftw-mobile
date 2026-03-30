import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  DollarSign,
  Clock,
  ImagePlus,
  X,
  Crosshair,
} from "lucide-react-native";
import { BRAND, JOB_CATEGORIES } from "@src/lib/constants";
import * as api from "@src/api/client";
import { pickImage, uploadImage } from "@src/lib/image-picker";
import { getCurrentLocation, geocodeAddress, reverseGeocode } from "@src/lib/location";

type Step = 1 | 2 | 3;

const TIMELINES = ["ASAP", "2 weeks", "1 month", "Flexible"];
const BUDGET_RANGES = [
  { label: "Under $5K", min: 0, max: 5000 },
  { label: "$5K - $15K", min: 5000, max: 15000 },
  { label: "$15K - $50K", min: 15000, max: 50000 },
  { label: "$50K+", min: 50000, max: 100000 },
];

export default function PostJobScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [timeline, setTimeline] = useState("Flexible");
  const [budgetRange, setBudgetRange] = useState<typeof BUDGET_RANGES[0] | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      if (loc) {
        setCoords(loc);
        const address = await reverseGeocode(loc.latitude, loc.longitude);
        if (address && !location) {
          setLocation(address);
        }
      }
    })();
  }, []);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setCoords(loc);
        const address = await reverseGeocode(loc.latitude, loc.longitude);
        if (address) setLocation(address);
      }
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleAddPhoto = async () => {
    if (photos.length >= 10) return;
    const uri = await pickImage();
    if (uri) {
      setPhotos((prev) => [...prev, uri].slice(0, 10));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canAdvance = () => {
    if (step === 1) return !!category;
    if (step === 2) return !!title && !!description;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      let finalCoords = coords;
      if (!finalCoords && location) {
        finalCoords = await geocodeAddress(location);
      }

      const job = await api.postJob({
        title: title || `${category} Project`,
        description,
        category,
        budget_min: budgetRange?.min || 0,
        budget_max: budgetRange?.max || 0,
        location: location || "Texas",
        latitude: finalCoords?.latitude,
        longitude: finalCoords?.longitude,
      });

      if (photos.length > 0 && job?.id) {
        photos.forEach((uri) => {
          uploadImage(uri, "job", job.id).catch(() => {});
        });
      }

      router.replace("/(homeowner)/(jobs)" as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity
            onPress={() => (step === 1 ? router.back() : setStep((st) => (st - 1) as Step))}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: BRAND.colors.textPrimary, marginLeft: 12, flex: 1 }}>
            Post a Job
          </Text>
          <Text style={{ fontSize: 13, color: BRAND.colors.textMuted }}>
            Step {step}/3
          </Text>
        </View>

        {/* Progress bar */}
        <View style={s.progressTrack}>
          <View
            style={[s.progressFill, { width: `${(step / 3) * 100}%` }]}
          />
        </View>

        <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary, marginBottom: 8 }}>
                What type of work?
              </Text>
              <Text style={{ fontSize: 14, color: BRAND.colors.textSecondary, marginBottom: 20 }}>
                Select the category that best matches your project.
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      s.chip,
                      category === cat ? s.chipActive : s.chipInactive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: category === cat ? "#FFFFFF" : BRAND.colors.textPrimary,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary, marginBottom: 8 }}>
                Describe the work
              </Text>
              <Text style={{ fontSize: 14, color: BRAND.colors.textSecondary, marginBottom: 20 }}>
                Be specific -- better descriptions get better bids.
              </Text>

              <Text style={s.fieldLabel}>Project Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={`${category} Project`}
                placeholderTextColor={BRAND.colors.textMuted}
                style={s.input}
              />

              <Text style={s.fieldLabel}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the scope, materials, any special requirements..."
                placeholderTextColor={BRAND.colors.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[s.input, { minHeight: 120 }]}
              />

              <Text style={s.fieldLabel}>Location</Text>
              <View style={s.locationRow}>
                <MapPin size={16} color={BRAND.colors.textMuted} />
                <TextInput
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    setCoords(null);
                  }}
                  placeholder="City, TX"
                  placeholderTextColor={BRAND.colors.textMuted}
                  style={{ flex: 1, marginLeft: 8, color: BRAND.colors.textPrimary, fontSize: 14 }}
                />
                <TouchableOpacity
                  onPress={handleDetectLocation}
                  disabled={detectingLocation}
                  activeOpacity={0.7}
                  style={{ marginLeft: 8 }}
                >
                  {detectingLocation ? (
                    <ActivityIndicator size="small" color={BRAND.colors.primary} />
                  ) : (
                    <Crosshair size={18} color={BRAND.colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Photos */}
              <Text style={[s.fieldLabel, { marginTop: 16 }]}>
                Photos (optional, max 10)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
                contentContainerStyle={{ gap: 8 }}
              >
                {photos.map((uri, i) => (
                  <View key={uri} style={s.photoContainer}>
                    <Image source={{ uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(i)}
                      style={s.photoRemoveBtn}
                      activeOpacity={0.7}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < 10 && (
                  <TouchableOpacity
                    onPress={handleAddPhoto}
                    style={s.photoAddBtn}
                    activeOpacity={0.7}
                  >
                    <ImagePlus size={20} color={BRAND.colors.textMuted} />
                    <Text style={{ fontSize: 10, color: BRAND.colors.textMuted, marginTop: 2 }}>Add</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary, marginBottom: 8 }}>
                Budget and timeline
              </Text>
              <Text style={{ fontSize: 14, color: BRAND.colors.textSecondary, marginBottom: 20 }}>
                Help contractors give you accurate bids.
              </Text>

              <View className="flex-row items-center mb-2">
                <DollarSign size={14} color={BRAND.colors.dark} />
                <Text style={{ fontSize: 14, fontWeight: "500", color: BRAND.colors.textPrimary, marginLeft: 4 }}>
                  Budget Range
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {BUDGET_RANGES.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    onPress={() => setBudgetRange(range)}
                    style={[
                      s.chip,
                      budgetRange?.label === range.label ? s.chipActive : s.chipInactive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: budgetRange?.label === range.label ? "#FFFFFF" : BRAND.colors.textPrimary,
                      }}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row items-center mb-2">
                <Clock size={14} color={BRAND.colors.dark} />
                <Text style={{ fontSize: 14, fontWeight: "500", color: BRAND.colors.textPrimary, marginLeft: 4 }}>
                  Timeline
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {TIMELINES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTimeline(t)}
                    style={[
                      s.chip,
                      timeline === t ? s.chipActive : s.chipInactive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: timeline === t ? "#FFFFFF" : BRAND.colors.textPrimary,
                      }}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <Text style={{ color: "#B91C1C", fontSize: 13 }}>{error}</Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        {/* Bottom action */}
        <View style={s.bottomBar}>
          {step < 3 ? (
            <TouchableOpacity
              onPress={() => setStep((st) => (st + 1) as Step)}
              disabled={!canAdvance()}
              style={[
                s.primaryBtn,
                { backgroundColor: canAdvance() ? BRAND.colors.primary : "#E5E7EB" },
              ]}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", marginRight: 8, color: canAdvance() ? "#FFFFFF" : "#9CA3AF" }}>
                Continue
              </Text>
              <ArrowRight size={18} color={canAdvance() ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[s.primaryBtn, { backgroundColor: BRAND.colors.primary }]}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Check size={18} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginLeft: 8 }}>
                    Post Job
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 0,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND.colors.primary,
    borderRadius: 0,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND.colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: BRAND.colors.textPrimary,
    fontSize: 14,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
  },
  chipActive: {
    backgroundColor: BRAND.colors.dark,
  },
  chipInactive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
  },
  photoRemoveBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoAddBtn: {
    width: 80,
    height: 80,
    borderRadius: 0,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: BRAND.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: BRAND.colors.border,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 0,
  },
});
