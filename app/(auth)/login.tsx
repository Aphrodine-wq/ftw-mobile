import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Link, useRouter } from "expo-router";
import { Mail, Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "@src/stores/auth";
import { BRAND } from "@src/lib/constants";
import { Input } from "@src/components/ui/input";
import { Button } from "@src/components/ui/button";
import { useToast } from "@src/components/ui/toast";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  const demoAs = (role: "contractor" | "homeowner" | "subcontractor") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const demoUsers = {
      contractor: { name: "Marcus Johnson", email: "marcus@johnsonsons.com" },
      homeowner: { name: "Michael Brown", email: "michael@brown.com" },
      subcontractor: { name: "Jake Wilson", email: "jake@wilsonelectric.com" },
    };
    const demoUser = demoUsers[role];
    useAuthStore.setState({
      token: "demo-token",
      user: {
        id: "demo-1",
        email: demoUser.email,
        name: demoUser.name,
        role,
      },
      isAuthenticated: true,
      isHydrated: true,
    });
    toast("success", `Signed in as ${demoUser.name}`);
    if (role === "homeowner") {
      router.replace("/(homeowner)/(dashboard)" as any);
    } else if (role === "subcontractor") {
      router.replace("/(subcontractor)/(dashboard)" as any);
    } else {
      router.replace("/(contractor)/(dashboard)" as any);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast("error", "Missing fields", "Please enter email and password");
      return;
    }

    try {
      await login(email.trim(), password);
      toast("success", "Welcome back!");
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast(
        "error",
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
        <Animated.View entering={FadeInDown.duration(500).delay(50)} className="mb-8">
          <View className="flex-row items-center mb-6">
            <View
              className="w-12 h-12 bg-brand-600 items-center justify-center"
              style={{ borderRadius: 4 }}
            >
              <Text className="text-white text-lg font-bold">FTW</Text>
            </View>
          </View>
          <Text className="text-2xl font-bold text-dark">Sign In</Text>
          <Text className="text-text-muted text-sm mt-1">
            {BRAND.tagline}
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(150)}
          className="bg-white border border-border rounded p-6"
          style={{ borderRadius: 4 }}
        >
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon={Mail}
            className="mb-4"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            icon={Lock}
            className="mb-6"
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
          />

          {/* Demo buttons */}
          <View className="mt-6">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-text-muted text-sm">or try a demo</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <Button
              title="Demo as Contractor"
              onPress={() => demoAs("contractor")}
              variant="outline"
              className="mb-3 border-dark"
            />

            <Button
              title="Demo as Homeowner"
              onPress={() => demoAs("homeowner")}
              variant="outline"
              className="mb-3 border-dark"
            />

            <Button
              title="Demo as Subcontractor"
              onPress={() => demoAs("subcontractor")}
              variant="outline"
              className="border-dark"
            />
          </View>
        </Animated.View>

        {/* Sign up link */}
        <Animated.View entering={FadeInDown.duration(500).delay(250)} className="flex-row justify-center mt-6">
          <Text className="text-text-secondary">
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text className="text-brand-600 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>

        {/* Welcome link */}
        <View className="items-center mt-3 mb-6">
          <Link href="/(auth)/welcome" asChild>
            <TouchableOpacity>
              <Text className="text-text-muted text-sm">
                First time? See what FairTradeWorker is about
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
