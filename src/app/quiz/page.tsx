"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: Array<{ label: string; value: string; score: number }>;
  category: "physical" | "digital" | "cognitive" | "emotional";
}

const questions: Question[] = [
  {
    id: 1,
    question: "How many hours do you sleep on average per night?",
    category: "physical",
    options: [
      { label: "Less than 5 hours", value: "A", score: 1 },
      { label: "5-6 hours", value: "B", score: 2 },
      { label: "7-8 hours", value: "C", score: 4 },
      { label: "More than 9 hours", value: "D", score: 3 }
    ]
  },
  {
    id: 2,
    question: "How often do you exercise or engage in physical activity?",
    category: "physical",
    options: [
      { label: "Never", value: "A", score: 1 },
      { label: "1-2 times per week", value: "B", score: 2 },
      { label: "3-4 times per week", value: "C", score: 4 },
      { label: "5+ times per week", value: "D", score: 5 }
    ]
  },
  {
    id: 3,
    question: "How would you describe your eating habits?",
    category: "physical",
    options: [
      { label: "Irregular, mostly junk food", value: "A", score: 1 },
      { label: "Somewhat balanced but inconsistent", value: "B", score: 2 },
      { label: "Balanced with occasional treats", value: "C", score: 4 },
      { label: "Very healthy and consistent", value: "D", score: 5 }
    ]
  },
  {
    id: 4,
    question: "How many hours a day do you spend on your phone or digital devices?",
    category: "digital",
    options: [
      { label: "Less than 2 hours", value: "A", score: 5 },
      { label: "2-4 hours", value: "B", score: 4 },
      { label: "5-7 hours", value: "C", score: 2 },
      { label: "More than 8 hours", value: "D", score: 1 }
    ]
  },
  {
    id: 5,
    question: "How often do you check social media?",
    category: "digital",
    options: [
      { label: "Rarely or never", value: "A", score: 5 },
      { label: "A few times per day", value: "B", score: 4 },
      { label: "Every hour", value: "C", score: 2 },
      { label: "Constantly throughout the day", value: "D", score: 1 }
    ]
  },
  {
    id: 6,
    question: "Do you take breaks from screens during the day?",
    category: "digital",
    options: [
      { label: "Yes, regularly scheduled breaks", value: "A", score: 5 },
      { label: "Sometimes, when I remember", value: "B", score: 3 },
      { label: "Rarely", value: "C", score: 2 },
      { label: "Never, I'm always on screens", value: "D", score: 1 }
    ]
  },
  {
    id: 7,
    question: "How often do you feel stressed or overwhelmed?",
    category: "emotional",
    options: [
      { label: "Rarely or never", value: "A", score: 5 },
      { label: "Occasionally", value: "B", score: 4 },
      { label: "Often", value: "C", score: 2 },
      { label: "Almost always", value: "D", score: 1 }
    ]
  },
  {
    id: 8,
    question: "How would you describe your mood most of the time?",
    category: "emotional",
    options: [
      { label: "Happy and energetic", value: "A", score: 5 },
      { label: "Content and stable", value: "B", score: 4 },
      { label: "Neutral or fluctuating", value: "C", score: 3 },
      { label: "Sad or anxious", value: "D", score: 1 }
    ]
  },
  {
    id: 9,
    question: "Do you have a support system (friends, family, community)?",
    category: "emotional",
    options: [
      { label: "Yes, a strong support network", value: "A", score: 5 },
      { label: "Yes, but limited", value: "B", score: 3 },
      { label: "Not really", value: "C", score: 2 },
      { label: "No, I feel isolated", value: "D", score: 1 }
    ]
  },
  {
    id: 10,
    question: "Have you experienced thoughts of self-harm or suicide?",
    category: "emotional",
    options: [
      { label: "No, never", value: "A", score: 5 },
      { label: "Rarely, fleeting thoughts", value: "B", score: 2 },
      { label: "Sometimes", value: "C", score: 1 },
      { label: "Yes, frequently", value: "D", score: 0 }
    ]
  },
  {
    id: 11,
    question: "How easily can you concentrate on tasks?",
    category: "cognitive",
    options: [
      { label: "Very easily, I stay focused", value: "A", score: 5 },
      { label: "Moderately well", value: "B", score: 4 },
      { label: "I get distracted often", value: "C", score: 2 },
      { label: "I can barely focus", value: "D", score: 1 }
    ]
  },
  {
    id: 12,
    question: "How often do you forget important tasks or information?",
    category: "cognitive",
    options: [
      { label: "Rarely", value: "A", score: 5 },
      { label: "Occasionally", value: "B", score: 4 },
      { label: "Often", value: "C", score: 2 },
      { label: "Very frequently", value: "D", score: 1 }
    ]
  },
  {
    id: 13,
    question: "Do you engage in activities that challenge your brain (puzzles, reading, learning)?",
    category: "cognitive",
    options: [
      { label: "Daily", value: "A", score: 5 },
      { label: "A few times per week", value: "B", score: 4 },
      { label: "Occasionally", value: "C", score: 2 },
      { label: "Rarely or never", value: "D", score: 1 }
    ]
  },
  {
    id: 14,
    question: "How would you rate your decision-making abilities?",
    category: "cognitive",
    options: [
      { label: "Excellent, I make clear decisions", value: "A", score: 5 },
      { label: "Good, with some hesitation", value: "B", score: 4 },
      { label: "Difficult, I often second-guess", value: "C", score: 2 },
      { label: "Very poor, I struggle to decide", value: "D", score: 1 }
    ]
  },
  {
    id: 15,
    question: "How often do you practice mindfulness or meditation?",
    category: "cognitive",
    options: [
      { label: "Daily", value: "A", score: 5 },
      { label: "A few times per week", value: "B", score: 4 },
      { label: "Occasionally", value: "C", score: 2 },
      { label: "Never", value: "D", score: 1 }
    ]
  },
  {
    id: 16,
    question: "How well do you handle setbacks or failures?",
    category: "emotional",
    options: [
      { label: "I bounce back quickly", value: "A", score: 5 },
      { label: "I recover with some time", value: "B", score: 4 },
      { label: "It takes me a while", value: "C", score: 2 },
      { label: "I struggle to recover", value: "D", score: 1 }
    ]
  },
  {
    id: 17,
    question: "Do you have clear goals and a sense of purpose?",
    category: "cognitive",
    options: [
      { label: "Yes, very clear goals", value: "A", score: 5 },
      { label: "Somewhat clear", value: "B", score: 4 },
      { label: "Vague or uncertain", value: "C", score: 2 },
      { label: "No clear direction", value: "D", score: 1 }
    ]
  }
];

