// FILE: app/api/internships/apply/route.ts
// REPLACE THE ENTIRE FILE WITH THIS CODE

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';
import Intern from '@/models/Intern';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    console.log('=== APPLICATION SUBMISSION STARTED ===');
    await dbConnect();
    
    const applicationData = await request.json();
    console.log('Received application data:', {
      internshipId: applicationData.internshipId,
      applicantUsername: applicationData.applicantUsername,
      applicantEmail: applicationData.applicantEmail
    });
    
    const {
      internshipId,
      internshipTitle,
      organizationName,
      organizationId,
      applicantUsername,
      applicantEmail,
      applicantName,
      applicationData: appData,
      userProfile
    } = applicationData;
    
    // Validate required fields
    if (!internshipId || !applicantUsername || !applicantEmail) {
      console.error('Missing required fields:', { internshipId: !!internshipId, applicantUsername: !!applicantUsername, applicantEmail: !!applicantEmail });
      return NextResponse.json({
        error: 'Missing required fields: internshipId, applicantUsername, or applicantEmail'
      }, { status: 400 });
    }
    
    // Ensure internshipId is a valid ObjectId
    let validInternshipId;
    try {
      validInternshipId = new mongoose.Types.ObjectId(internshipId);
      console.log('Valid internship ID:', validInternshipId);
    } catch (error) {
      console.error('Invalid internship ID format:', internshipId);
      return NextResponse.json({
        error: 'Invalid internship ID format'
      }, { status: 400 });
    }
    
    // Check if internship exists and is still accepting applications
    console.log('Looking for internship...');
    const internship = await Internship.findById(validInternshipId);
    if (!internship) {
      console.error('Internship not found:', validInternshipId);
      return NextResponse.json({
        error: 'Internship not found'
      }, { status: 404 });
    }
    
    console.log('Found internship:', internship.title, 'Status:', internship.status);
    
    if (internship.status !== 'published') {
      console.error('Internship not published:', internship.status);
      return NextResponse.json({
        error: 'This internship is no longer accepting applications'
      }, { status: 400 });
    }
    
    if (new Date(internship.applicationDeadline) < new Date()) {
      console.error('Application deadline passed:', internship.applicationDeadline);
      return NextResponse.json({
        error: 'Application deadline has passed'
      }, { status: 400 });
    }
    
    // Find the user in Intern collection
    console.log('Looking for user:', applicantUsername);
    const user = await Intern.findOne({ username: applicantUsername });
    if (!user) {
      console.error('User not found in Intern collection:', applicantUsername);
      return NextResponse.json({
        error: 'User not found. Please ensure your account is properly set up.'
      }, { status: 404 });
    }
    
    console.log('Found user:', user.username, 'ApplicationStatus:', user.applicationStatus);
    
    // CRITICAL FIX: Use valid enum values only
    // Valid values: ["pending", "approved", "rejected", "active", "completed"]
    const validApplicationStatuses = ["pending", "approved", "rejected", "active", "completed"];
    if (!user.applicationStatus || !validApplicationStatuses.includes(user.applicationStatus)) {
      console.log('User has invalid or missing applicationStatus:', user.applicationStatus);
      
      // Fix the user's applicationStatus - use "pending" instead of "none"
      user.applicationStatus = "pending";
      await user.save();
      console.log('Fixed user applicationStatus to "pending"');
    }
    
    // Ensure user has appliedInternships array
    if (!user.appliedInternships) {
      user.appliedInternships = [];
    }
    
    // Check if already applied to this internship
    const existingApplication = user.appliedInternships.find(
      (app: any) => {
        const appId = app.internshipId?.toString();
        const targetId = validInternshipId.toString();
        return appId === targetId;
      }
    );
    
    if (existingApplication) {
      console.error('User already applied to this internship');
      return NextResponse.json({
        error: 'You have already applied to this internship'
      }, { status: 400 });
    }
    
    // Check application limits
    if (!internship.applications) {
      internship.applications = [];
    }
    
    if (internship.applications.length >= internship.openings) {
      console.error('Internship applications full:', internship.applications.length, '>=', internship.openings);
      return NextResponse.json({
        error: 'This internship has reached its application limit'
      }, { status: 400 });
    }
    
    console.log('Creating application entry...');
    
    // Create application entry with comprehensive data
    const applicationEntry = {
      internshipId: validInternshipId.toString(),
      companyName: organizationName,
      position: internshipTitle,
      appliedDate: new Date(),
      status: 'pending',
      applicationData: {
        whyInterestedReason: appData?.whyInterestedReason || '',
        relevantExperience: appData?.relevantExperience || '',
        expectedOutcome: appData?.expectedOutcome || '',
        availableStartDate: appData?.availableStartDate || '',
        additionalComments: appData?.additionalComments || '',
        ...appData
      },
      userProfileSnapshot: {
        fullName: userProfile?.fullName || user.fullName || '',
        email: userProfile?.email || user.email || '',
        phone: userProfile?.phone || user.phone || '',
        university: userProfile?.university || user.university || '',
        degree: userProfile?.degree || user.degree || '',
        major: userProfile?.major || user.major || '',
        graduationYear: userProfile?.graduationYear || user.graduationYear || '',
        skills: userProfile?.skills || user.skills || '',
        resumeFile: userProfile?.resumeFile || user.resumeFile || '',
        gpa: userProfile?.gpa || user.gpa || '',
        portfolioLinks: userProfile?.portfolioLinks || user.portfolioLinks || [],
        internshipGoals: userProfile?.internshipGoals || user.internshipGoals || '',
        previousExperience: userProfile?.previousExperience || user.previousExperience || ''
      }
    };
    
    console.log('Application entry created:', {
      internshipId: applicationEntry.internshipId,
      position: applicationEntry.position,
      status: applicationEntry.status
    });
    
    // Add application to user's applied internships
    user.appliedInternships.push(applicationEntry);
    
    // Add user to internship's applications array
    internship.applications.push(user._id);
    
    console.log('Saving user and internship...');
    
    // Save both documents
    await Promise.all([
      user.save(),
      internship.save()
    ]);
    
    console.log('✅ Application submitted successfully');
    
    // Get the application ID from the saved document
    const savedApplication = user.appliedInternships[user.appliedInternships.length - 1];
    
    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: savedApplication._id,
      status: 'pending',
      internshipTitle: internshipTitle,
      organizationName: organizationName
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Error submitting application:', error);
    console.error('Error stack:', error.stack);
    
    // Provide detailed error information for debugging
    let errorMessage = 'Failed to submit application';
    let errorDetails = error.message;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation failed';
      errorDetails = Object.values(error.errors).map((err: any) => err.message).join(', ');
      console.error('Validation errors:', error.errors);
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      errorMessage = 'Database error';
      errorDetails = error.message;
    }
    
    return NextResponse.json({
      error: errorMessage,
      details: errorDetails,
      type: error.name,
      // Include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }, { status: 500 });
  }
}