import { NextRequest, NextResponse } from "next/server";

// API Key from requirements
const API_KEY = "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";

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

// Helper function for rate limiting
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const client = rateLimitStore.get(clientId);

  if (!client || now > client.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (client.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  client.count++;
  return true;
}

// Helper function for exponential backoff
async function retryWithBackoff(
  fn: () => Promise<Response>,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fn();
      if (response.ok) {
        return response;
      }

      if (attempt === maxRetries - 1) {
        throw new Error(`Max retries exceeded. Status: ${response.status}`);
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

// Screen Time API integration
async function getScreenTimeData(userId: string) {
  try {
    const response = await retryWithBackoff(() =>
      fetch("https://api.screentime-service.com/v1/device-usage", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "X-User-ID": userId,
        },
      })
    );

    const data = await response.json();

    return {
      totalHours: data.totalScreenTime || 0,
      appUsage: data.appBreakdown || {},
      digitalWellnessScore: calculateDigitalWellnessScore(data),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Screen time API error:", error);
    return {
      error: "Unable to fetch screen time data",
      fallback: generateMockScreenTimeData(),
    };
  }
}

// WhatsApp Business API integration
async function getWhatsAppActivity(userId: string) {
  try {
    const response = await retryWithBackoff(() =>
      fetch("https://api.whatsapp-business.com/v1/activity", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "X-User-ID": userId,
        },
      })
    );

    const data = await response.json();

    return {
      messagesReceived: data.incomingCount || 0,
      messagesSent: data.outgoingCount || 0,
      averageResponseTime: data.avgResponseTime || 0,
      peakActivityHours: data.peakHours || [],
      communicationScore: calculateCommunicationScore(data),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("WhatsApp API error:", error);
    return {
      error: "Unable to fetch WhatsApp activity",
      fallback: generateMockWhatsAppData(),
    };
  }
}

// Wearable APIs integration
async function getWearableData(userId: string) {
  try {
    // This would integrate with multiple wearable APIs
    const [fitbitData, appleHealthData] = await Promise.allSettled([
      getFitbitData(userId),
      getAppleHealthData(userId),
    ]);

    const fitbit = fitbitData.status === "fulfilled" ? fitbitData.value : null;
    const appleHealth = appleHealthData.status === "fulfilled" ? appleHealthData.value : null;

    return {
      steps: fitbit?.steps || appleHealth?.steps || 0,
      heartRate: fitbit?.heartRate || appleHealth?.heartRate || 0,
      sleepHours: fitbit?.sleepHours || appleHealth?.sleepHours || 0,
      activeMinutes: fitbit?.activeMinutes || appleHealth?.activeMinutes || 0,
      caloriesBurned: fitbit?.calories || appleHealth?.calories || 0,
      stressLevel: fitbit?.stress || appleHealth?.stress || 0,
      sources: {
        fitbit: !!fitbit,
        appleHealth: !!appleHealth,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Wearable API error:", error);
    return {
      error: "Unable to fetch wearable data",
      fallback: generateMockWearableData(),
    };
  }
}

async function getFitbitData(userId: string) {
  try {
    const response = await fetch("https://api.fitbit.com/1/user/-/activities/date/today.json", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "X-User-ID": userId,
      },
    });

    const data = await response.json();

    return {
      steps: data.steps || 0,
      calories: data.caloriesOut || 0,
      activeMinutes: data.fairlyActiveMinutes + data.veryActiveMinutes || 0,
    };
  } catch (error) {
    return null;
  }
}

async function getAppleHealthData(userId: string) {
  try {
    const response = await fetch("https://api.apple-health.com/v1/metrics", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "X-User-ID": userId,
      },
    });

    const data = await response.json();

    return {
      steps: data.stepCount || 0,
      heartRate: data.heartRate || 0,
      sleepHours: data.sleepAnalysis?.duration || 0,
      stressLevel: data.stressLevel || 0,
    };
  } catch (error) {
    return null;
  }
}

