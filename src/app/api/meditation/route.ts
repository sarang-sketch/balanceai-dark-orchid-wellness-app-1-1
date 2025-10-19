import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meditationSessions } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const stats = searchParams.get('stats');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single record by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const session = await db
        .select()
        .from(meditationSessions)
        .where(eq(meditationSessions.id, parseInt(id)))
        .limit(1);

      if (session.length === 0) {
        return NextResponse.json(
          { error: 'Meditation session not found', code: 'SESSION_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(session[0], { status: 200 });
    }

    // Statistics for user - MUST CHECK BEFORE userId alone
    if (userId && stats === 'true') {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const statsResult = await db
        .select({
          totalSessions: sql<number>`CAST(count(*) AS INTEGER)`,
          totalMinutes: sql<number>`CAST(COALESCE(sum(${meditationSessions.durationMinutes}), 0) AS INTEGER)`,
          averageDuration: sql<number>`CAST(COALESCE(avg(${meditationSessions.durationMinutes}), 0) AS REAL)`,
        })
        .from(meditationSessions)
        .where(eq(meditationSessions.userId, parseInt(userId)));

      const statsData = statsResult[0];
      return NextResponse.json(
        {
          totalSessions: Number(statsData.totalSessions) || 0,
          totalMinutes: Number(statsData.totalMinutes) || 0,
          averageDuration: Math.round(Number(statsData.averageDuration) * 100) / 100 || 0,
        },
        { status: 200 }
      );
    }

    // Filter by userId (without stats)
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const sessions = await db
        .select()
        .from(meditationSessions)
        .where(eq(meditationSessions.userId, parseInt(userId)))
        .orderBy(desc(meditationSessions.completedAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(sessions, { status: 200 });
    }

    // List all with pagination
    const sessions = await db
      .select()
      .from(meditationSessions)
      .orderBy(desc(meditationSessions.completedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(sessions, { status: 200 });
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
    const body = await request.json();
    const { userId, sessionType, durationMinutes, completedAt } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!sessionType) {
      return NextResponse.json(
        { error: 'Session type is required', code: 'MISSING_SESSION_TYPE' },
        { status: 400 }
      );
    }

    if (durationMinutes === undefined || durationMinutes === null) {
      return NextResponse.json(
        { error: 'Duration in minutes is required', code: 'MISSING_DURATION' },
        { status: 400 }
      );
    }

    // Validate data types
    if (isNaN(parseInt(String(userId)))) {
      return NextResponse.json(
        { error: 'User ID must be a valid number', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(String(durationMinutes))) || parseInt(String(durationMinutes)) <= 0) {
      return NextResponse.json(
        {
          error: 'Duration must be a positive number',
          code: 'INVALID_DURATION',
        },
        { status: 400 }
      );
    }

    // Validate sessionType
    const validSessionTypes = [
      'morning_mindfulness',
      'evening_calm',
      'digital_detox',
      'stress_relief',
      'sleep_preparation',
    ];

    if (typeof sessionType !== 'string' || sessionType.trim() === '') {
      return NextResponse.json(
        {
          error: 'Session type must be a non-empty string',
          code: 'INVALID_SESSION_TYPE',
        },
        { status: 400 }
      );
    }

    // Insert new meditation session
    const newSession = await db
      .insert(meditationSessions)
      .values({
        userId: parseInt(String(userId)),
        sessionType: sessionType.trim(),
        durationMinutes: parseInt(String(durationMinutes)),
        completedAt: completedAt || new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newSession[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}