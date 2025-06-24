// Create this file: /api/users/[id]/update-intern-profile/route.js

// Create this file: /app/api/users/[id]/update-intern-profile/route.js

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongoose';
import Intern from '@/models/Intern';

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
    
    // First get the current user to check the submission count
    const client = await dbConnect();
    const db = client.connection.db;
    const collection = db.collection('interns');
    
    const currentUser = await collection.findOne(filter);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Verify this is an intern
    if (currentUser.role !== 'intern') {
      return NextResponse.json({ error: 'This endpoint is only for intern profiles' }, { status: 403 });
    }
    
    // Get current count or default to 0
    const currentCount = currentUser.profileSubmissionCount || 0;
    const isFirstSubmission = currentCount === 0;
    
    // Complete fields mapping for intern-specific profile
    const updateFields = {
      // Basic profile fields
      fullName: profileData.fullName || '',
      phone: profileData.phone || '',
      address: profileData.address || '',
      bio: profileData.bio || '',
      website: profileData.website || '',
      profileImage: profileData.profileImage || '',
      dob: profileData.dob || '',
      updatedAt: new Date(),
      profileSubmissionCount: currentCount + 1,
      
      // Academic Information
      university: profileData.university || '',
      degree: profileData.degree || '',
      major: profileData.major || '',
      graduationYear: profileData.graduationYear || '',
      gpa: profileData.gpa || '',
      
      // Professional Information
      skills: profileData.skills || '',
      internshipGoals: profileData.internshipGoals || '',
      previousExperience: profileData.previousExperience || '',
      portfolioLinks: profileData.portfolioLinks || [],
      
      // Documents
      resumeFile: profileData.resumeFile || '',
      idDocumentFile: profileData.idDocumentFile || '',
      transcriptFile: profileData.transcriptFile || '',
      
      // Application Status
      applicationStatus: profileData.applicationStatus || currentUser.applicationStatus || 'none',
      
      // User Preferences
      preferences: profileData.preferences || currentUser.preferences || {
        theme: 'light',
        emailNotifications: true,
        weeklyReportReminders: true,
        teamChatNotifications: true,
        feedbackNotifications: true
      }
    };
    
    // If this is the first submission, set verification status to pending
    if (isFirstSubmission) {
      updateFields.verificationStatus = 'pending';
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
      message: 'Intern profile updated successfully',
      user: userWithoutPassword,
      isFirstSubmission: isFirstSubmission
    });
  } catch (error) {
    console.error('Intern profile update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message
    }, { status: 500 });
  }

