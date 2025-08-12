import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Assignment from '@/models/Assignment';

export async function PUT(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { assignmentId, status, username } = body;

    // Validate required fields
    if (!assignmentId || !status || !username) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['pending', 'active', 'posted', 'review', 'completed', 'submitted', 'under_review', 'reviewed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Validate user
    const user = await User.findOne({ username });
    if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Find and update assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check authorization
    if (assignment.assignmentFrom !== username && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to modify this assignment' }, { status: 403 });
    }

    assignment.status = status;
    assignment.updatedAt = new Date();
    await assignment.save();

    return NextResponse.json({
      message: 'Assignment status updated successfully',
      assignment
    }, { status: 200 });

  } catch (error: any) {
    console.error("Assignment status update error:", error);
    return NextResponse.json(
      { error: 'Failed to update assignment status', details: error.message },
      { status: 500 }
    );
  }
}