import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function PUT(request) {
  try {
    // Get the ID from the URL path segments
    const pathParts = request.nextUrl.pathname.split('/');
    const encodedId = pathParts[pathParts.length - 2]; // Get the username/id from URL path
    
    // Decode the ID (username) to handle spaces and special characters
    const id = decodeURIComponent(encodedId);
    
    // Parse the request body
    const profileData = await request.json();
    
    // Connect to the database
    await dbConnect();
    
    // Create filter based on whether id is ObjectId or username
    const filter = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id) } 
      : { username: id };
    
    // First get the current user to check the submission count and role
    const client = await dbConnect();
    const db = client.connection.db;
    const collection = db.collection('users');
    
    const currentUser = await collection.findOne(filter);
    
    if (!currentUser) {
      console.log(`User not found with identifier: ${id}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get current count or default to 0
    const currentCount = currentUser.profileSubmissionCount || 0;
    const isFirstSubmission = currentCount === 0;
    
    // Define fields to update based on user role
    let updateFields = {};
    
    if (currentUser.role === 'admin') {
      // Admin-specific fields - don't modify organizationName
      updateFields = {
        fullName: profileData.fullName || currentUser.fullName || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        website: profileData.website || '',
        profileImage: profileData.profileImage || '',
        dob: profileData.dob || '',
        // Don't modify organizationName for admins
        updatedAt: new Date(),
        // Increment the profile submission count
        profileSubmissionCount: currentCount + 1
      };
    } else {
      // For non-admin users (mentors, interns, panelists)
      updateFields = {
        fullName: profileData.fullName || '',
        phone: profileData.phone || '',
        position: profileData.position || '',
        address: profileData.address || '',
        experience: profileData.experience || '',
        skills: profileData.skills || '',
        bio: profileData.bio || '',
        website: profileData.website || '',
        profileImage: profileData.profileImage || '',
        dob: profileData.dob || '',
        teams: profileData.teams || [],
        // Only use organizationName from profileData for non-admins
        organizationName: profileData.organization || 'none',
        updatedAt: new Date(),
        // Increment the profile submission count
        profileSubmissionCount: currentCount + 1
      };
    }
    
    // If this is the first submission, set verification status to pending
    if (isFirstSubmission && currentUser.role !== 'admin') {
      updateFields.verificationStatus = 'pending';
      
      // If user is mentor or panelist, create a verification notification for the admin
      if (['mentor', 'panelist'].includes(currentUser.role) && currentUser.organizationId) {
        // Find the admin with the matching organizationId
        const adminUser = await collection.findOne({
          role: 'admin',
          organizationId: currentUser.organizationId
        });
        
        if (adminUser) {
          // Create a notification for the admin
          const notification = {
            userId: adminUser._id.toString(),
            type: 'verification_request',
            role: currentUser.role,
            requestorId: currentUser._id.toString(),
            requestorName: profileData.fullName || currentUser.username,
            organizationId: currentUser.organizationId,
            createdAt: new Date(),
            read: false
          };
          
          // Store notification in database
          const notificationsCollection = db.collection('notifications');
          await notificationsCollection.insertOne(notification);
          
          console.log(`Created verification notification for admin: ${adminUser.username}`);
        } else {
          console.log(`Could not find admin for organizationId: ${currentUser.organizationId}`);
        }
      }
    }
    
    // Update the user document directly
    const updateResult = await collection.updateOne(filter, { $set: updateFields });
    
    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get the updated user document to verify
    const updatedUser = await collection.findOne(filter);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to fetch updated user' }, { status: 500 });
    }
    
    // Remove sensitive information before returning
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword,
      isFirstSubmission: isFirstSubmission // Return flag to indicate if this was the first submission
    });
  } catch (error) {
    console.error("Error in update-profile route:", error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message
    }, { status: 500 });
  }
}
