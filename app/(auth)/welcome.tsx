import { useRef, useState, useCallback } from "react";
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
  Briefcase,
  Brain,
  Shield,
  Home,
  Wrench,
  HardHat,
} from "lucide-react-native";
import { BRAND } from "@src/lib/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingPage {
  id: string;
  content: React.ReactNode;
}

function FeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View
      className="flex-row items-center p-4 mb-3"
      style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 0 }}
    >
      <View
        className="w-12 h-12 items-center justify-center mr-4"
        style={{ backgroundColor: BRAND.colors.primary, borderRadius: 0 }}
      >
        <Icon size={22} color="#FFFFFF" />
      </View>
      <View className="flex-1">
        <Text className="text-white font-bold text-base">{title}</Text>
        <Text className="text-white/60 text-sm mt-0.5">{description}</Text>
      </View>
    </View>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <View
      className="p-5 mb-3"
      style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 0 }}
    >
      <View className="flex-row items-center mb-2">
        <View
          className="w-10 h-10 items-center justify-center mr-3"
          style={{ backgroundColor: BRAND.colors.primary, borderRadius: 0 }}
        >
          <Icon size={20} color="#FFFFFF" />
        </View>
        <Text className="text-white font-bold text-lg">{title}</Text>
      </View>
      <Text className="text-white/60 text-sm">{description}</Text>
    </View>
  );
}

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

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const pages: OnboardingPage[] = [
    {
      id: "1",
      content: (
        <View
          className="flex-1 justify-center items-center px-8"
          style={{ width: SCREEN_WIDTH }}
        >
          <View
            className="w-24 h-24 items-center justify-center mb-8"
            style={{ backgroundColor: BRAND.colors.dark, borderRadius: 0, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" }}
          >
            <Text className="text-white text-3xl font-bold">FTW</Text>
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-4">
            The Fair Way to Build
          </Text>
          <Text className="text-white/60 text-base text-center leading-6">
            FairTradeWorker connects homeowners with verified contractors. No
            lead fees. Fair pricing. Transparent estimates.
          </Text>
        </View>
      ),
    },
    {
      id: "2",
      content: (
        <View
          className="flex-1 justify-center px-8"
          style={{ width: SCREEN_WIDTH }}
        >
          <Text className="text-white text-3xl font-bold text-center mb-8">
            Built for the Job Site
          </Text>
          <FeatureRow
            icon={Briefcase}
            title="Find Jobs"
            description="Browse and bid on projects in your area"
          />
          <FeatureRow
            icon={Brain}
            title="AI Estimates"
            description="Generate detailed estimates with ConstructionAI"
          />
          <FeatureRow
            icon={Shield}
            title="FairRecord"
            description="Build a verified track record that wins clients"
          />
        </View>
      ),
    },
    {
      id: "3",
      content: (
        <View
          className="flex-1 justify-center px-8"
          style={{ width: SCREEN_WIDTH }}
        >
          <Text className="text-white text-3xl font-bold text-center mb-8">
            Three Ways to Work
          </Text>
          <RoleCard
            icon={Home}
            title="Homeowner"
            description="Post jobs, compare bids, manage projects"
          />
          <RoleCard
            icon={Wrench}
            title="Contractor"
            description="Find work, send estimates, grow your business"
          />
          <RoleCard
            icon={HardHat}
            title="Subcontractor"
            description="Get assigned work, track tasks, submit progress"
          />
        </View>
      ),
    },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: BRAND.colors.dark }}>
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
        renderItem={({ item }) => item.content}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
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
                backgroundColor:
                  currentPage === i
                    ? BRAND.colors.primary
                    : "rgba(255,255,255,0.3)",
                borderRadius: 0,
              }}
            />
          ))}
        </View>

        {/* Buttons on last page */}
        {currentPage === 2 ? (
          <View>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              className="py-4 items-center mb-3"
              style={{ backgroundColor: BRAND.colors.primary, borderRadius: 0 }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                Create Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              className="py-4 items-center"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.3)",
                borderRadius: 0,
              }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index: currentPage + 1,
                animated: true,
              });
            }}
            className="py-4 items-center"
            style={{ backgroundColor: BRAND.colors.primary, borderRadius: 0 }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
