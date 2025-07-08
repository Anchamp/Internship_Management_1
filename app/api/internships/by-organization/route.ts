import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const organizationName = searchParams.get('organizationName');
    const hideExpired = searchParams.get('hideExpired') === 'true';
    
    // Require either organizationId or organizationName
    if (!organizationId && !organizationName) {
      return NextResponse.json({
        error: 'Missing required parameter: organizationId or organizationName',
        details: 'You must provide at least one of these parameters to filter internships'
      }, { status: 400 });
    }
    
    // Build query based on provided parameters
    let query = {};
    if (organizationId) {
      query = { organizationId };
    } else if (organizationName) {
      query = { organizationName };
    }
    
    // Add deadline filter if requested
    if (hideExpired) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      query = { ...query, applicationDeadline: { $gte: today } };
    }
    
    // Add optional status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      query = { ...query, status };
    }
    
    // Add optional search term filter (search in title and department)
    const search = searchParams.get('search');
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        ...query,
        $or: [
          { title: searchRegex },
          { department: searchRegex }
        ]
      };
    }
    
    // Add category to query if provided
    const category = searchParams.get('category');
    if (category && category !== 'all') {
      query = { ...query, category };
    }
    
    // Determine sort field and direction
    let sortOptions: any = { postingDate: -1 }; // Default: newest first
    const sortOrder = searchParams.get('sort');
    if (sortOrder === 'oldest') {
      sortOptions = { postingDate: 1 };
    } else if (sortOrder === 'deadline') {
      sortOptions = { applicationDeadline: 1 };
    }
    
    // Fetch the internships with pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    
    const internships = await Internship.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Internship.countDocuments(query);
    
    console.log("Fetching internships with query:", JSON.stringify(query));
    
    return NextResponse.json({
      success: true,
      internships,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching internships by organization:', error);
    return NextResponse.json({
      error: 'Failed to fetch internships',
      details: error.message
    }, { status: 500 });
  }
}
