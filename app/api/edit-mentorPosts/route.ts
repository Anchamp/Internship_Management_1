import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import MentorPost from '@/models/MentorPost';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();
    const { username, postId, postContent, postTitle, postType } = body;

    // Validate User
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const user = await User.findOne({ username }).select("username role").lean() as {
      username?: string;
      role?: string;
      [key: string]: any;
    } | null;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const post = await MentorPost.findById(postId).lean() as {
      postedBy?: string;
      organizationName?: string;
      organizationId?: string;
      [key: string]: any;
    } | null;
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const adminUser = await User.findOne({ role: 'admin', organizationName: post.organizationName, organizationId: post.organizationId }).select("username").lean() as {
      username?: string;
      [key: string]: any;
    } | null;
    
    if (post.postedBy !== username && user.username !== adminUser?.username) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Validate Post Content
    if (!postContent || !postTitle || !postType) {
      return NextResponse.json({ error: 'Required Fields Missing' }, { status: 400 });
    }

    // Edit Mentor Post in db 
    const mentorPost = await MentorPost.findByIdAndUpdate(
      postId,
      {
        postContent,
        postTitle,
        postType,
        editedAt: new Date(),
      }
    ).lean();

    return NextResponse.json({ message: 'Mentor post updated successfully', mentorPost }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /mentor-posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
