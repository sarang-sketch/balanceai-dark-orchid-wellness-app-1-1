import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { journalEntries } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, entryText, moodAnalysis } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!entryText || entryText.trim() === '') {
      return NextResponse.json(
        { error: 'Entry text is required', code: 'MISSING_ENTRY_TEXT' },
        { status: 400 }
      );
    }

    if (!moodAnalysis) {
      return NextResponse.json(
        { error: 'Mood analysis is required', code: 'MISSING_MOOD_ANALYSIS' },
        { status: 400 }
      );
    }

    // Validate moodAnalysis values
    const validMoods = ['positive', 'neutral', 'needs attention'];
    if (!validMoods.includes(moodAnalysis)) {
      return NextResponse.json(
        {
          error: `Mood analysis must be one of: ${validMoods.join(', ')}`,
          code: 'INVALID_MOOD_ANALYSIS',
        },
        { status: 400 }
      );
    }

    // Create journal entry
    const newEntry = await db
      .insert(journalEntries)
      .values({
        userId: parseInt(userId),
        entryText: entryText.trim(),
        moodAnalysis,
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single entry by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const entry = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, parseInt(id)))
        .limit(1);

      if (entry.length === 0) {
        return NextResponse.json(
          { error: 'Journal entry not found', code: 'ENTRY_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(entry[0], { status: 200 });
    }

    // Filter by userId
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const entries = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, parseInt(userId)))
        .orderBy(desc(journalEntries.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(entries, { status: 200 });
    }

    // Return all entries with pagination
    const entries = await db
      .select()
      .from(journalEntries)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(entries, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}