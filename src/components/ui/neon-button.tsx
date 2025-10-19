import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

export function NeonButton({
  children,
  className,
  variant = "primary",
  size = "md",
  pulse = false,
  ...props
}: NeonButtonProps) {
  const baseStyles = "rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-orchid hover:bg-orchid-neon text-white shadow-[0_0_20px_rgba(139,90,139,0.5)] hover:shadow-[0_0_30px_rgba(199,21,133,0.7)]",
    secondary: "bg-orchid-neon hover:bg-secondary text-white shadow-[0_0_20px_rgba(199,21,133,0.5)] hover:shadow-[0_0_30px_rgba(199,21,133,0.8)]",
    outline: "border-2 border-orchid-neon text-orchid-neon hover:bg-orchid-neon/10 hover:shadow-[0_0_20px_rgba(199,21,133,0.3)]"
  };
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        pulse && "neon-pulse",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}