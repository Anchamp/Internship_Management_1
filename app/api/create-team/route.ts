import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Parse request body
    const body = await request.json();
    const { username, teamName, mentors, interns, panelists, description, organizationName} = body;

    // Validate input
    if (!username || !teamName || !mentors || !interns || !panelists || !description || !organizationName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the requester is an admin
    const adminUser = await User.findOne({ username, role: 'admin' }).lean();
    if (!adminUser) {
      return NextResponse.json({ error: 'Only admins can create teams' }, { status: 403 });
    }
    const organizationId = adminUser.organizationId;

    // Convert usernames to ObjectIds
    const mentorUsers = await User.find({ username: { $in: mentors }, organizationName: organizationName });
    const internUsers = await User.find({ username: { $in: interns }, organizationName: organizationName });
    const panelistUsers = await User.find({ username: { $in: panelists }, organizationName: organizationName });

    // Check if all users were found
    if (mentorUsers.length !== mentors.length) return NextResponse.json({ error: 'Some mentors not found' }, { status: 400 });
    if (internUsers.length !== interns.length) return NextResponse.json({ error: 'Some interns not found' }, { status: 400 });
    if (panelistUsers.length !== panelists.length) return NextResponse.json({ error: 'Some panelists not found' }, { status: 400 });

    // Prepare team data with ObjectIds
    const teamData = {
      teamName,
      mentors: mentorUsers.map(u => u._id),
      interns: internUsers.map(u => u._id),
      panelists: panelistUsers.map(u => u._id),
      description,
      organizationName,
      organizationId,
      status: 'active',
    };

    // Create the team
    const newTeam = new Team(teamData);
    await newTeam.save();

    // Add team to each user's `teams` array
    const allUsers = [...mentorUsers, ...internUsers, ...panelistUsers];
    for (const user of allUsers) {
      user.teams.push(newTeam._id);
      await user.save();
    }

    return NextResponse.json({
      message: 'Team created successfully',
      team: newTeam
    }, { status: 201 });

  } catch (error: any) {
    console.error('Team Creation Error:', error);
    return NextResponse.json({ error: 'Failed to create team', details: error.message }, { status: 500 });
  }
}
