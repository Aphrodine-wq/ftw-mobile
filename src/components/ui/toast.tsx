import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
} from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  type LucideIcon,
} from "lucide-react-native";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const COLORS: Record<ToastType, { icon: string; bg: string; border: string }> =
  {
    success: { icon: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
    error: { icon: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    info: { icon: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  };

function ToastItem({
  item,
  onDismiss,
}: {
  item: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, { duration: 300 });

    // Auto-dismiss after 3s
    const dismiss = () => {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withTiming(-80, { duration: 250 }, () => {
        runOnJS(onDismiss)(item.id);
      });
    };

    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const Icon = ICONS[item.type];
  const colors = COLORS[item.type];

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: colors.bg, borderColor: colors.border },
        animStyle,
      ]}
    >
      <Icon size={20} color={colors.icon} />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>{item.title}</Text>
        {item.message && (
          <Text style={styles.toastMessage}>{item.message}</Text>
        )}
      </View>
      <TouchableOpacity
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => onDismiss(item.id)}
      >
        <X size={16} color="#6B7280" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${++idRef.current}`;
      setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View
        style={[styles.container, { top: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111318",
  },
  toastMessage: {
    fontSize: 13,
    color: "#5C6370",
    marginTop: 2,
  },
});
