import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`🚀 API ENDPOINT HIT: /api/internships/applications/${params.id}/status`);
    
    const client = await dbConnect();
    const db = client.connection.db;
    const internsCollection = db.collection('interns');
    
    const applicationId = params.id;
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
      
      console.log(`🔍 DEBUG: Found any user with applications: ${anyUserWithApps ? 'YES' : 'NO'}`);
      if (anyUserWithApps) {
        console.log(`🔍 DEBUG: Sample user: ${anyUserWithApps.username}`);
        console.log(`🔍 DEBUG: Sample app IDs: ${anyUserWithApps.appliedInternships.map((app: any) => app._id).join(', ')}`);
      }
      
      return NextResponse.json({
        error: 'Application not found in interns collection',
        debug: {
          searchedObjectId: appObjectId.toString(),
          searchedStringId: applicationId
        }
      }, { status: 404 });
    }
    
    console.log(`✅ FOUND USER: ${user.username}`);
    console.log(`🔍 CURRENT applicationStatus: ${user.applicationStatus}`);
    console.log(`🔍 CURRENT verificationStatus: ${user.verificationStatus}`);
    
    // Determine what the applicationStatus should be (ONLY update applicationStatus, leave verificationStatus unchanged)
    let newApplicationStatus = user.applicationStatus || 'pending';
    
    switch (status) {
      case 'pending':
        newApplicationStatus = 'pending';
        break;
      case 'shortlisted':
        newApplicationStatus = 'active';
        break;
      case 'interview_scheduled':
        newApplicationStatus = 'active';
        break;
      case 'selected':
        newApplicationStatus = 'completed';
        break;
      case 'rejected':
        newApplicationStatus = 'rejected';
        break;
    }
    
    console.log(`🔄 WILL UPDATE applicationStatus: ${user.applicationStatus} → ${newApplicationStatus}`);
    console.log(`🔄 WILL KEEP verificationStatus: ${user.verificationStatus} (unchanged)`);
    
    // Update both the application status and ONLY the applicationStatus (not verificationStatus)
    const updateOperation = {
      $set: {
        'appliedInternships.$.status': status,
        'appliedInternships.$.updatedAt': new Date(),
        'applicationStatus': newApplicationStatus,
        'updatedAt': new Date()
      }
    };
    
    console.log(`🔍 UPDATE OPERATION:`, JSON.stringify(updateOperation, null, 2));
    
    const updateResult = await internsCollection.updateOne(
      { 
        'appliedInternships._id': appObjectId 
      },
      updateOperation
    );
    
    console.log(`📊 UPDATE RESULT:`);
    console.log(`   - Matched count: ${updateResult.matchedCount}`);
    console.log(`   - Modified count: ${updateResult.modifiedCount}`);
    console.log(`   - Acknowledged: ${updateResult.acknowledged}`);
    
    if (updateResult.matchedCount === 0) {
      console.log(`❌ NO DOCUMENTS MATCHED`);
      return NextResponse.json({
        error: 'Failed to update application - no documents matched',
        debug: {
          searchedId: appObjectId.toString()
        }
      }, { status: 404 });
    }
    
    if (updateResult.modifiedCount === 0) {
      console.log(`⚠️ NO DOCUMENTS MODIFIED (possibly same values)`);
    }
    
    // Verify the update by fetching the updated document
    const updatedUser = await internsCollection.findOne({ 
      'appliedInternships._id': appObjectId 
    });
    
    if (updatedUser) {
      console.log(`✅ VERIFICATION - User after update:`);
      console.log(`   - Username: ${updatedUser.username}`);
      console.log(`   - applicationStatus: ${user.applicationStatus} → ${updatedUser.applicationStatus}`);
      console.log(`   - verificationStatus: ${updatedUser.verificationStatus} (should be unchanged)`);
      console.log(`   - Application specific status: ${status}`);
      
      // Find the specific application and log its status
      const updatedApp = updatedUser.appliedInternships.find((app: any) => app._id.toString() === appObjectId.toString());
      if (updatedApp) {
        console.log(`   - Application status in array: ${updatedApp.status}`);
      }
    }
    
    return NextResponse.json({
      message: 'Application status updated successfully',
      debug: {
        username: updatedUser?.username,
        oldApplicationStatus: user.applicationStatus,
        newApplicationStatus: updatedUser?.applicationStatus,
        verificationStatus: updatedUser?.verificationStatus,
        applicationSpecificStatus: status,
        modifiedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount
      }
    });
    
  } catch (error: any) {
    console.error('❌ CRITICAL ERROR:', error);
    console.error('❌ ERROR STACK:', error.stack);
    return NextResponse.json({
      error: 'Failed to update application status',
      details: error.message
    }, { status: 500 });
  }
}