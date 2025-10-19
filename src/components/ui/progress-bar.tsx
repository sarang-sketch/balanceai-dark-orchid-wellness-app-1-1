"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: "orchid" | "neon" | "gradient";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showPercentage = false,
  animated = true,
  color = "gradient"
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayValue(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const colorStyles = {
    orchid: "bg-orchid",
    neon: "bg-orchid-neon",
    gradient: "bg-gradient-to-r from-orchid via-orchid-neon to-secondary"
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative w-full h-3 bg-muted/20 rounded-full overflow-hidden backdrop-blur-sm border border-orchid/20">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(199,21,133,0.5)]",
            colorStyles[color]
          )}
          style={{ width: `${displayValue}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {Math.round(displayValue)}%
        </div>
      )}
    </div>
  );
}