"use client";

import { useSession } from "@/lib/auth-client";
import { Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TopNav() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-orchid/30">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/06e525a7-e404-4fc7-ac36-804c29d94f91/generated_images/minimalist-neon-brain-icon-logo-with-orc-206338d1-20251019130303.jpg"
                alt="BalanceAI"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white">BalanceAI</span>
              <span className="text-[10px] text-orchid-neon/80 italic -mt-1 hidden sm:block">Balance your mind, transform your life</span>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isPending ? (
              <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded-lg" />
            ) : session ? (
              <>
                <span className="text-sm text-zinc-400 hidden sm:inline">
                  Welcome, {session.user.name?.split(' ')[0]}
                </span>
                <button
                  onClick={() => router.push("/notifications")}
                  className="relative p-2 rounded-lg hover:bg-orchid/20 transition-colors"
                >
                  <Bell className="h-5 w-5 text-zinc-400" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-orchid-neon rounded-full animate-pulse" />
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="hidden sm:inline-flex px-4 py-2 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push("/sign-in")}
                  className="px-4 py-2 border border-zinc-800 hover:border-orchid/50 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/sign-up")}
                  className="px-4 py-2 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}