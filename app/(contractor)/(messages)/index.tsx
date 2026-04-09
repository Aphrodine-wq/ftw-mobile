import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { useRealtimeChat } from "@src/realtime/hooks";
import { useConversations } from "@src/api/hooks";
import { useAuthStore } from "@src/stores/auth";
import type { Conversation } from "@src/types";

export default function ContractorMessages() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = useAuthStore((s) => s.user?.id);

  const { data: conversations = [] } = useConversations();
  const { messages: realtimeMessages, sendMessage: realtimeSend, sendTyping, typingUser, loading: chatLoading } = useRealtimeChat(selectedConvo);

  const activeConvo = selectedConvo
    ? (conversations as Conversation[]).find((c) => c.id === selectedConvo)
    : null;

  const handleContentSizeChange = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

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
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [selectedConvo, realtimeMessages.length]);

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
          data={conversations}
          keyExtractor={(item: any) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              className="flex-row items-center px-5 py-3 bg-white border-b border-border"
              activeOpacity={0.7}
              onPress={() => setSelectedConvo(item.id)}
            >
              <Image
                source={{ uri: item.avatar }}
                style={{ width: 48, height: 48, borderRadius: 4 }}
                contentFit="cover"
                recyclingKey={`avatar-${item.id}`}
                transition={150}
              />
              <View className="flex-1 ml-3 mr-3">
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
          <Image
            source={{ uri: activeConvo?.avatar }}
            style={{ width: 36, height: 36, borderRadius: 4, marginRight: 12 }}
            contentFit="cover"
          />
          <View className="flex-1">
            <Text className="text-dark font-semibold text-base">
              {activeConvo?.name}
            </Text>
            {typingUser ? (
              <Text className="text-brand-600 text-xs">typing...</Text>
            ) : (
              <Text className="text-text-muted text-xs capitalize">
                {activeConvo?.role}
              </Text>
            )}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={realtimeMessages}
          keyExtractor={(item: any) => item.id || `msg-${Math.random()}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          removeClippedSubviews
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={11}
          onContentSizeChange={handleContentSizeChange}
          renderItem={({ item }: { item: any }) => {
            const isMe = item.isMe !== undefined ? item.isMe : (item.sender === "me" || item.senderId === userId);
            return (
              <View
                className={`mb-3 max-w-[80%] ${isMe ? "self-end" : "self-start"}`}
              >
                <View
                  className={`px-4 py-2.5 ${isMe ? "bg-gray-900" : "bg-gray-100"}`}
                  style={{ borderRadius: 4 }}
                >
                  <Text className={`text-base ${isMe ? "text-white" : "text-dark"}`}>
                    {item.body || item.text}
                  </Text>
                </View>
                <Text
                  className={`text-text-muted text-xs mt-1 ${isMe ? "text-right" : "text-left"}`}
                >
                  {item.sentAt || item.time}
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

        {/* Typing indicator */}
        {typingUser && (
          <View className="px-4 pb-1">
            <Text className="text-text-muted text-xs italic">
              {typingUser} is typing...
            </Text>
          </View>
        )}

        {/* Input bar */}
        <View className="flex-row items-end px-4 py-3 bg-white border-t border-border">
          <TextInput
            className="flex-1 bg-surface px-4 py-3 text-dark text-base mr-3 max-h-24 border border-border"
            style={{ borderRadius: 4 }}
            placeholder="Type a message..."
            placeholderTextColor={BRAND.colors.textMuted}
            value={messageText}
            onChangeText={handleTextChange}
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
