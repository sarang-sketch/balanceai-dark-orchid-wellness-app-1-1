import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

const VALID_NOTIFICATION_TYPES = ['reminder', 'achievement', 'update', 'check_in'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationType, message } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!notificationType) {
      return NextResponse.json(
        { error: 'notificationType is required', code: 'MISSING_NOTIFICATION_TYPE' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'message is required', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // Validate notificationType
    if (!VALID_NOTIFICATION_TYPES.includes(notificationType)) {
      return NextResponse.json(
        { 
          error: `notificationType must be one of: ${VALID_NOTIFICATION_TYPES.join(', ')}`, 
          code: 'INVALID_NOTIFICATION_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate userId is a valid integer
    const userIdInt = parseInt(userId);
    if (isNaN(userIdInt)) {
      return NextResponse.json(
        { error: 'userId must be a valid integer', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Create notification with auto-generated fields
    const newNotification = await db.insert(notifications)
      .values({
        userId: userIdInt,
        notificationType: notificationType.trim(),
        message: message.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newNotification[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const isRead = searchParams.get('isRead');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single notification by ID
    if (id) {
      const idInt = parseInt(id);
      if (isNaN(idInt)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const notification = await db.select()
        .from(notifications)
        .where(eq(notifications.id, idInt))
        .limit(1);

      if (notification.length === 0) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(notification[0]);
    }

    // Build query with filters
    let query = db.select().from(notifications);
    const conditions = [];

    // Filter by userId if provided
    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(notifications.userId, userIdInt));
    }

    // Filter by isRead if provided
    if (isRead !== null && isRead !== undefined) {
      const isReadBool = isRead === 'true';
      conditions.push(eq(notifications.isRead, isReadBool));
    }

    // Apply conditions
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Order by createdAt DESC and apply pagination
    const results = await query
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const idInt = parseInt(id);

    // Check if notification exists
    const existing = await db.select()
      .from(notifications)
      .where(eq(notifications.id, idInt))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update notification to mark as read
    const updated = await db.update(notifications)
      .set({
        isRead: true,
      })
      .where(eq(notifications.id, idInt))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}