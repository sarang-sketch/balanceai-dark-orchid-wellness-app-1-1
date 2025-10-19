import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthScans } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const results = await db.select()
      .from(healthScans)
      .where(eq(healthScans.userId, parseInt(user.id)))
      .orderBy(desc(healthScans.createdAt))
      .limit(limit)
      .offset(offset);

    const parsedResults = results.map(scan => ({
      ...scan,
      deficiencies: typeof scan.deficiencies === 'string' 
        ? JSON.parse(scan.deficiencies) 
        : scan.deficiencies,
      recommendations: typeof scan.recommendations === 'string'
        ? JSON.parse(scan.recommendations)
        : scan.recommendations
    }));

    return NextResponse.json(parsedResults);
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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { overallHealth, deficiencies, recommendations, imageUrl } = body;

    if (overallHealth === undefined || overallHealth === null) {
      return NextResponse.json({ 
        error: "Overall health score is required",
        code: "MISSING_OVERALL_HEALTH" 
      }, { status: 400 });
    }

    if (!deficiencies) {
      return NextResponse.json({ 
        error: "Deficiencies are required",
        code: "MISSING_DEFICIENCIES" 
      }, { status: 400 });
    }

    if (!recommendations) {
      return NextResponse.json({ 
        error: "Recommendations are required",
        code: "MISSING_RECOMMENDATIONS" 
      }, { status: 400 });
    }

    const overallHealthNum = parseInt(overallHealth);
    if (isNaN(overallHealthNum)) {
      return NextResponse.json({ 
        error: "Overall health must be a valid integer",
        code: "INVALID_OVERALL_HEALTH_TYPE" 
      }, { status: 400 });
    }

    if (overallHealthNum < 0 || overallHealthNum > 100) {
      return NextResponse.json({ 
        error: "Overall health must be between 0 and 100",
        code: "INVALID_OVERALL_HEALTH_RANGE" 
      }, { status: 400 });
    }

    let deficienciesData;
    let recommendationsData;

    try {
      if (typeof deficiencies === 'string') {
        deficienciesData = JSON.parse(deficiencies);
      } else if (typeof deficiencies === 'object') {
        deficienciesData = deficiencies;
      } else {
        return NextResponse.json({ 
          error: "Deficiencies must be a valid JSON structure",
          code: "INVALID_DEFICIENCIES_FORMAT" 
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ 
        error: "Deficiencies must be valid JSON",
        code: "INVALID_DEFICIENCIES_JSON" 
      }, { status: 400 });
    }

    try {
      if (typeof recommendations === 'string') {
        recommendationsData = JSON.parse(recommendations);
      } else if (typeof recommendations === 'object') {
        recommendationsData = recommendations;
      } else {
        return NextResponse.json({ 
          error: "Recommendations must be a valid JSON structure",
          code: "INVALID_RECOMMENDATIONS_FORMAT" 
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ 
        error: "Recommendations must be valid JSON",
        code: "INVALID_RECOMMENDATIONS_JSON" 
      }, { status: 400 });
    }

    const newHealthScan = await db.insert(healthScans)
      .values({
        userId: parseInt(user.id),
        overallHealth: overallHealthNum,
        deficiencies: JSON.stringify(deficienciesData),
        recommendations: JSON.stringify(recommendationsData),
        imageUrl: imageUrl || null,
        createdAt: new Date()
      })
      .returning();

    const createdScan = {
      ...newHealthScan[0],
      deficiencies: typeof newHealthScan[0].deficiencies === 'string'
        ? JSON.parse(newHealthScan[0].deficiencies)
        : newHealthScan[0].deficiencies,
      recommendations: typeof newHealthScan[0].recommendations === 'string'
        ? JSON.parse(newHealthScan[0].recommendations)
        : newHealthScan[0].recommendations
    };

    return NextResponse.json(createdScan, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}