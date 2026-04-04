import React from "react";
import { View, Text } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  square?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-brand-100",
  success: "bg-green-100",
  warning: "bg-amber-100",
  danger: "bg-red-100",
  neutral: "bg-gray-100",
};

const variantTextClasses: Record<BadgeVariant, string> = {
  default: "text-brand-700",
  success: "text-green-700",
  warning: "text-amber-700",
  danger: "text-red-700",
  neutral: "text-gray-700",
};

export function Badge({ label, variant = "default", square }: BadgeProps) {
  return (
    <View
      className={`self-start px-2.5 py-0.5 ${square ? "" : "rounded-full"} ${variantClasses[variant]}`}
      style={square ? { borderRadius: 4 } : undefined}
    >
      <Text
        className={`text-xs font-medium ${variantTextClasses[variant]}`}
      >
        {label}
      </Text>
    </View>
  );
}
