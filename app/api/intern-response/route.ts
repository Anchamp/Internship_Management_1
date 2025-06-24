// app/api/intern-response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    console.log('=== INTERN RESPONSE API ENDPOINT HIT ===');
    
    // Parse request body
    const body = await request.json();
    console.log('Request body received:', body);
    
    const { applicationId, response, username } = body;

    // Validate input
    if (!applicationId) {
      console.log('Missing applicationId');
      return NextResponse.json({
        error: 'Application ID is required'
      }, { status: 400 });
    }

    if (!response || !['accepted', 'declined'].includes(response)) {
      console.log('Invalid response value:', response);
      return NextResponse.json({
        error: 'Invalid response. Must be "accepted" or "declined"'
      }, { status: 400 });
    }

    if (!username) {
      console.log('Missing username');
      return NextResponse.json({
        error: 'Username is required'
      }, { status: 400 });
    }

    console.log(`Processing intern response: ${response} for application ${applicationId} by user ${username}`);

    // Connect to database
    await dbConnect();
    console.log('Database connected successfully');

    // Find the user and the specific application
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    console.log('User found:', user.username);
    console.log('User has applied internships count:', user.appliedInternships?.length || 0);

    // Find the application in user's appliedInternships array
    const applicationIndex = user.appliedInternships.findIndex(
      (app: any) => app._id.toString() === applicationId
    );

    console.log('Application index found:', applicationIndex);

    if (applicationIndex === -1) {
      console.log('Application not found in user applications');
      console.log('Available application IDs:', user.appliedInternships.map((app: any) => app._id.toString()));
      return NextResponse.json({
        error: 'Application not found'
      }, { status: 404 });
    }

    const application = user.appliedInternships[applicationIndex];
    console.log('Current application status:', application.status);

    // Check if application is in "selected" status
    if (application.status !== 'selected') {
      console.log('Invalid status for response. Current status:', application.status);
      return NextResponse.json({
        error: `Can only respond to applications with "selected" status. Current status: ${application.status}`
      }, { status: 400 });
    }

    // Update the application status and add response date
    user.appliedInternships[applicationIndex].status = response;
    user.appliedInternships[applicationIndex].respondedDate = new Date();

    console.log('Updating application with new status:', response);

    // Save the updated user document
    const saveResult = await user.save();
    console.log('User document saved successfully');

    console.log(`✅ Application ${applicationId} status updated to: ${response}`);

    // Log success message
    if (response === 'accepted') {
      console.log(`🎉 User ${username} accepted internship offer for application ${applicationId}`);
    } else {
      console.log(`❌ User ${username} declined internship offer for application ${applicationId}`);
    }

    return NextResponse.json({
      success: true,
      message: `Application ${response} successfully`,
      applicationId: applicationId,
      newStatus: response,
      respondedDate: user.appliedInternships[applicationIndex].respondedDate
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error processing intern response:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      error: 'Failed to process response',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}