import { useState, useRef, useCallback } from "react";
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
  PanelLeftOpen,
  PanelLeftClose,
  Clock,
  Plus,
  Paperclip,
  HelpCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  mockAiEstimate,
  type AiEstimateResult,
} from "@src/lib/mock-data";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  estimateCard?: AiEstimateResult;
}

interface ConversationSummary {
  id: string;
  title: string;
  date: string;
  estimateAmount: string;
}

const MOCK_HISTORY: ConversationSummary[] = [
  { id: "h1", title: "Kitchen Remodel — 200 sq ft", date: "Mar 28", estimateAmount: "$32,500" },
  { id: "h2", title: "Roof Replacement — 2,400 sq ft", date: "Mar 25", estimateAmount: "$14,200" },
  { id: "h3", title: "Bathroom Tile — 80 sq ft", date: "Mar 22", estimateAmount: "$8,900" },
  { id: "h4", title: "Deck Build — 400 sq ft", date: "Mar 18", estimateAmount: "$18,600" },
  { id: "h5", title: "Electrical Panel Upgrade", date: "Mar 15", estimateAmount: "$6,200" },
];

export default function AiAgentScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);

  function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      text: input.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: `Based on your description, here's the estimate breakdown for "${userMsg.text.slice(0, 40)}..."`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
        estimateCard: mockAiEstimate,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 2000);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="bg-white border-b border-border flex-row items-center px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSidebar} activeOpacity={0.7} className="ml-3">
          {sidebarOpen ? (
            <PanelLeftClose size={22} color={BRAND.colors.textSecondary} />
          ) : (
            <PanelLeftOpen size={22} color={BRAND.colors.textSecondary} />
          )}
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <View className="flex-row items-center">
            <Brain size={20} color={BRAND.colors.primary} />
            <Text className="text-dark font-bold ml-2" style={{ fontSize: 18 }}>ConstructionAI</Text>
          </View>
        </View>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TouchableOpacity onPress={() => router.push("/(contractor)/about-ai" as any)} activeOpacity={0.7}>
            <HelpCircle size={22} color={BRAND.colors.textMuted} />
          </TouchableOpacity>
          <View className="bg-brand-600 px-2 py-0.5">
            <Text className="text-white text-[10px] font-bold">PRO</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View className="flex-1 flex-row">
        {/* Sidebar */}
        {sidebarOpen && (
          <View className="bg-white border-r border-border" style={{ width: 260 }}>
            <TouchableOpacity
              className="mx-3 mt-3 mb-2 border border-border py-2.5 items-center flex-row justify-center"
              activeOpacity={0.7}
              onPress={() => { setMessages([]); }}
            >
              <Plus size={14} color={BRAND.colors.textPrimary} />
              <Text className="text-dark font-bold ml-1.5" style={{ fontSize: 13 }}>New Chat</Text>
            </TouchableOpacity>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {MOCK_HISTORY.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="px-3 py-3 border-b border-border"
                  activeOpacity={0.7}
                >
                  <Text className="text-dark font-bold" style={{ fontSize: 13 }} numberOfLines={1}>{item.title}</Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <View className="flex-row items-center">
                      <Clock size={10} color={BRAND.colors.textMuted} />
                      <Text className="text-text-muted ml-1" style={{ fontSize: 10 }}>{item.date}</Text>
                    </View>
                    <Text className="text-dark font-bold" style={{ fontSize: 12 }}>{item.estimateAmount}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Chat Area */}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 && !loading && (
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 bg-brand-50 items-center justify-center mb-4">
                  <Brain size={32} color={BRAND.colors.primary} />
                </View>
                <Text className="text-dark font-bold" style={{ fontSize: 18 }}>Describe a job</Text>
                <Text className="text-text-muted text-center mt-1 px-8" style={{ fontSize: 14 }}>
                  Tell me what you're estimating and I'll generate a detailed breakdown.
                </Text>
              </View>
            )}

            {messages.map((msg) => (
              <View key={msg.id} className="mb-4">
                {msg.sender === "ai" ? (
                  <View className="mr-8">
                    <View className="flex-row items-center mb-1.5">
                      <View className="w-6 h-6 bg-brand-50 items-center justify-center">
                        <Brain size={14} color={BRAND.colors.primary} />
                      </View>
                      <Text className="text-text-muted text-xs ml-2 font-bold">ConstructionAI</Text>
                    </View>
                    <View className="bg-white border border-border rounded p-3" style={{ borderRadius: 4 }}>
                      <Text className="text-dark text-sm leading-5">{msg.text}</Text>
                    </View>
                    {msg.estimateCard && (
                      <View className="mt-3 -mr-8 bg-white border border-border overflow-hidden" style={{ borderRadius: 4 }}>
                        {/* Accent stripe */}
                        <View style={{ height: 3, backgroundColor: BRAND.colors.primary }} />

                        <View className="p-4">
                          {/* Header */}
                          <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                              <Brain size={16} color={BRAND.colors.primary} />
                              <Text className="text-text-muted font-bold uppercase tracking-wider ml-2" style={{ fontSize: 10 }}>ConstructionAI Estimate</Text>
                            </View>
                            <View className="bg-brand-50 px-2 py-0.5">
                              <Text className="text-brand-600 font-bold" style={{ fontSize: 10 }}>
                                {Math.round(msg.estimateCard.confidence * 100)}%
                              </Text>
                            </View>
                          </View>

                          {/* Job Title */}
                          <Text className="text-dark font-bold mb-3" style={{ fontSize: 17 }}>{msg.estimateCard.jobTitle}</Text>

                          {/* Price Range */}
                          <View className="bg-surface p-4 mb-3">
                            <View className="flex-row items-end justify-between">
                              <View className="items-center flex-1">
                                <Text className="text-text-muted mb-1" style={{ fontSize: 10 }}>Low</Text>
                                <Text className="text-text-secondary font-bold" style={{ fontSize: 16 }}>{formatCurrency(msg.estimateCard.estimateMin)}</Text>
                              </View>
                              <View className="items-center flex-1">
                                <Text className="text-text-muted mb-1" style={{ fontSize: 10 }}>Fair Price</Text>
                                <Text className="font-bold" style={{ fontSize: 26, color: BRAND.colors.primary }}>{formatCurrency(msg.estimateCard.estimateMid)}</Text>
                              </View>
                              <View className="items-center flex-1">
                                <Text className="text-text-muted mb-1" style={{ fontSize: 10 }}>High</Text>
                                <Text className="text-text-secondary font-bold" style={{ fontSize: 16 }}>{formatCurrency(msg.estimateCard.estimateMax)}</Text>
                              </View>
                            </View>
                          </View>

                          {/* Cost Breakdown */}
                          <View className="flex-row mb-3" style={{ gap: 8 }}>
                            <View className="flex-1 border border-border p-3 items-center">
                              <Text className="text-dark font-bold" style={{ fontSize: 14 }}>{formatCurrency(msg.estimateCard.laborCost)}</Text>
                              <Text className="text-text-muted mt-0.5" style={{ fontSize: 10 }}>Labor</Text>
                            </View>
                            <View className="flex-1 border border-border p-3 items-center">
                              <Text className="text-dark font-bold" style={{ fontSize: 14 }}>{formatCurrency(msg.estimateCard.materialCost)}</Text>
                              <Text className="text-text-muted mt-0.5" style={{ fontSize: 10 }}>Materials</Text>
                            </View>
                            <View className="flex-1 border border-border p-3 items-center">
                              <Text className="text-dark font-bold" style={{ fontSize: 14 }}>{formatCurrency(msg.estimateCard.equipmentCost)}</Text>
                              <Text className="text-text-muted mt-0.5" style={{ fontSize: 10 }}>Equipment</Text>
                            </View>
                          </View>

                          {/* Line Items */}
                          <View className="border border-border mb-3">
                            <View className="flex-row bg-surface px-3 py-2 border-b border-border">
                              <Text className="flex-1 text-text-muted font-bold uppercase tracking-wider" style={{ fontSize: 9 }}>Item</Text>
                              <Text className="w-10 text-text-muted font-bold text-right uppercase tracking-wider" style={{ fontSize: 9 }}>Qty</Text>
                              <Text className="w-16 text-text-muted font-bold text-right uppercase tracking-wider" style={{ fontSize: 9 }}>Total</Text>
                            </View>
                            {msg.estimateCard.lineItems.slice(0, 5).map((li, i) => (
                              <View key={i} className={`flex-row px-3 py-2 ${i < Math.min(msg.estimateCard!.lineItems.length, 5) - 1 ? "border-b border-border" : ""}`}>
                                <Text className="flex-1 text-dark" style={{ fontSize: 12 }} numberOfLines={1}>{li.description}</Text>
                                <Text className="w-10 text-text-muted text-right" style={{ fontSize: 12 }}>{li.quantity}</Text>
                                <Text className="w-16 text-dark font-bold text-right" style={{ fontSize: 12 }}>{formatCurrency(li.total)}</Text>
                              </View>
                            ))}
                            {msg.estimateCard.lineItems.length > 5 && (
                              <View className="px-3 py-2 bg-surface">
                                <Text className="text-text-muted" style={{ fontSize: 11 }}>+{msg.estimateCard.lineItems.length - 5} more line items</Text>
                              </View>
                            )}
                          </View>

                          {/* Timeline + Region + Hours */}
                          <View className="flex-row mb-3" style={{ gap: 8 }}>
                            <View className="flex-1 bg-surface p-3">
                              <Text className="text-text-muted" style={{ fontSize: 10 }}>Timeline</Text>
                              <Text className="text-dark font-bold mt-0.5" style={{ fontSize: 13 }}>{msg.estimateCard.timelineWeeks} weeks</Text>
                            </View>
                            <View className="flex-1 bg-surface p-3">
                              <Text className="text-text-muted" style={{ fontSize: 10 }}>Region</Text>
                              <Text className="text-dark font-bold mt-0.5" style={{ fontSize: 13 }}>{msg.estimateCard.regionFactor}x adj.</Text>
                            </View>
                            <View className="flex-1 bg-surface p-3">
                              <Text className="text-text-muted" style={{ fontSize: 10 }}>Labor</Text>
                              <Text className="text-dark font-bold mt-0.5" style={{ fontSize: 13 }}>{msg.estimateCard.laborHours} hrs</Text>
                            </View>
                          </View>

                          {/* Total */}
                          <View className="bg-surface p-4 flex-row items-center justify-between">
                            <Text className="text-dark font-bold" style={{ fontSize: 15 }}>Estimate Total</Text>
                            <Text className="font-bold" style={{ fontSize: 22, color: BRAND.colors.primary }}>{formatCurrency(msg.estimateCard.subtotal)}</Text>
                          </View>
                        </View>

                        {/* Actions */}
                        <View className="flex-row border-t border-border">
                          <TouchableOpacity className="flex-1 py-3.5 items-center border-r border-border" activeOpacity={0.7}>
                            <Text className="text-brand-600 font-bold" style={{ fontSize: 14 }}>Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="flex-1 py-3.5 items-center border-r border-border" activeOpacity={0.7}>
                            <Text className="text-text-secondary font-bold" style={{ fontSize: 14 }}>Send</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="flex-1 py-3.5 items-center" activeOpacity={0.7}>
                            <Text className="text-text-secondary font-bold" style={{ fontSize: 14 }}>PDF</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="ml-8">
                    <View className="bg-brand-50 border border-brand-600 p-3" style={{ borderRadius: 4 }}>
                      <Text className="text-dark text-sm">{msg.text}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {loading && (
              <View className="mr-8 mb-4">
                <View className="flex-row items-center mb-1.5">
                  <View className="w-6 h-6 bg-brand-50 items-center justify-center">
                    <Brain size={14} color={BRAND.colors.primary} />
                  </View>
                  <Text className="text-text-muted text-xs ml-2 font-bold">ConstructionAI</Text>
                </View>
                <View className="bg-white border border-border rounded p-3" style={{ borderRadius: 4 }}>
                  <Text className="text-text-muted text-sm">Analyzing scope and generating estimate...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View className="border-t border-border bg-white px-4 py-3 flex-row items-center">
            <TouchableOpacity activeOpacity={0.7} className="mr-2">
              <View className="w-11 h-11 bg-gray-100 items-center justify-center" style={{ borderRadius: 4 }}>
                <Paperclip size={20} color={BRAND.colors.textSecondary} />
              </View>
            </TouchableOpacity>
            <TextInput
              className="flex-1 bg-gray-50 border border-border p-3 text-dark text-sm"
              style={{ borderRadius: 4 }}
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
                style={{ borderRadius: 4 }}
              >
                <Send size={20} color={input.trim() && !loading ? "#FFFFFF" : BRAND.colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
