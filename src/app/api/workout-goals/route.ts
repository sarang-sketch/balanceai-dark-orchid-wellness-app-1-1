import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workoutGoals } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const goals = await db.select()
      .from(workoutGoals)
      .where(eq(workoutGoals.userId, user.id))
      .orderBy(desc(workoutGoals.createdAt));

    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { goalType, targetValue, currentValue } = body;

    // Validate required fields
    if (!goalType) {
      return NextResponse.json({ 
        error: "Goal type is required",
        code: "MISSING_GOAL_TYPE" 
      }, { status: 400 });
    }

    if (typeof goalType !== 'string' || goalType.trim() === '') {
      return NextResponse.json({ 
        error: "Goal type must be a non-empty string",
        code: "INVALID_GOAL_TYPE" 
      }, { status: 400 });
    }

    if (targetValue === undefined || targetValue === null) {
      return NextResponse.json({ 
        error: "Target value is required",
        code: "MISSING_TARGET_VALUE" 
      }, { status: 400 });
    }

    if (!Number.isInteger(targetValue)) {
      return NextResponse.json({ 
        error: "Target value must be an integer",
        code: "INVALID_TARGET_VALUE" 
      }, { status: 400 });
    }

    if (targetValue <= 0) {
      return NextResponse.json({ 
        error: "Target value must be greater than 0",
        code: "INVALID_TARGET_VALUE_RANGE" 
      }, { status: 400 });
    }

    // Validate optional currentValue if provided
    const finalCurrentValue = currentValue !== undefined ? currentValue : 0;
    if (!Number.isInteger(finalCurrentValue)) {
      return NextResponse.json({ 
        error: "Current value must be an integer",
        code: "INVALID_CURRENT_VALUE" 
      }, { status: 400 });
    }

    if (finalCurrentValue < 0) {
      return NextResponse.json({ 
        error: "Current value cannot be negative",
        code: "INVALID_CURRENT_VALUE_RANGE" 
      }, { status: 400 });
    }

    const now = new Date();

    const newGoal = await db.insert(workoutGoals)
      .values({
        userId: user.id,
        goalType: goalType.trim(),
        targetValue,
        currentValue: finalCurrentValue,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newGoal[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const body = await request.json();
    const { currentValue } = body;

    if (currentValue === undefined || currentValue === null) {
      return NextResponse.json({ 
        error: "Current value is required",
        code: "MISSING_CURRENT_VALUE" 
      }, { status: 400 });
    }

    if (!Number.isInteger(currentValue)) {
      return NextResponse.json({ 
        error: "Current value must be an integer",
        code: "INVALID_CURRENT_VALUE" 
      }, { status: 400 });
    }

    if (currentValue < 0) {
      return NextResponse.json({ 
        error: "Current value cannot be negative",
        code: "INVALID_CURRENT_VALUE_RANGE" 
      }, { status: 400 });
    }

    // Check if goal exists and belongs to user
    const existingGoal = await db.select()
      .from(workoutGoals)
      .where(and(
        eq(workoutGoals.id, parseInt(id)),
        eq(workoutGoals.userId, user.id)
      ))
      .limit(1);

    if (existingGoal.length === 0) {
      return NextResponse.json({ 
        error: 'Workout goal not found',
        code: "GOAL_NOT_FOUND" 
      }, { status: 404 });
    }

    const updated = await db.update(workoutGoals)
      .set({
        currentValue,
        updatedAt: new Date(),
      })
      .where(and(
        eq(workoutGoals.id, parseInt(id)),
        eq(workoutGoals.userId, user.id)
      ))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}