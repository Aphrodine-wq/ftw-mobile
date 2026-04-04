import React from "react";
import { View, Text } from "react-native";

interface ChatBubbleProps {
  text: string;
  sender: "me" | "them";
  time: string;
}

export const ChatBubble = React.memo(function ChatBubble({ text, sender, time }: ChatBubbleProps) {
  const isMe = sender === "me";

  return (
    <View className={`mb-3 ${isMe ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] px-4 py-2.5 ${
          isMe
            ? "bg-brand-600 rounded-2xl rounded-br-sm"
            : "bg-gray-100 rounded-2xl rounded-bl-sm"
        }`}
      >
        <Text
          className={`text-base ${isMe ? "text-white" : "text-dark"}`}
        >
          {text}
        </Text>
      </View>
      <Text className="text-xs text-text-muted mt-1 px-1">{time}</Text>
    </View>
  );
});
