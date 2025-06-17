import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();
    const { username, editTeamName, editMentors, editInterns, editPanelists, editDescription} = body;

    // Validate required fields
    if (!username || !editTeamName || !editMentors || !editInterns || !editPanelists || !editDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the requester is an admin of the organization
    const adminUser = await User.findOne({ username, role: 'admin' }).lean();
    if (!adminUser) {
      return NextResponse.json({ error: 'Only admins can edit teams' }, { status: 403 });
    }
    const organizationId = adminUser.organizationId;
    const organizationName = adminUser.organizationName;

    // Get the existing team
    const existingTeam = await Team.findOne({ teamName: editTeamName, organizationId });
    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Remove the team from all the users' teams
    const allUsers = [...existingTeam.mentors, ...existingTeam.interns, ...existingTeam.panelists];
    for (const user of allUsers) {
      await User.findOneAndUpdate(
        { _id: user, organizationName },
        { $pull: { teams: existingTeam._id } },
      )
    }

    
    // Get all the new Team members
    const mentorUsers = await User.find({ username: { $in: editMentors }, organizationId });
    // TODO: Need to change OrganizationName to organizationId for interns when intern onboarding process is complete
    const internUsers = await User.find({ username: { $in: editInterns }, organizationName });
    const panelistUsers = await User.find({ username: { $in: editPanelists }, organizationId });

    // validate if the users exist in the organization
    if (mentorUsers.length !== editMentors.length) return NextResponse.json({ error: 'Some mentors not found' }, { status: 400 });
    if (internUsers.length !== editInterns.length) return NextResponse.json({ error: 'Some interns not found' }, { status: 400 });
    if (panelistUsers.length !== editPanelists.length) return NextResponse.json({ error: 'Some panelists not found' }, { status: 400 });

    // Create the updated team data
    const teamData = {
      teamName: editTeamName,
      mentors: mentorUsers.map(u => u._id),
      interns: internUsers.map(u => u._id),
      panelists: panelistUsers.map(u => u._id),
      description: editDescription,
      organizationId,
    };


    // Update the team in the database
    const updatedTeam = await Team.findOneAndUpdate(
      { teamName: editTeamName, organizationId },
      teamData,
    );
    if (!updatedTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // push the team into the new team members' teams array
    const newTeamMembers = [...mentorUsers, ...internUsers, ...panelistUsers];
    for (const user of newTeamMembers) {
      await User.findOneAndUpdate(
        { username: user.username, organizationName },
        { $addToSet: { teams: updatedTeam._id } },
      );
    }

    return NextResponse.json({ message: 'Team updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
