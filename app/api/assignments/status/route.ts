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
    const validStatuses = ['pending', 'posted', 'active', 'under_review', 'reviewed', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 });
    }

    // Validate user - only employees and admins can update assignment status
    const user = await User.findOne({ username }).select('role organizationName organizationId');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'employee' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to update assignment status' }, { status: 403 });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if user belongs to same organization as assignment
    if (assignment.organizationName !== user.organizationName || 
        assignment.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Not authorized to update this assignment' }, { status: 403 });
    }

    // Check if user can update this assignment
    // Either they created the assignment or they are an admin
    if (assignment.assignmentFrom !== username && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to update this assignment' }, { status: 403 });
    }

    // Validate status transitions
    const currentStatus = assignment.status;
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['posted', 'active'],
      'posted': ['active', 'under_review', 'completed'],
      'active': ['under_review', 'completed'],
      'under_review': ['reviewed', 'active', 'completed'],
      'reviewed': ['completed'],
      'completed': [] // Final state
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json({ 
        error: `Cannot transition from ${currentStatus} to ${status}` 
      }, { status: 400 });
    }

    // Special validation for certain status changes
    if (status === 'posted' || status === 'active') {
      // Check if assignment has required fields for posting
      if (!assignment.deadline) {
        return NextResponse.json({ 
          error: 'Cannot post assignment without a deadline' 
        }, { status: 400 });
      }

      // Check if deadline is in the future
      if (new Date(assignment.deadline) <= new Date()) {
        return NextResponse.json({ 
          error: 'Cannot post assignment with past deadline' 
        }, { status: 400 });
      }

      // Enable submissions when posting
      assignment.acceptsSubmissions = true;
    }

    if (status === 'completed') {
      // Disable submissions when completing
      assignment.acceptsSubmissions = false;
    }

    if (status === 'under_review') {
      // Validate that there are submissions to review
      if (!assignment.submissions || assignment.submissions.length === 0) {
        return NextResponse.json({ 
          error: 'Cannot set to under_review without submissions' 
        }, { status: 400 });
      }
    }

    if (status === 'reviewed') {
      // Validate that all submissions have been reviewed
      if (!assignment.submissions || assignment.submissions.length === 0) {
        return NextResponse.json({ 
          error: 'Cannot set to reviewed without submissions' 
        }, { status: 400 });
      }

      const unreviewedSubmissions = assignment.submissions.filter(
        (sub: any) => sub.status !== 'reviewed'
      );

      if (unreviewedSubmissions.length > 0) {
        return NextResponse.json({ 
          error: 'Cannot set to reviewed while submissions are pending review' 
        }, { status: 400 });
      }
    }

    // Update assignment status
    const oldStatus = assignment.status;
    assignment.status = status;
    assignment.updatedAt = new Date();

    await assignment.save();

    return NextResponse.json({
      message: 'Assignment status updated successfully',
      assignment: {
        _id: assignment._id,
        assignmentName: assignment.assignmentName,
        status: assignment.status,
        oldStatus,
        updatedAt: assignment.updatedAt,
        acceptsSubmissions: assignment.acceptsSubmissions
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Assignment status update error:", error);
    return NextResponse.json(
      { error: 'Failed to update assignment status', details: error.message },
      { status: 500 }
    );
  }
}