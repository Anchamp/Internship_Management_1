import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
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

    // Validate user - check both User and Intern models
    let user = await User.findOne({ username }).select("role organizationName organizationId");
    let isIntern = false;

    if (!user) {
      // Check Intern model if not found in User model
      user = await Intern.findOne({ username }).select("role organizationName organizationId");
      isIntern = true;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use the actual role from database, not the query parameter
    const actualRole = isIntern ? 'intern' : user.role;

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

    if (actualRole === 'employee' || actualRole === 'admin') {
      // Mentors see assignments they created
      query.assignmentFrom = username;
    } else if (actualRole === 'intern') {
      // Interns see assignments assigned to them that are posted/active
      query.$and = [
        {
          $or: [
            { assignedTo: 'all' },
            { assignedTo: username },
            { assignedTo: { $elemMatch: { $eq: username } } }, // For array of usernames
            { assignedTo: { $elemMatch: { $eq: 'all' } } }     // For 'all' in array
          ]
        },
        {
          status: { $in: ['posted', 'active', 'under_review', 'reviewed'] }
        }
      ];
    }

    const assignments = await Assignment.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Enhance assignments with computed fields
    const enhancedAssignments = assignments.map(assignment => {
      const now = new Date();
      const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
      
      // Find user's submission if intern
      let userSubmission = null;
      if (actualRole === 'intern' && assignment.submissions) {
        userSubmission = assignment.submissions.find((sub: any) => sub.internUsername === username);
      }

      return {
        ...assignment,
        isOverdue: deadline ? now > deadline : false,
        submissionCount: assignment.submissions?.length || 0,
        userSubmission,
        // Add computed status for frontend
        canSubmit: actualRole === 'intern' && 
                   !userSubmission && 
                   ['posted', 'active'].includes(assignment.status) &&
                   assignment.acceptsSubmissions &&
                   (!deadline || now <= deadline)
      };
    });

    return NextResponse.json({ 
      assignments: enhancedAssignments,
      userRole: actualRole
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get assignments error:", error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments', details: error.message },
      { status: 500 }
    );
  }
}