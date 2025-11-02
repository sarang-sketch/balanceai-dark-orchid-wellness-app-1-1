"use client";

import {
  Bell,
  CheckCircle2,
  Clock,
  Heart,
  TrendingUp,
  Loader2,
  Phone,
  Calendar,
  Settings,
  Plus,
  Volume2,
  VolumeX,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SwipeNavigation from "@/components/ui/swipe-navigation";

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/notifications");
    }
  }, [session, isPending, router]);

  // Load notifications from database
  useEffect(() => {
    if (session?.user) {
      loadNotifications();
    }
  }, [session]);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/notifications?userId=${session?.user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setMarking(notificationId);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          read: true,
        }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        toast.success("Notification marked as read");
      }
    } catch (error) {
      console.error("Error marking notification:", error);
      toast.error("Failed to mark notification");
    } finally {
      setMarking(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      await Promise.all(
        unreadIds.map(id =>
          fetch(`/api/notifications?id=${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ read: true }),
          })
        )
      );

      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications:", error);
      toast.error("Failed to mark all notifications");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reminder":
        return <Clock className="text-blue-400" size={24} />;
      case "achievement":
        return <TrendingUp className="text-yellow-400" size={24} />;
      case "health":
        return <Heart className="text-red-400" size={24} />;
      default:
        return <Bell className="text-orchid-neon" size={24} />;
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SwipeNavigation>
      <div className="relative min-h-screen bg-black">
        <main className="relative z-10 container mx-auto px-6 py-12 max-w-4xl pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Notifications
            </h1>
            <p className="text-zinc-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 border border-zinc-800 hover:border-orchid/50 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="p-12 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm text-center">
              <Bell size={48} className="mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 rounded-2xl bg-zinc-900/50 backdrop-blur-sm transition-all ${
                  !notification.read ? "border-2 border-orchid-neon/50" : "border border-zinc-800/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-zinc-800/50 rounded-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`leading-relaxed text-zinc-300 ${!notification.read ? "font-semibold" : ""}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      disabled={marking === notification.id}
                      className="ml-4 p-2 hover:bg-zinc-800/50 rounded-lg transition-colors"
                    >
                      {marking === notification.id ? (
                        <Loader2 size={20} className="animate-spin text-orchid-neon" />
                      ) : (
                        <CheckCircle2 size={20} className="text-orchid-neon" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Settings */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <div>
                <p className="font-medium text-white">Daily Reminders</p>
                <p className="text-sm text-zinc-400">Get reminded about your wellness goals</p>
              </div>
              <button className="w-12 h-6 bg-orchid-neon rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 translate-x-6 transition-transform"></div>
              </button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <div>
                <p className="font-medium text-white">Achievement Alerts</p>
                <p className="text-sm text-zinc-400">Celebrate your milestones</p>
              </div>
              <button className="w-12 h-6 bg-orchid-neon rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 translate-x-6 transition-transform"></div>
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-white">Community Updates</p>
                <p className="text-sm text-zinc-400">Stay connected with the community</p>
              </div>
              <button className="w-12 h-6 bg-orchid-neon rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 translate-x-6 transition-transform"></div>
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </SwipeNavigation>
  );
}