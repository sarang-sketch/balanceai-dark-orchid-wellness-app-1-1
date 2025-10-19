"use client";

import { 
  TrendingUp, 
  Footprints,
  Dumbbell,
  Droplets,
  Target,
  Apple,
  Heart,
  Loader2,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface DailyStats {
  date: string;
  steps: number;
  caloriesBurned: number;
  workoutMinutes: number;
  waterIntake: number;
}

interface WorkoutGoal {
  id: number;
  goalType: string;
  targetValue: number;
  currentValue: number;
}

interface FoodScan {
  id: number;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: number;
}

interface HealthScan {
  id: number;
  overallHealth: number;
  deficiencies: string[];
  recommendations: string[];
  createdAt: number;
}

export default function ProgressPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [workoutGoals, setWorkoutGoals] = useState<WorkoutGoal[]>([]);
  const [recentFoodScans, setRecentFoodScans] = useState<FoodScan[]>([]);
  const [recentHealthScans, setRecentHealthScans] = useState<HealthScan[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/progress");
    }
  }, [session, isPending, router]);

  // Load all progress data
  useEffect(() => {
    if (session?.user) {
      loadAllData();
    }
  }, [session]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Load daily stats
      const statsResponse = await fetch("/api/daily-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setDailyStats(stats.slice(0, 7)); // Last 7 days
      }

      // Load workout goals
      const goalsResponse = await fetch("/api/workout-goals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (goalsResponse.ok) {
        const goals = await goalsResponse.json();
        setWorkoutGoals(goals);
      }

      // Load recent food scans
      const foodResponse = await fetch("/api/food-scans?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (foodResponse.ok) {
        const food = await foodResponse.json();
        setRecentFoodScans(food);
      }

      // Load recent health scans
      const healthResponse = await fetch("/api/health-scans?limit=3", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (healthResponse.ok) {
        const health = await healthResponse.json();
        setRecentHealthScans(health);
      }
    } catch (error) {
      console.error("Error loading progress data:", error);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totals = {
      steps: 0,
      calories: 0,
      workouts: 0,
      water: 0,
    };

    dailyStats.forEach(day => {
      totals.steps += day.steps || 0;
      totals.calories += day.caloriesBurned || 0;
      totals.workouts += day.workoutMinutes || 0;
      totals.water += day.waterIntake || 0;
    });

    return totals;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const totals = calculateTotals();

  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-6xl pb-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Progress Dashboard
          </h1>
          <p className="text-lg text-zinc-400">
            Track your wellness journey with detailed analytics
          </p>
        </div>

        {/* Weekly Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center hover:border-orchid/30 transition-all duration-300">
            <Footprints className="mx-auto mb-3 text-orchid-neon" size={28} />
            <p className="text-3xl font-bold text-white mb-1">{totals.steps.toLocaleString()}</p>
            <p className="text-sm text-zinc-400">Total Steps</p>
            <p className="text-xs text-orchid-neon mt-1">Last 7 Days</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center hover:border-orchid/30 transition-all duration-300">
            <Activity className="mx-auto mb-3 text-red-400" size={28} />
            <p className="text-3xl font-bold text-white mb-1">{totals.calories.toLocaleString()}</p>
            <p className="text-sm text-zinc-400">Calories Burned</p>
            <p className="text-xs text-orchid-neon mt-1">Last 7 Days</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center hover:border-orchid/30 transition-all duration-300">
            <Dumbbell className="mx-auto mb-3 text-blue-400" size={28} />
            <p className="text-3xl font-bold text-white mb-1">{totals.workouts}</p>
            <p className="text-sm text-zinc-400">Workout Minutes</p>
            <p className="text-xs text-orchid-neon mt-1">Last 7 Days</p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center hover:border-orchid/30 transition-all duration-300">
            <Droplets className="mx-auto mb-3 text-cyan-400" size={28} />
            <p className="text-3xl font-bold text-white mb-1">{totals.water}</p>
            <p className="text-sm text-zinc-400">Water Glasses</p>
            <p className="text-xs text-orchid-neon mt-1">Last 7 Days</p>
          </div>
        </div>

        {/* Daily Progress Chart */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="mr-3 text-orchid-neon" size={20} />
            Daily Activity Trend
          </h3>
          <div className="space-y-4">
            {dailyStats.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-xs text-zinc-400">{day.steps.toLocaleString()} steps</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orchid to-orchid-neon h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((day.steps / 10000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Goals */}
        {workoutGoals.length > 0 && (
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Target className="mr-3 text-orchid-neon" size={20} />
              Fitness Goals Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workoutGoals.map((goal) => {
                const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                return (
                  <div key={goal.id} className="space-y-3 p-4 bg-black/50 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white capitalize">{goal.goalType.replace('_', ' ')}</span>
                      <span className="text-sm text-orchid-neon">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-3">
                      <div
                        className="bg-orchid-neon h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Current: {goal.currentValue}</span>
                      <span>Target: {goal.targetValue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Food Scans */}
        {recentFoodScans.length > 0 && (
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Apple className="mr-3 text-orchid-neon" size={20} />
              Recent Nutrition Tracking
            </h3>
            <div className="space-y-3">
              {recentFoodScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-zinc-800">
                  <div>
                    <p className="font-medium text-white">{scan.foodName}</p>
                    <p className="text-sm text-zinc-400">{formatDate(scan.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-red-400">{scan.calories}</p>
                      <p className="text-xs text-zinc-500">cal</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-400">{scan.protein}g</p>
                      <p className="text-xs text-zinc-500">protein</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-400">{scan.carbs}g</p>
                      <p className="text-xs text-zinc-500">carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-yellow-400">{scan.fat}g</p>
                      <p className="text-xs text-zinc-500">fat</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Health Scans */}
        {recentHealthScans.length > 0 && (
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Heart className="mr-3 text-orchid-neon" size={20} />
              Health Assessment History
            </h3>
            <div className="space-y-4">
              {recentHealthScans.map((scan) => (
                <div key={scan.id} className="p-4 bg-black/50 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-white">Health Score: {scan.overallHealth}/100</p>
                      <p className="text-sm text-zinc-400">{formatDate(scan.createdAt)}</p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      scan.overallHealth >= 80 ? 'bg-green-400/20 text-green-400' :
                      scan.overallHealth >= 60 ? 'bg-yellow-400/20 text-yellow-400' :
                      'bg-red-400/20 text-red-400'
                    }`}>
                      <span className="text-xl font-bold">{scan.overallHealth}</span>
                    </div>
                  </div>
                  {scan.deficiencies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {scan.deficiencies.map((def, idx) => (
                        <span key={idx} className="text-xs bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-400/30">
                          {def}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/food-scanner")}
            className="px-6 py-4 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Apple size={20} />
            Scan Food
          </button>
          <button
            onClick={() => router.push("/health-scanner")}
            className="px-6 py-4 border border-zinc-800 hover:border-orchid/50 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Activity size={20} />
            Health Check
          </button>
        </div>
      </main>
    </div>
  );
}