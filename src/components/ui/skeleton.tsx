import React, { useEffect } from "react";
import { View, type ViewProps, type DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SkeletonProps extends ViewProps {
  width?: DimensionValue;
  height?: number;
  circle?: boolean;
}

export function Skeleton({
  width,
  height = 16,
  circle = false,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`bg-gray-200 ${className ?? ""}`}
      style={[
        {
          width: width ?? "100%",
          height,
          borderRadius: circle ? height / 2 : 4,
        },
        animStyle,
        style,
      ]}
      {...rest}
    />
  );
}

/** Pre-built skeleton for a card with title + 2 lines */
export function SkeletonCard() {
  return (
    <View className="bg-white border border-border rounded p-4" style={{ gap: 12 }}>
      <Skeleton height={14} width="60%" />
      <Skeleton height={12} width="100%" />
      <Skeleton height={12} width="80%" />
    </View>
  );
}

/** Pre-built skeleton for a stat row */
export function SkeletonStatRow({ count = 3 }: { count?: number }) {
  return (
    <View className="flex-row" style={{ gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          className="flex-1 bg-white border border-border rounded p-4"
          style={{ gap: 8 }}
        >
          <Skeleton height={10} width="50%" />
          <Skeleton height={28} width="70%" />
        </View>
      ))}
    </View>
  );
}
