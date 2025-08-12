import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Assignment from '@/models/Assignment';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const role = searchParams.get('role');
    const teamName = searchParams.get('teamName');
    const status = searchParams.get('status');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    // Validate user
    const user = await User.findOne({ username }).select("role organizationName organizationId");
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query: any = {
      organizationName: user.organizationName,
      organizationId: user.organizationId
    };

    // Add team filter if specified
    if (teamName) {
      query.assignmentTeamName = teamName;
    }

    // Add status filter if specified
    if (status) {
      query.status = status;
    }

    if (role === 'employee' || role === 'admin') {
      // Mentors see assignments they created
      query.assignmentFrom = username;
    } else if (role === 'intern') {
      // Interns see assignments assigned to them that are posted/active
      query.$and = [
        {
          $or: [
            { assignedTo: 'all' },
            { assignedTo: username },
            { assignedTo: { $in: ['all'] } }
          ]
        },
        {
          status: { $in: ['posted', 'active', 'submitted', 'under_review', 'reviewed'] }
        }
      ];
    }

    const assignments = await Assignment.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Enhance assignments with computed fields
    const enhancedAssignments = assignments.map(assignment => ({
      ...assignment,
      isOverdue: new Date() > new Date(assignment.deadline),
      submissionCount: assignment.submissions?.length || 0,
      userSubmission: role === 'intern' 
        ? assignment.submissions?.find((sub: any) => sub.internUsername === username)
        : null
    }));

    return NextResponse.json({ assignments: enhancedAssignments }, { status: 200 });

  } catch (error: any) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments', details: error.message },
      { status: 500 }
    );
  }
}