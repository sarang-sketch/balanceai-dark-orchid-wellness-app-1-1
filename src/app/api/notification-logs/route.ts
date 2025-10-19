import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notificationLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Extract and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const reminderType = searchParams.get('reminderType');
    const status = searchParams.get('status');
    const notificationMethod = searchParams.get('notificationMethod');

    // Pagination with defaults and max limit
    const limit = Math.min(
      parseInt(limitParam || '50'),
      100
    );
    const offset = parseInt(offsetParam || '0');

    // Validate pagination parameters
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    if (isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter', code: 'INVALID_OFFSET' },
        { status: 400 }
      );
    }

    // Build filter conditions
    const conditions = [eq(notificationLogs.userId, user.id)];

    if (reminderType) {
      conditions.push(eq(notificationLogs.reminderType, reminderType));
    }

    if (status) {
      conditions.push(eq(notificationLogs.status, status));
    }

    if (notificationMethod) {
      conditions.push(eq(notificationLogs.notificationMethod, notificationMethod));
    }

    // Execute query with filters, ordering, and pagination
    const logs = await db
      .select()
      .from(notificationLogs)
      .where(and(...conditions))
      .orderBy(desc(notificationLogs.sentAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('GET notification logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}