"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, CheckCircle2, Phone, Heart } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: Array<{ label: string; value: string; score: number }>;
}

const questions: Question[] = [
  {
    id: 1,
    question: "How often do you feel mentally sharp and focused during tasks?",
    options: [
      { label: "Always", value: "A", score: 5 },
      { label: "Often", value: "B", score: 4 },
      { label: "Sometimes", value: "C", score: 3 },
      { label: "Rarely", value: "D", score: 2 },
      { label: "Never", value: "E", score: 1 }
    ]
  },
  {
    id: 2,
    question: "How frequently do you experience difficulty remembering recent events?",
    options: [
      { label: "Never", value: "A", score: 5 },
      { label: "Rarely", value: "B", score: 4 },
      { label: "Sometimes", value: "C", score: 3 },
      { label: "Often", value: "D", score: 2 },
      { label: "Always", value: "E", score: 1 }
    ]
  },
  {
    id: 3,
    question: "How would you rate your ability to concentrate for extended periods?",
    options: [
      { label: "Excellent", value: "A", score: 5 },
      { label: "Good", value: "B", score: 4 },
      { label: "Average", value: "C", score: 3 },
      { label: "Poor", value: "D", score: 2 },
      { label: "Very Poor", value: "E", score: 1 }
    ]
  },
  {
    id: 4,
    question: "How often do you feel overwhelmed by daily responsibilities?",
    options: [
      { label: "Never", value: "A", score: 5 },
      { label: "Rarely", value: "B", score: 4 },
      { label: "Sometimes", value: "C", score: 3 },
      { label: "Often", value: "D", score: 2 },
      { label: "Always", value: "E", score: 1 }
    ]
  },
  {
    id: 5,
    question: "How frequently do you engage in activities that challenge your brain (e.g., puzzles, learning)?",
    options: [
      { label: "Daily", value: "A", score: 5 },
      { label: "Weekly", value: "B", score: 4 },
      { label: "Monthly", value: "C", score: 3 },
      { label: "Rarely", value: "D", score: 2 },
      { label: "Never", value: "E", score: 1 }
    ]
  },
  {
    id: 6,
    question: "How well do you manage stress during challenging situations?",
    options: [
      { label: "Very Well", value: "A", score: 5 },
      { label: "Well", value: "B", score: 4 },
      { label: "Moderately", value: "C", score: 3 },
      { label: "Poorly", value: "D", score: 2 },
      { label: "Not at All", value: "E", score: 1 }
    ]
  },
  {
    id: 7,
    question: "How often do you feel mentally fatigued or drained?",
    options: [
      { label: "Never", value: "A", score: 5 },
      { label: "Rarely", value: "B", score: 4 },
      { label: "Sometimes", value: "C", score: 3 },
      { label: "Often", value: "D", score: 2 },
      { label: "Always", value: "E", score: 1 }
    ]
  },
  {
    id: 8,
    question: "How would you describe your overall mood most days?",
    options: [
      { label: "Very Positive", value: "A", score: 5 },
      { label: "Positive", value: "B", score: 4 },
      { label: "Neutral", value: "C", score: 3 },
      { label: "Negative", value: "D", score: 2 },
      { label: "Very Negative", value: "E", score: 1 }
    ]
  },
  {
    id: 9,
    question: "How frequently do you practice mindfulness or relaxation techniques?",
    options: [
      { label: "Daily", value: "A", score: 5 },
      { label: "Weekly", value: "B", score: 4 },
      { label: "Monthly", value: "C", score: 3 },
      { label: "Rarely", value: "D", score: 2 },
      { label: "Never", value: "E", score: 1 }
    ]
  },
  {
    id: 10,
    question: "Have you experienced thoughts of self-harm or hopelessness in the past month?",
    options: [
      { label: "Never", value: "A", score: 5 },
      { label: "Rarely", value: "B", score: 2 },
      { label: "Sometimes", value: "C", score: 1 },
      { label: "Often", value: "D", score: 0 },
      { label: "Always", value: "E", score: 0 }
    ]
  }
];

export default function Quiz() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

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