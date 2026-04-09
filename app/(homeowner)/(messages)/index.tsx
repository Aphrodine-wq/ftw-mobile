import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Image } from "expo-image";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { useRealtimeChat } from "@src/realtime/hooks";
import { useConversations } from "@src/api/hooks";
import { useAuthStore } from "@src/stores/auth";
import type { Conversation } from "@src/types";

const ConversationRow = memo(function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={s.conversationCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Image
        source={{ uri: conversation.avatar }}
        style={{ width: 44, height: 44, borderRadius: 4, marginRight: 12 }}
        contentFit="cover"
        recyclingKey={`msg-avatar-${conversation.id}`}
        transition={150}
      />
      <View style={{ flex: 1, marginRight: 12 }}>
        <View className="flex-row items-center justify-between mb-0.5">
          <Text style={{ fontSize: 15, fontWeight: "600", color: BRAND.colors.textPrimary }}>
            {conversation.name}
          </Text>
          <Text style={{ fontSize: 12, color: BRAND.colors.textMuted }}>
            {conversation.lastMessageTime}
          </Text>
        </View>
        <Text
          style={{ fontSize: 13, color: BRAND.colors.textSecondary }}
          numberOfLines={1}
        >
          {conversation.lastMessage}
        </Text>
      </View>
      {conversation.unread > 0 && (
        <View style={s.unreadBadge}>
          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
            {conversation.unread}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

function ChatView({
  conversation,
  onBack,
}: {
  conversation: any;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = useAuthStore((s) => s.user?.id);
  const { messages: realtimeMessages, sendMessage: realtimeSend, sendTyping, typingUser } = useRealtimeChat(conversation.id);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    if (value.trim()) {
      sendTyping(true);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => sendTyping(false), 2000);
    }
  }, [sendTyping]);

  const handleSend = () => {
    if (!text.trim()) return;
    realtimeSend(text.trim());
    setText("");
    sendTyping(false);
  };

  useEffect(() => {
    if (realtimeMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [realtimeMessages.length]);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Chat Header */}
      <View style={s.chatHeader}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{ marginRight: 12 }}
        >
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <Image
          source={{ uri: conversation.avatar }}
          style={{ width: 36, height: 36, borderRadius: 4, marginRight: 8 }}
          contentFit="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: "600", color: BRAND.colors.textPrimary }}>
            {conversation.name}
          </Text>
          {typingUser && (
            <Text style={{ fontSize: 12, color: BRAND.colors.primary }}>typing...</Text>
          )}
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={realtimeMessages}
          keyExtractor={(item: any) => item.id || `msg-${Math.random()}`}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={11}
          renderItem={({ item }: { item: any }) => {
            const isMe = item.isMe !== undefined ? item.isMe : (item.sender === "me" || item.senderId === userId);
            return (
              <View style={[s.bubbleWrapper, { alignSelf: isMe ? "flex-end" : "flex-start" }]}>
                <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
                  <Text style={{ fontSize: 14, color: isMe ? "#FFFFFF" : BRAND.colors.textPrimary }}>
                    {item.body || item.text}
                  </Text>
                </View>
                <Text style={[s.bubbleTime, { textAlign: isMe ? "right" : "left" }]}>
                  {item.sentAt || item.time}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text style={{ color: BRAND.colors.textMuted, fontSize: 14 }}>
                No messages yet. Start the conversation.
              </Text>
            </View>
          }
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Typing indicator */}
        {typingUser && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 4 }}>
            <Text style={{ color: BRAND.colors.textMuted, fontSize: 12, fontStyle: "italic" }}>
              {typingUser} is typing...
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            placeholder="Type a message..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={text}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, { backgroundColor: text.trim() ? BRAND.colors.primary : "#E5E7EB" }]}
            activeOpacity={0.7}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Send
              size={18}
              color={text.trim() ? "#FFFFFF" : BRAND.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function HomeownerMessages() {
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const { data: conversations = [] } = useConversations();

  if (activeConversation) {
    return (
      <ChatView
        conversation={activeConversation}
        onBack={() => setActiveConversation(null)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4">
        <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary }}>
          Messages
        </Text>
        <Text style={{ fontSize: 14, color: BRAND.colors.textSecondary, marginTop: 4 }}>
          Chat with your contractors
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 90,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        renderItem={({ item }: { item: any }) => (
          <ConversationRow
            conversation={item}
            onPress={() => setActiveConversation(item)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text style={{ color: BRAND.colors.textSecondary, fontSize: 15 }}>
              No conversations yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  conversationCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: BRAND.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleWrapper: {
    marginBottom: 10,
    maxWidth: "80%",
  },
  bubble: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: BRAND.colors.primary,
  },
  bubbleThem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BRAND.colors.border,
  },
  bubbleTime: {
    fontSize: 11,
    color: BRAND.colors.textMuted,
    marginTop: 2,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.colors.border,
  },
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
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});
