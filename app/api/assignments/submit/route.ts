import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Assignment from '@/models/Assignment';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const assignmentId = formData.get('assignmentId') as string;
    const username = formData.get('username') as string;
    const submissionType = formData.get('submissionType') as 'link' | 'pdf';
    const submissionContent = formData.get('submissionContent') as string;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!assignmentId || !username || !submissionType) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate user
    const user = await User.findOne({ username }).select('role organizationName organizationId');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check authorization
    if (assignment.organizationName !== user.organizationName || 
        assignment.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      (sub: any) => sub.internUsername === username
    );
    if (existingSubmission) {
      return NextResponse.json({ error: 'Assignment already submitted' }, { status: 400 });
    }

    // Check if assignment accepts submissions
    if (!['posted', 'active'].includes(assignment.status)) {
      return NextResponse.json({ error: 'Assignment not available for submission' }, { status: 400 });
    }

    let finalSubmissionContent = submissionContent;
    let fileName, fileSize;
    const isOverdue = new Date() > new Date(assignment.deadline);

    // Handle submission based on type
    if (submissionType === 'link') {
      if (!submissionContent?.trim()) {
        return NextResponse.json({ error: 'URL is required for link submissions' }, { status: 400 });
      }
      
      // Basic URL validation
      try {
        new URL(submissionContent);
        finalSubmissionContent = submissionContent.trim();
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }

    } else if (submissionType === 'pdf') {
      if (!file) {
        return NextResponse.json({ error: 'PDF file is required' }, { status: 400 });
      }

      // Validate file
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
      }

      if (file.size > (assignment.maxFileSize || 1048576)) {
        return NextResponse.json({ 
          error: `File size exceeds limit of ${Math.round((assignment.maxFileSize || 1048576) / 1024 / 1024)}MB` 
        }, { status: 400 });
      }

      // For now, store file info (implement actual file storage as needed)
      fileName = file.name;
      fileSize = file.size;
      finalSubmissionContent = `${assignmentId}_${username}_${Date.now()}_${file.name}`;
      
      // TODO: Implement actual file storage
      console.log('File to be stored:', { fileName, fileSize, assignmentId, username });
    }

    // Create submission
    const submission = {
      internUsername: username,
      submissionType,
      submissionContent: finalSubmissionContent,
      fileName,
      fileSize,
      submittedAt: new Date(),
      status: 'submitted',
      isLateSubmission: isOverdue
    };

    // Add submission to assignment
    assignment.submissions.push(submission);
    
    // Update assignment status
    if (assignment.status === 'posted') {
      assignment.status = 'submitted';
    }
    
    assignment.updatedAt = new Date();
    await assignment.save();

    return NextResponse.json({
      message: isOverdue ? 'Late submission received' : 'Assignment submitted successfully',
      submission: {
        ...submission,
        assignmentName: assignment.assignmentName
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Assignment submission error:", error);
    return NextResponse.json(
      { error: 'Failed to submit assignment', details: error.message },
      { status: 500 }
    );
  }
}