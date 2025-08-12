// app/api/demo-presentations/update/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import DemoPresentation from '@/models/DemoPresentation';

interface UpdateDemoPresentationRequest {
  presentationId: string;
  username: string;
  updates: {
    title?: string;
    description?: string;
    scheduledDate?: string;
    duration?: number;
    location?: string;
    meetingLink?: string;
    requirements?: string[];
    evaluationCriteria?: Array<{
      criterion: string;
      maxPoints: number;
      description?: string;
    }>;
    assignedInterns?: string[];
    status?: string;
    tags?: string[];
  };
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    
    const body: UpdateDemoPresentationRequest = await request.json();
    const { presentationId, username, updates } = body;

    // Validate required fields
    if (!presentationId || !username) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Presentation ID and username are required'
      }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ 
        error: 'Updates object is required' 
      }, { status: 400 });
    }

    // Validate user
    const user = await User.findOne({ username }).select('role organizationName organizationId');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'employee' && user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'Only mentors and admins can update presentations' 
      }, { status: 403 });
    }

    // Find presentation
    const presentation = await DemoPresentation.findById(presentationId);
    if (!presentation) {
      return NextResponse.json({ error: 'Demo presentation not found' }, { status: 404 });
    }

    // Check authorization
    if (presentation.organizationName !== user.organizationName || 
        presentation.organizationId !== user.organizationId) {
      return NextResponse.json({ 
        error: 'Not authorized to update this presentation' 
      }, { status: 403 });
    }

    // Check if user can update this presentation
    if (presentation.createdBy !== username && user.role !== 'admin') {
      return NextResponse.json({ 
        error: 'You can only update presentations you created' 
      }, { status: 403 });
    }

    // Validate status update if provided
    if (updates.status) {
      const validStatuses = ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        }, { status: 400 });
      }

      // Validate status transitions
      const currentStatus = presentation.status;
      const validTransitions: { [key: string]: string[] } = {
        'draft': ['scheduled', 'cancelled'],
        'scheduled': ['in_progress', 'cancelled', 'draft'],
        'in_progress': ['completed', 'cancelled'],
        'completed': [], // Completed presentations cannot be changed
        'cancelled': ['draft', 'scheduled'] // Can reactivate cancelled presentations
      };

      if (!validTransitions[currentStatus]?.includes(updates.status)) {
        return NextResponse.json({ 
          error: `Cannot transition from ${currentStatus} to ${updates.status}` 
        }, { status: 400 });
      }
    }

    // Validate scheduled date if provided
    if (updates.scheduledDate) {
      const newDate = new Date(updates.scheduledDate);
      if (isNaN(newDate.getTime())) {
        return NextResponse.json({ 
          error: 'Invalid scheduled date format' 
        }, { status: 400 });
      }
      
      if (newDate <= new Date()) {
        return NextResponse.json({ 
          error: 'Demo presentation must be scheduled for a future date' 
        }, { status: 400 });
      }
    }

    // Validate duration if provided
    if (updates.duration !== undefined) {
      if (typeof updates.duration !== 'number' || updates.duration < 15 || updates.duration > 240) {
        return NextResponse.json({ 
          error: 'Duration must be a number between 15 and 240 minutes' 
        }, { status: 400 });
      }
    }

    // Validate meeting link if provided
    if (updates.meetingLink !== undefined && updates.meetingLink && 
        !/^https?:\/\/.+/.test(updates.meetingLink)) {
      return NextResponse.json({ 
        error: 'Meeting link must be a valid URL' 
      }, { status: 400 });
    }

    // Validate evaluation criteria if provided
    if (updates.evaluationCriteria) {
      if (!Array.isArray(updates.evaluationCriteria) || updates.evaluationCriteria.length === 0) {
        return NextResponse.json({ 
          error: 'At least one evaluation criterion is required' 
        }, { status: 400 });
      }

      for (const criteria of updates.evaluationCriteria) {
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
    }

    // Validate assigned interns if provided
    let processedInterns = presentation.assignedInterns;
    if (updates.assignedInterns) {
      if (!Array.isArray(updates.assignedInterns)) {
        return NextResponse.json({ 
          error: 'Assigned interns must be an array' 
        }, { status: 400 });
      }

      const validInterns = [];
      const uniqueInterns = [...new Set(updates.assignedInterns.filter(intern => intern?.trim()))];
      
      for (let i = 0; i < uniqueInterns.length; i++) {
        const internUsername = uniqueInterns[i].trim();
        
        const intern = await Intern.findOne({ 
          username: internUsername,
          organizationName: user.organizationName,
          organizationId: user.organizationId 
        }).select('username');
        
        if (!intern) {
          return NextResponse.json({ 
            error: `Intern '${internUsername}' not found in organization` 
          }, { status: 404 });
        }
        
        // Check if intern is already assigned (preserve existing assignment data)
        const existingAssignment = presentation.assignedInterns.find(
          (assignment: any) => assignment.internUsername === internUsername
        );

        if (existingAssignment) {
          validInterns.push(existingAssignment);
        } else {
          validInterns.push({
            internUsername: internUsername,
            assignedAt: new Date(),
            status: 'assigned',
            presentationOrder: i + 1
          });
        }
      }
      
      processedInterns = validInterns;
    }

    // Build update data
    const updateData: any = {};
    
    // Simple field updates
    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.description !== undefined) updateData.description = updates.description.trim();
    if (updates.scheduledDate !== undefined) updateData.scheduledDate = new Date(updates.scheduledDate);
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.location !== undefined) updateData.location = updates.location.trim() || 'Virtual';
    if (updates.meetingLink !== undefined) updateData.meetingLink = updates.meetingLink.trim();
    if (updates.status !== undefined) updateData.status = updates.status;
    
    // Array field updates
    if (updates.requirements !== undefined) {
      updateData.requirements = updates.requirements.filter(req => req?.trim()).map(req => req.trim());
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.filter(tag => tag?.trim()).map(tag => tag.trim());
    }
    if (updates.evaluationCriteria !== undefined) {
      updateData.evaluationCriteria = updates.evaluationCriteria.map(criteria => ({
        criterion: criteria.criterion.trim(),
        maxPoints: criteria.maxPoints,
        description: criteria.description?.trim() || ''
      }));
    }
    if (updates.assignedInterns !== undefined) {
      updateData.assignedInterns = processedInterns;
    }

    // Always update the timestamp
    updateData.updatedAt = new Date();

    // Perform the update
    const updatedPresentation = await DemoPresentation.findByIdAndUpdate(
      presentationId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        select: 'title description scheduledDate status assignedInterns evaluationCriteria updatedAt'
      }
    );

    if (!updatedPresentation) {
      return NextResponse.json({ 
        error: 'Failed to update presentation' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo presentation updated successfully',
      demoPresentation: {
        _id: updatedPresentation._id,
        title: updatedPresentation.title,
        description: updatedPresentation.description,
        scheduledDate: updatedPresentation.scheduledDate,
        status: updatedPresentation.status,
        assignedInternsCount: updatedPresentation.assignedInterns?.length || 0,
        updatedAt: updatedPresentation.updatedAt
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Demo presentation update error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors.join(', ')
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Failed to update demo presentation',
      details: error.message
    }, { status: 500 });
  }
}