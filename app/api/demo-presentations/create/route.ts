// app/api/demo-presentations/create/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';
import Intern from '@/models/Intern';
import DemoPresentation from '@/models/DemoPresentation';

interface CreateDemoPresentationRequest {
  title: string;
  description: string;
  teamName: string;
  organizationName: string;
  organizationId: string;
  createdBy: string;
  scheduledDate: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  requirements?: string[];
  evaluationCriteria: Array<{
    criterion: string;
    maxPoints: number;
    description?: string;
  }>;
  assignedInterns?: string[];
  tags?: string[];
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body: CreateDemoPresentationRequest = await request.json();
    const {
      title,
      description,
      teamName,
      organizationName,
      organizationId,
      createdBy,
      scheduledDate,
      duration = 30,
      location = 'Virtual',
      meetingLink = '',
      requirements = [],
      evaluationCriteria,
      assignedInterns = [],
      tags = []
    } = body;

    // Validate required fields
    if (!title?.trim() || !description?.trim() || !teamName?.trim() || 
        !organizationName?.trim() || !organizationId?.trim() || 
        !createdBy?.trim() || !scheduledDate) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Title, description, team name, organization details, creator, and scheduled date are required'
      }, { status: 400 });
    }

    // Validate evaluation criteria
    if (!evaluationCriteria || !Array.isArray(evaluationCriteria) || evaluationCriteria.length === 0) {
      return NextResponse.json({ 
        error: 'At least one evaluation criterion is required' 
      }, { status: 400 });
    }

    // Validate each evaluation criterion
    for (const criteria of evaluationCriteria) {
      if (!criteria.criterion?.trim()) {
        return NextResponse.json({ 
          error: 'All evaluation criteria must have a name' 
        }, { status: 400 });
      }
      if (!criteria.maxPoints || criteria.maxPoints < 1 || criteria.maxPoints > 100) {
        return NextResponse.json({ 
          error: 'Max points for each criterion must be between 1 and 100' 
        }, { status: 400 });
      }
    }

    // Validate duration
    if (duration < 15 || duration > 240) {
      return NextResponse.json({ 
        error: 'Duration must be between 15 and 240 minutes' 
      }, { status: 400 });
    }

    // Validate meeting link if provided
    if (meetingLink && !/^https?:\/\/.+/.test(meetingLink)) {
      return NextResponse.json({ 
        error: 'Meeting link must be a valid URL' 
      }, { status: 400 });
    }

    // Validate creator
    const creator = await User.findOne({ username: createdBy }).select('role organizationName organizationId');
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    if (creator.role !== 'employee' && creator.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Only mentors and admins can create demo presentations' 
      }, { status: 403 });
    }

    if (creator.organizationName !== organizationName || creator.organizationId !== organizationId) {
      return NextResponse.json({ 
        error: 'Creator not authorized for this organization' 
      }, { status: 403 });
    }

    // Validate team exists
    const team = await Team.findOne({ teamName, organizationName, organizationId }).lean();
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Validate scheduled date
    const demoDate = new Date(scheduledDate);
    if (isNaN(demoDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled date format' }, { status: 400 });
    }
    
    if (demoDate <= new Date()) {
      return NextResponse.json({ 
        error: 'Demo presentation must be scheduled for a future date' 
      }, { status: 400 });
    }

    // Validate assigned interns
    const validInterns: Array<{
      internUsername: string;
      assignedAt: Date;
      status: string;
      presentationOrder: number;
    }> = [];

    if (assignedInterns && assignedInterns.length > 0) {
      // Remove duplicates
      const uniqueInterns = [...new Set(assignedInterns)];
      
      for (let i = 0; i < uniqueInterns.length; i++) {
        const internUsername = uniqueInterns[i];
        
        if (!internUsername?.trim()) {
          continue; // Skip empty usernames
        }
        
        const intern = await Intern.findOne({ 
          username: internUsername.trim(),
          organizationName,
          organizationId 
        }).select('username');
        
        if (!intern) {
          return NextResponse.json({ 
            error: `Intern '${internUsername}' not found in organization` 
          }, { status: 404 });
        }
        
        validInterns.push({
          internUsername: internUsername.trim(),
          assignedAt: new Date(),
          status: 'assigned',
          presentationOrder: i + 1
        });
      }
    }

    // Create demo presentation
    const demoPresentationData = {
      title: title.trim(),
      description: description.trim(),
      teamName: teamName.trim(),
      organizationName: organizationName.trim(),
      organizationId: organizationId.trim(),
      createdBy: createdBy.trim(),
      scheduledDate: demoDate,
      duration,
      location: location.trim() || 'Virtual',
      meetingLink: meetingLink.trim(),
      requirements: requirements.filter(req => req?.trim()).map(req => req.trim()),
      evaluationCriteria: evaluationCriteria.map(criteria => ({
        criterion: criteria.criterion.trim(),
        maxPoints: criteria.maxPoints,
        description: criteria.description?.trim() || ''
      })),
      assignedInterns: validInterns,
      submissions: [],
      evaluations: [],
      status: 'draft',
      tags: tags.filter(tag => tag?.trim()).map(tag => tag.trim()),
      reminders: [
        { type: '24_hours', sent: false },
        { type: '2_hours', sent: false },
        { type: '30_minutes', sent: false }
      ]
    };

    const newDemoPresentation = new DemoPresentation(demoPresentationData);
    await newDemoPresentation.save();

    return NextResponse.json({
      success: true,
      message: 'Demo presentation created successfully',
      demoPresentation: {
        _id: newDemoPresentation._id,
        title: newDemoPresentation.title,
        description: newDemoPresentation.description,
        scheduledDate: newDemoPresentation.scheduledDate,
        status: newDemoPresentation.status,
        assignedInternsCount: validInterns.length
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Demo presentation creation error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors.join(', ')
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to create demo presentation',
      details: error.message
    }, { status: 500 });
  }
}