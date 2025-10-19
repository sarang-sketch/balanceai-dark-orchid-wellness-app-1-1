"use client";

import { 
  Camera,
  Upload,
  Sparkles,
  TrendingUp,
  Apple,
  Zap,
  Check,
  AlertCircle,
  Loader2,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface ScanResult {
  foodName: string;
  confidence: number;
  nutrition: NutritionData;
  healthScore: number;
  recommendations: string[];
}

export default function FoodScannerPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [savingToPlan, setSavingToPlan] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/food-scanner");
    }
  }, [session, isPending, router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        simulateScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate AI scanning
    setTimeout(() => {
      const mockResult: ScanResult = {
        foodName: "Grilled Chicken Salad",
        confidence: 94,
        nutrition: {
          calories: 320,
          protein: 38,
          carbs: 12,
          fat: 14,
          fiber: 5,
          sugar: 4,
          sodium: 420
        },
        healthScore: 8.5,
        recommendations: [
          "Great protein source for muscle recovery",
          "Low in carbs, perfect for your fitness goal",
          "Consider reducing sodium for better heart health",
          "Add more colorful vegetables for extra antioxidants"
        ]
      };
      setScanResult(mockResult);
      setIsScanning(false);
    }, 2500);
  };

  const saveToPlan = async () => {
    if (!scanResult || !session?.user) return;

    setSavingToPlan(true);
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Save to food scans database
      const response = await fetch("/api/food-scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          foodName: scanResult.foodName,
          calories: scanResult.nutrition.calories,
          protein: scanResult.nutrition.protein,
          carbs: scanResult.nutrition.carbs,
          fat: scanResult.nutrition.fat,
          imageUrl: uploadedImage,
        }),
      });

      if (!response.ok) throw new Error("Failed to save food scan");

      // Update daily stats with calories
      const today = new Date().toISOString().split('T')[0];
      await fetch("/api/daily-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: today,
          caloriesBurned: scanResult.nutrition.calories,
        }),
      });

      toast.success("Food scan saved to your daily plan!");
      
      // Reset scanner
      setTimeout(() => {
        setUploadedImage(null);
        setScanResult(null);
      }, 1500);
    } catch (error) {
      toast.error("Failed to save food scan");
      console.error("Error saving food scan:", error);
    } finally {
      setSavingToPlan(false);
    }
  };

  if (isPending) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-4xl pb-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Food Scanner
          </h1>
          <p className="text-lg text-zinc-400">
            Instant nutrition analysis with AI-powered insights
          </p>
        </div>

        {/* Upload Section */}
        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mb-6">
          <div className="text-center">
            {!uploadedImage ? (
              <>
                <div className="w-full h-64 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center mb-6 hover:border-orchid/30 transition-colors">
                  <Camera size={64} className="text-orchid-neon mb-4" />
                  <p className="text-lg font-semibold text-white mb-2">Upload Food Image</p>
                  <p className="text-sm text-zinc-400 mb-4">
                    Take a photo or upload from gallery
                  </p>
                  <label htmlFor="file-upload">
                    <span className="px-6 py-3 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer">
                      <Upload size={20} />
                      Choose Image
                    </span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </>
            ) : (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded food"
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <Sparkles size={48} className="text-orchid-neon mx-auto mb-4 animate-spin" />
                      <p className="text-lg font-semibold text-white">Analyzing nutrition...</p>
                      <p className="text-sm text-zinc-400">AI is detecting ingredients</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="space-y-6">
            {/* Food Identification */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{scanResult.foodName}</h2>
                  <p className="text-sm text-zinc-400">
                    AI Confidence: {scanResult.confidence}%
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orchid-neon">{scanResult.healthScore}</div>
                  <p className="text-xs text-zinc-400">Health Score</p>
                </div>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-orchid-neon h-2 rounded-full"
                  style={{ width: `${scanResult.confidence}%` }}
                />
              </div>
            </div>

            {/* Nutrition Facts */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Activity className="mr-3 text-orchid-neon" size={20} />
                Nutrition Facts
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-black/50 rounded-xl border border-zinc-800">
                  <Activity size={24} className="mx-auto mb-2 text-red-400" />
                  <p className="text-2xl font-bold text-white">{scanResult.nutrition.calories}</p>
                  <p className="text-xs text-zinc-400">Calories</p>
                </div>
                <div className="text-center p-4 bg-black/50 rounded-xl border border-zinc-800">
                  <Zap size={24} className="mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold text-white">{scanResult.nutrition.protein}g</p>
                  <p className="text-xs text-zinc-400">Protein</p>
                </div>
                <div className="text-center p-4 bg-black/50 rounded-xl border border-zinc-800">
                  <Apple size={24} className="mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold text-white">{scanResult.nutrition.carbs}g</p>
                  <p className="text-xs text-zinc-400">Carbs</p>
                </div>
                <div className="text-center p-4 bg-black/50 rounded-xl border border-zinc-800">
                  <Activity size={24} className="mx-auto mb-2 text-yellow-400" />
                  <p className="text-2xl font-bold text-white">{scanResult.nutrition.fat}g</p>
                  <p className="text-xs text-zinc-400">Fat</p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-6 space-y-3 pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Fiber</span>
                  <span className="font-semibold text-white">{scanResult.nutrition.fiber}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Sugar</span>
                  <span className="font-semibold text-white">{scanResult.nutrition.sugar}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Sodium</span>
                  <span className="font-semibold text-white">{scanResult.nutrition.sodium}mg</span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <TrendingUp className="mr-3 text-orchid-neon" size={20} />
                AI Recommendations
              </h3>
              <div className="space-y-3">
                {scanResult.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-black/50 rounded-xl border border-zinc-800">
                    {index < 2 ? (
                      <Check size={20} className="text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm text-zinc-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Integration */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Update Your Daily Plan?</h3>
                  <p className="text-sm text-zinc-400">
                    This meal will be added to today's nutrition tracking
                  </p>
                </div>
                <button
                  onClick={saveToPlan}
                  disabled={savingToPlan}
                  className="px-6 py-3 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  {savingToPlan ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Check size={20} />
                  )}
                  Add to Plan
                </button>
              </div>
            </div>

            {/* Scan Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setScanResult(null);
                }}
                className="px-6 py-3 border border-zinc-800 hover:border-orchid/50 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Camera size={20} />
                Scan Another Food
              </button>
            </div>
          </div>
        )}

        {/* How It Works */}
        {!uploadedImage && (
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orchid-neon rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <p className="text-zinc-300">Upload or take a photo of your meal</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orchid-neon rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <p className="text-zinc-300">AI analyzes ingredients and calculates nutrition</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orchid-neon rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <p className="text-zinc-300">Get personalized recommendations based on your goals</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orchid-neon rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </div>
                <p className="text-zinc-300">Auto-updates your daily plan and tracks calories</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}