import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gamificationProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    // If id provided, get single record by id
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(gamificationProgress)
        .where(eq(gamificationProgress.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Gamification progress record not found',
          code: "RECORD_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // If userId provided, get progress for that user
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: "Valid user ID is required",
          code: "INVALID_USER_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(gamificationProgress)
        .where(eq(gamificationProgress.userId, parseInt(userId)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ 
          error: 'Gamification progress not found for this user',
          code: "USER_PROGRESS_NOT_FOUND" 
        }, { status: 404 });
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // If no parameters provided, return error
    return NextResponse.json({ 
      error: "Either id or userId parameter is required",
      code: "MISSING_REQUIRED_PARAM" 
    }, { status: 400 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate userId parameter
    if (!userId) {
      return NextResponse.json({ 
        error: "userId query parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: "Valid user ID is required",
        code: "INVALID_USER_ID" 
      }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { level, experiencePoints, streakDays, badges, lastActivityDate } = body;

    // Check if record exists
    const existingRecord = await db.select()
      .from(gamificationProgress)
      .where(eq(gamificationProgress.userId, parseInt(userId)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ 
        error: 'Gamification progress not found for this user. Please create a progress record first.',
        code: "USER_PROGRESS_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate non-negative values
    if (experiencePoints !== undefined && experiencePoints < 0) {
      return NextResponse.json({ 
        error: "Experience points must be non-negative",
        code: "INVALID_EXPERIENCE_POINTS" 
      }, { status: 400 });
    }

    if (level !== undefined && level < 0) {
      return NextResponse.json({ 
        error: "Level must be non-negative",
        code: "INVALID_LEVEL" 
      }, { status: 400 });
    }

    if (streakDays !== undefined && streakDays < 0) {
      return NextResponse.json({ 
        error: "Streak days must be non-negative",
        code: "INVALID_STREAK_DAYS" 
      }, { status: 400 });
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (level !== undefined) updates.level = level;
    if (experiencePoints !== undefined) updates.experiencePoints = experiencePoints;
    if (streakDays !== undefined) updates.streakDays = streakDays;
    if (badges !== undefined) updates.badges = JSON.stringify(badges);
    if (lastActivityDate !== undefined) updates.lastActivityDate = lastActivityDate;

    // Update the record
    const updated = await db.update(gamificationProgress)
      .set(updates)
      .where(eq(gamificationProgress.userId, parseInt(userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update gamification progress',
        code: "UPDATE_FAILED" 
      }, { status: 500 });
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}