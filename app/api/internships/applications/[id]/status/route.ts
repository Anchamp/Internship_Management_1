import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Application from '@/models/Application';
import Notification from '@/models/Notification';

// PUT method to update application status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing its properties (Next.js 15 requirement)
    const { id } = await params;
    
    await dbConnect();
    
    const body = await request.json();
    const { status, feedback } = body;
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    // Find and update the application
    const application = await Application.findByIdAndUpdate(
      id,
      { 
        status,
        ...(feedback && { feedback }),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }
    
    // Create notification for the applicant
    try {
      await Notification.create({
        userId: application.userId,
        type: 'application_status_update',
        message: `Your application status has been updated to: ${status}`,
        status: status,
        read: false,
        createdAt: new Date()
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the request if notification creation fails
    }
    
    return NextResponse.json({
      success: true,
      application
    });
    
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update application status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
