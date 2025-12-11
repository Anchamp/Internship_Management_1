import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';
import Intern from '@/models/Intern';
import Assignment from '@/models/Assignment';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const body = await request.json();
    const { assignmentId, username, editAssignmentName, editDescription, editDeadline, editAssignedTo, editMentorFeedback } = body;

    // Validate Assignment
    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Validate User - Add type assertion
    const requestingUser = await User.findOne({ username, organizationId: assignment.organizationId }).select("username role").lean() as {
      username?: string;
      role?: string;
      [key: string]: any;
    } | null;

    if (!requestingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (requestingUser.role !== 'admin' && requestingUser.role !== 'employee') {
      return NextResponse.json({ error: 'Only admins or mentors can edit assignments' }, { status: 403 });
    }

    if (requestingUser.role === 'employee' && assignment.assignmentFrom !== requestingUser.username) {
      return NextResponse.json({ error: 'Unauthroized access' }, { status: 403 });
    }

    // Only update the fields that are provided in the body
    const updateData: any = {};
    if (editAssignmentName) {
      updateData.assignmentName = editAssignmentName;
    }
    if (editDescription) {
      updateData.description = editDescription;
    }
    if (editDeadline) {
      updateData.deadline = new Date(editDeadline);
      if (isNaN(updateData.deadline.getTime())) { 
        return NextResponse.json({ error: 'Invalid deadline format' }, { status: 400 });
      }
      if (updateData.deadline < new Date()) {
        return NextResponse.json({ error: 'Deadline cannot be in the past' }, { status: 400 });
      }
    }
    if (editAssignedTo) {
      updateData.assignedTo = editAssignedTo;
    }
    if (editMentorFeedback) {
      updateData.mentorFeedback = editMentorFeedback;
    }
    updateData.updatedAt = new Date();

    // Update the assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedAssignment) {
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Assignment updated successfully', assignment: updatedAssignment }, { status: 200 });
  } catch (error) { 
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

