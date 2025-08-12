// app/api/assignments/create/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import Team from '@/models/Team';
import Assignment from '@/models/Assignment';

// Define interfaces for type safety
interface UserDocument {
  _id: string;
  role: string;
  organizationName: string;
  organizationId: string;
  username: string;
}

interface TeamDocument {
  _id: string;
  teamName: string;
  mentors: string[];
  interns: string[];
  panelists: string[];
  organizationName: string;
  organizationId: string;
}

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
      instructions,
      allowedSubmissionTypes = ['link', 'pdf'],
      maxFileSize = 10485760 // 10MB default
    } = body;

    // Validate required fields
    if (!assignmentTeamName || !assignmentName || !assignmentFrom || !description || !organizationName || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate user exists and has permission
    const user = await User.findOne({ username: assignmentFrom }).select("role organizationName organizationId _id").lean() as UserDocument | null;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && user.role !== 'employee') {
      return NextResponse.json({ error: 'User not authorized to create assignments' }, { status: 403 });
    }

    if (user.organizationName !== organizationName || user.organizationId !== organizationId) {
      return NextResponse.json({ error: 'User not part of organization' }, { status: 403 });
    }

    // Validate team exists
    const team = await Team.findOne({ teamName: assignmentTeamName, organizationName, organizationId }).lean() as TeamDocument | null;
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is authorized for this team
    const authorizedAdmin = await User.findOne({
      role: 'admin', 
      organizationName: organizationName, 
      organizationId: organizationId
    }).select("_id").lean() as { _id: string } | null;
    
    if (!authorizedAdmin) {
      return NextResponse.json({ error: 'Organization admin not found' }, { status: 404 });
    }

    // Convert team.mentors to string array of IDs
    const teamMentorIds = Array.isArray(team.mentors) 
      ? team.mentors.map((mentorId: any) => mentorId.toString())
      : [];
    
    const authorizedUsers = [...teamMentorIds, authorizedAdmin._id.toString()];
    if (!authorizedUsers.includes(user._id.toString())) {
      return NextResponse.json({ error: 'User is not authorized for this team' }, { status: 403 });
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return NextResponse.json({ error: 'Deadline must be in the future' }, { status: 400 });
    }

    // Validate assigned interns if specified
    if (assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0) {
      const specificInterns = assignedTo.filter((intern: string) => intern !== 'all');
      
      for (const internUsername of specificInterns) {
        const internRequested = await Intern.findOne({ 
          username: internUsername,
          organizationName,
          organizationId 
        }).select("username").lean();
        
        if (!internRequested) {
          return NextResponse.json({
            error: `Intern '${internUsername}' not found in organization`
          }, { status: 404 });
        }
      }
    }

    // Validate submission types
    const validSubmissionTypes = ['link', 'pdf'];
    if (allowedSubmissionTypes && !allowedSubmissionTypes.every((type: string) => validSubmissionTypes.includes(type))) {
      return NextResponse.json(
        { error: 'Invalid submission types specified' },
        { status: 400 }
      );
    }

    // Validate file size limit
    if (maxFileSize && (maxFileSize < 1024 || maxFileSize > 52428800)) { // 1KB to 50MB
      return NextResponse.json(
        { error: 'File size limit must be between 1KB and 50MB' },
        { status: 400 }
      );
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
      maxFileSize,
      allowedSubmissionTypes,
      acceptsSubmissions: true,
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