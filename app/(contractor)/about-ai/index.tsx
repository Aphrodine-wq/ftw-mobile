import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Brain,
  Database,
  MapPin,
  BookOpen,
  Layers,
  Target,
  Shield,
  TrendingUp,
  Cpu,
  Users,
  Hammer,
  DollarSign,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { BRAND } from "@src/lib/constants";

export default function AboutAiScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={24} color={BRAND.colors.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-dark font-bold" style={{ fontSize: 16 }}>About ConstructionAI</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Hero */}
        <View className="items-center px-6 pt-8 pb-6">
          <View className="w-20 h-20 bg-brand-50 items-center justify-center mb-5" style={{ borderRadius: 22 }}>
            <Brain size={40} color={BRAND.colors.primary} />
          </View>
          <Text className="text-dark font-bold text-center" style={{ fontSize: 28, lineHeight: 34 }}>
            Built by contractors.{"\n"}Trained on real jobs.
          </Text>
          <Text className="text-text-muted text-center mt-3 px-2" style={{ fontSize: 15, lineHeight: 22 }}>
            ConstructionAI is a custom-trained language model purpose-built for construction estimation. Not a chatbot wrapper — a real model that understands trades.
          </Text>
        </View>

        {/* What It Is */}
        <View className="bg-surface py-8">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-2 px-6 text-center" style={{ fontSize: 11 }}>What It Is</Text>
          <Text className="text-dark font-bold mb-5 px-6 text-center" style={{ fontSize: 22 }}>Your AI estimator.</Text>

          <View className="px-6" style={{ gap: 2 }}>
            <View className="bg-white border border-border p-5 flex-row">
              <View className="w-12 h-12 bg-brand-50 items-center justify-center mr-4">
                <Brain size={24} color={BRAND.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 16 }}>Custom fine-tuned model</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 20 }}>
                  Not GPT. Not a prompt on top of someone else's AI. ConstructionAI is a Llama-based model fine-tuned from scratch on construction data.
                </Text>
              </View>
            </View>

            <View className="bg-white border border-border p-5 flex-row">
              <View className="w-12 h-12 bg-brand-50 items-center justify-center mr-4">
                <Layers size={24} color={BRAND.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 16 }}>CSI division awareness</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 20 }}>
                  Every estimate follows the Construction Specifications Institute format. Line items, divisions, labor/material splits — structured the way real estimators think.
                </Text>
              </View>
            </View>

            <View className="bg-white border border-border p-5 flex-row">
              <View className="w-12 h-12 bg-brand-50 items-center justify-center mr-4">
                <DollarSign size={24} color={BRAND.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 16 }}>Full cost breakdowns</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 20 }}>
                  Labor, materials, equipment, overhead, profit, contingency. Every estimate comes with a complete breakdown, not just a number.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* How It's Built */}
        <View className="py-8">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-2 px-6 text-center" style={{ fontSize: 11 }}>How It's Built</Text>
          <Text className="text-dark font-bold mb-5 px-6 text-center" style={{ fontSize: 22 }}>From the ground up.</Text>

          <View className="px-6" style={{ gap: 16 }}>
            <View className="flex-row">
              <View className="w-10 h-10 bg-brand-600 items-center justify-center mr-4 mt-0.5">
                <Text className="text-white font-bold" style={{ fontSize: 16 }}>1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>Real project data</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 21 }}>
                  Trained on hundreds of thousands of real construction estimates, bids, and project outcomes across every major trade. Not synthetic data — actual jobs from actual contractors.
                </Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="w-10 h-10 bg-brand-600 items-center justify-center mr-4 mt-0.5">
                <Text className="text-white font-bold" style={{ fontSize: 16 }}>2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>Distillation pipeline</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 21 }}>
                  We use a multi-stage training process. Larger models generate high-quality training examples, then we distill that knowledge into a fast, specialized model that runs efficiently on-device.
                </Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="w-10 h-10 bg-brand-600 items-center justify-center mr-4 mt-0.5">
                <Text className="text-white font-bold" style={{ fontSize: 16 }}>3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>Regional pricing engine</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 21 }}>
                  Material costs, labor rates, and permit requirements vary by ZIP code. ConstructionAI adjusts estimates based on your specific region using real market data — not national averages.
                </Text>
              </View>
            </View>

            <View className="flex-row">
              <View className="w-10 h-10 bg-brand-600 items-center justify-center mr-4 mt-0.5">
                <Text className="text-white font-bold" style={{ fontSize: 16 }}>4</Text>
              </View>
              <View className="flex-1">
                <Text className="text-dark font-bold" style={{ fontSize: 17 }}>Continuous learning</Text>
                <Text className="text-text-muted mt-1" style={{ fontSize: 14, lineHeight: 21 }}>
                  Every estimate generated feeds back into the training loop. As more contractors use the system, the model gets better at pricing jobs accurately for your trade and your market.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* What Makes It Accurate */}
        <View className="bg-surface py-8">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-2 px-6 text-center" style={{ fontSize: 11 }}>Accuracy</Text>
          <Text className="text-dark font-bold mb-5 px-6 text-center" style={{ fontSize: 22 }}>Why you can trust it.</Text>

          <View className="px-6" style={{ gap: 2 }}>
            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <Database size={20} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-3" style={{ fontSize: 16 }}>600K+ training examples</Text>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 20 }}>
                Not a hundred. Not a thousand. Over six hundred thousand curated training examples across plumbing, electrical, HVAC, roofing, concrete, framing, finishing, and general contracting.
              </Text>
            </View>

            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <MapPin size={20} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-3" style={{ fontSize: 16 }}>ZIP-level regional adjustment</Text>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 20 }}>
                A roof in Austin costs different than a roof in NYC. ConstructionAI knows the difference because it's trained on real pricing data indexed by region, not just state-level averages.
              </Text>
            </View>

            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <Hammer size={20} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-3" style={{ fontSize: 16 }}>Trade-specific language</Text>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 20 }}>
                The model speaks contractor. It knows what "rough-in" means, what "30-year architectural" implies, and that "full gut" changes the scope entirely. No translation layer needed — describe the job the way you'd tell your crew.
              </Text>
            </View>

            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <Target size={20} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-3" style={{ fontSize: 16 }}>Confidence scoring</Text>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 20 }}>
                Every estimate includes a confidence percentage. More detail in your description = higher confidence. The model tells you when it's guessing so you know when to adjust.
              </Text>
            </View>

            <View className="bg-white border border-border p-5">
              <View className="flex-row items-center mb-3">
                <Users size={20} color={BRAND.colors.primary} />
                <Text className="text-dark font-bold ml-3" style={{ fontSize: 16 }}>Built by a contractor</Text>
              </View>
              <Text className="text-text-muted" style={{ fontSize: 14, lineHeight: 20 }}>
                This isn't a Silicon Valley AI product adapted for construction. It was built by someone who's been on job sites, managed crews, and knows what a bad estimate costs. The model reflects that experience.
              </Text>
            </View>
          </View>
        </View>

        {/* The Numbers */}
        <View className="py-8 px-6">
          <Text className="text-text-muted font-bold uppercase tracking-wider mb-5 text-center" style={{ fontSize: 11 }}>By The Numbers</Text>
          <View className="flex-row" style={{ gap: 8 }}>
            <View className="flex-1 bg-surface p-4 items-center">
              <Text className="text-dark font-bold" style={{ fontSize: 28 }}>600K</Text>
              <Text className="text-text-muted text-center mt-1" style={{ fontSize: 12 }}>Training examples</Text>
            </View>
            <View className="flex-1 bg-surface p-4 items-center">
              <Text className="text-dark font-bold" style={{ fontSize: 28 }}>10</Text>
              <Text className="text-text-muted text-center mt-1" style={{ fontSize: 12 }}>Trade categories</Text>
            </View>
            <View className="flex-1 bg-surface p-4 items-center">
              <Text className="text-dark font-bold" style={{ fontSize: 28 }}>8B</Text>
              <Text className="text-text-muted text-center mt-1" style={{ fontSize: 12 }}>Model parameters</Text>
            </View>
          </View>
          <View className="flex-row mt-2" style={{ gap: 8 }}>
            <View className="flex-1 bg-surface p-4 items-center">
              <Text className="text-dark font-bold" style={{ fontSize: 28 }}>~5%</Text>
              <Text className="text-text-muted text-center mt-1" style={{ fontSize: 12 }}>Bid accuracy</Text>
            </View>
            <View className="flex-1 bg-surface p-4 items-center">
              <Text className="text-dark font-bold" style={{ fontSize: 28 }}>&lt;2s</Text>
              <Text className="text-text-muted text-center mt-1" style={{ fontSize: 12 }}>Response time</Text>
            </View>
            <View className="flex-1 bg-surface p-4 items-center">
              <Text className="text-dark font-bold" style={{ fontSize: 28 }}>v5</Text>
              <Text className="text-text-muted text-center mt-1" style={{ fontSize: 12 }}>Model version</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View className="px-6 pb-4">
          <TouchableOpacity
            className="bg-brand-600 py-4 items-center"
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text className="text-white font-bold" style={{ fontSize: 17 }}>Try ConstructionAI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
