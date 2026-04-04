import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
  Download,
  Clock,
  Brain,
  MapPin,
} from "lucide-react-native";
import { BRAND } from "@src/lib/constants";
import { formatCurrency } from "@src/lib/utils";
import type { AiEstimateResult } from "@src/lib/mock-data";

interface AiEstimateCardProps {
  estimate: AiEstimateResult;
  onSave?: () => void;
  onRegenerate?: () => void;
  onDownload?: () => void;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View className="border-t border-border">
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
        className="flex-row items-center justify-between py-3 px-4"
      >
        <Text className="text-dark font-semibold text-sm">{title}</Text>
        {open ? (
          <ChevronUp size={18} color={BRAND.colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={BRAND.colors.textSecondary} />
        )}
      </TouchableOpacity>
      {open && <View className="px-4 pb-3">{children}</View>}
    </View>
  );
}

function getConfidenceLabel(c: number): {
  label: string;
  bg: string;
  text: string;
} {
  if (c > 0.7)
    return { label: "High", bg: "bg-green-100", text: "text-green-700" };
  if (c >= 0.4)
    return { label: "Medium", bg: "bg-amber-100", text: "text-amber-700" };
  return { label: "Low", bg: "bg-red-100", text: "text-red-700" };
}

export function AiEstimateCard({
  estimate,
  onSave,
  onRegenerate,
  onDownload,
}: AiEstimateCardProps) {
  const conf = getConfidenceLabel(estimate.confidence);
  const laborPct = Math.round((estimate.laborCost / estimate.subtotal) * 100);
  const materialPct = Math.round(
    (estimate.materialCost / estimate.subtotal) * 100,
  );
  const equipPct = Math.round(
    (estimate.equipmentCost / estimate.subtotal) * 100,
  );

  return (
    <View
      className="bg-white border border-border rounded overflow-hidden"
      style={{ borderRadius: 4 }}
    >
      {/* Header */}
      <View className="px-4 py-3 bg-gray-50 flex-row items-center justify-between border-b border-border">
        <View className="flex-row items-center flex-1">
          <Brain size={18} color={BRAND.colors.primary} />
          <Text className="text-dark font-bold text-base ml-2">
            ConstructionAI Estimate
          </Text>
        </View>
        <View
          className={`px-2.5 py-0.5 ${conf.bg}`}
          style={{ borderRadius: 4 }}
        >
          <Text className={`text-xs font-semibold ${conf.text}`}>
            {conf.label} ({Math.round(estimate.confidence * 100)}%)
          </Text>
        </View>
      </View>

      {/* Job title + model */}
      <View className="px-4 pt-3 pb-1 flex-row items-center justify-between">
        <Text className="text-dark font-semibold text-sm flex-1" numberOfLines={1}>
          {estimate.jobTitle}
        </Text>
        <Text className="text-text-muted text-xs ml-2">
          {estimate.modelVersion}
        </Text>
      </View>

      {/* Estimate range */}
      <View className="px-4 py-3 flex-row items-end justify-between">
        <View className="items-center">
          <Text className="text-text-muted text-xs">Low</Text>
          <Text className="text-text-secondary text-sm font-medium">
            {formatCurrency(estimate.estimateMin)}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-text-muted text-xs">Estimate</Text>
          <Text
            className="text-2xl font-bold"
            style={{ color: BRAND.colors.primary }}
          >
            {formatCurrency(estimate.estimateMid)}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-text-muted text-xs">High</Text>
          <Text className="text-text-secondary text-sm font-medium">
            {formatCurrency(estimate.estimateMax)}
          </Text>
        </View>
      </View>

      {/* Cost breakdown row */}
      <View
        className="flex-row mx-4 mb-3 border border-border overflow-hidden"
        style={{ borderRadius: 4 }}
      >
        <View className="flex-1 items-center py-2.5 border-r border-border">
          <Text className="text-dark font-bold text-sm">
            {formatCurrency(estimate.laborCost)}
          </Text>
          <Text className="text-text-muted text-xs">Labor ({laborPct}%)</Text>
        </View>
        <View className="flex-1 items-center py-2.5 border-r border-border">
          <Text className="text-dark font-bold text-sm">
            {formatCurrency(estimate.materialCost)}
          </Text>
          <Text className="text-text-muted text-xs">
            Materials ({materialPct}%)
          </Text>
        </View>
        <View className="flex-1 items-center py-2.5">
          <Text className="text-dark font-bold text-sm">
            {formatCurrency(estimate.equipmentCost)}
          </Text>
          <Text className="text-text-muted text-xs">
            Equipment ({equipPct}%)
          </Text>
        </View>
      </View>

      {/* Overhead / Profit / Contingency */}
      <View className="flex-row px-4 pb-3">
        <Text className="text-text-muted text-xs">
          OH {Math.round(estimate.overheadPercent * 100)}% | Profit{" "}
          {Math.round(estimate.profitPercent * 100)}% | Contingency{" "}
          {Math.round(estimate.contingencyPct * 100)}%
        </Text>
      </View>

      {/* CSI Breakdown */}
      <CollapsibleSection title="CSI Breakdown">
        {estimate.breakdown.map((b, i) => (
          <View
            key={i}
            className="flex-row items-center justify-between py-1.5"
          >
            <View className="flex-1 mr-2">
              <Text className="text-dark text-xs font-medium">{b.division}</Text>
              <Text className="text-text-muted text-xs">{b.item}</Text>
            </View>
            <Text className="text-dark text-xs font-semibold">
              {formatCurrency(b.cost)}
            </Text>
          </View>
        ))}
      </CollapsibleSection>

      {/* Line Items */}
      <CollapsibleSection title="Line Items">
        {/* Header row */}
        <View className="flex-row pb-1.5 mb-1 border-b border-border">
          <Text className="flex-1 text-text-muted text-xs font-medium">
            Description
          </Text>
          <Text className="w-10 text-text-muted text-xs font-medium text-right">
            Qty
          </Text>
          <Text className="w-10 text-text-muted text-xs font-medium text-right">
            Unit
          </Text>
          <Text className="w-16 text-text-muted text-xs font-medium text-right">
            Rate
          </Text>
          <Text className="w-16 text-text-muted text-xs font-medium text-right">
            Total
          </Text>
        </View>
        {estimate.lineItems.map((li, i) => (
          <View key={i} className="flex-row items-center py-1">
            <Text
              className="flex-1 text-dark text-xs"
              numberOfLines={1}
            >
              {li.description}
            </Text>
            <Text className="w-10 text-dark text-xs text-right">
              {li.quantity}
            </Text>
            <Text className="w-10 text-text-muted text-xs text-right">
              {li.unit}
            </Text>
            <Text className="w-16 text-dark text-xs text-right">
              {formatCurrency(li.unitCost)}
            </Text>
            <Text className="w-16 text-dark text-xs font-medium text-right">
              {formatCurrency(li.total)}
            </Text>
          </View>
        ))}
      </CollapsibleSection>

      {/* Exclusions */}
      <CollapsibleSection title="Exclusions">
        {estimate.exclusions.map((ex, i) => (
          <View key={i} className="flex-row py-1">
            <Text className="text-text-muted text-xs mr-1.5">--</Text>
            <Text className="text-dark text-xs flex-1">{ex}</Text>
          </View>
        ))}
      </CollapsibleSection>

      {/* Notes */}
      <CollapsibleSection title="Notes">
        {estimate.notes.map((n, i) => (
          <View key={i} className="flex-row py-1">
            <Text className="text-text-muted text-xs mr-1.5">*</Text>
            <Text className="text-dark text-xs flex-1">{n}</Text>
          </View>
        ))}
      </CollapsibleSection>

      {/* Timeline + Region */}
      <View className="border-t border-border px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Clock size={14} color={BRAND.colors.textSecondary} />
          <Text className="text-text-secondary text-xs ml-1.5">
            {estimate.timelineWeeks} weeks
          </Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={14} color={BRAND.colors.textSecondary} />
          <Text className="text-text-secondary text-xs ml-1.5">
            Region factor: {estimate.regionFactor}x
          </Text>
        </View>
        <Text className="text-text-muted text-xs">
          {estimate.laborHours} labor hrs
        </Text>
      </View>

      {/* Action buttons */}
      <View className="border-t border-border flex-row">
        <TouchableOpacity
          onPress={onSave}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center py-3 border-r border-border"
        >
          <Save size={16} color={BRAND.colors.primary} />
          <Text
            className="text-sm font-semibold ml-1.5"
            style={{ color: BRAND.colors.primary }}
          >
            Save
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRegenerate}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center py-3 border-r border-border"
        >
          <RefreshCw size={16} color={BRAND.colors.textSecondary} />
          <Text className="text-sm font-semibold ml-1.5 text-text-secondary">
            Regenerate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDownload}
          activeOpacity={0.7}
          className="flex-1 flex-row items-center justify-center py-3"
        >
          <Download size={16} color={BRAND.colors.textSecondary} />
          <Text className="text-sm font-semibold ml-1.5 text-text-secondary">
            PDF
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
