import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, adminUsername } = body;
    
    if (!userId || !adminUsername) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, and adminUsername are required' 
      }, { status: 400 });
    }
    
    console.log(`Processing Remove request for userId=${userId} by admin=${adminUsername}`);
    
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
    const internCollection = db.collection('interns');
    
    // Convert userId to ObjectId
    const objectId = new ObjectId(userId);
    let userToRemove = await userCollection.findOne({ _id: objectId });
    let userToRemoveIntern = await internCollection.findOne({ _id: objectId });
    
    if (!userToRemove && !userToRemoveIntern) {
      console.error(`User not found with ID: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`Found user to Remove: ${userToRemove.username}`);
    
    // Create the update data with both fields explicitly defined
    const updateData = {
      verificationStatus: 'pending',
      organizationName: "none",
      organizationId: null,
      teams: []
    };
    
    console.log(`Updating user with data:`, updateData);
    
    // Update directly in MongoDB to bypass any Mongoose validation or middleware issues
    if (userToRemove) {
      const result = await userCollection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
    } else {
      const result = await internCollection.updateOne(
        { _id: objectId },
        { $set: updateData }
      )
    }
    
    // Get the updated user to confirm the change
    let updatedUser;

    if (userToRemove) {
      updatedUser = await userCollection.findOne({ _id: objectId });
    } else {
      updatedUser = await internCollection.findOne({ _id: objectId });
    }

    console.log(`Removing user: ${updatedUser.username} organizationName: ${updatedUser.organizationName}`);
    
    // Create a notification for the user
    const notificationsCollection = db.collection('notifications');
    await notificationsCollection.insertOne({
      userId: userToRemove._id.toString(),
      type: 'removed_from_organization',
      organizationId: admin.organizationId,
      organizationName: admin.organizationName,
      message: `You have been removed from ${admin.organizationName}`,
      createdAt: new Date(),
      read: false
    });
    
    return NextResponse.json({
      success: true,
      message: `User successfully Removed from the organization`,
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
