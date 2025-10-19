"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Brain, Activity, Calendar, MessageCircle, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

const features = [
  {
    icon: Brain,
    title: "Daily Plan",
    description: "AI-powered personalized wellness plans",
    color: "text-orchid-neon"
  },
  {
    icon: Activity,
    title: "Trackers",
    description: "Monitor your progress in real-time",
    color: "text-orchid"
  },
  {
    icon: Calendar,
    title: "Scanners",
    description: "AI health & nutrition analysis",
    color: "text-secondary"
  },
  {
    icon: MessageCircle,
    title: "Chat Support",
    description: "24/7 AI wellness companion",
    color: "text-orchid-neon"
  },
  {
    icon: Users,
    title: "Community",
    description: "Share & connect with others",
    color: "text-orchid"
  },
  {
    icon: TrendingUp,
    title: "Progress",
    description: "Visualize your wellness journey",
    color: "text-secondary"
  }
];

export function FeatureCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="min-w-full px-4">
                <GlassCard hover glow className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`${feature.color} neon-pulse`}>
                      <Icon size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Carousel indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "bg-orchid-neon w-8 shadow-[0_0_10px_rgba(199,21,133,0.8)]"
                : "bg-muted-foreground/30"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}