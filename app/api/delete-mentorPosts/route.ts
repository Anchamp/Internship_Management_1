import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';
import MentorPost from '@/models/MentorPost';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, postId } = body;

    if (!username || !postId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    const user = await User.findOne({ username }).select("username").lean() as {
      username?: string;
      [key: string]: any;
    } | null;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const adminUser = await User.findOne({ role: 'admin', organizationName: post.organizationName, organizationId: post.organizationId}).select("username").lean() as {
      username?: string;
      [key: string]: any;
    } | null;

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found for this organization' }, { status: 404 });
    }

    if (post.postedBy !== username && user.username !== adminUser.username) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 });
    }

    // Delete the post
    const response = await MentorPost.findByIdAndDelete(postId);
    if (!response) {
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error in POST /mentor-posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
