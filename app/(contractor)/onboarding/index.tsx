import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import {
  Building2,
  FileText,
  Shield,
  CheckCircle2,
  Camera,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";
import {
  useVerificationStatus,
  useSubmitVerification,
  useUploadLicense,
  useUploadInsurance,
} from "@src/api/hooks";

type OnboardingStep = 1 | 2 | 3 | 4;

const STEPS = [
  { label: "Business", icon: Building2 },
  { label: "License", icon: FileText },
  { label: "Insurance", icon: Shield },
  { label: "Confirm", icon: CheckCircle2 },
];

export default function ContractorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);

  // Business info
  const [businessName, setBusinessName] = useState("");
  const [ein, setEin] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [serviceArea, setServiceArea] = useState("");

  // License
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  // Insurance
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [insurancePhoto, setInsurancePhoto] = useState<string | null>(null);

  const { data: verificationStatus } = useVerificationStatus();
  const submitVerification = useSubmitVerification();
  const uploadLicense = useUploadLicense();
  const uploadInsurance = useUploadInsurance();

  const isSubmitting = submitVerification.isPending || uploadLicense.isPending || uploadInsurance.isPending;

  const pickImage = useCallback(async (type: "license" | "insurance") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need camera roll access to upload documents.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === "license") {
        setLicensePhoto(result.assets[0].uri);
      } else {
        setInsurancePhoto(result.assets[0].uri);
      }
    }
  }, []);

  const takePhoto = useCallback(async (type: "license" | "insurance") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need camera access to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === "license") {
        setLicensePhoto(result.assets[0].uri);
      } else {
        setInsurancePhoto(result.assets[0].uri);
      }
    }
  }, []);

  const handleSubmitStep = useCallback(async () => {
    if (step === 1) {
      if (!businessName.trim()) {
        Alert.alert("Required", "Business name is required.");
        return;
      }
      try {
        await submitVerification.mutateAsync({
          step: "business_info",
          data: {
            businessName: businessName.trim(),
            ein: ein.trim(),
            yearsInBusiness: parseInt(yearsInBusiness) || 0,
            serviceArea: serviceArea.trim(),
          },
        });
        setStep(2);
      } catch {
        Alert.alert("Error", "Failed to save business info.");
      }
    } else if (step === 2) {
      if (!licenseNumber.trim()) {
        Alert.alert("Required", "License number is required.");
        return;
      }

      try {
        // Upload license photo if present
        if (licensePhoto) {
          const formData = new FormData();
          formData.append("file", {
            uri: licensePhoto,
            type: "image/jpeg",
            name: "license.jpg",
          } as any);
          formData.append("licenseNumber", licenseNumber.trim());
          formData.append("state", licenseState.trim());
          formData.append("expiry", licenseExpiry.trim());
          await uploadLicense.mutateAsync(formData);
        } else {
          await submitVerification.mutateAsync({
            step: "license",
            data: {
              licenseNumber: licenseNumber.trim(),
              state: licenseState.trim(),
              expiry: licenseExpiry.trim(),
            },
          });
        }
        setStep(3);
      } catch {
        Alert.alert("Error", "Failed to save license info.");
      }
    } else if (step === 3) {
      try {
        if (insurancePhoto) {
          const formData = new FormData();
          formData.append("file", {
            uri: insurancePhoto,
            type: "image/jpeg",
            name: "insurance.jpg",
          } as any);
          formData.append("provider", insuranceProvider.trim());
          formData.append("policyNumber", policyNumber.trim());
          formData.append("coverageAmount", coverageAmount.trim());
          formData.append("expiry", insuranceExpiry.trim());
          await uploadInsurance.mutateAsync(formData);
        } else {
          await submitVerification.mutateAsync({
            step: "insurance",
            data: {
              provider: insuranceProvider.trim(),
              policyNumber: policyNumber.trim(),
              coverageAmount: parseInt(coverageAmount) || 0,
              expiry: insuranceExpiry.trim(),
            },
          });
        }
        setStep(4);
      } catch {
        Alert.alert("Error", "Failed to save insurance info.");
      }
    }
  }, [step, businessName, ein, yearsInBusiness, serviceArea, licenseNumber, licenseState, licenseExpiry, licensePhoto, insuranceProvider, policyNumber, coverageAmount, insuranceExpiry, insurancePhoto, submitVerification, uploadLicense, uploadInsurance]);

  const overallStatus = verificationStatus?.overallStatus || "incomplete";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ marginRight: 12 }}>
          <ChevronLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Business Verification</Text>
      </View>

      {/* Progress Steps */}
      <View style={st.stepsRow}>
        {STEPS.map((s, i) => {
          const stepNum = (i + 1) as OnboardingStep;
          const active = step === stepNum;
          const done = step > stepNum;
          const Icon = s.icon;
          return (
            <View key={i} style={st.stepItem}>
              <View style={[st.stepCircle, active && st.stepCircleActive, done && st.stepCircleDone]}>
                <Icon size={16} color={active || done ? "#FFFFFF" : BRAND.colors.textMuted} />
              </View>
              <Text style={[st.stepLabel, active && { color: BRAND.colors.primary, fontWeight: "700" }]}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Step 1: Business Info */}
        {step === 1 && (
          <View>
            <Text style={st.sectionTitle}>Business Information</Text>
            <Text style={st.sectionSub}>Tell us about your contracting business.</Text>

            <Text style={st.label}>Business Name *</Text>
            <TextInput style={st.input} value={businessName} onChangeText={setBusinessName} placeholder="e.g. Smith Construction LLC" placeholderTextColor={BRAND.colors.textMuted} />

            <Text style={st.label}>EIN (optional)</Text>
            <TextInput style={st.input} value={ein} onChangeText={setEin} placeholder="XX-XXXXXXX" placeholderTextColor={BRAND.colors.textMuted} keyboardType="number-pad" />

            <Text style={st.label}>Years in Business</Text>
            <TextInput style={st.input} value={yearsInBusiness} onChangeText={setYearsInBusiness} placeholder="e.g. 12" placeholderTextColor={BRAND.colors.textMuted} keyboardType="number-pad" />

            <Text style={st.label}>Service Area</Text>
            <TextInput style={st.input} value={serviceArea} onChangeText={setServiceArea} placeholder="e.g. Austin, TX metro" placeholderTextColor={BRAND.colors.textMuted} />
          </View>
        )}

        {/* Step 2: License */}
        {step === 2 && (
          <View>
            <Text style={st.sectionTitle}>Contractor License</Text>
            <Text style={st.sectionSub}>Provide your license details and upload a photo.</Text>

            <Text style={st.label}>License Number *</Text>
            <TextInput style={st.input} value={licenseNumber} onChangeText={setLicenseNumber} placeholder="e.g. R21909" placeholderTextColor={BRAND.colors.textMuted} />

            <Text style={st.label}>State</Text>
            <TextInput style={st.input} value={licenseState} onChangeText={setLicenseState} placeholder="e.g. MS" placeholderTextColor={BRAND.colors.textMuted} autoCapitalize="characters" />

            <Text style={st.label}>Expiration Date</Text>
            <TextInput style={st.input} value={licenseExpiry} onChangeText={setLicenseExpiry} placeholder="MM/DD/YYYY" placeholderTextColor={BRAND.colors.textMuted} />

            <Text style={st.label}>License Photo</Text>
            {licensePhoto ? (
              <View style={{ marginBottom: 16 }}>
                <Image source={{ uri: licensePhoto }} style={st.photoPreview} contentFit="cover" />
                <TouchableOpacity onPress={() => setLicensePhoto(null)} style={st.removePhoto}>
                  <Text style={{ color: BRAND.colors.primary, fontSize: 13, fontWeight: "600" }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={st.photoButtons}>
                <TouchableOpacity style={st.photoBtn} onPress={() => takePhoto("license")} activeOpacity={0.7}>
                  <Camera size={18} color={BRAND.colors.textSecondary} />
                  <Text style={st.photoBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.photoBtn} onPress={() => pickImage("license")} activeOpacity={0.7}>
                  <FileText size={18} color={BRAND.colors.textSecondary} />
                  <Text style={st.photoBtnText}>Choose File</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Insurance */}
        {step === 3 && (
          <View>
            <Text style={st.sectionTitle}>Insurance</Text>
            <Text style={st.sectionSub}>General liability insurance details.</Text>

            <Text style={st.label}>Insurance Provider</Text>
            <TextInput style={st.input} value={insuranceProvider} onChangeText={setInsuranceProvider} placeholder="e.g. State Farm" placeholderTextColor={BRAND.colors.textMuted} />

            <Text style={st.label}>Policy Number</Text>
            <TextInput style={st.input} value={policyNumber} onChangeText={setPolicyNumber} placeholder="Policy number" placeholderTextColor={BRAND.colors.textMuted} />

            <Text style={st.label}>Coverage Amount</Text>
            <TextInput style={st.input} value={coverageAmount} onChangeText={setCoverageAmount} placeholder="e.g. 1000000" placeholderTextColor={BRAND.colors.textMuted} keyboardType="number-pad" />

            <Text style={st.label}>Expiration Date</Text>
            <TextInput style={st.input} value={insuranceExpiry} onChangeText={setInsuranceExpiry} placeholder="MM/DD/YYYY" placeholderTextColor={BRAND.colors.textMuted} />

            <Text style={st.label}>Proof of Insurance</Text>
            {insurancePhoto ? (
              <View style={{ marginBottom: 16 }}>
                <Image source={{ uri: insurancePhoto }} style={st.photoPreview} contentFit="cover" />
                <TouchableOpacity onPress={() => setInsurancePhoto(null)} style={st.removePhoto}>
                  <Text style={{ color: BRAND.colors.primary, fontSize: 13, fontWeight: "600" }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={st.photoButtons}>
                <TouchableOpacity style={st.photoBtn} onPress={() => takePhoto("insurance")} activeOpacity={0.7}>
                  <Camera size={18} color={BRAND.colors.textSecondary} />
                  <Text style={st.photoBtnText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.photoBtn} onPress={() => pickImage("insurance")} activeOpacity={0.7}>
                  <FileText size={18} color={BRAND.colors.textSecondary} />
                  <Text style={st.photoBtnText}>Choose File</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <CheckCircle2 size={64} color="#059669" />
            <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary, marginTop: 16 }}>
              Submitted for Review
            </Text>
            <Text style={{ fontSize: 15, color: BRAND.colors.textSecondary, textAlign: "center", marginTop: 8, lineHeight: 22 }}>
              Your business information, license, and insurance have been submitted.
              We will verify your credentials and notify you once approved.
            </Text>

            <View style={st.statusCard}>
              <Text style={st.statusLabel}>Verification Status</Text>
              <View style={st.statusRow}>
                <View style={[st.statusDot, { backgroundColor: overallStatus === "verified" ? "#059669" : "#D97706" }]} />
                <Text style={st.statusText}>
                  {overallStatus === "verified" ? "Verified" : overallStatus === "pending_review" ? "Under Review" : "Pending"}
                </Text>
              </View>

              <View style={st.checkRow}>
                <CheckCircle2 size={16} color={businessName ? "#059669" : BRAND.colors.border} />
                <Text style={st.checkText}>Business Information</Text>
              </View>
              <View style={st.checkRow}>
                <CheckCircle2 size={16} color={licenseNumber ? "#059669" : BRAND.colors.border} />
                <Text style={st.checkText}>Contractor License</Text>
              </View>
              <View style={st.checkRow}>
                <CheckCircle2 size={16} color={insuranceProvider ? "#059669" : BRAND.colors.border} />
                <Text style={st.checkText}>Insurance</Text>
              </View>
            </View>

            <TouchableOpacity
              style={st.doneBtn}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Navigation */}
        {step < 4 && (
          <View style={st.navRow}>
            {step > 1 && (
              <TouchableOpacity style={st.backBtn} onPress={() => setStep((step - 1) as OnboardingStep)} activeOpacity={0.7}>
                <ArrowLeft size={18} color={BRAND.colors.dark} />
                <Text style={{ color: BRAND.colors.dark, fontWeight: "600", marginLeft: 8 }}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[st.nextBtn, isSubmitting && { backgroundColor: BRAND.colors.border }]}
              onPress={handleSubmitStep}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
                    {step === 3 ? "Submit" : "Continue"}
                  </Text>
                  <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BRAND.colors.border, backgroundColor: "#FFFFFF" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary },
  stepsRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, paddingHorizontal: 20, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: BRAND.colors.border },
  stepItem: { alignItems: "center" },
  stepCircle: { width: 36, height: 36, borderRadius: 4, backgroundColor: BRAND.colors.bgSoft, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  stepCircleActive: { backgroundColor: BRAND.colors.primary },
  stepCircleDone: { backgroundColor: "#059669" },
  stepLabel: { fontSize: 11, color: BRAND.colors.textMuted, fontWeight: "500" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: BRAND.colors.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 14, color: BRAND.colors.textSecondary, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "700", color: BRAND.colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BRAND.colors.border, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: BRAND.colors.textPrimary },
  photoButtons: { flexDirection: "row", gap: 12, marginBottom: 16 },
  photoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BRAND.colors.border, borderRadius: 4, paddingVertical: 14 },
  photoBtnText: { fontSize: 14, color: BRAND.colors.textSecondary, fontWeight: "500", marginLeft: 8 },
  photoPreview: { width: "100%", height: 200, borderRadius: 4, marginBottom: 8 },
  removePhoto: { alignSelf: "flex-start" },
  navRow: { flexDirection: "row", marginTop: 24, gap: 12 },
  backBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: BRAND.colors.border, borderRadius: 4, paddingVertical: 14, paddingHorizontal: 20 },
  nextBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: BRAND.colors.primary, borderRadius: 4, paddingVertical: 14 },
  statusCard: { width: "100%", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BRAND.colors.border, borderRadius: 4, padding: 20, marginTop: 24 },
  statusLabel: { fontSize: 14, fontWeight: "700", color: BRAND.colors.textSecondary, marginBottom: 12 },
  statusRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 16, fontWeight: "600", color: BRAND.colors.textPrimary },
  checkRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkText: { fontSize: 14, color: BRAND.colors.textSecondary, marginLeft: 8 },
  doneBtn: { width: "100%", backgroundColor: BRAND.colors.primary, borderRadius: 4, paddingVertical: 16, alignItems: "center", marginTop: 24 },
});
