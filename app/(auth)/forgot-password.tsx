import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Mail, ArrowLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { forgotPasswordApi } from "@src/api/auth";
import { BRAND } from "@src/lib/constants";
import { Input } from "@src/components/ui/input";
import { Button } from "@src/components/ui/button";
import { useToast } from "@src/components/ui/toast";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast("error", "Missing email", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch {
      // Always show success to avoid leaking whether the email exists
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500).delay(50)} className="mb-8">
          <View
            className="w-12 h-12 bg-brand-600 items-center justify-center mb-6"
            style={{ borderRadius: 4 }}
          >
            <Text className="text-white text-lg font-bold">FTW</Text>
          </View>
          <Text className="font-bold text-dark" style={{ fontSize: 28 }}>
            Reset your password
          </Text>
          <Text className="text-text-muted mt-1" style={{ fontSize: 14 }}>
            Enter your email and we&apos;ll send you a reset link.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(150)}
          className="bg-white border border-border p-6"
          style={{ borderRadius: 4 }}
        >
          {submitted ? (
            <View className="bg-green-50 border border-green-200 p-4" style={{ borderRadius: 4 }}>
              <Text className="text-green-900 text-sm font-semibold mb-1">Check your email</Text>
              <Text className="text-green-800 text-sm">
                If an account exists with that email, we&apos;ve sent a reset link.
              </Text>
            </View>
          ) : (
            <View>
              <Input
                label="Email address"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                icon={Mail}
                className="mb-6"
              />

              <Button
                title="Send Reset Link"
                onPress={handleSubmit}
                loading={isLoading}
                size="lg"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center justify-center mt-6"
            activeOpacity={0.7}
          >
            <ArrowLeft size={16} color={BRAND.colors.primary} />
            <Text className="text-brand-600 font-bold text-sm ml-1.5">
              Back to sign in
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
