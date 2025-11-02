import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/ui/bottom-nav";
import { TopNav } from "@/components/ui/top-nav";
import SwipeNavigation from "@/components/ui/swipe-navigation";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "BalanceAI - Balance Your Mind, Body, and Digital Life",
  description: "AI-powered wellness app with dark orchid theme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <TopNav />
        <div className="pt-16">
          {children}
        </div>
        <Toaster position="top-center" />
        <BottomNav />
      </body>
    </html>
  );
}