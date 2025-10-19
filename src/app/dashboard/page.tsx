"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Activity, 
  Brain, 
  Moon, 
  TrendingUp, 
  Flame, 
  Target,
  LayoutDashboard,
  ClipboardList,
  Users,
  MessageCircle,
  Settings,
  LogOut
} from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("bearer_token");
        
        // Fetch daily stats
        const statsResponse = await fetch("/api/daily-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsResponse.json();
        if (statsData.length > 0) {
          setStats(statsData[0]);
        }

        // Fetch gamification data for streak
        const gamificationResponse = await fetch("/api/gamification", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const gamificationData = await gamificationResponse.json();
        if (gamificationData.length > 0) {
          setCurrentStreak(gamificationData[0].current_streak || 0);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error("Failed to sign out");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
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

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    {
      icon: Activity,
      label: "Activity",
      value: stats?.workout_minutes || 0,
      unit: "min",
      color: "from-purple-500 to-orchid-neon",
    },
    {
      icon: Flame,
      label: "Calories",
      value: stats?.calories_burned || 0,
      unit: "kcal",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Target,
      label: "Steps",
      value: stats?.steps || 0,
      unit: "",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Moon,
      label: "Sleep",
      value: "7.5",
      unit: "hrs",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const sidebarNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ClipboardList, label: "Wellness Plan", href: "/plan" },
    { icon: Activity, label: "Activities", href: "/progress" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: MessageCircle, label: "AI Assistant", href: "/chat" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-zinc-900/50 border-r border-zinc-800/50 fixed left-0 top-0 bottom-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-orchid/30">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_images/minimalist-neon-brain-icon-logo-with-orc-206338d1-20251019130303.jpg"
                alt="BalanceAI"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-lg font-bold text-white">BalanceAI</span>
          </div>
          <p className="text-xs text-orchid-neon/80 italic text-center">Balance your mind, transform your life</p>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-zinc-800/50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orchid to-orchid-neon flex items-center justify-center text-white font-bold text-lg">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-white font-semibold">{session.user.name || "User"}</div>
              <div className="text-xs text-zinc-400">Premium Member</div>
            </div>
          </div>
          {currentStreak > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-zinc-300">{currentStreak} Day Streak</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/dashboard";
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-orchid/20 text-orchid-neon"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-zinc-800/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-orchid/5 via-transparent to-black pointer-events-none" />
        
        <div className="relative z-10 container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-zinc-500 mb-1">{currentDate}</p>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {session.user.name?.split(" ")[0] || "there"}
            </h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-orchid/30 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}{stat.unit}
                  </div>
                  <div className="text-sm text-zinc-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/quiz")}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-orchid/50 transition-all duration-300 text-left group"
              >
                <Brain className="w-8 h-8 text-orchid-neon mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orchid-neon transition-colors">
                  Take Assessment
                </h3>
                <p className="text-sm text-zinc-400">Check your wellness score</p>
              </button>

              <button
                onClick={() => router.push("/plan")}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-orchid/50 transition-all duration-300 text-left group"
              >
                <Target className="w-8 h-8 text-orchid-neon mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orchid-neon transition-colors">
                  View Plan
                </h3>
                <p className="text-sm text-zinc-400">Access your wellness program</p>
              </button>

              <button
                onClick={() => router.push("/progress")}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-orchid/50 transition-all duration-300 text-left group"
              >
                <TrendingUp className="w-8 h-8 text-orchid-neon mb-3" />
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orchid-neon transition-colors">
                  Track Progress
                </h3>
                <p className="text-sm text-zinc-400">View your achievements</p>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Today's Summary</h2>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Daily Goal Progress</span>
                  <span className="text-white font-medium">67%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orchid to-orchid-neon rounded-full" style={{ width: "67%" }} />
                </div>
                <p className="text-sm text-zinc-500">
                  Keep going! You're making great progress today.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}