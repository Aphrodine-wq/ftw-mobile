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
  Camera,
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

  // Auto-detect location on mount
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
      // If user typed a location but we don't have coordinates, try geocoding
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

      // Fire-and-forget photo uploads after job is created
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
        <View className="flex-row items-center px-5 py-3 bg-white border-b border-border">
          <TouchableOpacity
            onPress={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-dark ml-3 flex-1">Post a Job</Text>
          <Text className="text-sm text-text-muted">Step {step}/3</Text>
        </View>

        {/* Progress bar */}
        <View className="h-1 bg-gray-200 mx-5 mt-3 rounded-full overflow-hidden">
          <View
            className="h-full bg-brand-600 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </View>

        <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View>
              <Text className="text-xl font-bold text-dark mb-2">What type of work?</Text>
              <Text className="text-text-secondary mb-5">Select the category that best matches your project.</Text>
              <View className="flex-row flex-wrap gap-2">
                {JOB_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl border ${
                      category === cat
                        ? "bg-dark border-dark"
                        : "bg-white border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        category === cat ? "text-white" : "text-dark"
                      }`}
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
              <Text className="text-xl font-bold text-dark mb-2">Describe the work</Text>
              <Text className="text-text-secondary mb-5">Be specific — better descriptions get better bids.</Text>

              <Text className="text-sm font-medium text-dark mb-1.5">Project Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={`${category} Project`}
                placeholderTextColor={BRAND.colors.textMuted}
                className="bg-white border border-border rounded-xl px-4 py-3 text-dark mb-4"
              />

              <Text className="text-sm font-medium text-dark mb-1.5">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the scope, materials, any special requirements..."
                placeholderTextColor={BRAND.colors.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="bg-white border border-border rounded-xl px-4 py-3 text-dark mb-4 min-h-[120px]"
              />

              <Text className="text-sm font-medium text-dark mb-1.5">Location</Text>
              <View className="flex-row items-center bg-white border border-border rounded-xl px-4 py-3">
                <MapPin size={16} color={BRAND.colors.textMuted} />
                <TextInput
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    // Clear coords when user manually edits — will re-geocode on submit
                    setCoords(null);
                  }}
                  placeholder="City, TX"
                  placeholderTextColor={BRAND.colors.textMuted}
                  className="flex-1 ml-2 text-dark"
                />
                <TouchableOpacity
                  onPress={handleDetectLocation}
                  disabled={detectingLocation}
                  activeOpacity={0.7}
                  className="ml-2"
                >
                  {detectingLocation ? (
                    <ActivityIndicator size="small" color={BRAND.colors.primary} />
                  ) : (
                    <Crosshair size={18} color={BRAND.colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Photos */}
              <Text className="text-sm font-medium text-dark mb-1.5 mt-4">
                Photos (optional, max 10)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
                contentContainerStyle={{ gap: 8 }}
              >
                {photos.map((uri, i) => (
                  <View key={uri} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-border">
                    <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-dark/60 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photos.length < 10 && (
                  <TouchableOpacity
                    onPress={handleAddPhoto}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <ImagePlus size={20} color={BRAND.colors.textMuted} />
                    <Text className="text-[10px] text-text-muted mt-0.5">Add</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text className="text-xl font-bold text-dark mb-2">Budget and timeline</Text>
              <Text className="text-text-secondary mb-5">Help contractors give you accurate bids.</Text>

              <Text className="text-sm font-medium text-dark mb-2">
                <DollarSign size={14} color={BRAND.colors.dark} /> Budget Range
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {BUDGET_RANGES.map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    onPress={() => setBudgetRange(range)}
                    className={`px-4 py-2.5 rounded-xl border ${
                      budgetRange?.label === range.label
                        ? "bg-dark border-dark"
                        : "bg-white border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        budgetRange?.label === range.label ? "text-white" : "text-dark"
                      }`}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-sm font-medium text-dark mb-2">
                <Clock size={14} color={BRAND.colors.dark} /> Timeline
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {TIMELINES.map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTimeline(t)}
                    className={`px-4 py-2.5 rounded-xl border ${
                      timeline === t
                        ? "bg-dark border-dark"
                        : "bg-white border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        timeline === t ? "text-white" : "text-dark"
                      }`}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <Text className="text-red-700 text-sm">{error}</Text>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        {/* Bottom action */}
        <View className="px-5 py-4 bg-white border-t border-border">
          {step < 3 ? (
            <TouchableOpacity
              onPress={() => setStep((s) => (s + 1) as Step)}
              disabled={!canAdvance()}
              className={`flex-row items-center justify-center py-3.5 rounded-xl ${
                canAdvance() ? "bg-brand-600" : "bg-gray-200"
              }`}
              activeOpacity={0.7}
            >
              <Text className={`text-base font-semibold mr-2 ${canAdvance() ? "text-white" : "text-gray-400"}`}>
                Continue
              </Text>
              <ArrowRight size={18} color={canAdvance() ? "#fff" : "#9CA3AF"} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              className="flex-row items-center justify-center py-3.5 rounded-xl bg-brand-600"
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Check size={18} color="#fff" />
                  <Text className="text-white text-base font-semibold ml-2">Post Job</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
