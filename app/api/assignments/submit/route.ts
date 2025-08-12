import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import Assignment from '@/models/Assignment';

// Helper function to validate URL
function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to store file (implement based on your storage solution)
async function storeFile(file: File, username: string, assignmentId: string): Promise<string> {
  // This is a placeholder - implement your actual file storage logic
  // For example, you might use AWS S3, Cloudinary, or local storage
  const fileName = `${username}_${assignmentId}_${Date.now()}_${file.name}`;
  
  // Example implementation - replace with your actual storage logic
  // const uploadResult = await uploadToS3(file, fileName);
  // return uploadResult.url;
  
  // For now, return a placeholder URL
  return `/uploads/assignments/${fileName}`;
}

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

    // Validate user - check both User and Intern models
    let user = await User.findOne({ username }).select('role organizationName organizationId');
    let isIntern = false;

    if (!user) {
      // Check Intern model if not found in User model
      user = await Intern.findOne({ username }).select('role organizationName organizationId');
      isIntern = true;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate that only interns can submit assignments
    if (!isIntern) {
      return NextResponse.json({ error: 'Only interns can submit assignments' }, { status: 403 });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check authorization - user must be in same organization
    if (assignment.organizationName !== user.organizationName || 
        assignment.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Check if assignment accepts submissions
    if (!assignment.acceptsSubmissions) {
      return NextResponse.json({ error: 'This assignment no longer accepts submissions' }, { status: 400 });
    }

    // Check if assignment is in submittable status
    if (!['posted', 'active', 'under_review'].includes(assignment.status)) {
      return NextResponse.json({ error: 'Assignment is not accepting submissions' }, { status: 400 });
    }

    // Check if deadline has passed
    if (assignment.deadline && new Date() > new Date(assignment.deadline)) {
      return NextResponse.json({ error: 'Assignment deadline has passed' }, { status: 400 });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions?.find(
      (sub: any) => sub.internUsername === username
    );
    if (existingSubmission) {
      return NextResponse.json({ error: 'Assignment already submitted' }, { status: 400 });
    }

    // Validate submission type is allowed
    if (!assignment.allowedSubmissionTypes.includes(submissionType)) {
      return NextResponse.json({ 
        error: `Submission type '${submissionType}' not allowed for this assignment` 
      }, { status: 400 });
    }

    // Handle file upload or link validation
    let fileUrl = '';
    let fileName = '';

    if (submissionType === 'pdf') {
      if (!file) {
        return NextResponse.json({ error: 'PDF file is required for file submissions' }, { status: 400 });
      }

      // Validate file type
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
      }

      // Validate file size
      if (file.size > assignment.maxFileSize) {
        const maxSizeMB = Math.round(assignment.maxFileSize / (1024 * 1024));
        return NextResponse.json({ 
          error: `File size exceeds ${maxSizeMB}MB limit` 
        }, { status: 400 });
      }

      // Store the file
      try {
        fileUrl = await storeFile(file, username, assignmentId);
        fileName = file.name;
      } catch (error) {
        console.error('File storage error:', error);
        return NextResponse.json({ error: 'Failed to store file' }, { status: 500 });
      }
    } else if (submissionType === 'link') {
      if (!submissionContent || !submissionContent.trim()) {
        return NextResponse.json({ error: 'URL is required for link submissions' }, { status: 400 });
      }

      if (!isValidURL(submissionContent)) {
        return NextResponse.json({ error: 'Please provide a valid URL' }, { status: 400 });
      }
    }

    // Check if submission is late
    const isLateSubmission = assignment.deadline ? new Date() > new Date(assignment.deadline) : false;

    // Create submission object
    const submission = {
      internUsername: username,
      submissionType,
      submissionContent: submissionType === 'link' ? submissionContent : '',
      fileUrl,
      fileName,
      submittedAt: new Date(),
      isLateSubmission,
      status: 'submitted'
    };

    // Initialize submissions array if it doesn't exist
    if (!assignment.submissions) {
      assignment.submissions = [];
    }

    // Add submission to assignment
    assignment.submissions.push(submission);

    // Update assignment status
    if (assignment.status === 'posted' || assignment.status === 'active') {
      assignment.status = 'under_review';
    }

    assignment.updatedAt = new Date();
    await assignment.save();

    return NextResponse.json({
      message: 'Assignment submitted successfully',
      submission: {
        ...submission,
        _id: assignment.submissions[assignment.submissions.length - 1]._id
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