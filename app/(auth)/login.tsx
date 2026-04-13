import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Link, useRouter, Href } from "expo-router";
import { Mail, Lock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";
import { useAuthStore } from "@src/stores/auth";
import { BRAND } from "@src/lib/constants";
import { Input } from "@src/components/ui/input";
import { Button } from "@src/components/ui/button";
import { useToast } from "@src/components/ui/toast";

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function QuickBooksIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <ClipPath id="qb-clip">
          <Rect width="24" height="24" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#qb-clip)">
        <Path
          d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1z"
          fill="#2CA01C"
        />
        <Path
          d="M7.5 8C6.12 8 5 9.12 5 10.5v3C5 14.88 6.12 16 7.5 16H8v-1.5h-.5c-.55 0-1-.45-1-1v-3c0-.55.45-1 1-1H9v7h1.5V8H7.5zM16.5 8H16v1.5h.5c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1H15V8h-1.5v8h3c1.38 0 2.5-1.12 2.5-2.5v-3C19 9.12 17.88 8 16.5 8z"
          fill="#FFFFFF"
        />
      </G>
    </Svg>
  );
}

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
      const user = useAuthStore.getState().user;
      if (user?.role === "homeowner") {
        router.replace("/(homeowner)/(dashboard)" as any);
      } else if (user?.role === "subcontractor") {
        router.replace("/(subcontractor)/(dashboard)" as any);
      } else {
        router.replace("/(contractor)/(dashboard)" as any);
      }
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
        <Animated.View entering={FadeInDown.duration(500).delay(50)} className="mb-8 items-center">
          <View
            className="items-center justify-center mb-5"
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundColor: BRAND.colors.primary,
              boxShadow: "0 8px 24px rgba(196, 30, 58, 0.4), 0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.15)",
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.12)",
                borderBottomColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <Text className="text-white font-bold text-center" style={{ fontSize: 28, letterSpacing: 2, textShadowColor: "rgba(0, 0, 0, 0.25)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>FTW</Text>
            </View>
          </View>
          <Text className="font-bold text-dark text-center" style={{ fontSize: 28 }}>FairTradeWorker</Text>
          <Text className="text-text-muted text-center mt-1" style={{ fontSize: 14 }}>
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
            className="mb-2"
          />

          <View className="items-end mb-4">
            <Link href={"/(auth)/forgot-password" as Href} asChild>
              <TouchableOpacity>
                <Text className="text-brand-600 font-semibold text-sm">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            size="lg"
          />

          {/* OAuth buttons */}
          <View className="mt-4" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toast("info", "Coming Soon", "Google sign-in will be available at launch");
              }}
              className="flex-row items-center justify-center py-3.5 border border-border"
              style={{ borderRadius: 4, backgroundColor: "#FFFFFF" }}
              activeOpacity={0.7}
            >
              <GoogleIcon size={20} />
              <Text className="ml-3 font-semibold text-base" style={{ color: BRAND.colors.textPrimary }}>
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toast("info", "Coming Soon", "Apple sign-in will be available at launch");
              }}
              className="flex-row items-center justify-center py-3.5"
              style={{ borderRadius: 4, backgroundColor: "#000000" }}
              activeOpacity={0.7}
            >
              <AppleIcon size={20} />
              <Text className="ml-3 font-semibold text-base text-white">
                Sign in with Apple
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toast("info", "Coming Soon", "QuickBooks sign-in will be available at launch");
              }}
              className="flex-row items-center justify-center py-3.5"
              style={{ borderRadius: 4, backgroundColor: "#2CA01C" }}
              activeOpacity={0.7}
            >
              <QuickBooksIcon size={20} />
              <Text className="ml-3 font-semibold text-base text-white">
                Sign in with QuickBooks
              </Text>
            </TouchableOpacity>
          </View>

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
