import React from "react";
import { View, Text } from "react-native";
import { getInitials } from "@src/lib/utils";

type AvatarSize = "sm" | "default" | "lg";

interface AvatarProps {
  name: string;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8",
  default: "w-10 h-10",
  lg: "w-14 h-14",
};

const textSizeClasses: Record<AvatarSize, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-lg",
};

export function Avatar({ name, size = "default" }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <View
      className={`${sizeClasses[size]} rounded-full bg-brand-100 items-center justify-center`}
    >
      <Text
        className={`font-semibold text-brand-600 ${textSizeClasses[size]}`}
      >
        {initials}
      </Text>
    </View>
  );
}
