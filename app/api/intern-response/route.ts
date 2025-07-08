// app/api/intern-response/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Intern from '@/models/Intern';
import Internship from '@/models/Internship';

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
    const internUser = await Intern.findOne(
      { 
        username: username,
        'appliedInternships._id': applicationId
      },
      { 'appliedInternships.$': 1 }
    );
    
    if (!internUser || !internUser.appliedInternships || internUser.appliedInternships.length === 0) {
      return NextResponse.json({
        error: 'Application not found or user not authorized'
      }, { status: 404 });
    }
    
    const application = internUser.appliedInternships[0];
    const internshipId = application.internshipId;
    
    // Prepare update object for the application
    const updateObj: any = {
      'appliedInternships.$.status': response,
      'appliedInternships.$.respondedDate': new Date()
    };
    
    // If accepting, get organization info from the internship post
    if (response === 'accepted') {
      // Find the internship to get organization details
      const internship = await Internship.findById(internshipId);
      
      if (!internship) {
        return NextResponse.json({
          error: 'Internship not found'
        }, { status: 404 });
      }
      
      // Add organization info to the application update
      updateObj['appliedInternships.$.organizationId'] = internship.organizationId;
      updateObj['appliedInternships.$.organizationName'] = internship.organizationName;
      
      console.log(`Adding organization details: ${internship.organizationName} (${internship.organizationId})`);
      
      // Update the application in the database
      const appUpdateResult = await Intern.updateOne(
        { 
          username: username,
          'appliedInternships._id': applicationId
        },
        { $set: updateObj }
      );
      
      if (appUpdateResult.matchedCount === 0) {
        return NextResponse.json({
          error: 'Failed to update application'
        }, { status: 500 });
      }
      
      // IMPORTANT: Also update the root-level fields for the intern
      const rootUpdateResult = await Intern.updateOne(
        { username: username },
        { 
          $set: {
            organizationId: internship.organizationId,
            organizationName: internship.organizationName
          }
        }
      );
      
      if (rootUpdateResult.matchedCount === 0) {
        console.log('Warning: Failed to update root organization fields');
      } else {
        console.log(`Updated root organization fields for intern ${username}`);
      }
      
      return NextResponse.json({
        message: `Internship offer ${response}`,
        status: response,
        organizationInfo: {
          organizationId: internship.organizationId,
          organizationName: internship.organizationName
        }
      }, { status: 200 });
    } else {
      // For decline, just update the application status
      const result = await Intern.updateOne(
        { 
          username: username,
          'appliedInternships._id': applicationId
        },
        { $set: updateObj }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json({
          error: 'Failed to update application'
        }, { status: 500 });
      }
      
      return NextResponse.json({
        message: `Internship offer declined`,
        status: response
      }, { status: 200 });
    }
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