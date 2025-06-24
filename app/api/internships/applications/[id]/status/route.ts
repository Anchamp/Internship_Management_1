import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Intern from '@/models/Intern';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const applicationId = params.id;
    const { status } = await request.json();
    
    // Validate status
    const validStatuses = ['pending', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status'
      }, { status: 400 });
    }
    
    // Find the user with this application and update the status
    const result = await Intern.updateOne(
      { 'appliedInternships._id': applicationId },
      { 
        $set: { 
          'appliedInternships.$.status': status,
          'appliedInternships.$.updatedAt': new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        error: 'Application not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Application status updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json({
      error: 'Failed to update application status',
      details: error.message
    }, { status: 500 });
  }
}
