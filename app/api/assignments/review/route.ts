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
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Validate reviewer
    const reviewer = await User.findOne({ username: reviewerUsername });
    if (!reviewer || (reviewer.role !== 'employee' && reviewer.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authorized to review' }, { status: 403 });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if reviewer can review this assignment
    if (assignment.assignmentFrom !== reviewerUsername && reviewer.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to review this assignment' }, { status: 403 });
    }

    // Find submission
    const submissionIndex = assignment.submissions.findIndex(
      (sub: any) => sub.internUsername === internUsername
    );

    if (submissionIndex === -1) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update submission with review
    assignment.submissions[submissionIndex].status = 'reviewed';
    assignment.submissions[submissionIndex].mentorReview = {
      rating,
      comments,
      reviewedAt: new Date(),
      reviewedBy: reviewerUsername
    };

    // Update overall assignment status
    const allReviewed = assignment.submissions.every((sub: any) => sub.status === 'reviewed');
    if (allReviewed) {
      assignment.status = 'reviewed';
    } else {
      assignment.status = 'under_review';
    }

    // Also update legacy mentorFeedback field for backward compatibility
    if (!assignment.mentorFeedback) {
      assignment.mentorFeedback = `${rating}/5 - ${comments}`;
    }

    assignment.updatedAt = new Date();
    await assignment.save();

    return NextResponse.json({
      message: 'Review submitted successfully',
      submission: assignment.submissions[submissionIndex]
    }, { status: 200 });

  } catch (error: any) {
    console.error("Assignment review error:", error);
    return NextResponse.json(
      { error: 'Failed to submit review', details: error.message },
      { status: 500 }
    );
  }
}