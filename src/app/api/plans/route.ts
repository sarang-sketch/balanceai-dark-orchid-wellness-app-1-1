import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { plans } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

const VALID_GOAL_IDS = ['fitness', 'mental', 'sleep', 'digital', 'custom'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, goalId, goalTitle, planItems } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!goalId) {
      return NextResponse.json(
        { error: 'goalId is required', code: 'MISSING_GOAL_ID' },
        { status: 400 }
      );
    }

    if (!goalTitle) {
      return NextResponse.json(
        { error: 'goalTitle is required', code: 'MISSING_GOAL_TITLE' },
        { status: 400 }
      );
    }

    if (!planItems) {
      return NextResponse.json(
        { error: 'planItems is required', code: 'MISSING_PLAN_ITEMS' },
        { status: 400 }
      );
    }

    // Validate goalId is one of the allowed values
    if (!VALID_GOAL_IDS.includes(goalId)) {
      return NextResponse.json(
        { 
          error: `goalId must be one of: ${VALID_GOAL_IDS.join(', ')}`, 
          code: 'INVALID_GOAL_ID' 
        },
        { status: 400 }
      );
    }

    // Validate planItems is an array
    if (!Array.isArray(planItems)) {
      return NextResponse.json(
        { error: 'planItems must be an array', code: 'INVALID_PLAN_ITEMS' },
        { status: 400 }
      );
    }

    // Create new plan with auto-generated timestamps
    const timestamp = new Date().toISOString();
    const newPlan = await db.insert(plans)
      .values({
        userId: parseInt(userId),
        goalId: goalId.trim(),
        goalTitle: goalTitle.trim(),
        planItems: planItems,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    return NextResponse.json(newPlan[0], { status: 201 });
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Single plan by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const plan = await db.select()
        .from(plans)
        .where(eq(plans.id, parseInt(id)))
        .limit(1);

      if (plan.length === 0) {
        return NextResponse.json(
          { error: 'Plan not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(plan[0], { status: 200 });
    }

    // Plans filtered by userId
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid userId is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      const userPlans = await db.select()
        .from(plans)
        .where(eq(plans.userId, parseInt(userId)))
        .orderBy(desc(plans.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(userPlans, { status: 200 });
    }

    // All plans with pagination
    const allPlans = await db.select()
      .from(plans)
      .orderBy(desc(plans.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(allPlans, { status: 200 });
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

    // Validate ID is provided and valid
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const existingPlan = await db.select()
      .from(plans)
      .where(eq(plans.id, parseInt(id)))
      .limit(1);

    if (existingPlan.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { goalId, goalTitle, planItems } = body;

    // Validate goalId if provided
    if (goalId && !VALID_GOAL_IDS.includes(goalId)) {
      return NextResponse.json(
        { 
          error: `goalId must be one of: ${VALID_GOAL_IDS.join(', ')}`, 
          code: 'INVALID_GOAL_ID' 
        },
        { status: 400 }
      );
    }

    // Validate planItems is an array if provided
    if (planItems && !Array.isArray(planItems)) {
      return NextResponse.json(
        { error: 'planItems must be an array', code: 'INVALID_PLAN_ITEMS' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: {
      goalId?: string;
      goalTitle?: string;
      planItems?: any[];
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (goalId !== undefined) {
      updates.goalId = goalId.trim();
    }

    if (goalTitle !== undefined) {
      updates.goalTitle = goalTitle.trim();
    }

    if (planItems !== undefined) {
      updates.planItems = planItems;
    }

    // Update the plan
    const updatedPlan = await db.update(plans)
      .set(updates)
      .where(eq(plans.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedPlan[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}