import { useRef, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ClipboardList,
  Users,
  ShieldCheck,
  CreditCard,
  Search,
  Brain,
  Trophy,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react-native";
import { BRAND } from "@src/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingPage {
  id: string;
  content: React.ReactNode;
}

const StepItem = memo(function StepItem({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number;
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-center mb-6">
      <View
        className="w-16 h-16 items-center justify-center mr-4"
        style={{ backgroundColor: BRAND.colors.primary, borderRadius: 4 }}
      >
        <Icon size={28} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Text
          className="text-sm font-bold tracking-widest mb-1"
          style={{ color: BRAND.colors.textMuted }}
        >
          STEP {number}
        </Text>
        <Text
          className="font-bold text-lg"
          style={{ color: BRAND.colors.textPrimary }}
        >
          {title}
        </Text>
        <Text
          className="text-base mt-0.5"
          style={{ color: BRAND.colors.textSecondary }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
});

export default function WelcomeScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentPage(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const pages: OnboardingPage[] = [
    // Page 1: Brand
    {
      id: "brand",
      content: (
        <View
          className="flex-1 justify-center items-center px-8"
          style={{ width: SCREEN_WIDTH }}
        >
          <View
            className="items-center justify-center mb-10"
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              backgroundColor: BRAND.colors.primary,
              boxShadow: "0 8px 24px rgba(196, 30, 58, 0.4), 0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0, 0, 0, 0.15)",
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 19,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.12)",
                borderBottomColor: "rgba(0, 0, 0, 0.1)",
              }}
            >
              <Text className="text-white font-bold text-center" style={{ fontSize: 28, letterSpacing: 2, textShadowColor: "rgba(0, 0, 0, 0.25)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>FTW</Text>
            </View>
          </View>
          <Text
            className="font-bold text-center mb-4"
            style={{ color: BRAND.colors.textPrimary, fontSize: 28, lineHeight: 34 }}
          >
            FairTradeWorker
          </Text>
          <Text
            className="text-center mb-2"
            style={{ color: BRAND.colors.textPrimary, fontSize: 20, fontWeight: "600" }}
          >
            The Fair Way to Build
          </Text>
          <Text
            className="text-center px-4"
            style={{ color: BRAND.colors.textSecondary, fontSize: 16, lineHeight: 24 }}
          >
            No lead fees. No middlemen. Just homeowners and contractors
            connected directly, with fair pricing powered by AI.
          </Text>
        </View>
      ),
    },
    // Page 2: How It Works — Homeowners
    {
      id: "homeowner",
      content: (
        <View
          className="flex-1 justify-center px-8"
          style={{ width: SCREEN_WIDTH }}
        >
          <Text
            className="text-sm font-bold tracking-widest mb-2"
            style={{ color: BRAND.colors.primary }}
          >
            FOR HOMEOWNERS
          </Text>
          <Text
            className="text-3xl font-bold mb-8"
            style={{ color: BRAND.colors.textPrimary }}
          >
            Hire contractors you can trust
          </Text>

          <StepItem
            number={1}
            icon={ClipboardList}
            title="Post Your Job"
            description="Describe what you need done. It takes 60 seconds."
          />
          <StepItem
            number={2}
            icon={Users}
            title="Get Fair Bids"
            description="Verified contractors bid on your project. Compare side by side."
          />
          <StepItem
            number={3}
            icon={ShieldCheck}
            title="Hire with Confidence"
            description="Every contractor has a FairRecord — verified work history you can trust."
          />
          <StepItem
            number={4}
            icon={CreditCard}
            title="Pay Fair"
            description="Transparent pricing. No hidden fees. Pay through the app."
          />
        </View>
      ),
    },
    // Page 3: How It Works — Contractors
    {
      id: "contractor",
      content: (
        <View
          className="flex-1 justify-center px-8"
          style={{ width: SCREEN_WIDTH }}
        >
          <Text
            className="text-sm font-bold tracking-widest mb-2"
            style={{ color: BRAND.colors.primary }}
          >
            FOR CONTRACTORS
          </Text>
          <Text
            className="text-3xl font-bold mb-8"
            style={{ color: BRAND.colors.textPrimary }}
          >
            Win more work. Get paid fair.
          </Text>

          <StepItem
            number={1}
            icon={Search}
            title="Find Real Jobs"
            description="Browse jobs posted by real homeowners in your area. No lead fees."
          />
          <StepItem
            number={2}
            icon={Brain}
            title="AI-Powered Estimates"
            description="ConstructionAI generates detailed estimates in seconds."
          />
          <StepItem
            number={3}
            icon={Trophy}
            title="Win Work on Merit"
            description="Your bids, your prices, your reputation. No pay-to-play."
          />
          <StepItem
            number={4}
            icon={Star}
            title="Build Your FairRecord"
            description="Every completed job builds your verified track record."
          />
        </View>
      ),
    },
    // Page 4: Get Started
    {
      id: "cta",
      content: (
        <View
          className="flex-1 justify-center items-center px-8"
          style={{ width: SCREEN_WIDTH }}
        >
          <View
            className="w-24 h-24 items-center justify-center mb-8"
            style={{ backgroundColor: BRAND.colors.primary, borderRadius: 4 }}
          >
            <ArrowRight size={42} color="#FFFFFF" />
          </View>
          <Text
            className="text-4xl font-bold text-center mb-4"
            style={{ color: BRAND.colors.textPrimary }}
          >
            Ready to build fair?
          </Text>
          <Text
            className="text-lg text-center leading-7 px-4"
            style={{ color: BRAND.colors.textSecondary }}
          >
            Whether you're hiring or building, FairTradeWorker puts fairness
            first.
          </Text>
        </View>
      ),
    },
  ];

  const isLastPage = currentPage === pages.length - 1;

  const renderItem = useCallback(
    ({ item }: { item: OnboardingPage }) => <>{item.content}</>,
    []
  );

  return (
    <View className="flex-1" style={{ backgroundColor: BRAND.colors.bgSoft }}>
      <FlatList
        ref={flatListRef}
        data={pages}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        removeClippedSubviews
        maxToRenderPerBatch={1}
        windowSize={3}
        initialNumToRender={1}
      />

      {/* Bottom section */}
      <View className="px-8 pb-12">
        {/* Pagination dots */}
        <View className="flex-row justify-center mb-8" style={{ gap: 8 }}>
          {pages.map((_, i) => (
            <View
              key={i}
              className="h-2"
              style={{
                width: currentPage === i ? 24 : 8,
                borderRadius: 4,
                backgroundColor:
                  currentPage === i
                    ? BRAND.colors.primary
                    : BRAND.colors.border,
              }}
            />
          ))}
        </View>

        {isLastPage ? (
          <View>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              className="py-4 items-center mb-3"
              style={{ backgroundColor: BRAND.colors.primary, borderRadius: 4 }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">
                Create Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="py-4 items-center"
              style={{
                borderWidth: 1,
                borderColor: BRAND.colors.border,
                borderRadius: 4,
              }}
              activeOpacity={0.8}
            >
              <Text
                className="font-bold text-lg"
                style={{ color: BRAND.colors.textPrimary }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="py-4 items-center flex-1"
              style={{
                borderWidth: 1,
                borderColor: BRAND.colors.border,
                borderRadius: 4,
              }}
              activeOpacity={0.8}
            >
              <Text
                className="font-bold text-base"
                style={{ color: BRAND.colors.textMuted }}
              >
                Skip
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  index: currentPage + 1,
                  animated: true,
                });
              }}
              className="py-4 items-center flex-[2]"
              style={{ backgroundColor: BRAND.colors.primary, borderRadius: 4 }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <Text className="text-white font-bold text-lg">Next</Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
