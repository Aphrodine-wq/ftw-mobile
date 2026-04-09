import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { useRealtimeChat } from "@src/realtime/hooks";
import { useConversations } from "@src/api/hooks";
import { useAuthStore } from "@src/stores/auth";

export default function SubContractorMessages() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: conversations = [] } = useConversations();
  const { messages: realtimeMessages, sendMessage: realtimeSend, sendTyping, typingUser } = useRealtimeChat(selectedConvo);

  const activeConvo = selectedConvo
    ? (conversations as any[]).find((c: any) => c.id === selectedConvo)
    : null;

  const handleTextChange = useCallback((text: string) => {
    setMessageText(text);
    if (text.trim()) {
      sendTyping(true);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => sendTyping(false), 2000);
    }
  }, [sendTyping]);

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !selectedConvo) return;
    realtimeSend(trimmed);
    setMessageText("");
    sendTyping(false);
  };

  useEffect(() => {
    if (selectedConvo && realtimeMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [selectedConvo, realtimeMessages.length]);

  if (!selectedConvo) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-5 pt-4 pb-3">
          <Text style={s.headerTitle}>Messages</Text>
          <Text style={s.headerSub}>Chat with general contractors</Text>
        </View>

        <FlatList
          data={conversations}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 90 }}
          removeClippedSubviews
          initialNumToRender={10}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={s.convoCard}
              activeOpacity={0.7}
              onPress={() => setSelectedConvo(item.id)}
            >
              <Image
                source={{ uri: item.avatar }}
                style={{ width: 44, height: 44, borderRadius: 4, marginRight: 12 }}
                contentFit="cover"
                recyclingKey={`sc-avatar-${item.id}`}
                transition={150}
              />
              <View style={{ flex: 1, marginRight: 12 }}>
                <View className="flex-row items-center justify-between mb-0.5">
                  <Text style={s.convoName}>{item.name}</Text>
                  <Text style={s.convoTime}>{item.lastMessageTime}</Text>
                </View>
                <Text style={s.convoPreview} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              {item.unread > 0 && (
                <View style={s.unreadBadge}>
                  <Text style={s.unreadText}>{item.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-16 px-6">
              <Text style={s.emptyTitle}>No messages yet</Text>
              <Text style={s.emptySub}>
                Conversations will appear here when you connect with contractors.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={s.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedConvo(null)} style={{ marginRight: 12 }} activeOpacity={0.7}>
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <Image
            source={{ uri: activeConvo?.avatar }}
            style={{ width: 36, height: 36, borderRadius: 4, marginRight: 12 }}
            contentFit="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={s.chatName}>{activeConvo?.name}</Text>
            {typingUser ? (
              <Text style={{ fontSize: 12, color: BRAND.colors.primary }}>typing...</Text>
            ) : (
              <Text style={s.chatRole}>{activeConvo?.role}</Text>
            )}
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={realtimeMessages}
          keyExtractor={(item: any) => item.id || `msg-${Math.random()}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={11}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }: { item: any }) => {
            const isMe = item.isMe !== undefined ? item.isMe : (item.sender === "me" || item.senderId === userId);
            return (
              <View style={[s.msgWrapper, { alignSelf: isMe ? "flex-end" : "flex-start" }]}>
                <View style={[s.msgBubble, isMe ? s.bubbleMe : s.bubbleThem]}>
                  <Text style={{ fontSize: 14, color: isMe ? "#FFFFFF" : BRAND.colors.textPrimary }}>
                    {item.body || item.text}
                  </Text>
                </View>
                <Text style={[s.msgTime, { textAlign: isMe ? "right" : "left" }]}>
                  {item.sentAt || item.time}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text style={{ color: BRAND.colors.textMuted }}>No messages yet.</Text>
            </View>
          }
        />

        {typingUser && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 4 }}>
            <Text style={{ color: BRAND.colors.textMuted, fontSize: 12, fontStyle: "italic" }}>
              {typingUser} is typing...
            </Text>
          </View>
        )}

        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            placeholder="Type a message..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: messageText.trim() ? BRAND.colors.primary : "#E5E7EB" }]}
            activeOpacity={0.7}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Send size={18} color={messageText.trim() ? "#FFFFFF" : BRAND.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  headerTitle: { fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary },
  headerSub: { fontSize: 14, color: BRAND.colors.textSecondary, marginTop: 4 },
  convoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  convoName: { fontSize: 15, fontWeight: "600", color: BRAND.colors.textPrimary },
  convoTime: { fontSize: 12, color: BRAND.colors.textMuted },
  convoPreview: { fontSize: 13, color: BRAND.colors.textSecondary },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: BRAND.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: BRAND.colors.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: BRAND.colors.textSecondary, textAlign: "center" },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
  chatName: { fontSize: 17, fontWeight: "600", color: BRAND.colors.textPrimary },
  chatRole: { fontSize: 12, color: BRAND.colors.textMuted, textTransform: "capitalize" },
  msgWrapper: { marginBottom: 10, maxWidth: "80%" },
  msgBubble: { borderRadius: 4, paddingHorizontal: 16, paddingVertical: 10 },
  bubbleMe: { backgroundColor: BRAND.colors.primary },
  bubbleThem: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: BRAND.colors.border },
  msgTime: { fontSize: 11, color: BRAND.colors.textMuted, marginTop: 2 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: BRAND.colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: BRAND.colors.bgSoft,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: BRAND.colors.textPrimary,
    fontSize: 14,
    marginRight: 8,
    maxHeight: 96,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
