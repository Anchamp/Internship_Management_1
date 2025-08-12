// app/api/demo-presentations/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import DemoPresentation from '@/models/DemoPresentation';

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
      user = await Intern.findOne({ username }).select("role organizationName organizationId");
      isIntern = true;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const actualRole = isIntern ? 'intern' : user.role;

    // Build query
    let query: any = {
      organizationName: user.organizationName,
      organizationId: user.organizationId
    };

    // Add team filter if specified
    if (teamName) {
      query.teamName = teamName;
    }

    // Add status filter if specified
    if (status && ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Role-based filtering
    if (actualRole === 'employee' || actualRole === 'admin') {
      // Mentors see presentations they created or can manage
      if (actualRole !== 'admin') {
        query.createdBy = username;
      }
      // Admins see all presentations in their organization (no additional filter)
    } else if (actualRole === 'intern') {
      // Interns see presentations they are assigned to
      query['assignedInterns.internUsername'] = username;
    } else {
      // Unknown role, return empty array
      return NextResponse.json({ 
        demoPresentations: [],
        userRole: actualRole
      }, { status: 200 });
    }

    console.log('Demo presentations query:', JSON.stringify(query, null, 2));

    const demoPresentations = await DemoPresentation.find(query)
      .sort({ scheduledDate: 1, createdAt: -1 })
      .lean();

    console.log(`Found ${demoPresentations.length} demo presentations`);

    // Enhance presentations with computed fields
    const enhancedPresentations = demoPresentations.map(presentation => {
      const now = new Date();
      const scheduledDate = new Date(presentation.scheduledDate);
      
      // Find user's assignment if intern
      let userAssignment = null;
      if (actualRole === 'intern' && presentation.assignedInterns) {
        userAssignment = presentation.assignedInterns.find((assignment: any) => 
          assignment.internUsername === username
        );
      }

      // Find user's submission if intern
      let userSubmission = null;
      if (actualRole === 'intern' && presentation.submissions) {
        userSubmission = presentation.submissions.find((submission: any) => 
          submission.internUsername === username
        );
      }

      // Find user's evaluation if intern
      let userEvaluation = null;
      if (actualRole === 'intern' && presentation.evaluations) {
        userEvaluation = presentation.evaluations.find((evaluation: any) => 
          evaluation.internUsername === username
        );
      }

      // Calculate time until demo
      const timeUntilDemo = scheduledDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(timeUntilDemo / (1000 * 60 * 60 * 24));
      const hoursUntil = Math.ceil(timeUntilDemo / (1000 * 60 * 60));

      return {
        ...presentation,
        // Time-based computed fields
        isPast: now > scheduledDate,
        isUpcoming: now < scheduledDate,
        isToday: now.toDateString() === scheduledDate.toDateString(),
        timeUntilDemo,
        daysUntil,
        hoursUntil,
        
        // Count fields
        assignedInternsCount: presentation.assignedInterns?.length || 0,
        submissionsCount: presentation.submissions?.length || 0,
        evaluationsCount: presentation.evaluations?.length || 0,
        
        // User-specific fields (for interns)
        userAssignment,
        userSubmission,
        userEvaluation,
        
        // Computed status for interns
        userStatus: userAssignment?.status || 'not_assigned',
        canSubmit: actualRole === 'intern' && 
                   userAssignment && 
                   !userSubmission && 
                   ['draft', 'scheduled'].includes(presentation.status) &&
                   now < scheduledDate,
        
        // Evaluation status
        needsEvaluation: actualRole === 'employee' && 
                        presentation.status === 'completed' &&
                        presentation.assignedInterns?.some((intern: any) => 
                          !presentation.evaluations?.some((evaluation: any) => 
                            evaluation.internUsername === intern.internUsername
                          )
                        ),
        
        // Progress indicators
        completionRate: presentation.assignedInterns?.length > 0 
          ? Math.round((presentation.evaluationsCount / presentation.assignedInterns.length) * 100)
          : 0
      };
    });

    return NextResponse.json({ 
      success: true,
      demoPresentations: enhancedPresentations,
      userRole: actualRole,
      count: enhancedPresentations.length
    }, { status: 200 });

  } catch (error: any) {
    console.error("Get demo presentations error:", error);
    return NextResponse.json({
      error: 'Failed to fetch demo presentations',
      details: error.message
    }, { status: 500 });
  }
}