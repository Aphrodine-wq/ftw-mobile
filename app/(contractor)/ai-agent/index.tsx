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
import { type AiEstimateResult } from "@src/lib/mock-data";
import { aiChatStream, getAIEstimate } from "@src/api/client";
import { formatCurrency, formatDate } from "@src/lib/utils";
import { BRAND } from "@src/lib/constants";
import { pickImage } from "@src/lib/image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Image, ActionSheetIOS } from "react-native";
import { FileText as FileIcon } from "lucide-react-native";

interface Attachment {
  uri: string;
  name: string;
  type: "image" | "file";
  mimeType?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  estimateCard?: AiEstimateResult;
  attachment?: Attachment;
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
  const [attached, setAttached] = useState<Attachment | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);

  function handleAttach() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Photo Library", "File"], cancelButtonIndex: 0 },
        async (index) => {
          if (index === 1) {
            const uri = await pickImage();
            if (uri) setAttached({ uri, name: uri.split("/").pop() || "photo.jpg", type: "image" });
          } else if (index === 2) {
            const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
            if (!result.canceled && result.assets.length > 0) {
              const asset = result.assets[0];
              const isImage = asset.mimeType?.startsWith("image/");
              setAttached({ uri: asset.uri, name: asset.name, type: isImage ? "image" : "file", mimeType: asset.mimeType || undefined });
            }
          }
        }
      );
    } else {
      // Android — go straight to document picker which handles both
      DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true }).then((result) => {
        if (!result.canceled && result.assets.length > 0) {
          const asset = result.assets[0];
          const isImage = asset.mimeType?.startsWith("image/");
          setAttached({ uri: asset.uri, name: asset.name, type: isImage ? "image" : "file", mimeType: asset.mimeType || undefined });
        }
      });
    }
  }

  function sendMessage() {
    if ((!input.trim() && !attached) || loading) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      text: input.trim() || (attached ? `Attached ${attached.name}` : ""),
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
      attachment: attached || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttached(null);
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const aiMsgId = `ai-${Date.now()}`;

    // Detect estimate requests
    const estimateKeywords = ["estimate", "cost", "price", "how much", "bid", "quote", "remodel", "build", "install", "replace", "renovation", "repair"];
    const isEstimate = estimateKeywords.some((kw) => userMsg.text.toLowerCase().includes(kw));

    if (isEstimate) {
      // Show loading message then call estimate endpoint
      const loadingMsg: ChatMessage = {
        id: aiMsgId,
        text: "Generating your estimate...",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, loadingMsg]);

      getAIEstimate(userMsg.text)
        .then((result) => {
          // Response is nested: result.estimate.response has the full JSON string
          const wrapper = result.estimate || {};
          let est: any = {};
          if (wrapper.response) {
            try {
              est = JSON.parse(wrapper.response);
            } catch {
              // JSON might be truncated -- extract line_items array manually
              const match = wrapper.response.match(/"line_items"\s*:\s*\[([\s\S]*)/);
              if (match) {
                // Find complete objects in the array
                const items: any[] = [];
                const regex = /\{[^}]+\}/g;
                let m;
                while ((m = regex.exec(match[1])) !== null) {
                  try { items.push(JSON.parse(m[0])); } catch {}
                }
                // Extract other fields from the truncated JSON
                const typeMatch = wrapper.response.match(/"project_type"\s*:\s*"([^"]+)"/);
                const locMatch = wrapper.response.match(/"location"\s*:\s*"([^"]+)"/);
                const sqftMatch = wrapper.response.match(/"sqft"\s*:\s*(\d+)/);
                est = {
                  project_type: typeMatch?.[1] || "Construction Project",
                  location: locMatch?.[1] || "",
                  sqft: sqftMatch ? parseInt(sqftMatch[1]) : 0,
                  line_items: items,
                };
              }
            }
          }
          if (!est.line_items && wrapper.line_items) {
            est = wrapper;
          }

          const lineItems = (est.line_items || []).map((li: any) => ({
            description: li.description || "",
            quantity: li.quantity || 0,
            unit: li.unit || "LS",
            unitCost: li.unit_cost || 0,
            total: li.total || 0,
          }));

          const subtotal = est.subtotal || lineItems.reduce((s: number, li: any) => s + li.total, 0);
          const overhead = est.overhead || subtotal * 0.10;
          const profit = est.profit || subtotal * 0.15;
          const contingency = est.contingency || subtotal * 0.05;
          const total = est.total || subtotal + overhead + profit + contingency;

          const estimateCard: AiEstimateResult = {
            id: est.estimate_number || aiMsgId,
            jobTitle: est.project_type || userMsg.text.slice(0, 50),
            estimateMin: total * 0.85,
            estimateMax: total * 1.15,
            estimateMid: total,
            confidence: 0.78,
            laborHours: est.labor_hours || Math.round(subtotal / 65),
            laborCost: est.labor_cost || subtotal * 0.45,
            materialCost: est.material_cost || subtotal * 0.40,
            equipmentCost: est.equipment_cost || subtotal * 0.15,
            subtotal,
            overheadPercent: est.overhead_pct || 0.10,
            profitPercent: est.profit_pct || 0.15,
            contingencyPct: est.contingency_pct || 0.05,
            total,
            breakdown: lineItems.slice(0, 8).map((li: any) => ({
              division: li.description,
              item: li.description,
              cost: li.total,
            })),
            lineItems,
            exclusions: est.exclusions || ["Structural modifications", "Permit fees", "Hazardous material abatement"],
            notes: est.notes || ["Prices reflect current Austin, TX market rates", "Timeline assumes no permit delays"],
            timelineWeeks: est.timeline_weeks || 8,
            regionFactor: est.region_factor || 1.0,
            modelVersion: "constructionai-v4",
          };

          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, text: `Here's your estimate for ${est.project_type || "this project"}.`, estimateCard }
                : m
            )
          );
          setLoading(false);
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        })
        .catch((err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, text: `Couldn't generate estimate: ${err.message || "Unknown error"}` }
                : m
            )
          );
          setLoading(false);
        });
    } else {
      // Regular chat - type out response word by word
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        text: "",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        setLoading(false);
      };

      aiChatStream(
        userMsg.text,
        conversationId,
        (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, text: m.text + token } : m
            )
          );
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
        },
        (convId) => {
          if (convId) setConversationId(convId);
          finish();
        },
        (error) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId && !m.text
                ? { ...m, text: `Couldn't reach ConstructionAI: ${error}` }
                : m
            )
          );
          finish();
        },
      );
    }
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
          <Text className="text-dark font-bold" style={{ fontSize: 22 }}>ConstructionAI</Text>
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
                      {msg.attachment?.type === "image" && (
                        <Image source={{ uri: msg.attachment.uri }} style={{ width: "100%", height: 180, borderRadius: 4, marginBottom: msg.text ? 8 : 0 }} resizeMode="cover" />
                      )}
                      {msg.attachment?.type === "file" && (
                        <View className="flex-row items-center bg-white border border-border p-3 mb-2" style={{ borderRadius: 4 }}>
                          <FileIcon size={20} color={BRAND.colors.primary} />
                          <Text className="text-dark text-sm font-bold ml-2 flex-1" numberOfLines={1}>{msg.attachment.name}</Text>
                        </View>
                      )}
                      {msg.text ? <Text className="text-dark text-sm">{msg.text}</Text> : null}
                    </View>
                  </View>
                )}
              </View>
            ))}

            {loading && messages[messages.length - 1]?.text === "" && (
              <View className="mr-8 mb-4">
                <View className="flex-row items-center mb-1.5">
                  <View className="w-6 h-6 bg-brand-50 items-center justify-center">
                    <Brain size={14} color={BRAND.colors.primary} />
                  </View>
                  <Text className="text-text-muted text-xs ml-2 font-bold">ConstructionAI</Text>
                </View>
                <View className="bg-white border border-border rounded p-3" style={{ borderRadius: 4 }}>
                  <Text className="text-text-muted text-sm">Thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Attachment Preview */}
          {attached && (
            <View className="border-t border-border bg-white px-4 pt-3 flex-row items-center">
              <View style={{ position: "relative" }}>
                {attached.type === "image" ? (
                  <Image source={{ uri: attached.uri }} style={{ width: 64, height: 64, borderRadius: 4 }} resizeMode="cover" />
                ) : (
                  <View className="flex-row items-center bg-gray-100 border border-border px-3 py-2" style={{ borderRadius: 4 }}>
                    <FileIcon size={16} color={BRAND.colors.primary} />
                    <Text className="text-dark text-xs font-bold ml-2" numberOfLines={1} style={{ maxWidth: 180 }}>{attached.name}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setAttached(null)}
                  style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: BRAND.colors.dark, alignItems: "center", justifyContent: "center" }}
                  activeOpacity={0.7}
                >
                  <Plus size={12} color="#FFFFFF" style={{ transform: [{ rotate: "45deg" }] }} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Input Bar */}
          <View className={`${attached ? "" : "border-t border-border"} bg-white px-4 py-3 flex-row items-center`}>
            <TouchableOpacity onPress={handleAttach} activeOpacity={0.7} className="mr-2">
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
