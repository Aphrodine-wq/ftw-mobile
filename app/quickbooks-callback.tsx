import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, AlertTriangle } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { BRAND } from "@src/lib/constants";
import { queryKeys } from "@src/api/hooks";
import { Button } from "@src/components/ui/button";

/**
 * Deep link handler for QuickBooks OAuth callback.
 *
 * After the user authorizes in the browser, the backend redirects to:
 *   ftw://quickbooks-callback?success=true&company=CompanyName
 *   ftw://quickbooks-callback?error=denied
 *
 * This screen shows a brief result and navigates back to integrations.
 */
export default function QuickBooksCallbackScreen() {
  const params = useLocalSearchParams<{ success?: string; error?: string; company?: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);

  const isSuccess = params.success === "true";
  const errorMsg = params.error;

  useEffect(() => {
    if (isSuccess) {
      // Invalidate QB status so integrations screen refreshes
      queryClient.invalidateQueries({ queryKey: queryKeys.qbStatus });
    }
    // Brief delay so the user sees the result
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, [isSuccess, queryClient]);

  function goToIntegrations() {
    router.replace("/(contractor)/settings/integrations" as any);
  }

  if (!ready) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color={BRAND.colors.primary} />
        <Text className="text-text-muted text-sm mt-4">Connecting QuickBooks...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface items-center justify-center px-8">
      {isSuccess ? (
        <View className="items-center">
          <View className="w-16 h-16 bg-green-50 items-center justify-center mb-4" style={{ borderRadius: 4 }}>
            <CheckCircle2 size={32} color="#059669" />
          </View>
          <Text className="text-dark text-xl font-bold text-center">QuickBooks Connected</Text>
          {params.company && (
            <Text className="text-text-secondary text-sm mt-1 text-center">{params.company}</Text>
          )}
          <Text className="text-text-muted text-sm mt-3 text-center">
            Your invoices can now sync with QuickBooks for seamless bookkeeping.
          </Text>
        </View>
      ) : (
        <View className="items-center">
          <View className="w-16 h-16 bg-red-50 items-center justify-center mb-4" style={{ borderRadius: 4 }}>
            <AlertTriangle size={32} color="#DC2626" />
          </View>
          <Text className="text-dark text-xl font-bold text-center">Connection Failed</Text>
          <Text className="text-text-muted text-sm mt-3 text-center">
            {errorMsg === "denied"
              ? "You declined the QuickBooks authorization. You can try again from Settings."
              : "Something went wrong connecting to QuickBooks. Please try again."}
          </Text>
        </View>
      )}

      <View className="w-full mt-8">
        <Button
          title={isSuccess ? "Go to Integrations" : "Back to Settings"}
          onPress={goToIntegrations}
          size="lg"
        />
      </View>
    </View>
  );
}
