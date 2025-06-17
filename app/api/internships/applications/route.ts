import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Internship from '@/models/Internship';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const organizationAdmin = searchParams.get('organizationAdmin');
    const internshipId = searchParams.get('internshipId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    if (!organizationAdmin) {
      return NextResponse.json({
        error: 'Organization admin username is required'
      }, { status: 400 });
    }
    
    // Get admin user to find organization
    const adminUser = await User.findOne({ username: organizationAdmin });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({
        error: 'Invalid organization admin'
      }, { status: 403 });
    }
    
    const organizationId = adminUser.organizationId;
    
    // Build aggregation pipeline to get applications
    let matchStage: any = {
      'appliedInternships': { $exists: true, $not: { $size: 0 } }
    };
    
    // Get all applications from users, filtered by organization
    const pipeline: any[] = [
      { $match: matchStage },
      { $unwind: '$appliedInternships' },
      {
        $lookup: {
          from: 'internships',
          localField: 'appliedInternships.internshipId',
          foreignField: '_id',
          as: 'internshipDetails'
        }
      },
      { $unwind: '$internshipDetails' },
      {
        $match: {
          'internshipDetails.organizationId': organizationId
        }
      }
    ];
    
    // Add internship filter if specified
    if (internshipId && internshipId !== 'all') {
      pipeline.push({
        $match: {
          'appliedInternships.internshipId': internshipId
        }
      });
    }
    
    // Add status filter if specified
    if (status && status !== 'all') {
      pipeline.push({
        $match: {
          'appliedInternships.status': status
        }
      });
    }
    
    // Add search filter if specified
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'fullName': searchRegex },
            { 'email': searchRegex },
            { 'appliedInternships.position': searchRegex }
          ]
        }
      });
    }
    
    // Project the final structure
    pipeline.push({
      $project: {
        _id: '$appliedInternships._id',
        internshipId: '$appliedInternships.internshipId',
        companyName: '$appliedInternships.companyName',
        position: '$appliedInternships.position',
        appliedDate: '$appliedInternships.appliedDate',
        status: '$appliedInternships.status',
        applicationData: '$appliedInternships.applicationData',
        userProfileSnapshot: '$appliedInternships.userProfileSnapshot',
        applicantInfo: {
          username: '$username',
          fullName: '$fullName',
          email: '$email'
        }
      }
    });
    
    // Sort by application date (newest first)
    pipeline.push({
      $sort: { appliedDate: -1 }
    });
    
    const applications = await User.aggregate(pipeline);
    
    return NextResponse.json({
      success: true,
      applications
    });
    
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({
      error: 'Failed to fetch applications',
      details: error.message
    }, { status: 500 });
  }
}