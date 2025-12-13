import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';
import MentorPost from '@/models/MentorPost';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('teamName');
    const username = searchParams.get('username');
    const organizationName = searchParams.get('organizationName');
    const organizationId = searchParams.get('organizationId');

    // Validate Team Name and username
    if (!teamName || !username) {
      return NextResponse.json({ error: 'Missing required parameters: teamName or username' }, { status: 400 });
    }

    // Validate organizationName and OrganizationId
    if (!organizationName || !organizationId) {
      return NextResponse.json({ error: 'Missing required fields: organizationName or organizationId' }, { status: 400 });
    }

    await dbConnect();

    // Find the team with type assertion
    const team = await Team.findOne({teamName, organizationName, organizationId}).lean() as {
      mentors?: any[];
      interns?: any[];
      panelists?: any[];
      [key: string]: any;
    } | null;
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Adding admin user to the authorized Users
    const adminUser = await User.findOne({ role: 'admin', organizationName, organizationId }).select("username");
    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid Organization' }, { status: 404 });
    }
    
    const allUserIds = [...(team.mentors || []), ...(team.interns || []), ...(team.panelists || [])];
    let allUsers: string[] = [adminUser.username];
    for (const user of allUserIds) {
      const response = await User.findById(user).select("username");
      if (response) {
        allUsers.push(response.username);
      }
    }

    // Validate user's existence
    const user = await User.findOne({ username }).select("username");
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate if user is authorized 
    if (!allUsers.includes(user.username)) {
      return NextResponse.json({ error: 'Not Authorized' }, { status: 401 });
    }

    // Fetch Mentor Posts
    const allPosts = await MentorPost.find({teamName, organizationName, organizationId});
    return NextResponse.json({ mentorPosts: allPosts }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch Mentor Posts', details: error.message }, { status: 500 });
  }
}
