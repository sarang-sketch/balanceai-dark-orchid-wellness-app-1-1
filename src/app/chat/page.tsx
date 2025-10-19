"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your wellness assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const aiResponse: Message = {
        role: "assistant",
        content: "I understand your question. I'm here to help you with your wellness journey.",
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-orchid/5 via-transparent to-black pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Assistant</h1>
          <p className="text-zinc-400">Ask me anything about your wellness journey</p>
        </div>

        {/* Messages */}
        <div className="mb-6 space-y-4 min-h-[60vh] max-h-[60vh] overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-orchid-neon text-white"
                    : "bg-zinc-900/50 border border-zinc-800/50 text-white"
                }`}
              >
                {message.role === "assistant" && (
                  <Sparkles className="w-4 h-4 text-orchid-neon mb-2" />
                )}
                <p className="leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
                <Loader2 className="w-5 h-5 text-orchid-neon animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="w-full px-6 py-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-orchid/50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-orchid-neon hover:bg-orchid-neon/90 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}