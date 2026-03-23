import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { useAuthStore } from "@src/stores/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err instanceof Error ? err.message : "Invalid email or password"
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-brand-600 items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">FTW</Text>
          </View>
          <Text className="text-2xl font-bold text-dark">FairTradeWorker</Text>
          <Text className="text-text-secondary mt-1">
            The fair way to find and hire contractors
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-semibold text-dark mb-4">Sign In</Text>

          <View className="mb-4">
            <Text className="text-sm font-medium text-text-secondary mb-1.5">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="border border-border rounded-xl px-4 py-3 text-dark bg-surface"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-text-secondary mb-1.5">
              Password
            </Text>
            <View className="flex-row items-center border border-border rounded-xl bg-surface">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                className="flex-1 px-4 py-3 text-dark"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="px-4"
              >
                <Text className="text-brand-600 text-sm font-medium">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-brand-600 rounded-xl py-3.5 items-center"
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Social auth buttons — disabled until Phase 3 */}
          <View className="mt-6">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-text-muted text-sm">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <TouchableOpacity
              disabled
              className="border border-border rounded-xl py-3 items-center mb-3 opacity-40"
            >
              <Text className="text-dark font-medium">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled
              className="border border-border rounded-xl py-3 items-center mb-3 opacity-40"
            >
              <Text className="text-dark font-medium">
                Continue with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled
              className="border border-border rounded-xl py-3 items-center opacity-40"
            >
              <Text className="text-dark font-medium">
                Sign in with Phone
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign up link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-text-secondary">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-brand-600 font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
