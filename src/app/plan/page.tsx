"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Clock,
  Calendar,
  Bell,
  Play,
  Target,
  Activity,
  Droplet,
  Plus,
  X,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import EnhancedVideoPlayer from "@/components/ui/enhanced-video-player";
import Workout3DViewer from "@/components/ui/workout-3d-viewer";

// Video library
const VIDEO_LIBRARY: Record<string, string> = {
  yoga: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_videos/morning-yoga-workout-sequence%3a-a-perso-8bb9ba9d-20251019115719.mp4",
  meditation: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_videos/guided-meditation-session%3a-peaceful-sc-a6ec61fe-20251019115743.mp4",
  core: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_videos/core-strengthening-workout%3a-athletic-p-d2c660d7-20251019115810.mp4",
  evening: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_videos/evening-wind-down-meditation%3a-close-up-3f3edc87-20251019115843.mp4",
};

export default function Plan() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState("plan");
  const [selectedVideo, setSelectedVideo] = useState<{ src: string; title: string; type: string } | null>(null);
  const [show3DViewer, setShow3DViewer] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [showReminderForm, setShowReminderForm] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Fetch daily stats
      const statsRes = await fetch("/api/daily-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsData.length > 0) setStats(statsData[0]);

      // Fetch goals
      const goalsRes = await fetch("/api/workout-goals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const goalsData = await goalsRes.json();
      if (Array.isArray(goalsData)) {
        setGoals(goalsData);
      }

      // Fetch reminders
      const remindersRes = await fetch("/api/reminder-preferences", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const remindersData = await remindersRes.json();
      if (Array.isArray(remindersData)) {
        setReminders(remindersData);
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setReminders([]);
      setGoals([]);
    }
  };

  const updateStats = async (field: string, value: number) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/daily-stats", {
        method: stats ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: stats?.id,
          [field]: value,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        toast.success("Updated successfully");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  const exercises = [
    { name: "Morning Yoga", duration: "15 min", video: "yoga" },
    { name: "Core Workout", duration: "20 min", video: "core" },
    { name: "Meditation", duration: "10 min", video: "meditation" },
    { name: "Evening Stretch", duration: "10 min", video: "evening" },
  ];

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-orchid/5 via-transparent to-black pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Wellness Plan</h1>
          <p className="text-zinc-400">Personalized program for optimal health</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {["plan", "tracking", "reminders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab
                  ? "bg-orchid-neon text-white"
                  : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Plan Tab */}
        {activeTab === "plan" && (
          <div className="space-y-6">
            {/* Exercises */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Today's Exercises</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-orchid/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{exercise.name}</h3>
                        <p className="text-sm text-zinc-400">{exercise.duration}</p>
                      </div>
                      <Activity className="w-6 h-6 text-orchid-neon" />
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => setSelectedVideo({
                          src: VIDEO_LIBRARY[exercise.video],
                          title: exercise.name,
                          type: exercise.video
                        })}
                        className="w-full px-4 py-2 bg-orchid-neon/10 hover:bg-orchid-neon/20 text-orchid-neon rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Watch Demo
                      </button>
                      <button
                        onClick={() => setShow3DViewer(exercise.video)}
                        className="w-full px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800/70 border border-zinc-700/50 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        View 3D Model
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            {goals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Active Goals</h2>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{goal.goal_type}</span>
                        <span className="text-sm text-zinc-400">{goal.current_value}/{goal.target_value}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orchid to-orchid-neon rounded-full"
                          style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === "tracking" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Daily Tracking</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Steps */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Steps</p>
                    <p className="text-3xl font-bold text-white">{stats?.steps || 0}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
                <input
                  type="number"
                  placeholder="Update steps"
                  onBlur={(e) => e.target.value && updateStats("steps", parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orchid/50"
                />
              </div>

              {/* Calories */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Calories Burned</p>
                    <p className="text-3xl font-bold text-white">{stats?.calories_burned || 0}</p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-500" />
                </div>
                <input
                  type="number"
                  placeholder="Update calories"
                  onBlur={(e) => e.target.value && updateStats("calories_burned", parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orchid/50"
                />
              </div>

              {/* Workout */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Workout Minutes</p>
                    <p className="text-3xl font-bold text-white">{stats?.workout_minutes || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
                <input
                  type="number"
                  placeholder="Update minutes"
                  onBlur={(e) => e.target.value && updateStats("workout_minutes", parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orchid/50"
                />
              </div>

              {/* Water */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Water (glasses)</p>
                    <p className="text-3xl font-bold text-white">{stats?.water_intake || 0}</p>
                  </div>
                  <Droplet className="w-8 h-8 text-cyan-500" />
                </div>
                <input
                  type="number"
                  placeholder="Update water"
                  onBlur={(e) => e.target.value && updateStats("water_intake", parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orchid/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === "reminders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Your Reminders</h2>
              <button
                onClick={() => setShowReminderForm(!showReminderForm)}
                className="px-4 py-2 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Reminder
              </button>
            </div>

            {reminders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 text-center">
                <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No reminders yet. Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium mb-1">{reminder.reminder_type}</p>
                        <p className="text-sm text-zinc-400">
                          {reminder.schedule_time} • {reminder.notification_method}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        reminder.is_enabled 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-zinc-700 text-zinc-400"
                      }`}>
                        {reminder.is_enabled ? "Active" : "Disabled"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:text-orchid-neon transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="w-full rounded-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}