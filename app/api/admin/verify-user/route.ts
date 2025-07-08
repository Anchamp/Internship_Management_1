import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, action, adminUsername } = body;
    
    if (!userId || !action || !adminUsername) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, action, and adminUsername are required' 
      }, { status: 400 });
    }
    
    // Validate action
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "approve" or "reject"' 
      }, { status: 400 });
    }
    
    console.log(`Processing verification request: userId=${userId}, action=${action}, adminUsername=${adminUsername}`);
    
    // Verify that the admin exists and has permission
    const admin = await User.findOne({ username: adminUsername, role: 'admin' });
    if (!admin) {
      console.error(`Admin not found: ${adminUsername}`);
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    console.log(`Admin found: ${admin.username} with organization ${admin.organizationName}`);
    
    // Find the user to verify directly in MongoDB to bypass any Mongoose caching issues
    const client = await dbConnect();
    const db = client.connection.db;
    const userCollection = db.collection('users');
    
    // Convert userId to ObjectId
    const objectId = new ObjectId(userId);
    const userToVerify = await userCollection.findOne({ _id: objectId });
    
    if (!userToVerify) {
      console.error(`User not found with ID: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`Found user to verify: ${userToVerify.username}, current status: ${userToVerify.verificationStatus}`);
    
    // Create the update data with both fields explicitly defined
    const updateData = {
      verificationStatus: action === 'approve' ? 'verified' : 'rejected',
      organizationName: action === 'approve' ? admin.organizationName : userToVerify.organizationName
    };
    
    console.log(`Updating user with data:`, updateData);
    
    // Update directly in MongoDB to bypass any Mongoose validation or middleware issues
    const result = await userCollection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      console.error(`Failed to update user ${userId}, no document modified`);
      return NextResponse.json({ 
        error: 'Failed to update user verification status' 
      }, { status: 500 });
    }
    
    console.log(`Updated user ${userToVerify.username} verification status to: ${updateData.verificationStatus}, modified count: ${result.modifiedCount}`);
    
    // Get the updated user to confirm the change
    const updatedUser = await userCollection.findOne({ _id: objectId });
    console.log(`Verification status after update: ${updatedUser.verificationStatus}`);
    
    // Create a notification for the user using the Notification model
    await Notification.create({
      userId: userToVerify._id.toString(),
      type: 'verification_response',
      status: action === 'approve' ? 'verified' : 'rejected',
      organizationId: admin.organizationId,
      organizationName: admin.organizationName,
      message: action === 'approve' 
        ? `Your profile has been approved by ${admin.organizationName}` 
        : 'Your profile verification was rejected. Please update your profile and try again.',
      createdAt: new Date(),
      read: false
    });
    
    return NextResponse.json({
      success: true,
      message: `User successfully ${action === 'approve' ? 'approved' : 'rejected'}`,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role,
        verificationStatus: updatedUser.verificationStatus,
        organizationName: updatedUser.organizationName
      }
    });
    
  } catch (error: any) {
    console.error('Error verifying user:', error);
    return NextResponse.json({ 
      error: 'Failed to process verification', 
      details: error.message 
    }, { status: 500 });
  }
}
