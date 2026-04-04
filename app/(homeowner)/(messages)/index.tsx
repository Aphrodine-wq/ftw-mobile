import { useState, useRef, useEffect, useCallback, memo } from "react";
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
import { mockConversations, mockMessages } from "@src/lib/mock-data";
import type { MockConversation, MockMessage } from "@src/lib/mock-data";
import { BRAND } from "@src/lib/constants";
import { getInitials } from "@src/lib/utils";
import { useRealtimeChat } from "@src/realtime/hooks";

const convoKeyExtractor = (item: MockConversation) => item.id;
const messageKeyExtractor = (item: MockMessage) => item.id;

const ConversationRow = memo(function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: MockConversation;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={s.conversationCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={s.avatar}>
        <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
          {conversation.avatar}
        </Text>
      </View>
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

const ChatBubble = memo(function ChatBubble({ message }: { message: MockMessage }) {
  const isMe = message.sender === "me";
  return (
    <View
      style={[
        s.bubbleWrapper,
        { alignSelf: isMe ? "flex-end" : "flex-start" },
      ]}
    >
      <View
        style={[
          s.bubble,
          isMe ? s.bubbleMe : s.bubbleThem,
        ]}
      >
        <Text style={{ fontSize: 14, color: isMe ? "#FFFFFF" : BRAND.colors.textPrimary }}>
          {message.text}
        </Text>
      </View>
      <Text
        style={[
          s.bubbleTime,
          { textAlign: isMe ? "right" : "left" },
        ]}
      >
        {message.time}
      </Text>
    </View>
  );
});

function ChatView({
  conversation,
  onBack,
}: {
  conversation: MockConversation;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<MockMessage[]>(
    mockMessages[conversation.id] || []
  );
  const flatListRef = useRef<FlatList>(null);
  const { messages: realtimeMessages, sendMessage: realtimeSend } = useRealtimeChat(conversation.id);

  useEffect(() => {
    if (realtimeMessages.length > 0) setMessages(realtimeMessages as MockMessage[]);
  }, [realtimeMessages]);

  const handleSend = () => {
    if (!text.trim()) return;
    realtimeSend(text.trim());
    const newMsg: MockMessage = {
      id: `m-${Date.now()}`,
      text: text.trim(),
      sender: "me",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setText("");
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

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
        <View style={s.chatAvatar}>
          <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
            {conversation.avatar}
          </Text>
        </View>
        <Text style={{ fontSize: 17, fontWeight: "600", color: BRAND.colors.textPrimary }}>
          {conversation.name}
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={messageKeyExtractor}
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
          renderItem={({ item }) => <ChatBubble message={item} />}
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

        {/* Input */}
        <View style={s.inputBar}>
          <TextInput
            style={s.textInput}
            placeholder="Type a message..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={text}
            onChangeText={setText}
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
  const [activeConversation, setActiveConversation] =
    useState<MockConversation | null>(null);

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
      {/* Header */}
      <View className="px-5 pt-4">
        <Text style={{ fontSize: 24, fontWeight: "700", color: BRAND.colors.textPrimary }}>
          Messages
        </Text>
        <Text style={{ fontSize: 14, color: BRAND.colors.textSecondary, marginTop: 4 }}>
          Chat with your contractors
        </Text>
      </View>

      {/* Conversation List */}
      <FlatList
        data={mockConversations}
        keyExtractor={convoKeyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 90,
        }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        renderItem={({ item }) => (
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: BRAND.colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 4,
    backgroundColor: BRAND.colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
