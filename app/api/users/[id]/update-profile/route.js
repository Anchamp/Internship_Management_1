import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongoose';

export async function PUT(request) {
  try {
    // Get the ID from the URL path segments
    const pathParts = request.nextUrl.pathname.split('/');
    const id = pathParts[pathParts.length - 2]; // Get the username/id from URL path
    
    // Parse the request body
    const profileData = await request.json();
    
    // Connect to the database
    await dbConnect();
    
    // Create filter based on whether id is ObjectId or username
    const filter = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id) } 
      : { username: id };
      
    // Fields that should be updated - ensure fields match schema exactly
    const updateFields = {
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
      // Use consistent field naming
      organizationName: profileData.organization || 'none',
      updatedAt: new Date()
    };
    
    // Use direct MongoDB operations
    const client = await dbConnect();
    const db = client.connection.db;
    const collection = db.collection('users');
    
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
      user: userWithoutPassword
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message
    }, { status: 500 });
  }
}
