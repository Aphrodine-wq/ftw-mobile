import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  PhoneOff,
  Clock,
  FileText,
  ChevronRight,
  Lock,
  Bell,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";
import { formatCurrency } from "@src/lib/utils";
import { useCallEstimateStore, type CallEstimate } from "@src/stores/call-estimates";
import * as Haptics from "expo-haptics";

const PROCESSING_CALL: CallEstimate = {
  id: "ce0",
  title: "Processing...",
  description: "Your estimate is being generated from the call recording.",
  low: 0,
  high: 0,
  mid: 0,
  timeline: "",
  calledAt: "Just now",
  duration: "2:03",
  status: "processing",
};

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CallAgentScreen() {
  const router = useRouter();
  const [isPro] = useState(true); // TODO: subscription state
  const [isOnCall, setIsOnCall] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const estimates = useCallEstimateStore((s) => s.estimates);
  const addEstimate = useCallEstimateStore((s) => s.add);

  // Live call timer
  useEffect(() => {
    if (isOnCall) {
      setCallSeconds(0);
      timerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOnCall]);

  const startCall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsOnCall(true);
    // In production: Twilio SDK initiates call to AI agent
    // No timeout — user hangs up when done, even after 20+ minutes
  }, []);

  const endCall = useCallback(() => {
    const duration = formatTimer(callSeconds);
    setIsOnCall(false);

    // Add processing estimate with real call duration
    const processingEntry: CallEstimate = {
      ...PROCESSING_CALL,
      duration,
      calledAt: "Just now",
    };
    addEstimate(processingEntry);

    // Simulate AI processing the recording (30-60 seconds in production)
    setTimeout(() => {
      const { remove, add } = useCallEstimateStore.getState();
      remove("ce0");
      add({
        id: `ce-${Date.now()}`,
        title: "Deck Build — 400 sq ft",
        description: "Pressure-treated framing, composite decking, railing, stairs",
        low: 14800,
        high: 22000,
        mid: 18600,
        timeline: "2-3 weeks",
        duration,
        calledAt: "Just now",
        status: "ready",
      });
    }, 5000);
  }, [callSeconds]);

  const goToPro = useCallback(() => {
    router.push("/(contractor)/pro" as any);
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-border flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ position: "absolute", left: 16, zIndex: 1 }}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <View className="flex-row items-center">
            <Phone size={20} color={BRAND.colors.primary} />
            <Text className="text-dark font-bold ml-2" style={{ fontSize: 18 }}>Call Agent</Text>
          </View>
        </View>
        <View className="bg-brand-600 px-2 py-0.5" style={{ position: "absolute", right: 16 }}>
          <Text className="text-white text-[10px] font-bold">PRO</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {!isPro ? (
          /* Pro Gate */
          <View className="items-center px-6 pt-12">
            <View className="w-20 h-20 bg-surface items-center justify-center mb-4">
              <Lock size={36} color={BRAND.colors.textMuted} />
            </View>
            <Text className="text-dark font-bold text-center" style={{ fontSize: 22 }}>Unlock Call Agent</Text>
            <Text className="text-text-muted text-center mt-2 px-4" style={{ fontSize: 15, lineHeight: 22 }}>
              Call in estimates from the job site. Describe what you see, hang up, and get a full estimate in the app.
            </Text>
            <TouchableOpacity className="bg-brand-600 px-10 py-3.5 mt-5" activeOpacity={0.8} onPress={goToPro}>
              <Text className="text-white font-bold" style={{ fontSize: 16 }}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
        ) : isOnCall ? (
          /* Active Call */
          <View className="items-center px-6 pt-10">
            <View className="w-28 h-28 bg-brand-600 items-center justify-center mb-5" style={{ borderRadius: 64 }}>
              <PhoneCall size={48} color="#FFFFFF" />
            </View>

            {/* Live Timer */}
            <Text className="text-dark font-bold" style={{ fontSize: 36 }}>{formatTimer(callSeconds)}</Text>
            <Text className="text-text-muted mt-1" style={{ fontSize: 15 }}>On the line</Text>

            <View className="flex-row items-center mt-4 bg-surface px-4 py-2">
              <View className="w-2 h-2 bg-brand-600" style={{ borderRadius: 1 }} />
              <Text className="text-text-muted font-bold ml-2" style={{ fontSize: 13 }}>Recording</Text>
            </View>

            <Text className="text-text-muted text-center mt-5 px-4" style={{ fontSize: 14, lineHeight: 20 }}>
              Describe the job — scope, size, materials, condition. Take your time. No time limit.
            </Text>

            <TouchableOpacity
              className="bg-red-500 px-10 py-4 mt-6 flex-row items-center"
              activeOpacity={0.8}
              onPress={endCall}
            >
              <PhoneOff size={20} color="#FFFFFF" />
              <Text className="text-white font-bold ml-2" style={{ fontSize: 17 }}>Hang Up</Text>
            </TouchableOpacity>
            <Text className="text-text-muted mt-3" style={{ fontSize: 13 }}>Estimate generates ~30 seconds after you hang up.</Text>
          </View>
        ) : (
          /* Default — Call CTA + History */
          <>
            {/* Call Section */}
            <View className="items-center px-6 pt-8 pb-6">
              <TouchableOpacity
                className="w-28 h-28 bg-brand-600 items-center justify-center mb-5"
                style={{ borderRadius: 64 }}
                activeOpacity={0.8}
                onPress={startCall}
              >
                <Phone size={48} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-dark font-bold" style={{ fontSize: 22 }}>Call for an Estimate</Text>
              <Text className="text-text-muted text-center mt-2 px-4" style={{ fontSize: 15, lineHeight: 22 }}>
                Tap to call. Describe the job. Hang up. Your estimate shows up here.
              </Text>
            </View>

            {/* Estimates */}
            {estimates.length > 0 && (
              <View className="px-6">
                <Text className="text-text-muted font-bold uppercase tracking-wider mb-3" style={{ fontSize: 10 }}>Your Estimates</Text>
                {estimates.map((est) => (
                  <TouchableOpacity
                    key={est.id}
                    className="bg-white border border-border mb-3"
                    activeOpacity={0.7}
                    disabled={est.status === "processing"}
                  >
                    {est.status === "processing" ? (
                      <View className="p-4">
                        <View className="flex-row items-center">
                          <View className="w-2 h-2 bg-brand-600 mr-2" style={{ borderRadius: 1 }} />
                          <Text className="text-brand-600 font-bold" style={{ fontSize: 14 }}>Processing call...</Text>
                        </View>
                        <Text className="text-text-muted mt-1" style={{ fontSize: 13 }}>Your estimate will appear here shortly.</Text>
                        <View className="flex-row items-center mt-2">
                          <Clock size={12} color={BRAND.colors.textMuted} />
                          <Text className="text-text-muted ml-1" style={{ fontSize: 12 }}>{est.calledAt} — {est.duration} call</Text>
                        </View>
                      </View>
                    ) : (
                      <View className="p-4">
                        <Text className="text-dark font-bold mb-1" style={{ fontSize: 15 }} numberOfLines={1}>{est.title}</Text>
                        <Text className="text-text-muted mb-3" style={{ fontSize: 13 }} numberOfLines={1}>{est.description}</Text>

                        <View className="flex-row items-center bg-surface p-3 mb-3">
                          <View className="flex-1 items-center border-r border-border">
                            <Text className="text-text-muted" style={{ fontSize: 10 }}>Low</Text>
                            <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{formatCurrency(est.low)}</Text>
                          </View>
                          <View className="flex-1 items-center border-r border-border">
                            <Text className="text-text-muted" style={{ fontSize: 10 }}>Fair Price</Text>
                            <Text className="font-bold" style={{ fontSize: 17, color: BRAND.colors.primary }}>{formatCurrency(est.mid)}</Text>
                          </View>
                          <View className="flex-1 items-center">
                            <Text className="text-text-muted" style={{ fontSize: 10 }}>High</Text>
                            <Text className="text-dark font-bold" style={{ fontSize: 15 }}>{formatCurrency(est.high)}</Text>
                          </View>
                        </View>

                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center">
                            <Clock size={12} color={BRAND.colors.textMuted} />
                            <Text className="text-text-muted ml-1" style={{ fontSize: 12 }}>{est.calledAt}</Text>
                          </View>
                          <Text className="text-text-muted" style={{ fontSize: 12 }}>{est.duration} call — {est.timeline}</Text>
                        </View>

                        <View className="flex-row" style={{ gap: 8 }}>
                          <TouchableOpacity
                            className="flex-1 bg-brand-600 py-2.5 items-center"
                            activeOpacity={0.8}
                            onPress={() => router.push(`/(contractor)/call-estimate?id=${est.id}` as any)}
                          >
                            <Text className="text-white font-bold" style={{ fontSize: 13 }}>Send to Client</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="flex-1 border border-border py-2.5 items-center"
                            activeOpacity={0.7}
                            onPress={() => router.push(`/(contractor)/call-estimate?id=${est.id}` as any)}
                          >
                            <Text className="text-dark font-bold" style={{ fontSize: 13 }}>View Estimate</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
