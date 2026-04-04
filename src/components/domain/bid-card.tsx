import React from "react";
import { View, Text } from "react-native";
import { Star, Clock } from "lucide-react-native";
import { Card } from "@src/components/ui/card";
import { Badge } from "@src/components/ui/badge";
import { Avatar } from "@src/components/ui/avatar";
import { formatCurrency } from "@src/lib/utils";
import type { MockBid } from "@src/lib/mock-data";

interface BidCardProps {
  bid: MockBid;
}

const statusVariant: Record<MockBid["status"], "default" | "success" | "danger"> = {
  pending: "default",
  accepted: "success",
  rejected: "danger",
};

const statusLabel: Record<MockBid["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const BidCard = React.memo(function BidCard({ bid }: BidCardProps) {
  return (
    <Card>
      {/* Contractor header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1">
          <Avatar name={bid.contractor.name} />
          <View className="flex-1">
            <Text className="text-base font-semibold text-dark">
              {bid.contractor.name}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Star size={13} color="#C41E3A" fill="#C41E3A" />
              <Text className="text-sm text-text-secondary">
                {bid.contractor.rating.toFixed(1)}
              </Text>
              <Text className="text-sm text-text-muted">
                ({bid.contractor.jobsCompleted} jobs)
              </Text>
            </View>
          </View>
        </View>
        <Badge label={statusLabel[bid.status]} variant={statusVariant[bid.status]} />
      </View>

      {/* Bid amount */}
      <Text className="text-2xl font-bold text-dark mb-2">
        {formatCurrency(bid.amount)}
      </Text>

      {/* Message preview */}
      <Text className="text-sm text-text-secondary mb-3" numberOfLines={2}>
        {bid.message}
      </Text>

      {/* Timeline */}
      <View className="flex-row items-center gap-1">
        <Clock size={14} color="#9CA3AF" />
        <Text className="text-sm text-text-muted">{bid.timeline}</Text>
      </View>
    </Card>
  );
});
