"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface SwipeNavigationProps {
  children: React.ReactNode;
  enabled?: boolean;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

const TOUCH_THRESHOLD = 50; // Minimum distance for swipe
const VELOCITY_THRESHOLD = 0.3; // Minimum velocity for swipe

export default function SwipeNavigation({ children, enabled = true }: SwipeNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [touchStartTime, setTouchStartTime] = useState(0);

  // Define navigation routes
  const routes = ["/dashboard", "/quiz", "/results", "/plan", "/track", "/community", "/settings"];
  const currentRouteIndex = routes.indexOf(pathname);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchStartTime(Date.now());
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!enabled) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = Date.now() - touchStartTime;

    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > TOUCH_THRESHOLD) {
      // Horizontal swipe
      if (velocity > VELOCITY_THRESHOLD) {
        if (deltaX > 0) {
          handleSwipeRight();
        } else {
          handleSwipeLeft();
        }
      }
    } else if (Math.abs(deltaY) > TOUCH_THRESHOLD && velocity > VELOCITY_THRESHOLD) {
      // Vertical swipe
      if (deltaY > 0) {
        handleSwipeDown();
      } else {
        handleSwipeUp();
      }
    }

    // Haptic feedback if available
    if ("vibrate" in navigator && velocity > VELOCITY_THRESHOLD) {
      navigator.vibrate(50);
    }
  };

  const handleSwipeLeft = () => {
    // Navigate to next route
    if (currentRouteIndex < routes.length - 1) {
      router.push(routes[currentRouteIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    // Navigate to previous route
    if (currentRouteIndex > 0) {
      router.push(routes[currentRouteIndex - 1]);
    }
  };

  const handleSwipeUp = () => {
    // Expand content or scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwipeDown = () => {
    // Minimize content or scroll to bottom
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  // Mouse drag support for desktop
  const [mouseDown, setMouseDown] = useState(false);
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!enabled) return;
    setMouseDown(true);
    setMouseStart({ x: e.clientX, y: e.clientY });
    setTouchStartTime(Date.now());
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDown || !enabled) return;

    const deltaX = e.clientX - mouseStart.x;
    const deltaY = e.clientY - mouseStart.y;

    // Visual feedback during drag
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      const container = containerRef.current;
      if (container) {
        container.style.cursor = "grabbing";
        container.style.transition = "none";

        // Subtle visual feedback
        const opacity = Math.max(0.95, 1 - Math.abs(deltaX + deltaY) / 500);
        container.style.opacity = opacity.toString();
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDown || !enabled) return;

    setMouseDown(false);

    const deltaX = e.clientX - mouseStart.x;
    const deltaY = e.clientY - mouseStart.y;
    const deltaTime = Date.now() - touchStartTime;

    const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > TOUCH_THRESHOLD) {
      if (velocity > VELOCITY_THRESHOLD) {
        if (deltaX > 0) {
          handleSwipeRight();
        } else {
          handleSwipeLeft();
        }
      }
    }

    // Reset visual feedback
    const container = containerRef.current;
    if (container) {
      container.style.cursor = "";
      container.style.transition = "";
      container.style.opacity = "";
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setMouseDown(false);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full select-none"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setMouseDown(false)}
    >
      {children}

      {/* Visual swipe hints */}
      {enabled && currentRouteIndex >= 0 && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-40">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-full">
            <div className="flex gap-1">
              {routes.map((route, index) => (
                <div
                  key={route}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentRouteIndex
                      ? "bg-orchid-neon w-6"
                      : "bg-zinc-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-400 ml-2">
              Swipe to navigate
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for adding swipe functionality to any component
export function useSwipe(handlers: SwipeHandlers) {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > TOUCH_THRESHOLD) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
    } else {
      if (Math.abs(deltaY) > TOUCH_THRESHOLD) {
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}