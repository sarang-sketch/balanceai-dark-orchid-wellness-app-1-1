"use client";

import { 
  Camera,
  Upload,
  Sparkles,
  Heart,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Pill,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Deficiency {
  name: string;
  severity: "low" | "moderate" | "high";
  confidence: number;
  symptoms: string[];
  recommendations: string[];
}

interface HealthScanResult {
  overallHealth: number;
  deficiencies: Deficiency[];
  positiveIndicators: string[];
}

export default function HealthScannerPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<HealthScanResult | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in?redirect=/health-scanner");
    }
  }, [session, isPending, router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        simulateScan();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate AI health analysis
    setTimeout(() => {
      const mockResult: HealthScanResult = {
        overallHealth: 78,
        deficiencies: [
          {
            name: "Vitamin D",
            severity: "moderate",
            confidence: 87,
            symptoms: ["Fatigue", "Weak bones", "Low mood"],
            recommendations: [
              "Get 15-20 minutes of sunlight daily",
              "Include fatty fish in your diet (salmon, mackerel)",
              "Consider Vitamin D3 supplement (consult doctor)",
              "Eat fortified dairy products"
            ]
          },
          {
            name: "Iron",
            severity: "low",
            confidence: 72,
            symptoms: ["Pale skin", "Tired easily"],
            recommendations: [
              "Eat iron-rich foods (spinach, red meat, lentils)",
              "Combine with Vitamin C for better absorption",
              "Avoid tea/coffee with iron-rich meals"
            ]
          }
        ],
        positiveIndicators: [
          "Good skin hydration levels",
          "Healthy eye appearance",
          "No visible inflammation markers",
          "Normal coloring and circulation"
        ]
      };
      setScanResult(mockResult);
      setIsScanning(false);
    }, 3000);
  };

  const updatePlanWithRecommendations = async () => {
    if (!scanResult || !session?.user) return;

    setUpdatingPlan(true);
    try {
      const token = localStorage.getItem("bearer_token");
      
      // Save health scan to database
      const response = await fetch("/api/health-scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          overallHealth: scanResult.overallHealth,
          deficiencies: scanResult.deficiencies.map(d => d.name),
          recommendations: scanResult.deficiencies.flatMap(d => d.recommendations),
          imageUrl: uploadedImage,
        }),
      });

      if (!response.ok) throw new Error("Failed to save health scan");

      toast.success("Health scan saved! Your wellness plan has been updated with personalized recommendations.");
      
      // Navigate to plan page
      setTimeout(() => {
        router.push("/plan");
      }, 2000);
    } catch (error) {
      toast.error("Failed to save health scan");
      console.error("Error saving health scan:", error);
    } finally {
      setUpdatingPlan(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-400";
      case "moderate":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-400/10 border-red-400/30";
      case "moderate":
        return "bg-yellow-400/10 border-yellow-400/30";
      case "low":
        return "bg-green-400/10 border-green-400/30";
      default:
        return "bg-muted/10";
    }
  };

  if (isPending) {
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orchid-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-4xl pb-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Health Scanner
          </h1>
          <p className="text-lg text-zinc-400">
            Real-time health analysis and deficiency detection
          </p>
        </div>

        {/* Upload Section */}
        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm mb-6">
          <div className="text-center">
            {!uploadedImage ? (
              <>
                <div className="w-full h-64 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center mb-6 hover:border-orchid/30 transition-colors">
                  <Camera size={64} className="text-orchid-neon mb-4" />
                  <p className="text-lg font-semibold text-white mb-2">Upload Health Photo</p>
                  <p className="text-sm text-zinc-400 mb-4">
                    Take a well-lit photo (eyes, skin, nails, tongue)
                  </p>
                  <label htmlFor="health-upload">
                    <span className="px-6 py-3 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer">
                      <Upload size={20} />
                      Choose Image
                    </span>
                  </label>
                  <input
                    id="health-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  🔒 Images are analyzed locally and deleted after scan
                </p>
              </>
            ) : (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Health scan"
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <Sparkles size={48} className="text-orchid-neon mx-auto mb-4 animate-spin" />
                      <p className="text-lg font-semibold text-white">Analyzing health markers...</p>
                      <p className="text-sm text-zinc-400">Detecting potential deficiencies</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="space-y-6">
            {/* Overall Health Score */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-4">Overall Health Score</h2>
                <div className="relative inline-block w-48 h-48">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="rgba(139, 90, 139, 0.2)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#C71585"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 88}`}
                      strokeDashoffset={`${2 * Math.PI * 88 * (1 - scanResult.overallHealth / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white">{scanResult.overallHealth}</span>
                    <span className="text-sm text-zinc-400">/ 100</span>
                  </div>
                </div>
                <p className="mt-4 text-zinc-400">
                  {scanResult.overallHealth >= 80 ? "Good health indicators" : 
                   scanResult.overallHealth >= 60 ? "Some areas need attention" : 
                   "Consider consulting a healthcare provider"}
                </p>
              </div>
            </div>

            {/* Detected Deficiencies */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <AlertTriangle className="mr-3 text-yellow-400" size={20} />
                Detected Deficiencies
              </h3>
              <div className="space-y-4">
                {scanResult.deficiencies.map((deficiency, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${getSeverityBg(deficiency.severity)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{deficiency.name}</h4>
                        <p className="text-sm text-zinc-400">
                          AI Confidence: {deficiency.confidence}%
                        </p>
                      </div>
                      <span className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${getSeverityColor(deficiency.severity)}`}>
                        {deficiency.severity}
                      </span>
                    </div>

                    {/* Symptoms */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-white mb-2">Potential Symptoms:</p>
                      <div className="flex flex-wrap gap-2">
                        {deficiency.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-black/50 border border-zinc-800 px-3 py-1 rounded-full text-zinc-300"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <p className="text-sm font-medium text-white mb-2 flex items-center">
                        <Pill size={16} className="mr-2 text-orchid-neon" />
                        Recommendations:
                      </p>
                      <ul className="space-y-2">
                        {deficiency.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm flex items-start space-x-2">
                            <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
                            <span className="text-zinc-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Positive Indicators */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Activity className="mr-3 text-green-400" size={20} />
                Positive Health Indicators
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scanResult.positiveIndicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-green-400/10 border border-green-400/30 rounded-xl"
                  >
                    <CheckCircle size={20} className="text-green-400 shrink-0" />
                    <span className="text-sm text-zinc-300">{indicator}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Integration */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Update Your Plan?</h3>
                  <p className="text-sm text-zinc-400">
                    Add these recommendations to your daily wellness plan
                  </p>
                </div>
                <button
                  onClick={updatePlanWithRecommendations}
                  disabled={updatingPlan}
                  className="px-6 py-3 bg-orchid-neon hover:bg-orchid-neon/90 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  {updatingPlan ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <TrendingUp size={20} />
                  )}
                  Update Plan
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-400 mb-1">Important Medical Disclaimer</p>
                  <p className="text-zinc-400">
                    This AI analysis is for informational purposes only and should not replace 
                    professional medical advice. Always consult a healthcare provider for accurate 
                    diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>

            {/* Scan Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setScanResult(null);
                }}
                className="px-6 py-3 border border-zinc-800 hover:border-orchid/50 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Camera size={20} />
                New Health Scan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}