import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reminderPreferences, notificationLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

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

    const { preferenceId } = body;

    // Validate preferenceId is provided
    if (!preferenceId) {
      return NextResponse.json(
        {
          error: 'Preference ID is required',
          code: 'MISSING_PREFERENCE_ID',
        },
        { status: 400 }
      );
    }

    // Validate preferenceId is valid integer
    const parsedPreferenceId = parseInt(preferenceId);
    if (isNaN(parsedPreferenceId)) {
      return NextResponse.json(
        {
          error: 'Preference ID must be a valid integer',
          code: 'INVALID_PREFERENCE_ID',
        },
        { status: 400 }
      );
    }

    // Fetch reminder preference and verify it belongs to authenticated user
    const preference = await db
      .select()
      .from(reminderPreferences)
      .where(
        and(
          eq(reminderPreferences.id, parsedPreferenceId),
          eq(reminderPreferences.userId, user.id)
        )
      )
      .limit(1);

    if (preference.length === 0) {
      return NextResponse.json(
        {
          error: 'Reminder preference not found or does not belong to user',
          code: 'PREFERENCE_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const reminderPreference = preference[0];

    // Check if preference is enabled
    if (!reminderPreference.enabled) {
      return NextResponse.json(
        {
          error: 'Reminder preference is disabled',
          code: 'PREFERENCE_DISABLED',
        },
        { status: 400 }
      );
    }

    // Construct message based on reminderType
    const messageMap: Record<string, string> = {
      wake_up_call: 'Good morning! Time to wake up and start your day!',
      workout: "Time for your workout session! Let's get moving!",
      meditation: 'Time for your meditation practice. Take a moment to breathe.',
      meal: "Meal reminder! Don't forget to eat healthy and stay nourished.",
      water: 'Hydration reminder! Time to drink some water.',
    };

    const message =
      messageMap[reminderPreference.reminderType] ||
      'Time for your scheduled reminder!';

    // Create notification log entry
    const notificationLog = await db
      .insert(notificationLogs)
      .values({
        userId: user.id,
        reminderType: reminderPreference.reminderType,
        notificationMethod: reminderPreference.notificationMethod,
        message: message,
        sentAt: new Date(),
        status: 'sent',
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Reminder sent successfully',
        log: notificationLog[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}