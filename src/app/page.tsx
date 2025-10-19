"use client";

import { useSession } from "@/lib/auth-client";
import { ArrowRight, Shield, Sparkles, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orchid/5 via-transparent to-black pointer-events-none" />
      
      <main className="relative z-10 container mx-auto px-6 py-24 lg:py-32">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-orchid/30 shadow-lg shadow-orchid/20">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_images/minimalist-neon-brain-icon-logo-with-orc-206338d1-20251019130303.jpg"
                alt="BalanceAI Brain Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Motivating Quote */}
          <p className="text-orchid-neon font-medium text-lg tracking-wide">
            "Balance your mind, transform your life"
          </p>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            <span className="text-white">Your Personal</span>
            <br />
            <span className="bg-gradient-to-r from-orchid via-orchid-neon to-purple-400 bg-clip-text text-transparent">
              Wellness Intelligence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Track your mental, physical, and digital health with AI-powered insights.
            Build sustainable habits that transform your lifestyle.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {session ? (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="group relative px-8 py-4 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push("/plan")}
                  className="px-8 py-4 border border-zinc-800 hover:border-orchid/50 text-white rounded-xl font-medium transition-all duration-200"
                >
                  View Plan
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="group relative px-8 py-4 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push("/quiz")}
                  className="px-8 py-4 border border-zinc-800 hover:border-orchid/50 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Take Assessment
                </button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-orchid/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orchid/10 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-orchid-neon" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Plans</h3>
            <p className="text-zinc-400 leading-relaxed">
              Personalized wellness programs tailored to your goals and lifestyle.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-orchid/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orchid/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-orchid-neon" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Tracking</h3>
            <p className="text-zinc-400 leading-relaxed">
              Monitor your progress with comprehensive analytics and insights.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm hover:border-orchid/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orchid/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orchid-neon" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Privacy First</h3>
            <p className="text-zinc-400 leading-relaxed">
              Your data is encrypted and never shared. Complete control, always.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">10k+</div>
                <div className="text-sm text-zinc-400">Active Users</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">95%</div>
                <div className="text-sm text-zinc-400">Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-zinc-400">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}