import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dailyStats } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
        { status: 400 }
      );
    }

    // If date is provided, return single record for that date
    if (date) {
      const stats = await db
        .select()
        .from(dailyStats)
        .where(and(eq(dailyStats.userId, parseInt(user.id)), eq(dailyStats.date, date)))
        .limit(1);

      if (stats.length === 0) {
        return NextResponse.json(
          { error: 'Stats not found for the specified date', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(stats[0], { status: 200 });
    }

    // If no date provided, return all stats for user ordered by date descending
    const allStats = await db
      .select()
      .from(dailyStats)
      .where(eq(dailyStats.userId, parseInt(user.id)))
      .orderBy(desc(dailyStats.date));

    return NextResponse.json(allStats, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { date, steps, caloriesBurned, workoutMinutes, waterIntake } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required', code: 'MISSING_DATE' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
        { status: 400 }
      );
    }

    // Validate optional integer fields
    const validateInteger = (value: any, fieldName: string) => {
      if (value !== undefined && value !== null) {
        const num = parseInt(value);
        if (isNaN(num)) {
          throw new Error(`${fieldName} must be a valid integer`);
        }
        return num;
      }
      return null;
    };

    let validatedSteps = null;
    let validatedCaloriesBurned = null;
    let validatedWorkoutMinutes = null;
    let validatedWaterIntake = null;

    try {
      validatedSteps = validateInteger(steps, 'Steps');
      validatedCaloriesBurned = validateInteger(caloriesBurned, 'Calories burned');
      validatedWorkoutMinutes = validateInteger(workoutMinutes, 'Workout minutes');
      validatedWaterIntake = validateInteger(waterIntake, 'Water intake');
    } catch (validationError: any) {
      return NextResponse.json(
        { error: validationError.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Check if record exists for this user and date
    const existing = await db
      .select()
      .from(dailyStats)
      .where(and(eq(dailyStats.userId, parseInt(user.id)), eq(dailyStats.date, date)))
      .limit(1);

    const currentTimestamp = new Date();

    if (existing.length > 0) {
      // Update existing record
      const updateData: any = {
        updatedAt: currentTimestamp,
      };

      if (steps !== undefined && steps !== null) updateData.steps = validatedSteps;
      if (caloriesBurned !== undefined && caloriesBurned !== null)
        updateData.caloriesBurned = validatedCaloriesBurned;
      if (workoutMinutes !== undefined && workoutMinutes !== null)
        updateData.workoutMinutes = validatedWorkoutMinutes;
      if (waterIntake !== undefined && waterIntake !== null)
        updateData.waterIntake = validatedWaterIntake;

      const updated = await db
        .update(dailyStats)
        .set(updateData)
        .where(and(eq(dailyStats.userId, parseInt(user.id)), eq(dailyStats.date, date)))
        .returning();

      return NextResponse.json(updated[0], { status: 201 });
    } else {
      // Insert new record
      const newStats = await db
        .insert(dailyStats)
        .values({
          userId: parseInt(user.id),
          date,
          steps: validatedSteps,
          caloriesBurned: validatedCaloriesBurned,
          workoutMinutes: validatedWorkoutMinutes,
          waterIntake: validatedWaterIntake,
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        })
        .returning();

      return NextResponse.json(newStats[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}