export default function Quiz() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    if (!session) return;
    
    const savedAnswers = localStorage.getItem("quizAnswers");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [session]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    setAnswers({ ...answers, [currentQuestion]: option });
  };

  const handleNext = () => {
    if (!selectedOption) {
      toast.error("Please select an option");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[currentQuestion + 1] || "");
    } else {
      // Save results
      saveResults();
    }
  };

  const saveResults = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      await fetch("/api/quiz-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          completed_at: new Date().toISOString(),
        }),
      });
      router.push("/results");
    } catch (error) {
      toast.error("Failed to save results");
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-orchid/5 via-transparent to-black pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-6 py-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm text-orchid-neon">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orchid to-orchid-neon transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-orchid/10 border border-orchid/20 text-orchid-neon rounded-full text-sm font-medium">
            {currentQ.category}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
          {currentQ.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index);
            const isSelected = selectedOption === optionLetter;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(optionLetter)}
                className={`w-full p-5 rounded-2xl text-left transition-all duration-200 ${
                  isSelected
                    ? "bg-orchid-neon border-2 border-orchid-neon text-white"
                    : "bg-zinc-900/50 border-2 border-zinc-800/50 text-white hover:border-orchid/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                      isSelected ? "bg-white text-orchid-neon" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {optionLetter}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1);
                setSelectedOption(answers[currentQuestion - 1] || "");
              }}
              className="px-6 py-3 bg-zinc-900/50 border border-zinc-800/50 text-white rounded-xl font-medium hover:border-orchid/50 transition-all duration-200"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="flex-1 px-6 py-3 bg-orchid-neon hover:bg-orchid-neon/90 disabled:bg-zinc-800 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}