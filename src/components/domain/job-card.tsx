import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, Clock, DollarSign, ChevronRight } from "lucide-react-native";
import { Card } from "@src/components/ui/card";
import { Badge } from "@src/components/ui/badge";
import { formatCurrency } from "@src/lib/utils";
import type { MockJob } from "@src/lib/mock-data";

interface JobCardProps {
  job: MockJob;
  onPress: () => void;
}

const urgencyVariant: Record<MockJob["urgency"], "danger" | "warning" | "neutral"> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

const urgencyLabel: Record<MockJob["urgency"], string> = {
  high: "Urgent",
  medium: "Normal",
  low: "Flexible",
};

export function JobCard({ job, onPress }: JobCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card>
        {/* Header: title + chevron */}
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-base font-semibold text-dark flex-1 mr-2">
            {job.title}
          </Text>
          <ChevronRight size={18} color="#9CA3AF" />
        </View>

        {/* Badges */}
        <View className="flex-row items-center gap-2 mb-3">
          <Badge label={job.category} />
          <Badge label={urgencyLabel[job.urgency]} variant={urgencyVariant[job.urgency]} />
        </View>

        {/* Details row */}
        <View className="flex-row items-center gap-4 mb-2">
          <View className="flex-row items-center gap-1">
            <MapPin size={14} color="#9CA3AF" />
            <Text className="text-sm text-text-secondary">{job.location}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Clock size={14} color="#9CA3AF" />
            <Text className="text-sm text-text-secondary">{job.postedDate}</Text>
          </View>
        </View>

        {/* Budget + bids */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <DollarSign size={14} color="#C41E3A" />
            <Text className="text-sm font-medium text-dark">
              {formatCurrency(job.budget.min)} - {formatCurrency(job.budget.max)}
            </Text>
          </View>
          <Text className="text-sm text-text-muted">
            {job.bidCount} {job.bidCount === 1 ? "bid" : "bids"}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
