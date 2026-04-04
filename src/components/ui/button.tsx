import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "default" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "children"> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-brand-600 active:bg-brand-700",
  outline: "border border-border bg-transparent active:bg-brand-50",
  ghost: "bg-transparent active:bg-brand-50",
  destructive: "bg-red-600 active:bg-red-700",
};

const variantTextClasses: Record<ButtonVariant, string> = {
  default: "text-white",
  outline: "text-brand-600",
  ghost: "text-brand-600",
  destructive: "text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 rounded",
  default: "px-5 py-3 rounded",
  lg: "px-7 py-4 rounded",
};

const sizeTextClasses: Record<ButtonSize, string> = {
  sm: "text-sm",
  default: "text-base",
  lg: "text-lg",
};

export function Button({
  title,
  onPress,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? "#C41E3A" : "#FFFFFF"}
          className="mr-2"
        />
      ) : null}
      <Text
        className={`font-semibold ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