// SMS/Voice call scheduling
async function scheduleNotification(userId: string, type: "sms" | "voice", data: any) {
  try {
    const response = await fetch("https://api.notification-service.com/v1/schedule", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        type,
        ...data,
        scheduledAt: data.scheduledAt || new Date().toISOString(),
        otp: generateOTP(),
      }),
    });

    const result = await response.json();

    return {
      success: true,
      id: result.id,
      scheduledAt: result.scheduledAt,
      otp: result.otp,
    };
  } catch (error) {
    console.error("Notification scheduling error:", error);
    return {
      success: false,
      error: "Unable to schedule notification",
    };
  }
}

// Video streaming API
async function getVideoStream(videoId: string) {
  try {
    const response = await fetch(`https://api.video-streaming.com/v1/stream/${videoId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Video stream error: ${response.status}`);
    }

    const data = await response.json();

    return {
      streamUrl: data.url,
      quality: data.quality,
      duration: data.duration,
      subtitles: data.subtitles || [],
      thumbnails: data.thumbnails || [],
    };
  } catch (error) {
    console.error("Video streaming error:", error);
    return {
      error: "Unable to stream video",
    };
  }
}

// Helper functions
function calculateDigitalWellnessScore(data: any): number {
  const totalHours = data.totalScreenTime || 0;
  const appVariety = Object.keys(data.appBreakdown || {}).length;

  // Simple scoring algorithm (max 100)
  let score = 100;

  // Deduct points for excessive screen time (>8 hours)
  if (totalHours > 8) {
    score -= (totalHours - 8) * 10;
  }

  // Bonus points for app variety (digital diversity)
  score += Math.min(appVariety * 2, 20);

  return Math.max(0, Math.min(100, score));
}

function calculateCommunicationScore(data: any): number {
  const responseTime = data.avgResponseTime || 0;
  const messageBalance = (data.outgoingCount || 0) / (data.incomingCount || 1);

  // Score based on response time and communication balance
  let score = 100;

  if (responseTime > 60) {
    score -= Math.min(responseTime / 60, 50);
  }

  if (messageBalance > 2 || messageBalance < 0.5) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateMockScreenTimeData() {
  return {
    totalHours: 4.5,
    appUsage: {
      "Social Media": 2.1,
      "Work": 1.8,
      "Entertainment": 0.6,
    },
    digitalWellnessScore: 75,
  };
}

function generateMockWhatsAppData() {
  return {
    messagesReceived: 25,
    messagesSent: 30,
    averageResponseTime: 45,
    peakActivityHours: [9, 12, 20],
    communicationScore: 80,
  };
}

function generateMockWearableData() {
  return {
    steps: 8432,
    heartRate: 72,
    sleepHours: 7.5,
    activeMinutes: 45,
    caloriesBurned: 2150,
    stressLevel: 3,
  };
}

// Main API route handler
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get("x-forwarded-for") || request.ip || "unknown";
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let data;

    switch (type) {
      case "screen-time":
        data = await getScreenTimeData(userId);
        break;
      case "whatsapp":
        data = await getWhatsAppActivity(userId);
        break;
      case "wearable":
        data = await getWearableData(userId);
        break;
      case "all":
        data = await Promise.allSettled([
          getScreenTimeData(userId),
          getWhatsAppActivity(userId),
          getWearableData(userId),
        ]).then(([screenTime, whatsapp, wearable]) => ({
          screenTime: screenTime.status === "fulfilled" ? screenTime.value : { error: screenTime.reason },
          whatsapp: whatsapp.status === "fulfilled" ? whatsapp.value : { error: whatsapp.reason },
          wearable: wearable.status === "fulfilled" ? wearable.value : { error: wearable.reason },
        }));
        break;
      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Real-time data API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch real-time data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, data } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: "User ID and type are required" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "schedule-sms":
      case "schedule-voice":
        result = await scheduleNotification(userId, type === "schedule-sms" ? "sms" : "voice", data);
        break;
      case "video-stream":
        result = await getVideoStream(data.videoId);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Real-time data API POST error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to process request",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}