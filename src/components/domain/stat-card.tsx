import React from "react";
import { View, Text } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";
import { Card } from "@src/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  trend?: "up" | "down" | null;
}

export const StatCard = React.memo(function StatCard({ label, value, prefix, suffix, trend }: StatCardProps) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-dark">
            {prefix ?? ""}
            {value}
            {suffix ?? ""}
          </Text>
          <Text className="text-sm text-text-muted mt-1">{label}</Text>
        </View>
        {trend === "up" && (
          <View className="bg-green-100 p-2 rounded-full">
            <TrendingUp size={18} color="#15803D" />
          </View>
        )}
        {trend === "down" && (
          <View className="bg-red-100 p-2 rounded-full">
            <TrendingDown size={18} color="#DC2626" />
          </View>
        )}
      </View>
    </Card>
  );
});
