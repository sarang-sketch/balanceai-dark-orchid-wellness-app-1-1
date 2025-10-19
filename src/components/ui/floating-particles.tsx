"use client";

export function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-30"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 2 === 0 ? "#8B5A8B" : "#C71585",
            boxShadow: `0 0 ${Math.random() * 20 + 10}px ${i % 2 === 0 ? "rgba(139, 90, 139, 0.6)" : "rgba(199, 21, 133, 0.6)"}`,
            animation: `float ${Math.random() * 4 + 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}