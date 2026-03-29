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
import { useAuthStore } from "@src/stores/auth";

type Role = "homeowner" | "contractor";

export default function SignupScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const { register, isLoading } = useAuthStore();

  const handleSignup = async () => {
    if (!role || !name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
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
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="items-center mb-8 mt-12">
          <View
            className="w-16 h-16 bg-brand-600 items-center justify-center mb-4"
            style={{ borderRadius: 0 }}
          >
            <Text className="text-white text-2xl font-bold">FTW</Text>
          </View>
          <Text className="text-2xl font-bold text-dark">Create Account</Text>
          <Text className="text-text-secondary mt-1">
            Step {step} of 2
          </Text>
        </View>

        {/* Step indicator */}
        <View className="flex-row mb-6 gap-2">
          <View className="flex-1 h-1 bg-brand-600" />
          <View
            className={`flex-1 h-1 ${step === 2 ? "bg-brand-600" : "bg-border"}`}
          />
        </View>

        {step === 1 ? (
          /* Step 1: Role picker */
          <View>
            <Text className="text-lg font-bold text-dark mb-4">
              I am a...
            </Text>

            <TouchableOpacity
              onPress={() => setRole("homeowner")}
              className={`border-2 p-5 mb-3 ${
                role === "homeowner"
                  ? "border-brand-600 bg-brand-50"
                  : "border-border bg-white"
              }`}
              style={{ borderRadius: 0 }}
            >
              <Text className="text-lg font-bold text-dark">
                Homeowner
              </Text>
              <Text className="text-text-secondary mt-1">
                I need to hire contractors for home projects
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole("contractor")}
              className={`border-2 p-5 mb-6 ${
                role === "contractor"
                  ? "border-brand-600 bg-brand-50"
                  : "border-border bg-white"
              }`}
              style={{ borderRadius: 0 }}
            >
              <Text className="text-lg font-bold text-dark">
                Contractor
              </Text>
              <Text className="text-text-secondary mt-1">
                I want to find jobs and grow my business
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => role && setStep(2)}
              disabled={!role}
              className={`py-3.5 items-center ${
                role ? "bg-brand-600" : "bg-border"
              }`}
              style={{ borderRadius: 0 }}
              activeOpacity={0.8}
            >
              <Text
                className={`font-bold text-base ${
                  role ? "text-white" : "text-text-muted"
                }`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Step 2: Details form */
          <View
            className="bg-white border border-border p-6"
            style={{ borderRadius: 0 }}
          >
            <Text className="text-lg font-bold text-dark mb-4">
              Your Details
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-bold text-text-secondary mb-1.5">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={
                  role === "contractor" ? "Company or your name" : "Your name"
                }
                className="border border-border px-4 py-3 text-dark bg-surface"
                style={{ borderRadius: 0 }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-bold text-text-secondary mb-1.5">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="border border-border px-4 py-3 text-dark bg-surface"
                style={{ borderRadius: 0 }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-bold text-text-secondary mb-1.5">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Min 8 characters"
                secureTextEntry
                className="border border-border px-4 py-3 text-dark bg-surface"
                style={{ borderRadius: 0 }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-text-secondary mb-1.5">
                Location
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City, State"
                className="border border-border px-4 py-3 text-dark bg-surface"
                style={{ borderRadius: 0 }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              className="bg-brand-600 py-3.5 items-center mb-3"
              style={{ borderRadius: 0 }}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep(1)}
              className="items-center py-2"
            >
              <Text className="text-text-secondary font-bold">Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Login link */}
        <View className="flex-row justify-center mt-6 mb-8">
          <Text className="text-text-secondary">Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-brand-600 font-bold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
