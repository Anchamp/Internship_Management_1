import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import Team from '@/models/Team';
import Assignment from '@/models/Assignment';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, assignmentId } = body;

    // Validate input
    if (!username || !assignmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const requestingUser = await User.findOne({ username }).select("username role organizationId").lean();

    if (!requestingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const assignment = await Assignment.findById(assignmentId).lean();
    if (requestingUser.organizationId !== assignment.organizationId) {
      return NextResponse.json({ error: 'Assignment not found in your organization' }, { status: 404 });
    }
    
    if (requestingUser.role !== 'admin' && requestingUser.username !== assignment.assignmentFrom) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 403 });
    }

    // Delete the assignment
    const response = await Assignment.deleteOne({ _id: assignmentId });
    if (!response) {
      return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
    }

    // Remove the assignment from team's assignments
    const team = await Team.findOneAndUpdate(
      { teamName: assignment.assignmentTeamName, organizationId: assignment.organizationId },
      { $pull: { assignments: assignmentId } },
      { new: true }
    )

    if (!team) {
      return NextResponse.json({ error: 'Failed to update team assignments' }, { status: 500 });
    }

    // Remove the assignment from interns' assignments
    const interns = await Intern.updateMany(
      { _id: { $in: team.interns } },
      { $pull: { assignments: assignmentId } }
    );
    if (!interns) {
      return NextResponse.json({ error: 'Failed to update interns assignments' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Assignment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
