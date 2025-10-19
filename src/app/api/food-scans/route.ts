import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { foodScans } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const results = await db
      .select()
      .from(foodScans)
      .where(eq(foodScans.userId, parseInt(user.id)))
      .orderBy(desc(foodScans.createdAt))
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

    const { foodName, calories, protein, carbs, fat, imageUrl } = body;

    // Validate required fields
    if (!foodName) {
      return NextResponse.json(
        {
          error: 'Food name is required',
          code: 'MISSING_FOOD_NAME',
        },
        { status: 400 }
      );
    }

    if (typeof foodName !== 'string' || foodName.trim() === '') {
      return NextResponse.json(
        {
          error: 'Food name must be a non-empty string',
          code: 'INVALID_FOOD_NAME',
        },
        { status: 400 }
      );
    }

    if (calories === undefined || calories === null) {
      return NextResponse.json(
        {
          error: 'Calories is required',
          code: 'MISSING_CALORIES',
        },
        { status: 400 }
      );
    }

    if (protein === undefined || protein === null) {
      return NextResponse.json(
        {
          error: 'Protein is required',
          code: 'MISSING_PROTEIN',
        },
        { status: 400 }
      );
    }

    if (carbs === undefined || carbs === null) {
      return NextResponse.json(
        {
          error: 'Carbs is required',
          code: 'MISSING_CARBS',
        },
        { status: 400 }
      );
    }

    if (fat === undefined || fat === null) {
      return NextResponse.json(
        {
          error: 'Fat is required',
          code: 'MISSING_FAT',
        },
        { status: 400 }
      );
    }

    // Validate nutritional values are valid integers
    const caloriesInt = parseInt(calories);
    const proteinInt = parseInt(protein);
    const carbsInt = parseInt(carbs);
    const fatInt = parseInt(fat);

    if (isNaN(caloriesInt)) {
      return NextResponse.json(
        {
          error: 'Calories must be a valid integer',
          code: 'INVALID_CALORIES',
        },
        { status: 400 }
      );
    }

    if (isNaN(proteinInt)) {
      return NextResponse.json(
        {
          error: 'Protein must be a valid integer',
          code: 'INVALID_PROTEIN',
        },
        { status: 400 }
      );
    }

    if (isNaN(carbsInt)) {
      return NextResponse.json(
        {
          error: 'Carbs must be a valid integer',
          code: 'INVALID_CARBS',
        },
        { status: 400 }
      );
    }

    if (isNaN(fatInt)) {
      return NextResponse.json(
        {
          error: 'Fat must be a valid integer',
          code: 'INVALID_FAT',
        },
        { status: 400 }
      );
    }

    // Validate nutritional values are not negative
    if (caloriesInt < 0) {
      return NextResponse.json(
        {
          error: 'Calories cannot be negative',
          code: 'NEGATIVE_CALORIES',
        },
        { status: 400 }
      );
    }

    if (proteinInt < 0) {
      return NextResponse.json(
        {
          error: 'Protein cannot be negative',
          code: 'NEGATIVE_PROTEIN',
        },
        { status: 400 }
      );
    }

    if (carbsInt < 0) {
      return NextResponse.json(
        {
          error: 'Carbs cannot be negative',
          code: 'NEGATIVE_CARBS',
        },
        { status: 400 }
      );
    }

    if (fatInt < 0) {
      return NextResponse.json(
        {
          error: 'Fat cannot be negative',
          code: 'NEGATIVE_FAT',
        },
        { status: 400 }
      );
    }

    // Create food scan
    const newFoodScan = await db
      .insert(foodScans)
      .values({
        userId: parseInt(user.id),
        foodName: foodName.trim(),
        calories: caloriesInt,
        protein: proteinInt,
        carbs: carbsInt,
        fat: fatInt,
        imageUrl: imageUrl || null,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newFoodScan[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}