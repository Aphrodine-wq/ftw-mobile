import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { mockConversations, mockMessages } from "@src/lib/mock-data";
import type { MockConversation, MockMessage } from "@src/lib/mock-data";
import { BRAND } from "@src/lib/constants";

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: MockConversation;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="w-12 h-12 rounded-full bg-brand-600 items-center justify-center mr-3">
        <Text className="text-white text-sm font-bold">
          {conversation.avatar}
        </Text>
      </View>
      <View className="flex-1 mr-3">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-base font-semibold text-dark">
            {conversation.name}
          </Text>
          <Text className="text-text-muted text-xs">
            {conversation.lastMessageTime}
          </Text>
        </View>
        <Text
          className="text-text-secondary text-sm"
          numberOfLines={1}
        >
          {conversation.lastMessage}
        </Text>
      </View>
      {conversation.unread > 0 && (
        <View className="w-5 h-5 rounded-full bg-brand-600 items-center justify-center">
          <Text className="text-white text-xs font-bold">
            {conversation.unread}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function ChatBubble({ message }: { message: MockMessage }) {
  const isMe = message.sender === "me";
  return (
    <View
      className={`mb-2.5 max-w-[80%] ${isMe ? "self-end" : "self-start"}`}
    >
      <View
        className={`rounded-2xl px-4 py-2.5 ${
          isMe ? "bg-brand-600 rounded-br-sm" : "bg-white rounded-bl-sm"
        }`}
      >
        <Text
          className={`text-sm ${isMe ? "text-white" : "text-dark"}`}
        >
          {message.text}
        </Text>
      </View>
      <Text
        className={`text-xs text-text-muted mt-0.5 ${
          isMe ? "text-right" : "text-left"
        }`}
      >
        {message.time}
      </Text>
    </View>
  );
}

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

  const handleSend = () => {
    if (!text.trim()) return;
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
      <View className="flex-row items-center px-5 py-3 bg-white border-b border-border">
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="mr-3"
        >
          <ArrowLeft size={24} color={BRAND.colors.dark} />
        </TouchableOpacity>
        <View className="w-9 h-9 rounded-full bg-brand-600 items-center justify-center mr-3">
          <Text className="text-white text-xs font-bold">
            {conversation.avatar}
          </Text>
        </View>
        <Text className="text-lg font-semibold text-dark">
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 8,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-text-muted text-sm">
                No messages yet. Start the conversation.
              </Text>
            </View>
          }
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* Input */}
        <View className="flex-row items-center px-5 py-3 bg-white border-t border-border">
          <TextInput
            className="flex-1 bg-surface rounded-xl px-4 py-2.5 text-dark text-sm mr-2"
            placeholder="Type a message..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              text.trim() ? "bg-brand-600" : "bg-gray-200"
            }`}
            activeOpacity={0.7}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Send
              size={18}
              color={text.trim() ? "white" : BRAND.colors.textMuted}
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
        <Text className="text-2xl font-bold text-dark">Messages</Text>
        <Text className="text-text-secondary mt-1">
          Chat with your contractors
        </Text>
      </View>

      {/* Conversation List */}
      <FlatList
        data={mockConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ConversationRow
            conversation={item}
            onPress={() => setActiveConversation(item)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-text-secondary text-base">
              No conversations yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
