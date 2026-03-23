import React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <View
      className={`bg-white rounded-2xl border border-border p-4 ${className ?? ""}`}
      {...rest}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

export function CardHeader({ children, className, ...rest }: CardHeaderProps) {
  return (
    <View className={`mb-3 ${className ?? ""}`} {...rest}>
      {children}
    </View>
  );
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

export function CardContent({ children, className, ...rest }: CardContentProps) {
  return (
    <View className={className ?? ""} {...rest}>
      {children}
    </View>
  );
}
