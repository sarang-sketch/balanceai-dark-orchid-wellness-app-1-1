import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizResults } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, answers, moodResult, balanceScore, physicalScore, cognitiveScore, digitalScore } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!answers) {
      return NextResponse.json({ 
        error: "answers is required",
        code: "MISSING_ANSWERS" 
      }, { status: 400 });
    }

    if (!moodResult) {
      return NextResponse.json({ 
        error: "moodResult is required",
        code: "MISSING_MOOD_RESULT" 
      }, { status: 400 });
    }

    if (balanceScore === undefined || balanceScore === null) {
      return NextResponse.json({ 
        error: "balanceScore is required",
        code: "MISSING_BALANCE_SCORE" 
      }, { status: 400 });
    }

    if (physicalScore === undefined || physicalScore === null) {
      return NextResponse.json({ 
        error: "physicalScore is required",
        code: "MISSING_PHYSICAL_SCORE" 
      }, { status: 400 });
    }

    if (cognitiveScore === undefined || cognitiveScore === null) {
      return NextResponse.json({ 
        error: "cognitiveScore is required",
        code: "MISSING_COGNITIVE_SCORE" 
      }, { status: 400 });
    }

    if (digitalScore === undefined || digitalScore === null) {
      return NextResponse.json({ 
        error: "digitalScore is required",
        code: "MISSING_DIGITAL_SCORE" 
      }, { status: 400 });
    }

    // Validate moodResult values
    const validMoodResults = ["balanced", "needs_attention", "overloaded"];
    if (!validMoodResults.includes(moodResult)) {
      return NextResponse.json({ 
        error: "moodResult must be one of: balanced, needs_attention, overloaded",
        code: "INVALID_MOOD_RESULT" 
      }, { status: 400 });
    }

    // Validate score ranges (0-100)
    const scores = [
      { value: balanceScore, name: "balanceScore" },
      { value: physicalScore, name: "physicalScore" },
      { value: cognitiveScore, name: "cognitiveScore" },
      { value: digitalScore, name: "digitalScore" }
    ];

    for (const score of scores) {
      if (score.value < 0 || score.value > 100) {
        return NextResponse.json({ 
          error: `${score.name} must be between 0 and 100`,
          code: "INVALID_SCORE_RANGE" 
        }, { status: 400 });
      }
    }

    // Validate answers is a valid JSON object
    if (typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ 
        error: "answers must be a valid JSON object",
        code: "INVALID_ANSWERS_FORMAT" 
      }, { status: 400 });
    }

    // Create new quiz result
    const newQuizResult = await db.insert(quizResults)
      .values({
        userId: parseInt(userId),
        answers: JSON.stringify(answers),
        moodResult,
        balanceScore: parseInt(balanceScore),
        physicalScore: parseInt(physicalScore),
        cognitiveScore: parseInt(cognitiveScore),
        digitalScore: parseInt(digitalScore),
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newQuizResult[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const result = await db.select()
        .from(quizResults)
        .where(eq(quizResults.id, parseInt(id)))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json({ 
          error: 'Quiz result not found',
          code: "NOT_FOUND" 
        }, { status: 404 });
      }

      // Parse JSON answers for response
      const record = result[0];
      return NextResponse.json({
        ...record,
        answers: typeof record.answers === 'string' ? JSON.parse(record.answers) : record.answers
      });
    }

    // Filter by userId
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid userId is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

      const results = await db.select()
        .from(quizResults)
        .where(eq(quizResults.userId, parseInt(userId)))
        .orderBy(desc(quizResults.createdAt));

      // Parse JSON answers for all results
      const parsedResults = results.map(record => ({
        ...record,
        answers: typeof record.answers === 'string' ? JSON.parse(record.answers) : record.answers
      }));

      return NextResponse.json(parsedResults);
    }

    // Get all with pagination
    const results = await db.select()
      .from(quizResults)
      .orderBy(desc(quizResults.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse JSON answers for all results
    const parsedResults = results.map(record => ({
      ...record,
      answers: typeof record.answers === 'string' ? JSON.parse(record.answers) : record.answers
    }));

    return NextResponse.json(parsedResults);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}