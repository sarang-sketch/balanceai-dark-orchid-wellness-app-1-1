"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { 
  Home, 
  ClipboardList, 
  Target, 
  TrendingUp, 
  MessageCircle, 
  Users, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: any;
  label: string;
  href: string;
  authRequired?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/", authRequired: false },
  { icon: ClipboardList, label: "Quiz", href: "/quiz", authRequired: true },
  { icon: Target, label: "Plan", href: "/plan", authRequired: true },
  { icon: TrendingUp, label: "Progress", href: "/progress", authRequired: true },
  { icon: MessageCircle, label: "Chat", href: "/chat", authRequired: true },
  { icon: Users, label: "Community", href: "/community", authRequired: true },
  { icon: Settings, label: "Settings", href: "/settings", authRequired: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Filter nav items based on auth status
  const visibleNavItems = session 
    ? navItems 
    : navItems.filter(item => !item.authRequired);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-300",
                  "hover:bg-zinc-800/50 active:scale-95",
                  isActive && "bg-zinc-800/70"
                )}
              >
                <Icon 
                  size={22} 
                  className={cn(
                    "transition-colors duration-300",
                    isActive ? "text-orchid-neon" : "text-zinc-400"
                  )}
                />
                <span 
                  className={cn(
                    "text-xs mt-1 font-medium transition-colors duration-300",
                    isActive ? "text-orchid-neon" : "text-zinc-400"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}