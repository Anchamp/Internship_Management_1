import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, teamName } = body;

    // Validate input
    if (!username || !teamName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the requester is an admin
    const adminUser = await User.findOne({ username, role: 'admin' }).lean();
    if (!adminUser) {
      return NextResponse.json({ error: 'Only admins can delete teams' }, { status: 403 });
    }
    const organizationId = adminUser.organizationId;

    // Find the team to delete
    const teamToDelete = await Team.findOne({ teamName, organizationId }).lean();
    if (!teamToDelete) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Find all the users who are associated with the team
    const allUsers = await User.find({
      $or: [
        { _id: { $in: teamToDelete.mentors } },
        { _id: { $in: teamToDelete.interns } },
        { _id: { $in: teamToDelete.panelists } }
      ],
      organizationId
    })


    // Delete the Team
    const response = await Team.deleteOne({ teamName, organizationId }); 
    if (!response) {
      return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
   
    // Remove the team from each user's `teams` array
    for (const user of allUsers) {
      user.teams = user.teams.filter(team => team.toString() !== teamToDelete._id.toString());
      await user.save();
    }

    return NextResponse.json({ message: 'Team deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
