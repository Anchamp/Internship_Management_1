import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';
import MentorPost from '@/models/MentorPost';
import Assignment from '@/models/Assignment';
 
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { postTitle, postedBy, postContent, postType, teamName, organizationName, organizationId } =  body;

    if (!postTitle || !postedBy || !postContent || !postType || !teamName || !organizationName || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const team = await Team.findOne({ teamName, organizationName, organizationId });
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    let mentors = []
    for (const mentorId of team.mentors) {
      const mentor = await User.findById(mentorId).select("username");
      if (mentor) {
        await mentors.push(mentor.username)
      }
    }
    
    if (!mentors.includes(postedBy)) {
      return NextResponse.json({ error: 'Not Authorized' }, { status: 401 });
    }

    if (!['announcement', 'discussion', 'resource'].includes(postType)) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
    }

    const mentorPostData = {
      postTitle,
      postedBy,
      postContent,
      postType,
      teamName,
      organizationName,
      organizationId
    };

    const newMentorPost = new MentorPost(mentorPostData);
    await newMentorPost.save();

    return NextResponse.json({
      message: 'Mentor Post Created Successfully',
      mentorPost: newMentorPost
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create Mentor Post', details: error.message }, { status: 500 });
  }
}
