import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className, hover = false, glow = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300",
        hover && "hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(199,21,133,0.3)] cursor-pointer",
        glow && "neon-glow",
        className
      )}
    >
      {children}
    </div>
  );
}