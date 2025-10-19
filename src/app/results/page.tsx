"use client";

import { Cloud, Sun, CloudRain, Wind, Zap, Heart, Brain, Activity, Smartphone, Sparkles, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";

interface Mood {
  title: string;
  description: string;
  icon: any;
  color: string;
  glowColor: string;
  scoreRange: [number, number];
}

const moods: Mood[] = [
  {
    title: "Stormy",
    description: "Heavy clouds, but rain brings growth",
    icon: CloudRain,
    color: "text-blue-400",
    glowColor: "rgba(96, 165, 250, 0.5)",
    scoreRange: [0, 40]
  },
  {
    title: "Cloudy",
    description: "Overcast skies, sunshine is near",
    icon: Cloud,
    color: "text-gray-400",
    glowColor: "rgba(156, 163, 175, 0.5)",
    scoreRange: [41, 60]
  },
  {
    title: "Breezy",
    description: "Partly cloudy with gentle winds",
    icon: Wind,
    color: "text-cyan-400",
    glowColor: "rgba(34, 211, 238, 0.5)",
    scoreRange: [61, 75]
  },
  {
    title: "Sunny",
    description: "Clear skies and bright energy",
    icon: Sun,
    color: "text-yellow-400",
    glowColor: "rgba(250, 204, 21, 0.5)",
    scoreRange: [76, 90]
  },
  {
    title: "Radiant",
    description: "Electrifying energy and balance",
    icon: Zap,
    color: "text-orchid-neon",
    glowColor: "rgba(199, 21, 133, 0.5)",
    scoreRange: [91, 100]
  }
];

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood>(moods[0]);
  const [balanceScore, setBalanceScore] = useState(0);
  const [physicalScore, setPhysicalScore] = useState(0);
  const [cognitiveScore, setCognitiveScore] = useState(0);
  const [digitalScore, setDigitalScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/results");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      // Get quiz results from URL params or calculate
      const score = parseInt(searchParams.get("score") || "75");
      const physical = parseInt(searchParams.get("physical") || "70");
      const cognitive = parseInt(searchParams.get("cognitive") || "80");
      const digital = parseInt(searchParams.get("digital") || "75");

      setBalanceScore(score);
      setPhysicalScore(physical);
      setCognitiveScore(cognitive);
      setDigitalScore(digital);

      // Determine mood based on score
      const mood = moods.find(m => score >= m.scoreRange[0] && score <= m.scoreRange[1]) || moods[0];
      setCurrentMood(mood);

      // Save quiz results to database
      saveQuizResults(score, physical, cognitive, digital, mood.title);
      
      setLoading(false);
      setTimeout(() => setShowResults(true), 300);
    }
  }, [session, searchParams]);

  const saveQuizResults = async (balance: number, physical: number, cognitive: number, digital: number, moodTitle: string) => {
    if (!session?.user) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/quiz-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: session.user.id,
          answers: JSON.stringify({}),
          moodResult: moodTitle,
          balanceScore: balance,
          physicalScore: physical,
          cognitiveScore: cognitive,
          digitalScore: digital,
        }),
      });

      if (!response.ok) throw new Error("Failed to save results");
      
      toast.success("Quiz results saved successfully!");
    } catch (error) {
      toast.error("Failed to save quiz results");
      console.error("Error saving quiz results:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePlan = () => {
    router.push("/plan");
  };

  if (isPending || loading) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const MoodIcon = currentMood.icon;

  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-6xl pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Logo */}
          <div className="text-center mb-8">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_images/minimalist-neon-brain-icon-logo-with-orc-6190ec63-20251019101914.jpg"
              alt="BalanceAI"
              width={80}
              height={80}
              className="mx-auto rounded-2xl mb-4 border border-orchid/20"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Your Balance Score
            </h1>
          </div>

          {/* Main Result Card */}
          <div className={`transition-all duration-1000 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center mb-8">
              <div className="mb-6">
                <MoodIcon 
                  className={`mx-auto ${currentMood.color} mb-4`} 
                  size={80} 
                  strokeWidth={1.5}
                />
                <h2 className="text-4xl font-bold mb-2 text-white">
                  {currentMood.title}
                </h2>
                <p className="text-lg text-zinc-400">
                  {currentMood.description}
                </p>
              </div>

              {/* Score Display */}
              <div className="mb-6">
                <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-orchid via-orchid-neon to-purple-400 bg-clip-text text-transparent">
                  {balanceScore}%
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
                  <div
                    className="h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-orchid to-orchid-neon"
                    style={{ width: `${balanceScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-zinc-400 mb-1">Cognitive Health</h3>
                  <p className="text-2xl font-bold text-white">{cognitiveScore}%</p>
                </div>
                <Brain className="text-orchid opacity-50" size={40} />
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-zinc-400 mb-1">Physical Health</h3>
                  <p className="text-2xl font-bold text-white">{physicalScore}%</p>
                </div>
                <Activity className="text-orchid-neon opacity-50" size={40} />
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-zinc-400 mb-1">Digital Wellness</h3>
                  <p className="text-2xl font-bold text-white">{digitalScore}%</p>
                </div>
                <Smartphone className="text-purple-400 opacity-50" size={40} />
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-zinc-400 mb-1">Overall Balance</h3>
                  <p className="text-2xl font-bold text-white">{balanceScore}%</p>
                </div>
                <Heart className="text-red-400 opacity-50" size={40} />
              </div>
            </div>

            {/* Generate Plan Button */}
            <div className="text-center">
              <button
                onClick={handleGeneratePlan}
                disabled={saving}
                className="px-8 py-4 bg-orchid-neon hover:bg-orchid-neon/90 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto text-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate My Personalized Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}