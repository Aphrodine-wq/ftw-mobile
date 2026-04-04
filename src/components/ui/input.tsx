import React, { useState, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { BRAND } from "@src/lib/constants";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    disabled = false,
    secureTextEntry,
    className,
    ...rest
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? "#DC2626"
      : focusAnim.value > 0.5
        ? BRAND.colors.primary
        : BRAND.colors.border,
    borderWidth: focusAnim.value > 0.5 ? 2 : 1,
  }));

  const handleFocus = (e: any) => {
    setFocused(true);
    focusAnim.value = withTiming(1, { duration: 150 });
    rest.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    focusAnim.value = withTiming(0, { duration: 150 });
    rest.onBlur?.(e);
  };

  const isSecure = secureTextEntry && !showPassword;

  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-semibold text-text-secondary mb-1.5">
          {label}
        </Text>
      )}
      <AnimatedView
        className="flex-row items-center bg-white rounded"
        style={[{ borderRadius: 4 }, borderStyle]}
      >
        {Icon && (
          <View className="pl-3">
            <Icon
              size={18}
              color={
                error
                  ? "#DC2626"
                  : focused
                    ? BRAND.colors.primary
                    : BRAND.colors.textMuted
              }
            />
          </View>
        )}
        <TextInput
          ref={ref}
          editable={!disabled}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#9CA3AF"
          className={`flex-1 px-3 py-3 text-dark text-base ${disabled ? "opacity-50" : ""}`}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="pr-3"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={BRAND.colors.textMuted} />
            ) : (
              <Eye size={18} color={BRAND.colors.textMuted} />
            )}
          </TouchableOpacity>
        )}
      </AnimatedView>
      {error && (
        <Text className="text-xs text-red-600 mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-xs text-text-muted mt-1">{hint}</Text>
      )}
    </View>
  );
});
