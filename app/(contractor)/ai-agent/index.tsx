import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Brain,
  Send,
  Mic,
  Sparkles,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  mockAiEstimate,
  type AiEstimateResult,
} from "@src/lib/mock-data";
import { BRAND } from "@src/lib/constants";
import { AiEstimateCard } from "@src/components/domain/ai-estimate-card";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  estimateCard?: AiEstimateResult;
}

export default function AiAgentScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "What are we estimating?",
      sender: "ai",
      timestamp: "now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      sender: "user",
      timestamp: "now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: `Here's your estimate for "${userMsg.text}":`,
        sender: "ai",
        timestamp: "now",
        estimateCard: mockAiEstimate,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-dark px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} className="mr-3">
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Brain size={22} color={BRAND.colors.primary} />
            <View className="ml-2">
              <Text className="text-white text-lg font-bold">ConstructionAI</Text>
              <Text className="text-white/50 text-xs">AI Estimation Agent — PRO</Text>
            </View>
          </View>
          <View className="bg-brand-600 px-2.5 py-1">
            <Text className="text-white text-[10px] font-bold">PRO</Text>
          </View>
        </View>
      </View>


      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} className="mb-4">
              {msg.sender === "ai" ? (
                <View className="mr-8">
                  <View className="flex-row items-center mb-1.5">
                    <View className="w-6 h-6 bg-dark items-center justify-center">
                      <Brain size={14} color={BRAND.colors.primary} />
                    </View>
                    <Text className="text-text-muted text-xs ml-2 font-bold">ConstructionAI</Text>
                  </View>
                  <View className="bg-white border border-border p-3" style={{ borderRadius: 0 }}>
                    <Text className="text-dark text-sm leading-5">{msg.text}</Text>
                  </View>
                  {msg.estimateCard && (
                    <View className="mt-3">
                      <AiEstimateCard estimate={msg.estimateCard} />
                    </View>
                  )}
                </View>
              ) : (
                <View className="ml-8">
                  <View className="bg-brand-600 p-3" style={{ borderRadius: 0 }}>
                    <Text className="text-white text-sm">{msg.text}</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {loading && (
            <View className="mr-8 mb-4">
              <View className="flex-row items-center mb-1.5">
                <View className="w-6 h-6 bg-dark items-center justify-center">
                  <Brain size={14} color={BRAND.colors.primary} />
                </View>
                <Text className="text-text-muted text-xs ml-2 font-bold">ConstructionAI</Text>
              </View>
              <View className="bg-white border border-border p-3" style={{ borderRadius: 0 }}>
                <Text className="text-text-muted text-sm">Analyzing scope and generating estimate...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View className="border-t border-border bg-white px-4 py-3 flex-row items-center">
          <TouchableOpacity activeOpacity={0.7} className="relative mr-2">
            <View className="w-11 h-11 bg-gray-100 items-center justify-center" style={{ borderRadius: 0 }}>
              <Mic size={22} color={BRAND.colors.textSecondary} />
            </View>
            <View className="absolute -top-1.5 -right-1.5 bg-brand-600 px-1 py-0.5" style={{ borderRadius: 0 }}>
              <Text className="text-white text-[8px] font-bold">PRO</Text>
            </View>
          </TouchableOpacity>

          <TextInput
            className="flex-1 bg-gray-50 border border-border p-3 text-dark text-sm"
            style={{ borderRadius: 0 }}
            placeholder="Describe a job to estimate..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!loading}
          />

          <TouchableOpacity onPress={sendMessage} activeOpacity={0.7} className="ml-2">
            <View
              className={`w-11 h-11 items-center justify-center ${input.trim() && !loading ? "bg-brand-600" : "bg-gray-200"}`}
              style={{ borderRadius: 0 }}
            >
              <Send size={20} color={input.trim() && !loading ? "#FFFFFF" : BRAND.colors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
