import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { progressTracking } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, trackingDate, sleepHours, screenTimeHours, steps, calories, stressLevel } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!trackingDate) {
      return NextResponse.json(
        { error: 'Tracking date is required', code: 'MISSING_TRACKING_DATE' },
        { status: 400 }
      );
    }

    // Validate trackingDate format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(trackingDate)) {
      return NextResponse.json(
        { error: 'Tracking date must be in YYYY-MM-DD format', code: 'INVALID_DATE_FORMAT' },
        { status: 400 }
      );
    }

    // Validate stressLevel if provided
    if (stressLevel !== undefined && stressLevel !== null) {
      const stressLevelNum = parseInt(stressLevel);
      if (isNaN(stressLevelNum) || stressLevelNum < 1 || stressLevelNum > 10) {
        return NextResponse.json(
          { error: 'Stress level must be between 1 and 10', code: 'INVALID_STRESS_LEVEL' },
          { status: 400 }
        );
      }
    }

    // Create progress entry
    const newEntry = await db.insert(progressTracking)
      .values({
        userId: parseInt(userId),
        trackingDate: trackingDate.trim(),
        sleepHours: sleepHours !== undefined ? parseFloat(sleepHours) : null,
        screenTimeHours: screenTimeHours !== undefined ? parseFloat(screenTimeHours) : null,
        steps: steps !== undefined ? parseInt(steps) : null,
        calories: calories !== undefined ? parseInt(calories) : null,
        stressLevel: stressLevel !== undefined ? parseInt(stressLevel) : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single entry by ID
    if (id) {
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const entry = await db.select()
        .from(progressTracking)
        .where(eq(progressTracking.id, idNum))
        .limit(1);

      if (entry.length === 0) {
        return NextResponse.json(
          { error: 'Progress entry not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(entry[0], { status: 200 });
    }

    // Build query with filters
    let query = db.select().from(progressTracking);
    const conditions = [];

    // Filter by userId
    if (userId) {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json(
          { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(progressTracking.userId, userIdNum));
    }

    // Filter by date range
    if (startDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate)) {
        return NextResponse.json(
          { error: 'Start date must be in YYYY-MM-DD format', code: 'INVALID_START_DATE' },
          { status: 400 }
        );
      }
      conditions.push(gte(progressTracking.trackingDate, startDate));
    }

    if (endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(endDate)) {
        return NextResponse.json(
          { error: 'End date must be in YYYY-MM-DD format', code: 'INVALID_END_DATE' },
          { status: 400 }
        );
      }
      conditions.push(lte(progressTracking.trackingDate, endDate));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering and pagination
    const results = await query
      .orderBy(desc(progressTracking.trackingDate))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const idNum = parseInt(id);

    // Check if record exists
    const existing = await db.select()
      .from(progressTracking)
      .where(eq(progressTracking.id, idNum))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Progress entry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { sleepHours, screenTimeHours, steps, calories, stressLevel, trackingDate } = body;

    // Validate trackingDate format if provided
    if (trackingDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(trackingDate)) {
        return NextResponse.json(
          { error: 'Tracking date must be in YYYY-MM-DD format', code: 'INVALID_DATE_FORMAT' },
          { status: 400 }
        );
      }
    }

    // Validate stressLevel if provided
    if (stressLevel !== undefined && stressLevel !== null) {
      const stressLevelNum = parseInt(stressLevel);
      if (isNaN(stressLevelNum) || stressLevelNum < 1 || stressLevelNum > 10) {
        return NextResponse.json(
          { error: 'Stress level must be between 1 and 10', code: 'INVALID_STRESS_LEVEL' },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: any = {};
    
    if (trackingDate !== undefined) updates.trackingDate = trackingDate.trim();
    if (sleepHours !== undefined) updates.sleepHours = sleepHours !== null ? parseFloat(sleepHours) : null;
    if (screenTimeHours !== undefined) updates.screenTimeHours = screenTimeHours !== null ? parseFloat(screenTimeHours) : null;
    if (steps !== undefined) updates.steps = steps !== null ? parseInt(steps) : null;
    if (calories !== undefined) updates.calories = calories !== null ? parseInt(calories) : null;
    if (stressLevel !== undefined) updates.stressLevel = stressLevel !== null ? parseInt(stressLevel) : null;

    // Update the record
    const updated = await db.update(progressTracking)
      .set(updates)
      .where(eq(progressTracking.id, idNum))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}