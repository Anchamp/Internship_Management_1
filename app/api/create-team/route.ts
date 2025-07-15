import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
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
    const organizationId = (adminUser as any).organizationId;

    // Remove duplicates in mentors, interns, and panelists
    const uniqueMentors = Array.from(new Set(mentors));
    const uniqueInterns = Array.from(new Set(interns));
    const uniquePanelists = Array.from(new Set(panelists));

    // Convert usernames to ObjectIds
    const mentorUsers = await User.find({ username: { $in: uniqueMentors }, organizationName: organizationName });
    const internUsers = await Intern.find({ username: { $in: uniqueInterns }, organizationName: organizationName });
    const panelistUsers = await User.find({ username: { $in: uniquePanelists }, organizationName: organizationName });

    // Check if all users were found
    if (mentorUsers.length !== uniqueMentors.length) return NextResponse.json({ error: 'Some mentors not found' }, { status: 400 });
    if (internUsers.length !== uniqueInterns.length) return NextResponse.json({ error: 'Some interns not found' }, { status: 400 });
    if (panelistUsers.length !== uniquePanelists.length) return NextResponse.json({ error: 'Some panelists not found' }, { status: 400 });

    // Prepare team data with ObjectIds
    const existingTeam = await Team.findOne({ teamName, organizationId }).lean();
    if (existingTeam) {
      return NextResponse.json({ error: 'Team with this name already exists in the organization' }, { status: 400 });
    }

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
    const allUsers = [...mentorUsers, ...panelistUsers];
    for (const user of allUsers) {
      user.teams.push(newTeam._id);
      await user.save();
    }

    for (const intern of internUsers) {
      intern.teams.push(newTeam._id);
      await intern.save();
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
