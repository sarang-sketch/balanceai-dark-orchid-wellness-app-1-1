import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, content } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    // Validate content is not empty after trimming
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Content cannot be empty', code: 'EMPTY_CONTENT' },
        { status: 400 }
      );
    }

    // Create new community post
    const now = new Date().toISOString();
    const newPost = await db
      .insert(communityPosts)
      .values({
        userId: parseInt(userId),
        content: trimmedContent,
        likes: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
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

    // Get single post by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const post = await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.id, parseInt(id)))
        .limit(1);

      if (post.length === 0) {
        return NextResponse.json(
          { error: 'Post not found', code: 'POST_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(post[0], { status: 200 });
    }

    // Get paginated list of posts
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20'),
      100
    );
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(posts, { status: 200 });
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

    // Check if post exists
    const existingPost = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, parseInt(id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Increment likes and update timestamp
    const updatedPost = await db
      .update(communityPosts)
      .set({
        likes: sql`${communityPosts.likes} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(communityPosts.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedPost[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Check if post exists before deleting
    const existingPost = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, parseInt(id)))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Post not found', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the post
    const deletedPost = await db
      .delete(communityPosts)
      .where(eq(communityPosts.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Post deleted successfully',
        deletedPost: deletedPost[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}