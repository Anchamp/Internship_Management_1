import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';
import User from '@/models/User';
import Intern from '@/models/Intern';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const applicationData = await request.json();
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
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }
    
    // Ensure internshipId is a valid ObjectId
    let validInternshipId;
    try {
      validInternshipId = new mongoose.Types.ObjectId(internshipId);
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid internship ID format'
      }, { status: 400 });
    }
    
    // Check if internship exists and is still accepting applications
    const internship = await Internship.findById(validInternshipId);
    if (!internship) {
      return NextResponse.json({
        error: 'Internship not found'
      }, { status: 404 });
    }
    
    if (internship.status !== 'published') {
      return NextResponse.json({
        error: 'This internship is no longer accepting applications'
      }, { status: 400 });
    }
    
    if (new Date(internship.applicationDeadline) < new Date()) {
      return NextResponse.json({
        error: 'Application deadline has passed'
      }, { status: 400 });
    }
    
    // Check if user has already applied
    const user = await Intern.findOne({ username: applicantUsername });
    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }
    
    // Check if already applied to this internship (check both string and ObjectId formats)
    const existingApplication = user.appliedInternships?.find(
      (app: any) => {
        const appId = app.internshipId?.toString();
        const targetId = validInternshipId.toString();
        return appId === targetId;
      }
    );
    
    if (existingApplication) {
      return NextResponse.json({
        error: 'You have already applied to this internship'
      }, { status: 400 });
    }
    
    // Add application to internship's applications array
    if (!internship.applications) {
      internship.applications = [];
    }
    
    // Check if applications are full
    if (internship.applications.length >= internship.openings) {
      return NextResponse.json({
        error: 'This internship has reached its application limit'
      }, { status: 400 });
    }
    
    internship.applications.push(user._id);
    await internship.save();
    
    // Add application to user's applied internships
    if (!user.appliedInternships) {
      user.appliedInternships = [];
    }
    
    const applicationEntry = {
      internshipId: validInternshipId.toString(), // Store as string for consistency
      companyName: organizationName,
      position: internshipTitle,
      appliedDate: new Date(),
      status: 'pending',
      applicationData: appData,
      userProfileSnapshot: userProfile
    };
    
    user.appliedInternships.push(applicationEntry);
    await user.save();
    
    // Send success response
    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: user.appliedInternships[user.appliedInternships.length - 1]._id
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error submitting application:', error);
    return NextResponse.json({
      error: 'Failed to submit application',
      details: error.message
    }, { status: 500 });
  }
}
