import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Assignment from '@/models/Assignment';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      assignmentId,
      internUsername,
      rating,
      comments,
      reviewerUsername
    } = body;

    // Validate required fields
    if (!assignmentId || !internUsername || !rating || !reviewerUsername) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    // Validate comments
    if (comments && typeof comments !== 'string') {
      return NextResponse.json({ error: 'Comments must be a string' }, { status: 400 });
    }

    // Validate reviewer - only check User model since only employees/admins can review
    const reviewer = await User.findOne({ username: reviewerUsername }).select('role organizationName organizationId');
    if (!reviewer || (reviewer.role !== 'employee' && reviewer.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authorized to review assignments' }, { status: 403 });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if reviewer belongs to same organization as assignment
    if (assignment.organizationName !== reviewer.organizationName || 
        assignment.organizationId !== reviewer.organizationId) {
      return NextResponse.json({ error: 'Not authorized to review this assignment' }, { status: 403 });
    }

    // Check if reviewer can review this assignment
    // Either they created the assignment or they are an admin
    if (assignment.assignmentFrom !== reviewerUsername && reviewer.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to review this assignment' }, { status: 403 });
    }

    // Initialize submissions array if it doesn't exist
    if (!assignment.submissions) {
      assignment.submissions = [];
    }

    // Find submission
    const submissionIndex = assignment.submissions.findIndex(
      (sub: any) => sub.internUsername === internUsername
    );

    if (submissionIndex === -1) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submission = assignment.submissions[submissionIndex];

    // Check if submission is in a reviewable state
    if (submission.status === 'reviewed') {
      return NextResponse.json({ error: 'Submission has already been reviewed' }, { status: 400 });
    }

    // Update submission with review
    assignment.submissions[submissionIndex].status = 'reviewed';
    assignment.submissions[submissionIndex].mentorReview = {
      rating,
      comments: comments || '',
      reviewedAt: new Date(),
      reviewedBy: reviewerUsername
    };

    // Update overall assignment status based on all submissions
    const allSubmissions = assignment.submissions;
    const totalSubmissions = allSubmissions.length;
    const reviewedSubmissions = allSubmissions.filter((sub: any) => sub.status === 'reviewed').length;

    if (reviewedSubmissions === totalSubmissions && totalSubmissions > 0) {
      // All submissions have been reviewed
      assignment.status = 'reviewed';
    } else if (reviewedSubmissions > 0) {
      // Some submissions reviewed, some pending
      assignment.status = 'under_review';
    }

    // Update legacy mentorFeedback field for backward compatibility
    // Use the first review or most recent review for the legacy field
    if (!assignment.mentorFeedback || assignment.mentorFeedback === '') {
      assignment.mentorFeedback = `${rating}/5 - ${comments || 'No comments provided'}`;
    }

    assignment.updatedAt = new Date();
    await assignment.save();

    // Return the updated submission
    const updatedSubmission = assignment.submissions[submissionIndex];

    return NextResponse.json({
      message: 'Review submitted successfully',
      submission: {
        internUsername: updatedSubmission.internUsername,
        submissionType: updatedSubmission.submissionType,
        submittedAt: updatedSubmission.submittedAt,
        status: updatedSubmission.status,
        mentorReview: updatedSubmission.mentorReview,
        isLateSubmission: updatedSubmission.isLateSubmission
      },
      assignmentStatus: assignment.status
    }, { status: 200 });

  } catch (error: any) {
    console.error("Assignment review error:", error);
    return NextResponse.json(
      { error: 'Failed to submit review', details: error.message },
      { status: 500 }
    );
  }
}