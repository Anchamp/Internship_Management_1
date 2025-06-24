import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
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
    
    // Step 1: Get all internships for this organization
    const organizationInternships = await Internship.find({ 
      organizationId: organizationId 
    }).select('_id title organizationName department mode location');
    
    if (organizationInternships.length === 0) {
      return NextResponse.json({
        success: true,
        applications: [],
        count: 0
      });
    }
    
    // Step 2: Extract internship IDs (both string and ObjectId formats)
    const internshipIds = organizationInternships.map(internship => internship._id.toString());
    const internshipObjectIds = organizationInternships.map(internship => internship._id);
    
    // Create a map for quick internship details lookup
    const internshipDetailsMap = organizationInternships.reduce((map, internship) => {
      map[internship._id.toString()] = {
        title: internship.title,
        organizationName: internship.organizationName,
        department: internship.department,
        mode: internship.mode,
        location: internship.location
      };
      return map;
    }, {});
    
    // Step 3: Build query for users with applications to these internships
    let userQuery: any = {
      'appliedInternships': { 
        $elemMatch: {
          $or: [
            { 'internshipId': { $in: internshipIds } },
            { 'internshipId': { $in: internshipObjectIds } }
          ]
        }
      }
    };
    
    // Step 4: Get users and extract relevant applications
    const usersWithApplications = await Intern.find(userQuery).select(
      'username fullName email appliedInternships'
    );
    
    // Step 5: Process and filter applications
    let allApplications = [];
    
    for (const user of usersWithApplications) {
      if (!user.appliedInternships) continue;
      
      for (const application of user.appliedInternships) {
        const appInternshipId = application.internshipId?.toString();
        
        // Check if this application belongs to the organization
        if (internshipIds.includes(appInternshipId)) {
          // Apply filters
          let includeApplication = true;
          
          // Filter by specific internship
          if (internshipId && internshipId !== 'all') {
            if (appInternshipId !== internshipId) {
              includeApplication = false;
            }
          }
          
          // Filter by status
          if (status && status !== 'all') {
            if (application.status !== status) {
              includeApplication = false;
            }
          }
          
          // Filter by search term
          if (search) {
            const searchRegex = new RegExp(search, 'i');
            const searchMatch = (
              searchRegex.test(user.fullName || '') ||
              searchRegex.test(user.email || '') ||
              searchRegex.test(application.position || '') ||
              searchRegex.test(application.companyName || '')
            );
            
            if (!searchMatch) {
              includeApplication = false;
            }
          }
          
          if (includeApplication) {
            allApplications.push({
              _id: application._id,
              internshipId: application.internshipId,
              companyName: application.companyName,
              position: application.position,
              appliedDate: application.appliedDate,
              status: application.status,
              applicationData: application.applicationData,
              userProfileSnapshot: application.userProfileSnapshot,
              applicantInfo: {
                username: user.username,
                fullName: user.fullName,
                email: user.email
              },
              internshipDetails: internshipDetailsMap[appInternshipId] || {}
            });
          }
        }
      }
    }
    
    // Step 6: Sort by application date (newest first)
    allApplications.sort((a, b) => {
      const dateA = new Date(a.appliedDate);
      const dateB = new Date(b.appliedDate);
      return dateB.getTime() - dateA.getTime();
    });
    
    return NextResponse.json({
      success: true,
      applications: allApplications,
      count: allApplications.length
    });
    
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({
      error: 'Failed to fetch applications',
      details: error.message
    }, { status: 500 });
  }
}
