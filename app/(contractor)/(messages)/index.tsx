import { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import {
  mockConversations,
  mockMessages,
  type MockConversation,
  type MockMessage,
} from "@src/lib/mock-data";
import { BRAND } from "@src/lib/constants";
import { useRealtimeChat } from "@src/realtime/hooks";

const convoKeyExtractor = (item: MockConversation) => item.id;
const messageKeyExtractor = (item: MockMessage) => item.id;

export default function ContractorMessages() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<
    Record<string, MockMessage[]>
  >(mockMessages);
  const flatListRef = useRef<FlatList>(null);

  // Realtime chat integration
  const { messages: realtimeMessages, sendMessage: realtimeSend } = useRealtimeChat(selectedConvo);

  // Merge realtime messages when available
  useEffect(() => {
    if (realtimeMessages.length > 0 && selectedConvo) {
      setLocalMessages((prev) => ({ ...prev, [selectedConvo]: realtimeMessages as MockMessage[] }));
    }
  }, [realtimeMessages, selectedConvo]);

  const activeConvo = selectedConvo
    ? mockConversations.find((c) => c.id === selectedConvo)
    : null;
  const messages = selectedConvo ? localMessages[selectedConvo] || [] : [];

  const handleContentSizeChange = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !selectedConvo) return;

    // Send via realtime if connected
    realtimeSend(trimmed);

    const newMsg: MockMessage = {
      id: `m-${Date.now()}`,
      text: trimmed,
      sender: "me",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setLocalMessages((prev) => ({
      ...prev,
      [selectedConvo]: [...(prev[selectedConvo] || []), newMsg],
    }));
    setMessageText("");
  };

  useEffect(() => {
    if (selectedConvo && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [selectedConvo, messages.length]);

  // Conversation list view
  if (!selectedConvo) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-dark">Messages</Text>
          <Text className="text-text-secondary mt-1">
            Chat with homeowners
          </Text>
        </View>

        <FlatList
          data={mockConversations}
          keyExtractor={convoKeyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          renderItem={({ item }: { item: MockConversation }) => (
            <TouchableOpacity
              className="flex-row items-center px-5 py-3 bg-white border-b border-border"
              activeOpacity={0.7}
              onPress={() => setSelectedConvo(item.id)}
            >
              {/* Avatar */}
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Text className="text-gray-600 font-bold text-base">
                  {item.avatar}
                </Text>
              </View>

              {/* Content */}
              <View className="flex-1 mr-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-dark font-semibold text-base">
                    {item.name}
                  </Text>
                  <Text className="text-text-muted text-xs">
                    {item.lastMessageTime}
                  </Text>
                </View>
                <Text
                  className="text-text-secondary text-sm mt-0.5"
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>

              {/* Unread badge */}
              {item.unread > 0 && (
                <View
                  className="bg-brand-600 w-5 h-5 items-center justify-center"
                  style={{ borderRadius: 4 }}
                >
                  <Text className="text-white text-xs font-bold">
                    {item.unread}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-6">
              <Text className="text-lg font-semibold text-dark mb-2">
                No messages yet
              </Text>
              <Text className="text-text-secondary text-center">
                Conversations will appear here when homeowners respond to your
                bids.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // Chat view
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Chat header */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
          <TouchableOpacity
            onPress={() => setSelectedConvo(null)}
            className="mr-3 p-1"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={BRAND.colors.dark} />
          </TouchableOpacity>
          <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3">
            <Text className="text-gray-600 font-bold text-sm">
              {activeConvo?.avatar}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-dark font-semibold text-base">
              {activeConvo?.name}
            </Text>
            <Text className="text-text-muted text-xs capitalize">
              {activeConvo?.role}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={messageKeyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          removeClippedSubviews
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={11}
          onContentSizeChange={handleContentSizeChange}
          renderItem={({ item }: { item: MockMessage }) => {
            const isMe = item.sender === "me";
            return (
              <View
                className={`mb-3 max-w-[80%] ${
                  isMe ? "self-end" : "self-start"
                }`}
              >
                <View
                  className={`px-4 py-2.5 ${
                    isMe ? "bg-gray-900" : "bg-gray-100"
                  }`}
                  style={{ borderRadius: 4 }}
                >
                  <Text
                    className={`text-base ${
                      isMe ? "text-white" : "text-dark"
                    }`}
                  >
                    {item.text}
                  </Text>
                </View>
                <Text
                  className={`text-text-muted text-xs mt-1 ${
                    isMe ? "text-right" : "text-left"
                  }`}
                >
                  {item.time}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text className="text-text-secondary">
                No messages yet. Start the conversation.
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View className="flex-row items-end px-4 py-3 bg-white border-t border-border">
          <TextInput
            className="flex-1 bg-surface px-4 py-3 text-dark text-base mr-3 max-h-24 border border-border"
            style={{ borderRadius: 4 }}
            placeholder="Type a message..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            className={`w-11 h-11 items-center justify-center ${
              messageText.trim() ? "bg-brand-600" : "bg-gray-200"
            }`}
            style={{ borderRadius: 4 }}
            activeOpacity={0.7}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Send
              size={18}
              color={messageText.trim() ? "#FFFFFF" : BRAND.colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
