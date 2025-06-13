import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Parse request body
    const data = await request.json();
    
    // Extract user information from request body
    const { userData, ...internshipData } = data;
    
    console.log("API received userData:", userData);
    
    // Validate user data with more detailed error messages
    if (!userData) {
      return NextResponse.json(
        { error: 'Missing user information', details: 'Request must include userData object' },
        { status: 400 }
      );
    }
    
    if (!userData.username) {
      return NextResponse.json(
        { error: 'Missing user information', details: 'userData must include username' },
        { status: 400 }
      );
    }
    
    if (!userData.organizationName) {
      return NextResponse.json(
        { error: 'Missing user organization information', details: 'userData must include organizationName' },
        { status: 400 }
      );
    }
    
    if (!userData.organizationId) {
      return NextResponse.json(
        { error: 'Missing user organization information', details: 'userData must include organizationId' },
        { status: 400 }
      );
    }
    
    // Create internship posting with admin info
    const internship = new Internship({
      ...internshipData,
      postedBy: userData.username,
      organizationName: userData.organizationName,
      organizationId: userData.organizationId,
    });
    
    console.log("Creating internship with:", {
      postedBy: userData.username,
      orgName: userData.organizationName,
      orgId: userData.organizationId
    });
    
    // Save to database
    await internship.save();
    
    return NextResponse.json({
      message: 'Internship posted successfully',
      internship
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating internship posting:', error);
    return NextResponse.json(
      { error: 'Failed to create internship posting', details: error.message },
      { status: 500 }
    );
  }
}

// Get all internships for an organization
export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    let query = {};
    if (organizationId) {
      query = { organizationId };
    }
    
    const internships = await Internship.find(query)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ internships });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch internships', details: error.message },
      { status: 500 }
    );
  }
}
