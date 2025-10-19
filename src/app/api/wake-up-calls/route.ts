import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { wakeUpCalls } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const results = await db
      .select()
      .from(wakeUpCalls)
      .where(eq(wakeUpCalls.userId, parseInt(user.id)))
      .orderBy(asc(wakeUpCalls.scheduledTime));

    return NextResponse.json(results, { status: 200 });
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
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
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

    const { scheduledTime, enabled } = body;

    // Validate required fields
    if (!scheduledTime) {
      return NextResponse.json(
        {
          error: 'scheduledTime is required',
          code: 'MISSING_SCHEDULED_TIME',
        },
        { status: 400 }
      );
    }

    if (typeof scheduledTime !== 'string' || scheduledTime.trim() === '') {
      return NextResponse.json(
        {
          error: 'scheduledTime must be a non-empty string',
          code: 'INVALID_SCHEDULED_TIME',
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData = {
      userId: parseInt(user.id),
      scheduledTime: scheduledTime.trim(),
      enabled: enabled !== undefined ? Boolean(enabled) : true,
      createdAt: new Date(),
    };

    const newWakeUpCall = await db
      .insert(wakeUpCalls)
      .values(insertData)
      .returning();

    return NextResponse.json(newWakeUpCall[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
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

    const { enabled } = body;

    // Validate enabled field is present
    if (enabled === undefined) {
      return NextResponse.json(
        { error: 'enabled field is required', code: 'MISSING_ENABLED_FIELD' },
        { status: 400 }
      );
    }

    // Check if wake-up call exists and belongs to user
    const existing = await db
      .select()
      .from(wakeUpCalls)
      .where(
        and(
          eq(wakeUpCalls.id, parseInt(id)),
          eq(wakeUpCalls.userId, parseInt(user.id))
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Wake-up call not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Update only the enabled field
    const updated = await db
      .update(wakeUpCalls)
      .set({
        enabled: Boolean(enabled),
      })
      .where(
        and(
          eq(wakeUpCalls.id, parseInt(id)),
          eq(wakeUpCalls.userId, parseInt(user.id))
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Wake-up call not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}