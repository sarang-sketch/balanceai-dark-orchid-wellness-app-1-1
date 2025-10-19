"use client";

import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Share2,
  Lock,
  HelpCircle,
  LogOut,
  Loader2,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [familySharing, setFamilySharing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/settings");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error("Failed to sign out");
      } else {
        localStorage.removeItem("bearer_token");
        await refetch();
        toast.success("Signed out successfully");
        router.push("/");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    toast.info("Profile editing coming soon!");
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    toast.success(notifications ? "Notifications disabled" : "Notifications enabled");
  };

  const handleFamilySharingToggle = () => {
    setFamilySharing(!familySharing);
    toast.success(familySharing ? "Family sharing disabled" : "Family sharing enabled");
  };

  const handleChangePassword = () => {
    toast.info("Password change feature coming soon!");
  };

  const handlePrivacyPolicy = () => {
    toast.info("Opening privacy policy...");
  };

  const handleTerms = () => {
    toast.info("Opening terms of service...");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires confirmation. Please contact support.");
  };

  const handleHelpCenter = () => {
    toast.info("Opening help center...");
  };

  const handleContactSupport = () => {
    toast.info("Opening support contact form...");
  };

  const handleReportBug = () => {
    toast.info("Opening bug report form...");
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
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl pb-24">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
            Settings
          </h1>
          <p className="text-base sm:text-lg text-zinc-400">
            Manage your account and preferences
          </p>
        </div>

        {/* Account Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <User className="mr-2 text-orchid-neon" size={20} />
              Account
            </h2>
            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-base sm:text-lg truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-sm text-zinc-400 mt-1 truncate">
                    {session.user.email}
                  </p>
                </div>
                <button 
                  onClick={handleEditProfile}
                  className="w-full sm:w-auto px-4 py-2 border border-zinc-800 hover:border-orchid/50 text-white rounded-lg text-sm font-medium transition-all duration-200 active:scale-95"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <SettingsIcon className="mr-2 text-orchid-neon" size={20} />
              Preferences
            </h2>
            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Bell size={20} className="text-zinc-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm sm:text-base">Notifications</p>
                    <p className="text-xs sm:text-sm text-zinc-400">Daily reminders and alerts</p>
                  </div>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 active:scale-95 ${
                    notifications ? "bg-orchid-neon" : "bg-zinc-700"
                  }`}
                  aria-label="Toggle notifications"
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                    notifications ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Share2 size={20} className="text-zinc-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm sm:text-base">Family Sharing</p>
                    <p className="text-xs sm:text-sm text-zinc-400">Share progress with family</p>
                  </div>
                </div>
                <button
                  onClick={handleFamilySharingToggle}
                  className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 active:scale-95 ${
                    familySharing ? "bg-orchid-neon" : "bg-zinc-700"
                  }`}
                  aria-label="Toggle family sharing"
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 ${
                    familySharing ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <Lock className="mr-2 text-orchid-neon" size={20} />
              Privacy & Security
            </h2>
            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm space-y-1">
              <button 
                onClick={handleChangePassword}
                className="w-full flex items-center justify-between hover:bg-zinc-800/50 p-3 sm:p-4 rounded-lg transition-all duration-200 text-white active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base">Change Password</span>
                <ChevronRight size={20} className="text-zinc-400" />
              </button>
              <button 
                onClick={handlePrivacyPolicy}
                className="w-full flex items-center justify-between hover:bg-zinc-800/50 p-3 sm:p-4 rounded-lg transition-all duration-200 text-white active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base">Privacy Policy</span>
                <ChevronRight size={20} className="text-zinc-400" />
              </button>
              <button 
                onClick={handleTerms}
                className="w-full flex items-center justify-between hover:bg-zinc-800/50 p-3 sm:p-4 rounded-lg transition-all duration-200 text-white active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base">Terms of Service</span>
                <ChevronRight size={20} className="text-zinc-400" />
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between hover:bg-zinc-800/50 p-3 sm:p-4 rounded-lg transition-all duration-200 text-red-400 active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base">Delete Account</span>
                <ChevronRight size={20} className="text-red-400" />
              </button>
            </div>
          </div>

          {/* Help & Support */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center">
              <HelpCircle className="mr-2 text-orchid-neon" size={20} />
              Help & Support
            </h2>
            <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm space-y-1">
              <button 
                onClick={handleHelpCenter}
                className="w-full flex items-center justify-between hover:bg-zinc-800/50 p-3 sm:p-4 rounded-lg transition-all duration-200 text-white active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base">Help Center</span>
                <ChevronRight size={20} className="text-zinc-400" />
              </button>
              <button 
                onClick={handleContactSupport}
                className="w-full flex items-center justify-between hover:bg-zinc-800/50 p-3 sm:p-4 rounded-lg transition-all duration-200 text-white active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base">Contact Support</span>
                <ChevronRight size={20} className="text-zinc-400" />
              </button>
              <button 
                onClick={handleReportBug}
                className="w-full flex items-center justify-between hover:bg-zinc-800/50 p-3 sm:p-4 rounded-lg transition-all duration-200 text-white active:scale-[0.98]"
              >
                <span className="text-sm sm:text-base">Report a Bug</span>
                <ChevronRight size={20} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Sign Out */}
          <div className="text-center pt-4">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full max-w-xs px-6 py-4 border border-zinc-800 hover:border-red-400/50 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 mx-auto active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut size={20} />
                  Sign Out
                </>
              )}
            </button>
          </div>

          {/* App Info */}
          <div className="text-center text-xs sm:text-sm text-zinc-500 pt-4">
            <p>BalanceAI v1.0.0</p>
          </div>
        </div>
      </main>
    </div>
  );
}