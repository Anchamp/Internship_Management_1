import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';
import Assignment from '@/models/Assignment';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      assignmentTeamName,
      assignmentName,
      assignmentFrom,
      description,
      organizationName,
      organizationId,
      assignedTo,
      deadline,
      status = 'pending',
      instructions
    } = body;

    // Validate required fields
    if (!assignmentTeamName || !assignmentName || !assignmentFrom || !description || !organizationName || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate user exists and has permission
    const user = await User.findOne({ username: assignmentFrom }).select("role organizationName organizationId");
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && user.role !== 'employee') {
      return NextResponse.json({ error: 'User not authorized to create assignments' }, { status: 403 });
    }

    if (user.organizationName !== organizationName || user.organizationId !== organizationId) {
      return NextResponse.json({ error: 'User not part of organization' }, { status: 403 });
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json({ error: 'Deadline must be in the future' }, { status: 400 });
    }

    // Create assignment with both old and new fields
    const assignmentData = {
      assignmentTeamName,
      assignmentName,
      assignmentFrom,
      description,
      organizationName,
      organizationId,
      assignedTo: assignedTo || ['all'],
      deadline: deadlineDate,
      status,
      instructions,
      submissions: [],
      maxFileSize: 1048576,
      allowedSubmissionTypes: ['link', 'pdf'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newAssignment = new Assignment(assignmentData);
    await newAssignment.save();

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment: newAssignment
    }, { status: 201 });

  } catch (error: any) {
    console.error("Assignment creation error:", error);
    return NextResponse.json(
      { error: 'Failed to create assignment', details: error.message },
      { status: 500 }
    );
  }
}