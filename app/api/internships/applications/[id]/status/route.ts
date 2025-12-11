import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise (Next.js 15 requirement)
    const resolvedParams = await params;
    const applicationId = resolvedParams.id;
    
    console.log(`🚀 API ENDPOINT HIT: /api/internships/applications/${applicationId}/status`);
    
    const client = await dbConnect();
    const db = client.connection.db;
    const internsCollection = db.collection('interns');
    
    const { status } = await request.json();
    
    console.log(`🔍 DEBUGGING: Starting status update for applicationId: ${applicationId}`);
    console.log(`🔍 DEBUGGING: New status: ${status}`);
    
    // Validate status
    const validStatuses = ['pending', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      console.log(`❌ INVALID STATUS: ${status}`);
      return NextResponse.json({
        error: 'Invalid status'
      }, { status: 400 });
    }
    
    // Convert applicationId to ObjectId
    const appObjectId = new ObjectId(applicationId);
    console.log(`🔍 DEBUGGING: Converted to ObjectId: ${appObjectId}`);
    
    // Find the user with this application ID
    console.log(`🔍 DEBUGGING: Searching in interns collection...`);
    const user = await internsCollection.findOne({ 
      'appliedInternships._id': appObjectId 
    });
    
    if (!user) {
      console.log(`❌ USER NOT FOUND with application ID: ${appObjectId}`);
      
      // Let's also try to find any user with any applications to debug
      const anyUserWithApps = await internsCollection.findOne({ 
        'appliedInternships': { $exists: true, $ne: [] }
      });
      
      console.log(`🔍 DEBUG: Found any user with applications: ${anyUserWithApps ? 'Yes' : 'No'}`);
      
      if (anyUserWithApps) {
        console.log(`🔍 DEBUG: Sample application structure:`, 
          JSON.stringify(anyUserWithApps.appliedInternships?.[0], null, 2));
      }
      
      return NextResponse.json({
        error: 'Application not found',
        debug: {
          searchedId: appObjectId.toString(),
          foundAnyApplications: !!anyUserWithApps
        }
      }, { status: 404 });
    }
    
    console.log(`✅ USER FOUND: ${user._id}`);
    console.log(`🔍 DEBUGGING: User has ${user.appliedInternships?.length || 0} applications`);
    
    // Find the specific application in the array
    const applicationIndex = user.appliedInternships.findIndex(
      (app: any) => app._id.toString() === appObjectId.toString()
    );
    
    if (applicationIndex === -1) {
      console.log(`❌ APPLICATION NOT FOUND in user's applications array`);
      return NextResponse.json({
        error: 'Application not found in user record'
      }, { status: 404 });
    }
    
    console.log(`✅ APPLICATION FOUND at index: ${applicationIndex}`);
    console.log(`🔍 DEBUGGING: Current status: ${user.appliedInternships[applicationIndex].status}`);
    
    // Update the application status
    const updateResult = await internsCollection.updateOne(
      { 
        _id: user._id,
        'appliedInternships._id': appObjectId 
      },
      { 
        $set: { 
          'appliedInternships.$.status': status,
          'appliedInternships.$.lastUpdated': new Date()
        } 
      }
    );
    
    console.log(`🔍 DEBUGGING: Update result:`, {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount
    });
    
    if (updateResult.modifiedCount === 0) {
      console.log(`⚠️ WARNING: No documents were modified`);
      return NextResponse.json({
        error: 'Failed to update application status',
        debug: {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount
        }
      }, { status: 500 });
    }
    
    console.log(`✅ STATUS UPDATE SUCCESSFUL: ${status}`);
    
    // Fetch the updated application to return
    const updatedUser = await internsCollection.findOne({ 
      'appliedInternships._id': appObjectId 
    });
    
    const updatedApplication = updatedUser?.appliedInternships?.find(
      (app: any) => app._id.toString() === appObjectId.toString()
    );
    
    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `Application status updated to ${status}`
    });
    
  } catch (error: any) {
    console.error('❌ ERROR updating application status:', error);
    return NextResponse.json({
      error: 'Failed to update application status',
      details: error.message
    }, { status: 500 });
  }
}
