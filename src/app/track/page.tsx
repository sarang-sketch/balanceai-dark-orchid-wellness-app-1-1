"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  Heart,
  Moon,
  Phone,
  MessageSquare,
  Monitor,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Users,
  Download
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { toast } from "sonner";
import SwipeNavigation from "@/components/ui/swipe-navigation";

interface RealTimeData {
  screenTime?: {
    totalHours: number;
    appUsage: Record<string, number>;
    digitalWellnessScore: number;
    lastUpdated: string;
  };
  whatsapp?: {
    messagesReceived: number;
    messagesSent: number;
    averageResponseTime: number;
    peakActivityHours: number[];
    communicationScore: number;
    lastUpdated: string;
  };
  wearable?: {
    steps: number;
    heartRate: number;
    sleepHours: number;
    activeMinutes: number;
    caloriesBurned: number;
    stressLevel: number;
    sources: {
      fitbit: boolean;
      appleHealth: boolean;
    };
    lastUpdated: string;
  };
  lastUpdated: string;
}

const COLORS = ["#8B5A8B", "#C71585", "#4A90E2", "#50C878", "#FFB84D", "#FF6B6B"];

export default function Track() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [familySharing, setFamilySharing] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchRealTimeData();
    }
  }, [session]);

  useEffect(() => {
    if (!autoRefresh || !session) return;

    const interval = setInterval(() => {
      fetchRealTimeData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, session]);

  const fetchRealTimeData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/real-time-data?type=all&userId=" + session?.user?.id, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        setRealTimeData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch real-time data:", error);
      toast.error("Failed to fetch real-time data");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const dataStr = JSON.stringify(realTimeData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `balanceai-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  const getWellnessScore = () => {
    if (!realTimeData) return 0;

    const scores = [];
    if (realTimeData.screenTime?.digitalWellnessScore) {
      scores.push(realTimeData.screenTime.digitalWellnessScore);
    }
    if (realTimeData.whatsapp?.communicationScore) {
      scores.push(realTimeData.whatsapp.communicationScore);
    }
    if (realTimeData.wearable) {
      // Calculate wearable score based on steps, sleep, and stress
      const wearableScore = Math.min(100, (
        Math.min(realTimeData.wearable.steps / 100, 1) * 30 +
        Math.min(realTimeData.wearable.sleepHours / 8, 1) * 40 +
        Math.max(0, 10 - realTimeData.wearable.stressLevel) * 3
      ));
      scores.push(wearableScore);
    }

    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  };

  const radialData = [
    {
      name: "Wellness Score",
      value: getWellnessScore(),
      fill: getWellnessScore() > 70 ? "#50C878" : getWellnessScore() > 40 ? "#FFB84D" : "#FF6B6B",
    },
  ];

  return (
    <SwipeNavigation>
      <div className="min-h-screen bg-black pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-orchid/5 via-transparent to-black pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Progress Tracking</h1>
              <p className="text-zinc-400">Real-time wellness insights</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  autoRefresh
                    ? "bg-orchid-neon text-white"
                    : "bg-zinc-900/50 border border-zinc-800/50 text-zinc-400"
                }`}
              >
                <Zap className="w-4 h-4" />
                {autoRefresh ? "Live" : "Paused"}
              </button>

              {/* Export Button */}
              <button
                onClick={exportReport}
                className="p-2 bg-zinc-900/50 border border-zinc-800/50 text-white rounded-xl hover:border-orchid/50 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Overall Wellness Score */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-1">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orchid-neon" />
                  Overall Wellness Score
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{getWellnessScore()}%</p>
                  <p className="text-sm text-zinc-400">Combined Score</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Activity className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{realTimeData?.wearable?.steps || 0}</p>
                    <p className="text-sm text-zinc-400">Steps</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{realTimeData?.wearable?.heartRate || 0}</p>
                    <p className="text-sm text-zinc-400">Heart Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Moon className="w-6 h-6 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{realTimeData?.wearable?.sleepHours || 0}h</p>
                    <p className="text-sm text-zinc-400">Sleep</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Monitor className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-white">{realTimeData?.screenTime?.totalHours || 0}h</p>
                    <p className="text-sm text-zinc-400">Screen Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {["overview", "physical", "digital", "communication", "family"].map((tab) => (
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

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Steps Trend */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orchid-neon" />
                  Activity Trend
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { day: "Mon", steps: 8000 },
                    { day: "Tue", steps: 10000 },
                    { day: "Wed", steps: 7500 },
                    { day: "Thu", steps: 9000 },
                    { day: "Fri", steps: 11000 },
                    { day: "Sat", steps: 6000 },
                    { day: "Sun", steps: realTimeData?.wearable?.steps || 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
                    <Line type="monotone" dataKey="steps" stroke="#8B5A8B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Screen Time Breakdown */}
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-orchid-neon" />
                  Screen Time Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(realTimeData?.screenTime?.appUsage || {}).map(([app, hours]) => ({
                        name: app,
                        value: hours,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(realTimeData?.screenTime?.appUsage || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "physical" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Physical Activity
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-zinc-400">Steps Goal</span>
                        <span className="text-white font-medium">{realTimeData?.wearable?.steps || 0}/10,000</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          style={{ width: `${Math.min(100, ((realTimeData?.wearable?.steps || 0) / 10000) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-zinc-400">Active Minutes</span>
                        <span className="text-white font-medium">{realTimeData?.wearable?.activeMinutes || 0}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                          style={{ width: `${Math.min(100, ((realTimeData?.wearable?.activeMinutes || 0) / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-zinc-400">Calories Burned</span>
                        <span className="text-white font-medium">{realTimeData?.wearable?.caloriesBurned || 0}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                          style={{ width: `${Math.min(100, ((realTimeData?.wearable?.caloriesBurned || 0) / 2500) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Heart Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{realTimeData?.wearable?.heartRate || 0}</p>
                      <p className="text-sm text-zinc-400">Current BPM</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">Normal</p>
                      <p className="text-sm text-zinc-400">Heart Rate Zone</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-purple-500" />
                    Sleep Quality
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{realTimeData?.wearable?.sleepHours || 0}h</p>
                      <p className="text-sm text-zinc-400">Last Night</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">Good</p>
                      <p className="text-sm text-zinc-400">Sleep Quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "digital" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-orchid-neon" />
                    Digital Wellness
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">{realTimeData?.screenTime?.totalHours || 0}h</p>
                      <p className="text-sm text-zinc-400">Total Screen Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-white">{realTimeData?.screenTime?.digitalWellnessScore || 0}%</p>
                      <p className="text-sm text-zinc-400">Wellness Score</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4">App Usage</h3>
                  <div className="space-y-3">
                    {Object.entries(realTimeData?.screenTime?.appUsage || {}).map(([app, hours]) => (
                      <div key={app}>
                        <div className="flex justify-between mb-1">
                          <span className="text-zinc-400">{app}</span>
                          <span className="text-white font-medium">{hours}h</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orchid to-orchid-neon rounded-full"
                            style={{ width: `${(hours / (realTimeData?.screenTime?.totalHours || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "communication" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                    WhatsApp Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Messages Sent</span>
                      <span className="text-white font-medium">{realTimeData?.whatsapp?.messagesSent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Messages Received</span>
                      <span className="text-white font-medium">{realTimeData?.whatsapp?.messagesReceived || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Avg Response Time</span>
                      <span className="text-white font-medium">{realTimeData?.whatsapp?.averageResponseTime || 0}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Communication Score</span>
                      <span className="text-white font-medium">{realTimeData?.whatsapp?.communicationScore || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Peak Activity Hours
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {realTimeData?.whatsapp?.peakActivityHours?.map((hour) => (
                      <span
                        key={hour}
                        className="px-3 py-1 bg-orchid-neon/20 text-orchid-neon rounded-lg text-sm font-medium"
                      >
                        {hour}:00
                      </span>
                    )) || <span className="text-zinc-400">No data available</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "family" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-orchid-neon" />
                    Family Progress Sharing
                  </h3>
                  <button
                    onClick={() => setFamilySharing(!familySharing)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      familySharing
                        ? "bg-orchid-neon text-white"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {familySharing ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {familySharing ? (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-orchid-neon mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-white mb-2">Family Circle</h4>
                      <p className="text-zinc-400 mb-6">Connect with family members to share progress</p>
                      <button className="px-6 py-3 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200">
                        Invite Family Members
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-400">Enable family sharing to connect with loved ones and track progress together.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-center mt-8">
            <p className="text-sm text-zinc-500">
              Last updated: {realTimeData?.lastUpdated ? new Date(realTimeData.lastUpdated).toLocaleString() : "Never"}
            </p>
          </div>
        </div>
      </div>
    </SwipeNavigation>
  );
}