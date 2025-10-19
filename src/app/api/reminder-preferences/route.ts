import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reminderPreferences } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_REMINDER_TYPES = ['wake_up_call', 'workout', 'meditation', 'meal', 'water'];
const VALID_NOTIFICATION_METHODS = ['email', 'whatsapp', 'both'];
const VALID_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

function validateDaysOfWeek(days: any): boolean {
  if (!Array.isArray(days)) return false;
  if (days.length === 0) return false;
  return days.every(day => typeof day === 'string' && VALID_DAYS.includes(day.toLowerCase()));
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const preferences = await db
      .select()
      .from(reminderPreferences)
      .where(eq(reminderPreferences.userId, parseInt(user.id)))
      .orderBy(desc(reminderPreferences.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(preferences);
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
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { reminderType, notificationMethod, enabled, scheduleTime, daysOfWeek } = body;

    if (!reminderType) {
      return NextResponse.json({ 
        error: 'reminderType is required',
        code: 'MISSING_REMINDER_TYPE' 
      }, { status: 400 });
    }

    if (!VALID_REMINDER_TYPES.includes(reminderType)) {
      return NextResponse.json({ 
        error: `reminderType must be one of: ${VALID_REMINDER_TYPES.join(', ')}`,
        code: 'INVALID_REMINDER_TYPE' 
      }, { status: 400 });
    }

    if (!notificationMethod) {
      return NextResponse.json({ 
        error: 'notificationMethod is required',
        code: 'MISSING_NOTIFICATION_METHOD' 
      }, { status: 400 });
    }

    if (!VALID_NOTIFICATION_METHODS.includes(notificationMethod)) {
      return NextResponse.json({ 
        error: `notificationMethod must be one of: ${VALID_NOTIFICATION_METHODS.join(', ')}`,
        code: 'INVALID_NOTIFICATION_METHOD' 
      }, { status: 400 });
    }

    if (!scheduleTime) {
      return NextResponse.json({ 
        error: 'scheduleTime is required',
        code: 'MISSING_SCHEDULE_TIME' 
      }, { status: 400 });
    }

    if (!validateTimeFormat(scheduleTime)) {
      return NextResponse.json({ 
        error: 'scheduleTime must be in HH:MM format (e.g., "07:30", "14:00")',
        code: 'INVALID_SCHEDULE_TIME_FORMAT' 
      }, { status: 400 });
    }

    if (!daysOfWeek) {
      return NextResponse.json({ 
        error: 'daysOfWeek is required',
        code: 'MISSING_DAYS_OF_WEEK' 
      }, { status: 400 });
    }

    if (!validateDaysOfWeek(daysOfWeek)) {
      return NextResponse.json({ 
        error: 'daysOfWeek must be a non-empty array of valid day names',
        code: 'INVALID_DAYS_OF_WEEK' 
      }, { status: 400 });
    }

    const now = new Date();
    const newPreference = await db
      .insert(reminderPreferences)
      .values({
        userId: parseInt(user.id),
        reminderType,
        notificationMethod,
        enabled: enabled !== undefined ? enabled : true,
        scheduleTime,
        daysOfWeek: JSON.stringify(daysOfWeek),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newPreference[0], { status: 201 });
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
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(reminderPreferences)
      .where(
        and(
          eq(reminderPreferences.id, parseInt(id)),
          eq(reminderPreferences.userId, parseInt(user.id))
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Reminder preference not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const updates: any = {};

    if (body.reminderType !== undefined) {
      if (!VALID_REMINDER_TYPES.includes(body.reminderType)) {
        return NextResponse.json({ 
          error: `reminderType must be one of: ${VALID_REMINDER_TYPES.join(', ')}`,
          code: 'INVALID_REMINDER_TYPE' 
        }, { status: 400 });
      }
      updates.reminderType = body.reminderType;
    }

    if (body.notificationMethod !== undefined) {
      if (!VALID_NOTIFICATION_METHODS.includes(body.notificationMethod)) {
        return NextResponse.json({ 
          error: `notificationMethod must be one of: ${VALID_NOTIFICATION_METHODS.join(', ')}`,
          code: 'INVALID_NOTIFICATION_METHOD' 
        }, { status: 400 });
      }
      updates.notificationMethod = body.notificationMethod;
    }

    if (body.scheduleTime !== undefined) {
      if (!validateTimeFormat(body.scheduleTime)) {
        return NextResponse.json({ 
          error: 'scheduleTime must be in HH:MM format (e.g., "07:30", "14:00")',
          code: 'INVALID_SCHEDULE_TIME_FORMAT' 
        }, { status: 400 });
      }
      updates.scheduleTime = body.scheduleTime;
    }

    if (body.daysOfWeek !== undefined) {
      if (!validateDaysOfWeek(body.daysOfWeek)) {
        return NextResponse.json({ 
          error: 'daysOfWeek must be a non-empty array of valid day names',
          code: 'INVALID_DAYS_OF_WEEK' 
        }, { status: 400 });
      }
      updates.daysOfWeek = JSON.stringify(body.daysOfWeek);
    }

    if (body.enabled !== undefined) {
      updates.enabled = body.enabled;
    }

    updates.updatedAt = new Date();

    const updated = await db
      .update(reminderPreferences)
      .set(updates)
      .where(
        and(
          eq(reminderPreferences.id, parseInt(id)),
          eq(reminderPreferences.userId, parseInt(user.id))
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Reminder preference not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'UNAUTHORIZED' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(reminderPreferences)
      .where(
        and(
          eq(reminderPreferences.id, parseInt(id)),
          eq(reminderPreferences.userId, parseInt(user.id))
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Reminder preference not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db
      .delete(reminderPreferences)
      .where(
        and(
          eq(reminderPreferences.id, parseInt(id)),
          eq(reminderPreferences.userId, parseInt(user.id))
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Reminder preference not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Reminder preference deleted successfully',
      deletedPreference: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}