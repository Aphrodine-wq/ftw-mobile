import React from "react";
import {
  Text,
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "default" | "lg";

interface ButtonProps extends Omit<PressableProps, "children"> {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-brand-600",
  outline: "border border-border bg-transparent",
  ghost: "bg-transparent",
  destructive: "bg-red-600",
};

const variantPressedClasses: Record<ButtonVariant, string> = {
  default: "bg-brand-700",
  outline: "bg-brand-50",
  ghost: "bg-brand-50",
  destructive: "bg-red-700",
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      className={`flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      style={animStyle}
      {...rest}
    >
      {({ pressed }) => (
        <>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                variant === "outline" || variant === "ghost"
                  ? "#C41E3A"
                  : "#FFFFFF"
              }
              className="mr-2"
            />
          ) : null}
          <Text
            className={`font-semibold ${variantTextClasses[variant]} ${sizeTextClasses[size]}`}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}
